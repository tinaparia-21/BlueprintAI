import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../services/api';
import { Layers, AlertCircle, ArrowLeft, Plus } from 'lucide-react';

export default function CreateProject() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [architectureType, setArchitectureType] = useState('Full-stack MERN');
  const [techStackInput, setTechStackInput] = useState('');
  const [techStack, setTechStack] = useState(['MongoDB', 'Express', 'React', 'Node.js']);
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleAddTag = (e) => {
    e.preventDefault();
    if (techStackInput.trim() && !techStack.includes(techStackInput.trim())) {
      setTechStack([...techStack, techStackInput.trim()]);
      setTechStackInput('');
    }
  };

  const handleRemoveTag = (tag) => {
    setTechStack(techStack.filter((t) => t !== tag));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Project title is required');
      return;
    }

    setIsSubmitting(true);

    try {
      await projectService.create({
        title,
        description,
        architectureType,
        techStack,
        prompt,
      });
      navigate('/projects');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-lg bg-blue-600/20 text-blue-500 border border-blue-500/30">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Create New Project</h1>
            <p className="text-sm text-slate-400 mt-1">
              Define the requirements and architectural framework for your blueprint.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., E-Commerce Microservices Engine"
              className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief overview of the project's purpose and target users..."
              className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Architecture Type
              </label>
              <select
                value={architectureType}
                onChange={(e) => setArchitectureType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm"
              >
                <option value="Full-stack MERN">Full-stack MERN</option>
                <option value="Microservices">Microservices</option>
                <option value="Serverless">Serverless</option>
                <option value="REST API">REST API</option>
                <option value="Custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Tech Stack
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={techStackInput}
                  onChange={(e) => setTechStackInput(e.target.value)}
                  placeholder="Add technology (e.g. Redis)"
                  className="flex-1 px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {/* Stack tags */}
              <div className="flex flex-wrap gap-2 mt-3">
                {techStack.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs"
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tech)}
                      className="hover:text-red-400 ml-1 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              System Architecture Prompt / Requirements
            </label>
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Detail system specifications, data models, high-availability needs, or API design goals..."
              className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition shadow-lg shadow-blue-500/25 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Save Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
