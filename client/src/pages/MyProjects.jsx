import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { projectService } from '../services/api';
import {
  PlusCircle,
  Trash2,
  FolderKanban,
  Calendar,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  Server,
  Boxes,
  Database,
  Plug,
  Map,
  ListChecks,
  Circle,
  Download,
} from 'lucide-react';

function ArchitectureDiagram({ diagram, project }) {
  const [expandedNodes, setExpandedNodes] = useState(new Set());

  const fileStructure =
    project?.systemArchitecture?.fileStructure;

  const toggleNode = (nodeId) => {
    setExpandedNodes((current) => {
      const next = new Set(current);

      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }

      return next;
    });
  };

  const renderTree = (node, level = 0) => {
    if (!node) return null;

    const hasChildren =
      Array.isArray(node.children) && node.children.length > 0;

    const isExpanded = expandedNodes.has(node.name);

    const isFolder = node.type === 'folder';

    return (
      <div key={`${node.name}-${level}`} className="select-none">
        {/* Node */}
        <div
          className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-800/80 transition cursor-pointer"
          style={{
            marginLeft: `${level * 28}px`,
          }}
          onClick={() => {
            if (hasChildren) {
              toggleNode(node.name);
            }
          }}
        >
          {/* Expand / collapse */}
          {isFolder && hasChildren ? (
            <span className="w-5 text-center text-slate-400 text-sm">
              {isExpanded ? '▼' : '▶'}
            </span>
          ) : (
            <span className="w-5" />
          )}

          {/* Icon */}
          <span className="text-lg">
            {isFolder ? '📁' : '📄'}
          </span>

          {/* Name */}
          <span
            className={`text-sm ${
              isFolder
                ? 'font-semibold text-white'
                : 'text-slate-300'
            }`}
          >
            {node.name}
          </span>

          {/* Type */}
          <span className="text-[10px] text-slate-600 ml-1">
            {node.type}
          </span>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div>
            {node.children.map((child) =>
              renderTree(child, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  if (!fileStructure) {
    return (
      <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
        <p className="text-sm text-slate-400">
          No file structure was generated for this blueprint.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-slate-950/80 border border-slate-800 overflow-hidden">

      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">
            Project Architecture
          </p>

          <p className="text-xs text-slate-500 mt-1">
            Click folders to expand or collapse the project structure.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setExpandedNodes(new Set())}
          className="text-xs px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
        >
          Collapse All
        </button>
      </div>

      {/* Tree */}
      <div className="p-5 max-h-[560px] overflow-auto">
        <div className="min-w-[650px]">
          {renderTree(fileStructure)}
        </div>
      </div>

    </div>
  );
}

export default function MyProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [generatingId, setGeneratingId] = useState(null);
  const [viewingId, setViewingId] = useState(null);

  // Task list state
  const [taskLists, setTaskLists] = useState({});
  const [showTasks, setShowTasks] = useState({});

  const fetchProjects = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await projectService.getAll();

      setProjects(res.data);

      // Restore saved task progress after refresh
      const savedTasks = {};

      res.data.forEach((project) => {
        const saved = localStorage.getItem(
          `blueprint-tasks-${project._id}`
        );

        if (saved) {
          try {
            const parsedTasks = JSON.parse(saved);

            if (Array.isArray(parsedTasks)) {
              savedTasks[project._id] = parsedTasks;
            }
          } catch {
            // Ignore invalid saved task data
          }
        }
      });

      setTaskLists(savedTasks);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to fetch projects'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    setDeletingId(id);

    try {
      await projectService.delete(id);

      // Remove saved task progress for this project
      localStorage.removeItem(`blueprint-tasks-${id}`);

      setProjects((currentProjects) =>
        currentProjects.filter((p) => p._id !== id)
      );

      if (viewingId === id) {
        setViewingId(null);
      }

      setTaskLists((current) => {
        const updated = { ...current };
        delete updated[id];
        return updated;
      });

      setShowTasks((current) => {
        const updated = { ...current };
        delete updated[id];
        return updated;
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete project');
    } finally {
      setDeletingId(null);
    }
  };

  const handleGenerate = async (id) => {
    setGeneratingId(id);
    setError('');

    try {
      const res = await projectService.generate(id);

      const updatedProject = res.data;

      setProjects((currentProjects) =>
        currentProjects.map((project) =>
          project._id === id ? updatedProject : project
        )
      );

      setViewingId(id);

      // Reset task list because the blueprint was regenerated
      setTaskLists((current) => {
        const updated = { ...current };
        delete updated[id];
        return updated;
      });

      setShowTasks((current) => {
        const updated = { ...current };
        delete updated[id];
        return updated;
      });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Blueprint generation failed. Please try again.';

      setError(message);

      try {
        const refreshResponse = await projectService.getAll();
        setProjects(refreshResponse.data);
      } catch {
        // Keep original generation error visible
      }
    } finally {
      setGeneratingId(null);
    }
  };

  const toggleBlueprint = (id) => {
    setViewingId((currentId) => (currentId === id ? null : id));
  };

  // Download the generated blueprint as a text file
  const downloadBlueprint = (project) => {
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const margin = 18;
    const maxWidth = pageWidth - margin * 2;

    let y = 20;

    const lineHeight = 5;
    const sectionGap = 7;

    const checkPage = (neededHeight = 8) => {
      if (y + neededHeight > pageHeight - 18) {
        doc.addPage();
        y = 20;
      }
    };

    // Main title
    const addTitle = (text) => {
      checkPage(20);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(15, 23, 42);

      const lines = doc.splitTextToSize(
        String(text || ''),
        maxWidth
      );

      doc.text(lines, margin, y);

      y += lines.length * 8 + 4;
    };

    // Section heading
    const addHeading = (text) => {
      checkPage(18);

      y += 3;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);

      doc.text(String(text), margin, y);

      y += 5;

      doc.setDrawColor(210, 214, 220);

      doc.line(
        margin,
        y,
        pageWidth - margin,
        y
      );

      y += 7;
    };

    // Normal content
    const addContent = (value) => {
      const text = formatDownloadValue(value);

      if (!text || !text.trim()) {
        return;
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(55, 65, 81);

      const lines = doc.splitTextToSize(
        text,
        maxWidth
      );

      lines.forEach((line) => {
        checkPage(lineHeight);

        doc.text(
          line,
          margin,
          y
        );

        y += lineHeight;
      });

      y += sectionGap;
    };

    // --------------------------------------------------
    // BLUEPRINT TITLE
    // --------------------------------------------------

    addTitle('BLUEPRINT AI');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(30, 41, 59);

    const projectTitle = doc.splitTextToSize(
      project.title || 'Project Blueprint',
      maxWidth
    );

    checkPage(
      projectTitle.length * 8 + 8
    );

    doc.text(
      projectTitle,
      margin,
      y
    );

    y += projectTitle.length * 8 + 8;

    // --------------------------------------------------
    // PROJECT INFORMATION
    // --------------------------------------------------

    addHeading('Project Information');

    addContent(
      `Architecture Type: ${
        project.architectureType ||
        'Not provided'
      }`
    );

    addContent(
      `Tech Stack: ${
        project.techStack ||
        'Not provided'
      }`
    );

    addContent(
      `Description: ${
        project.description ||
        'Not provided'
      }`
    );

    // --------------------------------------------------
    // SYSTEM ARCHITECTURE
    // --------------------------------------------------

    if (project.systemArchitecture) {
      addHeading('System Architecture');

      // Remove ONLY fileStructure from the PDF.
      // Everything else in systemArchitecture stays.
      const {
        fileStructure,
        ...systemArchitectureWithoutFileStructure
      } = project.systemArchitecture;

      addContent(
        systemArchitectureWithoutFileStructure
      );
    }

    // --------------------------------------------------
    // PROJECT MODULES
    // --------------------------------------------------

    if (
      Array.isArray(project.modules) &&
      project.modules.length > 0
    ) {
      addHeading('Project Modules');

      addContent(
        project.modules
      );
    }

    // --------------------------------------------------
    // DATABASE DESIGN
    // --------------------------------------------------

    if (project.databaseDesign) {
      addHeading('Database Design');

      addContent(
        project.databaseDesign
      );
    }

    // --------------------------------------------------
    // API DESIGN
    // --------------------------------------------------

    if (
      Array.isArray(project.apiDesign) &&
      project.apiDesign.length > 0
    ) {
      addHeading('API Design');

      addContent(
        project.apiDesign
      );
    }

    // --------------------------------------------------
    // DEVELOPMENT ROADMAP
    // --------------------------------------------------

    if (
      Array.isArray(project.roadmap) &&
      project.roadmap.length > 0
    ) {
      addHeading('Development Roadmap');

      addContent(
        project.roadmap
      );
    }

    // --------------------------------------------------
    // PAGE NUMBERS
    // --------------------------------------------------

    const totalPages =
      doc.internal.getNumberOfPages();

    for (
      let page = 1;
      page <= totalPages;
      page++
    ) {
      doc.setPage(page);

      doc.setFont(
        'helvetica',
        'normal'
      );

      doc.setFontSize(8);
      doc.setTextColor(
        100,
        116,
        139
      );

      doc.text(
        `Blueprint AI • ${project.title || 'Project Blueprint'} Page ${page} of ${totalPages}`,
        margin,
        pageHeight - 8
      );
    }

    // --------------------------------------------------
    // SAVE PDF
    // --------------------------------------------------

    const filename =
      `${project.title || 'blueprint'}-blueprint.pdf`
        .replace(
          /[<>:"/\\|?*]+/g,
          '-'
        );

    doc.save(filename);
  };

  // Convert blueprint data into readable text for download
  const formatDownloadValue = (value, indent = 0) => {
    const spacing = ' '.repeat(indent);

    if (value === null || value === undefined) {
      return `${spacing}Not provided`;
    }

    if (typeof value === 'string') {
      return `${spacing}${value}`;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return `${spacing}${String(value)}`;
    }

    if (Array.isArray(value)) {
      return value
        .map((item, index) => {
          if (typeof item === 'object' && item !== null) {
            return `${spacing}${index + 1}.\n${formatDownloadValue(
              item,
              indent + 2
            )}`;
          }

          return `${spacing}- ${String(item)}`;
        })
        .join('\n');
    }

    if (typeof value === 'object') {
      return Object.entries(value)
        .map(([key, val]) => {
          const label = key
            .replace(/([A-Z])/g, ' $1')
            .replace(/[_-]/g, ' ')
            .replace(/\b\w/g, (letter) => letter.toUpperCase());

          return `${spacing}${label}:\n${formatDownloadValue(
            val,
            indent + 2
          )}`;
        })
        .join('\n');
    }

    return `${spacing}${String(value)}`;
  };

  const formatLabel = (key) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const renderValue = (value) => {
    if (value === null || value === undefined) {
      return <span className="text-slate-500">Not provided</span>;
    }

    if (typeof value === 'string') {
      return (
        <p className="text-sm text-slate-300 whitespace-pre-wrap break-words leading-6 overflow-wrap-anywhere">
          {value}
        </p>
      );
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-slate-500">No items provided</span>;
      }

      return (
        <div className="space-y-3 min-w-0">
          {value.map((item, index) => (
            <div
              key={index}
              className="rounded-lg bg-slate-950/60 border border-slate-800 p-4 min-w-0"
            >
              {typeof item === 'object' ? (
                <div className="space-y-2 min-w-0">
                  {Object.entries(item).map(([key, val]) => (
                    <div key={key} className="min-w-0">
                      <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                        {formatLabel(key)}
                      </p>

                      {Array.isArray(val) ? (
                        <ul className="list-disc list-inside text-sm text-slate-300 space-y-1 break-words">
                          {val.map((entry, i) => (
                            <li key={i} className="break-words">
                              {typeof entry === 'object'
                                ? JSON.stringify(entry)
                                : String(entry)}
                            </li>
                          ))}
                        </ul>
                      ) : typeof val === 'object' && val !== null ? (
                        <pre className="text-xs text-slate-300 whitespace-pre-wrap break-all overflow-x-auto max-w-full">
                          {JSON.stringify(val, null, 2)}
                        </pre>
                      ) : (
                        <p className="text-sm text-slate-300 break-words overflow-wrap-anywhere">
                          {String(val)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-300 break-words">
                  {String(item)}
                </p>
              )}
            </div>
          ))}
        </div>
      );
    }

    if (typeof value === 'object') {
      return (
        <div className="space-y-4 min-w-0">
          {Object.entries(value).map(([key, val]) => (
            <div key={key} className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                {formatLabel(key)}
              </p>

              {renderValue(val)}
            </div>
          ))}
        </div>
      );
    }

    return (
      <p className="text-sm text-slate-300 break-words overflow-wrap-anywhere">
        {String(value)}
      </p>
    );
  };

  // Generate a practical task list from the existing blueprint.
  const generateTaskList = (project) => {
    const tasks = [];

    // Tasks from modules
    if (Array.isArray(project.modules)) {
      project.modules.forEach((module) => {
        if (!module || typeof module !== 'object') return;

        const moduleName = module.name || 'Project Module';

        tasks.push({
          id: `module-${tasks.length}`,
          phase: moduleName,
          task: `Set up the ${moduleName} module`,
          completed: false,
        });

        if (Array.isArray(module.responsibilities)) {
          module.responsibilities.forEach((responsibility) => {
            tasks.push({
              id: `responsibility-${tasks.length}`,
              phase: moduleName,
              task: String(responsibility),
              completed: false,
            });
          });
        }

        if (Array.isArray(module.features)) {
          module.features.forEach((feature) => {
            tasks.push({
              id: `feature-${tasks.length}`,
              phase: moduleName,
              task: `Implement ${String(feature)}`,
              completed: false,
            });
          });
        }
      });
    }

    // Tasks from roadmap
    if (Array.isArray(project.roadmap)) {
      project.roadmap.forEach((phase) => {
        if (!phase || typeof phase !== 'object') return;

        const phaseName = phase.phase || 'Development Phase';

        if (Array.isArray(phase.tasks)) {
          phase.tasks.forEach((task) => {
            tasks.push({
              id: `roadmap-${tasks.length}`,
              phase: phaseName,
              task: String(task),
              completed: false,
            });
          });
        } else if (Array.isArray(phase.goals)) {
          phase.goals.forEach((goal) => {
            tasks.push({
              id: `goal-${tasks.length}`,
              phase: phaseName,
              task: String(goal),
              completed: false,
            });
          });
        }
      });
    }

    // Remove duplicate task names
    const uniqueTasks = [];
    const seen = new Set();

    tasks.forEach((task) => {
      const normalized = task.task.trim().toLowerCase();

      if (!seen.has(normalized)) {
        seen.add(normalized);
        uniqueTasks.push(task);
      }
    });

    // Save the newly generated task list
    localStorage.setItem(
      `blueprint-tasks-${project._id}`,
      JSON.stringify(uniqueTasks)
    );

    setTaskLists((current) => ({
      ...current,
      [project._id]: uniqueTasks,
    }));

    setShowTasks((current) => ({
      ...current,
      [project._id]: true,
    }));
  };

  const toggleTask = (projectId, taskId) => {
    setTaskLists((current) => {
      const updatedTasks = current[projectId].map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed: !task.completed,
            }
          : task
      );

      // Save task progress so it survives page refresh
      localStorage.setItem(
        `blueprint-tasks-${projectId}`,
        JSON.stringify(updatedTasks)
      );

      return {
        ...current,
        [projectId]: updatedTasks,
      };
    });
  };

  const renderTaskList = (project) => {
    const tasks = taskLists[project._id] || [];

    if (tasks.length === 0) {
      return (
        <div className="mt-6 p-6 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
          <ListChecks className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-slate-300">
            No development tasks could be created from this blueprint.
          </p>
        </div>
      );
    }

    const completedTasks = tasks.filter((task) => task.completed).length;
    const progress = Math.round((completedTasks / tasks.length) * 100);

    const groupedTasks = tasks.reduce((groups, task) => {
      if (!groups[task.phase]) {
        groups[task.phase] = [];
      }

      groups[task.phase].push(task);
      return groups;
    }, {});

    return (
      <section className="mt-6 rounded-xl bg-slate-950/60 border border-slate-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <ListChecks className="w-5 h-5 text-blue-400" />

              <div>
                <h2 className="text-lg font-bold text-white">
                  Development Task List
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Follow these tasks to implement your project.
                </p>
              </div>
            </div>

            <div className="text-sm text-slate-300">
              <span className="text-emerald-400 font-semibold">
                {completedTasks}
              </span>{' '}
              / {tasks.length} completed
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>

            <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="p-5 space-y-6">
          {Object.entries(groupedTasks).map(([phase, phaseTasks]) => (
            <div key={phase}>
              <h3 className="text-sm font-semibold text-slate-200 mb-3">
                {phase}
              </h3>

              <div className="space-y-2">
                {phaseTasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => toggleTask(project._id, task.id)}
                    className={`w-full flex items-start gap-3 text-left p-3 rounded-lg border transition ${
                      task.completed
                        ? 'bg-emerald-500/5 border-emerald-500/20'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                    )}

                    <span
                      className={`text-sm break-words ${
                        task.completed
                          ? 'text-slate-500 line-through'
                          : 'text-slate-300'
                      }`}
                    >
                      {task.task}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderBlueprint = (project) => {
    if (
      !project.systemArchitecture &&
      !project.modules?.length &&
      !project.databaseDesign &&
      !project.apiDesign?.length &&
      !project.roadmap?.length
    ) {
      return (
        <div className="mt-6 p-6 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
          <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
          <p className="text-slate-300">
            No generated blueprint is available yet.
          </p>
        </div>
      );
    }

    const hasTaskList = taskLists[project._id]?.length > 0;
    const isTaskListVisible = showTasks[project._id];

    return (
      <div className="mt-6 space-y-6 min-w-0">

        {/* Blueprint actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => downloadBlueprint(project)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition"
          >
            <Download className="w-4 h-4" />
            Download Blueprint
          </button>
        </div>

        {/* Architecture Visualization */}
        {project.systemArchitecture?.diagram && (
          <section className="rounded-xl bg-slate-950/60 border border-slate-800 overflow-hidden min-w-0">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-3">
              <Server className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">
                Architecture Visualization
              </h2>
            </div>

            <div className="p-5 min-w-0">
              <ArchitectureDiagram
                diagram={project.systemArchitecture.diagram}
                project={project}
              />
            </div>
          </section>
        )}

        {/* System Architecture */}
        {project.systemArchitecture && (
          <section className="rounded-xl bg-slate-950/60 border border-slate-800 overflow-hidden min-w-0">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-3">
              <Server className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-bold text-white">
                System Architecture
              </h2>
            </div>

            <div className="p-5 min-w-0">
              {renderValue(project.systemArchitecture)}
            </div>
          </section>
        )}

        {/* Modules */}
        {project.modules && project.modules.length > 0 && (
          <section className="rounded-xl bg-slate-950/60 border border-slate-800 overflow-hidden min-w-0">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-3">
              <Boxes className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-bold text-white">
                Project Modules
              </h2>
            </div>

            <div className="p-5 min-w-0">
              {renderValue(project.modules)}
            </div>
          </section>
        )}

        {/* Database */}
        {project.databaseDesign && (
          <section className="rounded-xl bg-slate-950/60 border border-slate-800 overflow-hidden min-w-0">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-3">
              <Database className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">
                Database Design
              </h2>
            </div>

            <div className="p-5 min-w-0">
              {renderValue(project.databaseDesign)}
            </div>
          </section>
        )}

        {/* API Design */}
        {project.apiDesign && project.apiDesign.length > 0 && (
          <section className="rounded-xl bg-slate-950/60 border border-slate-800 overflow-hidden min-w-0">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-3">
              <Plug className="w-5 h-5 text-orange-400" />
              <h2 className="text-lg font-bold text-white">
                API Design
              </h2>
            </div>

            <div className="p-5 min-w-0">
              {renderValue(project.apiDesign)}
            </div>
          </section>
        )}

        {/* Roadmap */}
        {project.roadmap && project.roadmap.length > 0 && (
          <section className="rounded-xl bg-slate-950/60 border border-slate-800 overflow-hidden min-w-0">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-3">
              <Map className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">
                Development Roadmap
              </h2>
            </div>

            <div className="p-5 min-w-0">
              {renderValue(project.roadmap)}
            </div>
          </section>
        )}

        {/* Task List Action */}
        <section className="rounded-xl bg-blue-500/5 border border-blue-500/20 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <ListChecks className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />

              <div>
                <h2 className="text-lg font-bold text-white">
                  Ready to build this project?
                </h2>

                <p className="text-sm text-slate-400 mt-1">
                  Convert your blueprint into an actionable development task
                  list.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (hasTaskList) {
                  setShowTasks((current) => ({
                    ...current,
                    [project._id]: !current[project._id],
                  }));
                } else {
                  generateTaskList(project);
                }
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition shadow-lg shadow-blue-500/20 flex-shrink-0"
            >
              <ListChecks className="w-4 h-4" />

              {hasTaskList
                ? isTaskListVisible
                  ? 'Hide Task List'
                  : 'Show Task List'
                : 'Generate Task List'}
            </button>
          </div>
        </section>

        {/* Generated Task List */}
        {hasTaskList && isTaskListVisible && renderTaskList(project)}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-8 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            My Projects
          </h1>

          <p className="mt-1 text-slate-400 text-sm">
            View, manage, and generate your system architecture blueprints.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchProjects}
            disabled={loading}
            className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <Link
            to="/projects/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition shadow-lg shadow-blue-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Project</span>
          </Link>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="my-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p>Loading projects...</p>
        </div>

      ) : projects.length === 0 ? (

        <div className="my-12 p-12 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center">
          <FolderKanban className="w-12 h-12 text-slate-600 mx-auto mb-3" />

          <h3 className="text-lg font-semibold text-white">
            No projects yet
          </h3>

          <p className="mt-1 text-sm text-slate-400 max-w-sm mx-auto">
            You haven't created any blueprints yet. Start building your
            architectural roadmap today.
          </p>

          <Link
            to="/projects/create"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create First Project</span>
          </Link>
        </div>

      ) : (

        <div className="grid grid-cols-1 gap-6 mt-8">

          {projects.map((proj) => {
            const isGenerating = generatingId === proj._id;
            const isViewing = viewingId === proj._id;

            return (
              <div
                key={proj._id}
                className={`p-6 rounded-xl bg-slate-900/60 border ${
                  isViewing
                    ? 'border-blue-500/40'
                    : 'border-slate-800'
                } hover:border-slate-700 transition flex flex-col min-w-0`}
              >

                {/* Project info */}
                <div>
                  <div className="flex items-center justify-between mb-3 gap-2">

                    <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                      {proj.architectureType}
                    </span>

                    <span
                      className={`text-xs px-2 py-0.5 rounded font-medium ${
                        proj.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : proj.status === 'generating'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : proj.status === 'failed'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {proj.status}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">
                    {proj.title}
                  </h3>

                  <p className="text-slate-400 text-sm line-clamp-3 mb-4">
                    {proj.description || 'No description provided.'}
                  </p>

                  {proj.techStack && proj.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {proj.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/50"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="pt-4 border-t border-slate-800/80">

                  <div className="flex flex-wrap items-center gap-2">

                    <button
                      onClick={() => handleGenerate(proj._id)}
                      disabled={isGenerating}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          {proj.status === 'completed'
                            ? 'Regenerate'
                            : 'Generate Blueprint'}
                        </>
                      )}
                    </button>

                    {proj.status === 'completed' && (
                      <button
                        onClick={() => toggleBlueprint(proj._id)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition"
                      >
                        {isViewing ? (
                          <>
                            <EyeOff className="w-4 h-4" />
                            Hide Blueprint
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4" />
                            View Blueprint
                          </>
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(proj._id)}
                      disabled={deletingId === proj._id}
                      className="ml-auto text-slate-400 hover:text-red-400 p-2 rounded-lg hover:bg-slate-800 transition disabled:opacity-50"
                      title="Delete project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      Created{' '}
                      {new Date(proj.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {isViewing && renderBlueprint(proj)}

              </div>
            );
          })}

        </div>
      )}
    </div>
  );
}