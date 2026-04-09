import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/user.context";
import axios from "../config/axios";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Plus, LogOut, Code2, Users, LayoutTemplate, X, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

const Home = () => {
  const { user, isAuthenticated, logout, isLoading } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ name: "" });
  const navigate = useNavigate();

  const fetchProjects = useCallback(async () => {
    if (isAuthenticated) {
      try {
        const response = await axios.get("projects/all");
        setProjects(response.data.projects || []);
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast.error("Failed to load projects");
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchProjects();
  }, [isAuthenticated, fetchProjects]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsCreating(true);
    const loadingToast = toast.loading("Creating project...");
    
    try {
      const response = await axios.post("/projects/create", formData);
      toast.success("Project created successfully!", { id: loadingToast });
      setIsModalOpen(false);
      setFormData({ name: "" });
      fetchProjects();
      navigate(`/project/${response.data.project._id || response.data._id}`);
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error(error.response?.data?.message || "Failed to create project", { id: loadingToast });
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          <span className="text-gray-400 font-medium tracking-wide">Initializing workspace...</span>
        </motion.div>
      </div>
    );
  }

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 glass-panel border-b-0 border-white/5 py-4">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              CoBuilder
            </h1>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4"
          >
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 text-sm text-gray-400">
                  <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-300 font-medium border border-gray-700">
                    {user?.email?.[0].toUpperCase()}
                  </div>
                  <span className="truncate max-w-[120px]">{user?.email}</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-200 px-4 py-2 rounded-lg transition-colors border border-gray-700"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="space-x-3 text-sm font-medium">
                <Link to="/login" className="text-gray-300 hover:text-white px-4 py-2 transition-colors">
                  Log in
                </Link>
                <Link to="/register" className="bg-white text-black hover:bg-gray-200 px-5 py-2.5 rounded-lg transition-colors shadow-lg shadow-white/10">
                  Sign up
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 lg:py-20">
        {!isAuthenticated ? (
          <motion.div 
            initial="hidden"
            animate="show"
            variants={containerVariants}
            className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto mt-10"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-8 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Next-generation intelligent workspace</span>
            </motion.div>
            
            <motion.h2 variants={itemVariants} className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              Build amazing software, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                together with AI.
              </span>
            </motion.h2>
            
            <motion.p variants={itemVariants} className="text-lg md:text-xl text-gray-400 mb-10 leading-relaxed max-w-2xl">
              CoBuilder provides a seamless real-time collaborative environment where you and your team can design, code, and deploy directly from the browser with powerful AI assistance.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link to="/register" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-4 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2">
                Start Building Free
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </Link>
              <Link to="/login" className="glass-panel hover:bg-gray-800 text-white px-8 py-4 rounded-xl font-medium transition-colors flex items-center justify-center">
                Sign in to workspace
              </Link>
            </motion.div>
          </motion.div>
        ) : (
          <div className="space-y-8 mt-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-800 pb-6"
            >
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Your Projects</h2>
                <p className="text-gray-400">Continue building or start something new.</p>
              </div>
            </motion.div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
              {/* New Project Button */}
              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsModalOpen(true)}
                className="glass-card flex flex-col items-center justify-center min-h-[180px] p-6 text-gray-400 hover:text-white rounded-2xl border-dashed border-2 group bg-gray-900/40"
              >
                <div className="w-12 h-12 rounded-full bg-gray-800 group-hover:bg-blue-600/20 group-hover:text-blue-400 flex items-center justify-center mb-4 transition-colors">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="font-medium font-sans">Create New Project</span>
              </motion.button>

              {/* Existing Projects */}
              {projects.map((project) => (
                <motion.div key={project._id} variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to={`/project/${project._id}`}
                    className="glass-card flex flex-col justify-between min-h-[180px] p-6 rounded-2xl group block relative overflow-hidden h-full"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-blue-500/10 transition-colors" />
                    
                    <div>
                      <div className="w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center mb-4 text-blue-400">
                        <LayoutTemplate className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-1 truncate pr-4 group-hover:text-blue-400 transition-colors">
                        {project.name}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">Updated recently</p>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-800">
                      <div className="flex items-center text-gray-400 text-sm">
                        <Users className="w-4 h-4 mr-1.5" />
                        <span>{project.users?.length || 1} Collaborators</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {/* Empty State Addressed by adding the New Project Card alongside others */}
          </div>
        )}
      </main>

      {/* Animated Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative glass-modal w-full max-w-md p-8 rounded-2xl"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-1 rounded-md hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
                  <LayoutTemplate className="w-6 h-6 text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Create a new project</h2>
                <p className="text-gray-400 mt-1 text-sm">Give your new workspace a descriptive name to get started.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Project Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="e.g. NextJS E-commerce"
                    autoFocus
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-medium py-2.5 px-4 rounded-xl transition-colors border border-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating || !formData.name.trim()}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white font-medium py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {isCreating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Create Workspace"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;