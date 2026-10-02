import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectService } from '../services/api';
import {
  PlusCircle,
  FolderKanban,
  Clock,
  CheckCircle2,
  FileCode2,
  ArrowRight,
  XCircle,
  BarChart3,
  Sparkles,
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await projectService.getAll();
        setProjects(res.data);
      } catch (err) {
        console.error('Failed to load projects:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const completedCount = projects.filter(
    (p) => p.status === 'completed'
  ).length;

  const draftCount = projects.filter(
    (p) => p.status === 'draft'
  ).length;

  const failedCount = projects.filter(
    (p) => p.status === 'failed'
  ).length;

  const totalProjects = projects.length;

  const completionPercentage =
    totalProjects > 0
      ? Math.round((completedCount / totalProjects) * 100)
      : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-8 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.name || 'Developer'}!
          </h1>

          <p className="mt-1 text-slate-400 text-sm">
            Manage your system architectures and generate new project
            blueprints.
          </p>
        </div>

        <Link
          to="/projects/create"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition shadow-lg shadow-blue-500/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Project</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 my-8">

        {/* Total Projects */}
        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">
              Total Projects
            </span>

            <FolderKanban className="w-5 h-5 text-blue-400" />
          </div>

          <p className="mt-4 text-3xl font-bold text-white">
            {totalProjects}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            All your projects
          </p>
        </div>

        {/* Draft Projects */}
        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">
              Draft Blueprints
            </span>

            <Clock className="w-5 h-5 text-amber-400" />
          </div>

          <p className="mt-4 text-3xl font-bold text-white">
            {draftCount}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Waiting for generation
          </p>
        </div>

        {/* Completed */}
        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">
              Completed
            </span>

            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>

          <p className="mt-4 text-3xl font-bold text-white">
            {completedCount}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Generated blueprints
          </p>
        </div>

        {/* Failed */}
        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">
              Failed
            </span>

            <XCircle className="w-5 h-5 text-red-400" />
          </div>

          <p className="mt-4 text-3xl font-bold text-white">
            {failedCount}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Projects needing attention
          </p>
        </div>
      </div>

      {/* Project Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">

        {/* Completion Overview */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-blue-400" />

              <div>
                <h2 className="text-lg font-bold text-white">
                  Project Overview
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Your current blueprint generation progress
                </p>
              </div>
            </div>

            <span className="text-2xl font-bold text-blue-400">
              {completionPercentage}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">

            <div>
              <p className="text-xs text-slate-500">
                Total
              </p>

              <p className="text-xl font-bold text-white mt-1">
                {totalProjects}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Completed
              </p>

              <p className="text-xl font-bold text-emerald-400 mt-1">
                {completedCount}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Draft
              </p>

              <p className="text-xl font-bold text-amber-400 mt-1">
                {draftCount}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Failed
              </p>

              <p className="text-xl font-bold text-red-400 mt-1">
                {failedCount}
              </p>
            </div>

          </div>
        </div>

        {/* Quick Action */}
        <div className="p-6 rounded-xl bg-blue-500/5 border border-blue-500/20">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-5 h-5 text-blue-400" />

            <h2 className="text-lg font-bold text-white">
              Build Something New
            </h2>
          </div>

          <p className="text-sm text-slate-400 leading-6">
            Turn your software idea into a structured architecture,
            modules, database design, APIs, and development roadmap.
          </p>

          <Link
            to="/projects/create"
            className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition"
          >
            <PlusCircle className="w-4 h-4" />
            Create Project
          </Link>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="mt-10">

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            Recent Projects
          </h2>

          <Link
            to="/projects"
            className="text-sm font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
          >
            <span>View all</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            Loading projects...
          </div>

        ) : projects.length === 0 ? (

          <div className="p-12 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center">
            <FileCode2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />

            <h3 className="text-lg font-semibold text-white">
              No projects found
            </h3>

            <p className="mt-1 text-sm text-slate-400 max-w-sm mx-auto">
              Get started by creating your first architectural blueprint
              with custom specifications.
            </p>

            <Link
              to="/projects/create"
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Project</span>
            </Link>
          </div>

        ) : (

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {projects.slice(0, 6).map((proj) => (
              <div
                key={proj._id}
                className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between"
              >

                <div>

                  <div className="flex items-center justify-between mb-3 gap-2">

                    <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                      {proj.architectureType}
                    </span>

                    <span
                      className={`text-xs px-2 py-0.5 rounded font-medium ${
                        proj.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : proj.status === 'failed'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {proj.status}
                    </span>

                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">
                    {proj.title}
                  </h3>

                  <p className="text-slate-400 text-sm line-clamp-2 mb-4">
                    {proj.description || 'No description provided.'}
                  </p>

                </div>

                <div className="text-xs text-slate-500 pt-4 border-t border-slate-800/80 flex items-center justify-between">

                  <span>
                    Created{' '}
                    {new Date(proj.createdAt).toLocaleDateString()}
                  </span>

                  <Link
                    to="/projects"
                    className="text-blue-400 hover:text-blue-300 font-medium"
                  >
                    Details →
                  </Link>

                </div>

              </div>
            ))}

          </div>
        )}

      </div>
    </div>
  );
}