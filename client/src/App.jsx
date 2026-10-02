import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyProjects from './pages/MyProjects';
import CreateProject from './pages/CreateProject';
import { Sparkles, Cpu, Server, Code2, ArrowRight } from 'lucide-react';

function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center px-4 py-16">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
        <Sparkles className="w-4 h-4" /> Next-Gen System Architecture with AI
      </div>

      <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight max-w-4xl leading-tight">
        Architect and Scale Full-Stack Systems with <span className="text-blue-500">Blueprint AI</span>
      </h1>

      <p className="mt-6 text-lg text-slate-400 max-w-2xl leading-relaxed">
        Production-ready MERN foundation engineered with Express, MongoDB, JWT authentication, and a responsive Vite React frontend.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link
          to="/register"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition shadow-lg shadow-blue-500/25"
        >
          <span>Get Started Free</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/login"
          className="px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition"
        >
          Sign In
        </Link>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-5xl w-full text-left">
        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition">
          <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400 w-fit mb-4">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-white">AI-Driven Architecture</h3>
          <p className="mt-2 text-slate-400 text-sm leading-relaxed">
            Ready for Google GenAI integration to synthesize high-availability architectural blueprints and flowcharts.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 w-fit mb-4">
            <Server className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-white">Secure MERN Backend</h3>
          <p className="mt-2 text-slate-400 text-sm leading-relaxed">
            Express API with JWT authentication, bcrypt password hashing, and Mongoose schemas for Users and Projects.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition">
          <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400 w-fit mb-4">
            <Code2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-white">Vite & Tailwind CSS</h3>
          <p className="mt-2 text-slate-400 text-sm leading-relaxed">
            Blazing fast frontend with Lucide icons, responsive navigation, and protected route state management.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-500/30">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects"
                element={
                  <ProtectedRoute>
                    <MyProjects />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects/create"
                element={
                  <ProtectedRoute>
                    <CreateProject />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}
