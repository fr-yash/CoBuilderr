import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useUser } from "../context/user.context";
import axios from "../config/axios";
import { createSocketConnection, receiveMessage, sendMessage, disconnectSocket } from "../config/socket";
import Markdown from "markdown-to-jsx";

// Component to render message content with markdown support for AI messages
const MessageContent = ({ message, isCurrentUser }) => {
  const isAIMessage = message.sender === "AI";

  if (isAIMessage) {
    return (
      <div className="ai-message-content">
        <Markdown
          options={{
            overrides: {
              // Custom styling for markdown elements in AI messages
              h1: { props: { className: 'text-lg font-bold mb-3 text-gray-800' } },
              h2: { props: { className: 'text-base font-bold mb-2 text-gray-800' } },
              h3: { props: { className: 'text-sm font-bold mb-2 text-gray-800' } },
              h4: { props: { className: 'text-sm font-semibold mb-1 text-gray-800' } },
              p: { props: { className: 'text-sm text-gray-700 mb-2 last:mb-0 leading-relaxed' } },
              ul: { props: { className: 'list-disc list-inside text-sm text-gray-700 mb-2 ml-2' } },
              ol: { props: { className: 'list-decimal list-inside text-sm text-gray-700 mb-2 ml-2' } },
              li: { props: { className: 'mb-1 leading-relaxed' } },
              strong: { props: { className: 'font-bold text-gray-800' } },
              em: { props: { className: 'italic text-gray-700' } },
              a: { props: { className: 'text-blue-600 hover:text-blue-800 underline' } },
              hr: { props: { className: 'border-gray-300 my-3' } },
            }
          }}
        >
          {message.text}
        </Markdown>
      </div>
    );
  }

  // Regular text message for non-AI messages
  return (
    <p className={`text-sm break-words ${
      isCurrentUser ? 'text-white' : 'text-gray-700'
    }`}>
      {message.text}
    </p>
  );
};

