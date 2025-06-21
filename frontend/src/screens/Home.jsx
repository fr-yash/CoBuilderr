import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../context/user.context";
import axios from "../config/axios";

const Home = () => {
  const { user, isAuthenticated, logout, isLoading } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
  });

  const fetchProjects = useCallback(() => {
    if (isAuthenticated) {
      axios.get("projects/all")
        .then((response) => {
          console.log(response.data);
          setProjects(response.data.projects || []);
        })
        .catch((error) => {
          console.error("Error fetching projects:", error);
        });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Only fetch projects if user is authenticated
    fetchProjects();
  }, [isAuthenticated, fetchProjects]); // Add dependency array

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    axios.post("/projects/create", formData)
      .then((response) => {
        console.log(response.data);
        setIsModalOpen(false);
        // Reset form
        setFormData({ name: "" });
        // Refresh projects list
        fetchProjects();
      })
      .catch((error) => {
        console.error("Error creating project:", error);
      });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-white text-lg">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Project Manager</h1>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="text-gray-300">Welcome, {user?.email}</span>
                  <button
                    onClick={logout}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-200"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="space-x-3">
                  <Link
                    to="/login"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-200"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {isAuthenticated ? (
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Your Projects</h2>
                <p className="text-gray-300 mb-6">Manage your projects and create new ones.</p>

                {/* Projects Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {/* New Project Button */}
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-gray-700 hover:bg-gray-600 border-2 border-dashed border-gray-500 hover:border-gray-400 text-gray-300 hover:text-white font-semibold p-6 rounded-lg shadow-md transition duration-300 flex flex-col items-center justify-center min-h-[120px] group"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-sm">New Project</span>
                    </div>
                  </button>

                  {/* Existing Projects */}
                  {projects.map((project) => (
                    <Link
                      key={project._id}
                      to={`/project/${project._id}`}
                      className="bg-gray-700 hover:bg-gray-600 text-white font-semibold p-6 rounded-lg shadow-md transition duration-300 flex flex-col justify-between min-h-[120px] group border border-gray-600 hover:border-gray-500"
                    >
                      <div className="flex-1 flex items-center justify-center">
                        <h3 className="text-lg font-bold text-center truncate w-full group-hover:text-blue-300 transition-colors duration-200">
                          {project.name}
                        </h3>
                      </div>
                      <div className="flex items-center justify-center mt-3 text-gray-400 group-hover:text-gray-300 transition-colors duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-sm">{project.users?.length || 1}</span>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Empty State */}
                {projects.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-400 mb-4">No projects yet. Create your first project to get started!</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg shadow-lg p-8 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Welcome to Project Manager</h2>
              <p className="text-gray-300 mb-6">Please login or register to manage your projects.</p>
              <div className="space-x-4">
                <Link
                  to="/login"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition duration-200 inline-block"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition duration-200 inline-block"
                >
                  Register
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">New Project</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Project Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter project name"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;