const Project = require('../models/Project');
const { generateBlueprint } = require('../services/geminiService');

// @desc    Get all projects for authenticated user
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check ownership
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this project' });
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
  try {
    const { title, description, techStack, architectureType, prompt } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Project title is required' });
    }

    const project = await Project.create({
      user: req.user._id,
      title,
      description: description || '',
      techStack: Array.isArray(techStack) ? techStack : [],
      architectureType: architectureType || 'Full-stack MERN',
      prompt: prompt || '',
      status: 'draft',
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check ownership
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }

    const {
      title,
      description,
      techStack,
      architectureType,
      prompt,
      blueprintContent,
      status,
      systemArchitecture,
      modules,
      databaseDesign,
      apiDesign,
      roadmap,
    } = req.body;

    project.title = title !== undefined ? title : project.title;
    project.description = description !== undefined ? description : project.description;
    project.techStack = techStack !== undefined ? (Array.isArray(techStack) ? techStack : project.techStack) : project.techStack;
    project.architectureType = architectureType !== undefined ? architectureType : project.architectureType;
    project.prompt = prompt !== undefined ? prompt : project.prompt;
    project.blueprintContent = blueprintContent !== undefined ? blueprintContent : project.blueprintContent;
    project.status = status !== undefined ? status : project.status;
    project.systemArchitecture = systemArchitecture !== undefined ? systemArchitecture : project.systemArchitecture;
    project.modules = modules !== undefined ? modules : project.modules;
    project.databaseDesign = databaseDesign !== undefined ? databaseDesign : project.databaseDesign;
    project.apiDesign = apiDesign !== undefined ? apiDesign : project.apiDesign;
    project.roadmap = roadmap !== undefined ? roadmap : project.roadmap;

    const updatedProject = await project.save();
    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check ownership
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }

    await Project.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate AI blueprint for an existing project
// @route   POST /api/projects/:id/generate
// @access  Private
const generateProjectBlueprint = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Verify that the authenticated user owns the project
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to generate blueprint for this project' });
    }

    // Change status to 'generating' before calling Gemini
    project.status = 'generating';
    await project.save();

    try {
      // Call Gemini service using the project's saved information
      const blueprintData = await generateBlueprint({
        title: project.title,
        description: project.description,
        architectureType: project.architectureType,
        techStack: project.techStack,
        prompt: project.prompt,
      });

      // Save the generated structured sections to the same Project document
      project.systemArchitecture = blueprintData.systemArchitecture;
      project.modules = blueprintData.modules;
      project.databaseDesign = blueprintData.databaseDesign;
      project.apiDesign = blueprintData.apiDesign;
      project.roadmap = blueprintData.roadmap;
      project.blueprintContent = JSON.stringify(blueprintData, null, 2);
      project.status = 'completed';

      const updatedProject = await project.save();
      return res.status(200).json(updatedProject);
    } catch (aiError) {
      console.error('Gemini Blueprint Generation Error:', aiError.message);

      // Change status to 'failed' if generation fails
      project.status = 'failed';
      await project.save();

      return res.status(500).json({
        message: aiError.message || 'Blueprint generation failed. Please try again.',
        status: 'failed',
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  generateProjectBlueprint,
};
