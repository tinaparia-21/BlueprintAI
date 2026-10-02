import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  Layers,
  LogOut,
  PlusCircle,
  FolderKanban,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 text-white font-bold text-xl tracking-tight"
        >
          <div className="p-2 rounded-lg bg-blue-600/20 text-blue-500 border border-blue-500/30">
            <Layers className="w-5 h-5" />
          </div>

          <span>
            Blueprint<span className="text-blue-500">AI</span>
          </span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">

          {isAuthenticated ? (
            <>
              {/* Dashboard */}
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition ${
                    isActive
                      ? 'bg-blue-600 text-white border border-blue-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </NavLink>

              {/* My Projects */}
              <NavLink
                to="/projects"
                end
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition ${
                    isActive
                      ? 'bg-blue-600 text-white border border-blue-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                <FolderKanban className="w-4 h-4" />
                <span>My Projects</span>
              </NavLink>

              {/* New Project */}
              <NavLink
                to="/projects/create"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition ${
                    isActive
                      ? 'bg-blue-700 text-white shadow-md shadow-blue-500/20'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                  }`
                }
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">New Project</span>
              </NavLink>

              {/* User + Logout */}
              <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-slate-800">
                <span className="text-xs text-slate-400 hidden md:inline">
                  {user?.name || user?.email}
                </span>

                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Sign In */}
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-sm font-medium text-slate-300 hover:text-white transition"
              >
                Sign In
              </Link>

              {/* Get Started */}
              <Link
                to="/register"
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition shadow-md shadow-blue-500/20"
              >
                Get Started
              </Link>
            </>
          )}

        </nav>
      </div>
    </header>
  );
}