// Component to render file tree
const FileTreePanel = ({ fileTree, buildCommand, startCommand, onFileSelect, activeFile }) => {
  const renderFileTree = (tree, path = '') => {
    return Object.entries(tree).map(([name, content]) => {
      const fullPath = path ? `${path}/${name}` : name;

      if (content.file) {
        return (
          <div
            key={fullPath}
            className={`flex items-center space-x-2 p-2 rounded cursor-pointer hover:bg-gray-700 transition-colors ${
              activeFile && activeFile.name === fullPath ? 'bg-gray-700' : ''
            }`}
            onClick={() => onFileSelect(fullPath, content.file.contents)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm text-gray-300">{name}</span>
          </div>
        );
      } else {
        return (
          <div key={fullPath} className="mb-2">
            <div className="flex items-center space-x-2 p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5L12 5H5a2 2 0 00-2 2z" />
              </svg>
              <span className="text-sm font-medium text-gray-200">{name}</span>
            </div>
            <div className="ml-6">
              {renderFileTree(content, fullPath)}
            </div>
          </div>
        );
      }
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h3 className="text-lg font-medium text-white">Generated Files</h3>
        <div className="flex space-x-2">
          {buildCommand && (
            <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition duration-200">
              Build
            </button>
          )}
          {startCommand && (
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition duration-200">
              Start
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {fileTree ? renderFileTree(fileTree) : (
          <div className="text-center text-gray-500 mt-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5L12 5H5a2 2 0 00-2 2z" />
            </svg>
            <p>No files generated yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Component to display file content with tabs
const FileViewer = ({
  openFiles,
  activeFile,
  onTabClick,
  onCloseFile,
  editingFiles,
  onEditFile,
  onSaveFile,
  onCancelEdit,
  onFileContentChange
}) => {
  const [editContent, setEditContent] = useState('');

  const isEditing = activeFile && editingFiles[activeFile.name];

  const handleCopyContent = async () => {
    if (activeFile && activeFile.content) {
      try {
        await navigator.clipboard.writeText(activeFile.content);
        // You could add a toast notification here
        console.log('Content copied to clipboard');
      } catch (err) {
        console.error('Failed to copy content:', err);
      }
    }
  };

  const handleStartEdit = () => {
    if (activeFile) {
      setEditContent(activeFile.content);
      onEditFile(activeFile.name);
    }
  };

  const handleSave = () => {
    if (activeFile) {
      onSaveFile(activeFile.name, editContent);
    }
  };

  const handleCancel = () => {
    if (activeFile) {
      setEditContent('');
      onCancelEdit(activeFile.name);
    }
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setEditContent(newContent);
    if (activeFile) {
      onFileContentChange(activeFile.name, newContent);
    }
  };

  if (!activeFile) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium mb-2">Select a file</h3>
          <p className="text-sm">Choose a file from the tree to view its content</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Tab Bar */}
      {openFiles.length > 0 && (
        <div className="flex bg-gray-800 border-b border-gray-700 overflow-x-auto file-tabs">
          {openFiles.map((file) => (
            <div
              key={file.name}
              className={`flex items-center min-w-0 max-w-48 border-r border-gray-700 ${
                activeFile.name === file.name
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <button
                onClick={() => onTabClick(file)}
                className="flex-1 flex items-center space-x-2 px-3 py-2 text-left min-w-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm truncate">
                  {file.name.split('/').pop()}
                  {file.isModified && <span className="text-orange-400 ml-1">●</span>}
                </span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseFile(file.name);
                }}
                className="p-1 hover:bg-gray-600 rounded transition-colors flex-shrink-0 mr-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* File Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-900">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-medium text-white">{activeFile.name}</h3>
          {activeFile.isModified && <span className="text-orange-400 text-sm">● Modified</span>}
        </div>
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition duration-200 flex items-center space-x-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Save</span>
              </button>
              <button
                onClick={handleCancel}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition duration-200 flex items-center space-x-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Cancel</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleStartEdit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition duration-200 flex items-center space-x-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit</span>
              </button>
              <button
                onClick={handleCopyContent}
                className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm transition duration-200 flex items-center space-x-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copy</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* File Content */}
      <div className="flex-1 overflow-auto bg-gray-800">
        {isEditing ? (
          <textarea
            value={editContent}
            onChange={handleContentChange}
            className="w-full h-full p-4 bg-gray-800 text-gray-300 font-mono text-sm resize-none border-none outline-none file-editor-textarea"
            style={{ minHeight: '100%' }}
            placeholder="Edit your file content here..."
            spellCheck={false}
          />
        ) : (
          <div className="p-4">
            <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
              {activeFile.content}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

const Project = () => {
  const { projectId } = useParams();
  const { user, isAuthenticated } = useUser();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showUserList, setShowUserList] = useState(false);
  const [showAddCollaboratorModal, setShowAddCollaboratorModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [currentFileTree, setCurrentFileTree] = useState(null);
  const [openFiles, setOpenFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [editingFiles, setEditingFiles] = useState({}); // Track which files are being edited
  const [buildCommand, setBuildCommand] = useState(null);
  const [startCommand, setStartCommand] = useState(null);
  const messagesEndRef = useRef(null);

  // Generate unique ID for messages
  const generateUniqueId = () => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  };

  const fetchProject = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/projects/get-project/${projectId}`);
      setProject(response.data.project);
    } catch (error) {
      console.error("Error fetching project:", error);
      setError("Failed to load project");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const handleSaveFile = useCallback((fileName, newContent) => {
    // Update the file content in openFiles
    setOpenFiles(prev => prev.map(file =>
      file.name === fileName
        ? { ...file, content: newContent, isModified: false }
        : file
    ));

    // Update active file if it's the one being saved
    if (activeFile && activeFile.name === fileName) {
      setActiveFile(prev => ({ ...prev, content: newContent, isModified: false }));
    }

    // Exit edit mode
    setEditingFiles(prev => ({
      ...prev,
      [fileName]: false
    }));
  }, [activeFile]);

  const handleCancelEdit = useCallback((fileName) => {
    setEditingFiles(prev => ({
      ...prev,
      [fileName]: false
    }));
  }, []);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Keyboard shortcuts for file editing
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+S or Cmd+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && activeFile) {
        e.preventDefault();
        if (editingFiles[activeFile.name]) {
          // Save the current content from the active file
          handleSaveFile(activeFile.name, activeFile.content);
        }
      }

      // Escape to cancel editing
      if (e.key === 'Escape' && activeFile && editingFiles[activeFile.name]) {
        e.preventDefault();
        handleCancelEdit(activeFile.name);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeFile, editingFiles, handleSaveFile, handleCancelEdit]);

  useEffect(() => {
    if (isAuthenticated && projectId) {
      fetchProject();
    }
  }, [isAuthenticated, projectId, fetchProject]);

  // Separate useEffect for socket connection after project is loaded
  useEffect(() => {
    if (project && project._id) {
      createSocketConnection(project._id);
      receiveMessage('project-message', (message) => {
        // Ensure received messages have unique IDs and proper timestamp format
        const messageWithId = {
          ...message,
          id: message.id || generateUniqueId(),
          timestamp: message.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        // If this is an AI message with fileTree, update the file panel
        if (message.sender === "AI") {
          console.log('Received AI message:', message);
          console.log('FileTree in message:', !!message.fileTree);
          console.log('FileTree content:', message.fileTree);

          if (message.fileTree) {
            setCurrentFileTree(message.fileTree);
            setBuildCommand(message.buildCommand);
            setStartCommand(message.startCommand);
            console.log('Updated file tree state');
          } else {
            console.log('No fileTree found in AI message');
          }
        }

        setMessages(prev => {
          // Check if message already exists to prevent duplicates
          const messageExists = prev.some(existingMessage => existingMessage.id === messageWithId.id);
          if (messageExists) {
            return prev;
          }
          return [...prev, messageWithId];
        });
      });
    }

    // Cleanup function to disconnect socket when component unmounts
    return () => {
      disconnectSocket();
    };
  }, [project]);



  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const message = {
        id: generateUniqueId(),
        text: newMessage,
        sender: user?.email || 'You',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => {
        // Check if message already exists to prevent duplicates
        const messageExists = prev.some(existingMessage => existingMessage.id === message.id);
        if (messageExists) {
          return prev;
        }
        return [...prev, message];
      });
      sendMessage(message);
      setNewMessage("");
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
  };

  const toggleUserList = () => {
    setShowUserList(!showUserList);
  };

  const handleFileSelect = (fileName, content) => {
    // Check if file is already open
    const existingFile = openFiles.find(file => file.name === fileName);

    if (!existingFile) {
      // Add new file to open files
      const newFile = { name: fileName, content: content };
      setOpenFiles(prev => [...prev, newFile]);
    }

    // Set as active file
    setActiveFile({ name: fileName, content: content });
  };

  const handleCloseFile = (fileName) => {
    // Remove file from open files
    setOpenFiles(prev => prev.filter(file => file.name !== fileName));

    // If closing the active file, switch to another open file or clear active file
    if (activeFile && activeFile.name === fileName) {
      const remainingFiles = openFiles.filter(file => file.name !== fileName);
      if (remainingFiles.length > 0) {
        setActiveFile(remainingFiles[remainingFiles.length - 1]);
      } else {
        setActiveFile(null);
      }
    }
  };

  const handleTabClick = (file) => {
    setActiveFile(file);
  };

  const handleEditFile = (fileName) => {
    setEditingFiles(prev => ({
      ...prev,
      [fileName]: true
    }));
  };



  const handleFileContentChange = (fileName, newContent) => {
    // Update the file content in openFiles and mark as modified
    setOpenFiles(prev => prev.map(file =>
      file.name === fileName
        ? { ...file, content: newContent, isModified: true }
        : file
    ));

    // Update active file if it's the one being edited
    if (activeFile && activeFile.name === fileName) {
      setActiveFile(prev => ({ ...prev, content: newContent, isModified: true }));
    }
  };

  const toggleAddCollaboratorModal = async () => {
    if (!showAddCollaboratorModal) {
      // Fetch all users when opening modal
      await fetchAllUsers();
    }
    setShowAddCollaboratorModal(!showAddCollaboratorModal);
  };

  const fetchAllUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await axios.get('/users/all');
      setAllUsers(response.data.allUsers || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const addUserToProject = async (userId) => {
    try {
      const response = await axios.put('/projects/add-users', {
        projectId: projectId,
        users: [userId]
      });

      // Refresh project data to show new user
      await fetchProject();

      // Close modal
      setShowAddCollaboratorModal(false);

      console.log("User added successfully:", response.data);
    } catch (error) {
      console.error("Error adding user to project:", error);
      // You could add error handling/notification here
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-gray-300 mb-6">Please login to view this project.</p>
          <Link
            to="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition duration-200 inline-block"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading project...</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Project Not Found</h2>
          <p className="text-gray-300 mb-6">{error || "The project you're looking for doesn't exist."}</p>
          <Link
            to="/"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition duration-200 inline-block"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="text-gray-300 hover:text-white transition duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-xl font-bold text-white">{project.name}</h1>
              <button
                onClick={toggleAddCollaboratorModal}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm transition duration-200 flex items-center space-x-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Collaborator</span>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              {/* User Icon - Clickable */}
              <button
                onClick={toggleUserList}
                className="w-8 h-8 bg-gray-600 hover:bg-gray-500 rounded-full flex items-center justify-center transition duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>
      

      {/* Main Content Area */}
      <div className="flex-1 flex relative">
        {/* Chat Area - Left Side */}
        <div className="chatArea w-80 flex flex-col border-r border-gray-700" style={{ height: 'calc(100vh - 65px)' }}>
          {/* Messages Area */}
          <div className="flex-1 bg-slate-300 p-4 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 text-sm">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message) => {
                  const isCurrentUser = message.sender === user?.email || message.sender === 'You';
                  const isAIMessage = message.sender === "AI";

                  return (
                    <div key={message.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`rounded-lg p-3 shadow-sm ${
                        isAIMessage
                          ? 'max-w-[90%] min-w-[200px] bg-green-50 border border-green-200'
                          : isCurrentUser
                            ? 'max-w-[80%] min-w-[120px] bg-blue-600 text-white'
                            : 'max-w-[80%] min-w-[120px] bg-white text-gray-700'
                      } w-fit`}>
                        <div className="flex items-center justify-between mb-1 gap-2">
                          <span className={`font-medium text-sm flex-shrink-0 ${
                            isAIMessage
                              ? 'text-green-800 flex items-center gap-1'
                              : isCurrentUser
                                ? 'text-blue-100'
                                : 'text-gray-800'
                          }`}>
                            {isAIMessage && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                            )}
                            {isCurrentUser ? 'You' : message.sender}
                          </span>
                          <span className={`text-xs flex-shrink-0 ${
                            isAIMessage
                              ? 'text-green-600'
                              : isCurrentUser
                                ? 'text-blue-200'
                                : 'text-gray-500'
                          }`}>
                            {message.timestamp}
                          </span>
                        </div>
                        <MessageContent message={message} isCurrentUser={isCurrentUser} />
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Message Input Area */}
          <div className="bg-gray-800 p-3">
            <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={handleInputChange}
                placeholder="Enter message (use @ai for AI assistance)"
                className="flex-1 bg-gray-700 text-white placeholder-gray-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-gray-600 transition duration-200"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition duration-200 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </form>
          </div>
        </div>

        {/* Main Content Area - Right Side */}
        {currentFileTree ? (
          <div className="flex-1 flex" style={{ height: 'calc(100vh - 65px)' }}>
            {/* File Tree Panel - Left */}
            <div className="w-80 bg-gray-800 border-r border-gray-700">
              <FileTreePanel
                fileTree={currentFileTree}
                buildCommand={buildCommand}
                startCommand={startCommand}
                onFileSelect={handleFileSelect}
                activeFile={activeFile}
              />
            </div>

            {/* File Viewer - Right */}
            <div className="flex-1 bg-gray-900">
              <FileViewer
                openFiles={openFiles}
                activeFile={activeFile}
                onTabClick={handleTabClick}
                onCloseFile={handleCloseFile}
                editingFiles={editingFiles}
                onEditFile={handleEditFile}
                onSaveFile={handleSaveFile}
                onCancelEdit={handleCancelEdit}
                onFileContentChange={handleFileContentChange}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-gray-900 flex items-center justify-center">
            <div className="text-gray-500 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="text-lg font-medium mb-2">Project Workspace</h3>
              <p className="text-sm">Ask AI to generate files using @ai</p>
              <p className="text-xs text-gray-600 mt-2">Example: "@ai create a React todo app"</p>
            </div>
          </div>
        )}

        {/* User List Popup */}
        {showUserList && (
          <div className="absolute top-0 right-4 bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-4 min-w-64 z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">Team Members</h3>
              <button
                onClick={toggleUserList}
                className="text-gray-400 hover:text-gray-300 transition duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-2">
              {project.users && project.users.length > 0 ? (
                project.users.map((user, index) => (
                  <div key={user._id || index} className="flex items-center space-x-3 p-2 bg-gray-700 rounded-lg">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                      </span>
                    </div>
                    <span className="text-gray-300 text-sm">{user.email || 'Unknown User'}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No team members found</p>
              )}
            </div>
          </div>
        )}

        {/* Add Collaborator Modal */}
        {showAddCollaboratorModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-6 w-96 max-h-96 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium text-lg">Add Collaborator</h3>
                <button
                  onClick={toggleAddCollaboratorModal}
                  className="text-gray-400 hover:text-gray-300 transition duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="overflow-y-auto max-h-64">
                {loadingUsers ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-gray-400">Loading users...</div>
                  </div>
                ) : allUsers.length > 0 ? (
                  <div className="space-y-2">
                    {allUsers
                      .filter(user => !project.users?.some(projectUser => projectUser._id === user._id))
                      .map((user) => (
                        <div key={user._id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition duration-200">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {user.email.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-gray-300">{user.email}</span>
                          </div>
                          <button
                            onClick={() => addUserToProject(user._id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition duration-200"
                          >
                            Add
                          </button>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No users available to add</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Project;
