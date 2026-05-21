import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useUser } from "../context/user.context";
import axios from "../config/axios";
import { createSocketConnection, receiveMessage, sendMessage, disconnectSocket, emitEvent } from "../config/socket";
import MessageContent from "../components/MessageContent";
import FileTreePanel from "../components/FileTreePanel";
import FileViewer from "../components/FileViewer";
import LivePreview from "../components/preview/LivePreview";
import { detectCodeLanguage } from "../utils/detectCodeLanguage";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Users, UserPlus, X, Send, Loader2, MessageSquare, Code2, Sparkles, AlertCircle, FilePlus2 } from "lucide-react";
import toast from "react-hot-toast";

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
  const [editingFiles, setEditingFiles] = useState({});
  const [buildCommand, setBuildCommand] = useState(null);
  const [startCommand, setStartCommand] = useState(null);
  const [previewBlocks, setPreviewBlocks] = useState([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const generateUniqueId = () => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  };

  const fetchProject = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/projects/get-project/${projectId}`);
      setProject(response.data.project);

      // Load DB persistence into UI state
      if (response.data.project.messages?.length > 0) {
        setMessages(response.data.project.messages);
      }
      if (response.data.project.fileTree && Object.keys(response.data.project.fileTree).length > 0) {
        setCurrentFileTree(response.data.project.fileTree);
      }

    } catch (error) {
      console.error("Error fetching project:", error);
      setError("Failed to load workspace");
      toast.error("Failed to load workspace");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const updateTreeRecursively = useCallback((tree, pathParts, content) => {
    if (pathParts.length === 1) {
      if (tree[pathParts[0]] && tree[pathParts[0]].file) {
        tree[pathParts[0]].file.contents = content;
      }
      return tree;
    }
    const currentPart = pathParts.shift();
    if (tree[currentPart]) {
      tree[currentPart] = updateTreeRecursively(tree[currentPart], pathParts, content);
    }
    return tree;
  }, []);

  const upsertFileInTree = (tree, fileName, content) => {
    const nextTree = tree ? JSON.parse(JSON.stringify(tree)) : {};
    const pathParts = fileName.split('/').filter(Boolean);
    let cursor = nextTree;

    pathParts.slice(0, -1).forEach((part) => {
      if (!cursor[part] || cursor[part].file) {
        cursor[part] = {};
      }
      cursor = cursor[part];
    });

    cursor[pathParts[pathParts.length - 1]] = {
      file: { contents: content },
    };

    return nextTree;
  };

  const getStarterContentForFile = (fileName) => {
    const extension = fileName.split('.').pop()?.toLowerCase();

    if (extension === 'html') {
      return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>New Page</title>
  </head>
  <body>
    <main>
      <h1>Hello Cobuilder</h1>
    </main>
  </body>
</html>
`;
    }

    if (extension === 'css') {
      return `body {
  margin: 0;
  font-family: system-ui, sans-serif;
}
`;
    }

    if (['js', 'mjs', 'cjs'].includes(extension)) {
      return `function main() {
  console.log("Hello Cobuilder");
}

main();
`;
    }

    if (['jsx', 'tsx'].includes(extension)) {
      return `export default function App() {
  return (
    <main>
      <h1>Hello Cobuilder</h1>
    </main>
  );
}
`;
    }

    return "";
  };

  const getDefaultFileNameForLanguage = (language) => {
    const normalizedLanguage = detectCodeLanguage("", language);

    if (normalizedLanguage === "html") return "index.html";
    if (normalizedLanguage === "css") return "style.css";
    if (normalizedLanguage === "javascript") return "script.js";
    if (["jsx", "react"].includes(normalizedLanguage)) return "App.jsx";

    return "ai-generated-code.txt";
  };

  const getLanguageForFile = useCallback((fileName = "", content = "") => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const languageByExtension = {
      html: "html",
      css: "css",
      js: "javascript",
      mjs: "javascript",
      cjs: "javascript",
      jsx: "react",
      tsx: "react",
    };

    return detectCodeLanguage(content, languageByExtension[extension]);
  }, []);

  const flattenFileTree = useCallback((tree, path = '') => {
    if (!tree || typeof tree !== 'object') return [];

    return Object.entries(tree).flatMap(([name, content]) => {
      const fullPath = path ? `${path}/${name}` : name;

      if (content?.file) {
        return [{
          name: fullPath,
          content: content.file.contents || "",
        }];
      }

      if (typeof content === 'string') {
        return [{
          name: fullPath,
          content,
        }];
      }

      if (typeof content === 'object' && content !== null) {
        return flattenFileTree(content, fullPath);
      }

      return [];
    });
  }, []);

  const getRunnableReactFile = useCallback((files, selectedFile) => {
    const selectedName = selectedFile.name.split('/').pop()?.toLowerCase() || "";
    const selectedLanguage = getLanguageForFile(selectedFile.name, selectedFile.content);

    if (["react", "jsx"].includes(selectedLanguage) && !/^main\.(jsx|tsx|js|ts)$/.test(selectedName)) {
      return selectedFile;
    }

    const reactFiles = files
      .map((file) => ({ ...file, language: getLanguageForFile(file.name, file.content) }))
      .filter((file) => ["react", "jsx"].includes(file.language));

    const appFile = reactFiles.find((file) => /(^|\/)app\.(jsx|tsx|js|ts)$/i.test(file.name));
    if (appFile) return appFile;

    const componentWithDefaultExport = reactFiles.find((file) =>
      /export\s+default\s+(function|class|[A-Z][A-Za-z0-9_$]*|\([^)]*\)\s*=>)/.test(file.content)
    );
    if (componentWithDefaultExport) return componentWithDefaultExport;

    const componentDefinition = reactFiles.find((file) =>
      /\b(function|const|let|var|class)\s+[A-Z][A-Za-z0-9_$]*\b/.test(file.content)
    );

    return componentDefinition || selectedFile;
  }, [getLanguageForFile]);

  const buildReactPreviewFile = useCallback((files, selectedFile) => {
    const reactFiles = files
      .map((file) => ({ ...file, language: getLanguageForFile(file.name, file.content) }))
      .filter((file) => ["react", "jsx"].includes(file.language));

    const runnableReactFile = getRunnableReactFile(files, selectedFile);
    const isEntryFile = (fileName = "") => /(^|\/)(main|index)\.(jsx|tsx|js|ts)$/i.test(fileName);
    const orderedFiles = [
      ...reactFiles
        .filter((file) => file.name !== runnableReactFile.name)
        .filter((file) => !isEntryFile(file.name))
        .sort((a, b) => a.name.localeCompare(b.name)),
      runnableReactFile,
    ];

    return {
      name: runnableReactFile.name,
      content: orderedFiles
        .map((file) => `// ${file.name}\n${file.content}`)
        .join("\n\n"),
    };
  }, [getLanguageForFile, getRunnableReactFile]);

  const handleSaveFile = useCallback((fileName, newContent) => {
    setOpenFiles(prev => prev.map(file =>
      file.name === fileName ? { ...file, content: newContent, isModified: false } : file
    ));
    if (activeFile && activeFile.name === fileName) {
      setActiveFile(prev => ({ ...prev, content: newContent, isModified: false }));
    }
    setEditingFiles(prev => ({ ...prev, [fileName]: false }));

    // Mutate global tree and broadcast to DB & peers
    if (currentFileTree) {
       const duplicatedTree = JSON.parse(JSON.stringify(currentFileTree));
       const newTree = updateTreeRecursively(duplicatedTree, fileName.split('/'), newContent);
       setCurrentFileTree(newTree);
       emitEvent('update-file-tree', newTree);
    }

    toast.success(`Saved ${fileName.split('/').pop()}`, { icon: '💾' });
  }, [activeFile, currentFileTree, updateTreeRecursively]);

  const handleRunActiveFile = useCallback(() => {
    if (!activeFile) {
      toast.error("Select a file to run");
      return;
    }

    const treeFiles = flattenFileTree(currentFileTree);
    const openFilesByName = new Map(openFiles.map((file) => [file.name, file.content]));
    const files = treeFiles.map((file) => ({
      ...file,
      content: openFilesByName.get(file.name) ?? file.content,
    }));

    if (!files.some((file) => file.name === activeFile.name)) {
      files.push({ name: activeFile.name, content: activeFile.content || "" });
    }

    const selectedFile = {
      name: activeFile.name,
      content: activeFile.content || openFilesByName.get(activeFile.name) || "",
    };
    const selectedLanguage = getLanguageForFile(selectedFile.name, selectedFile.content);

    const toBlock = (file) => ({
      id: file.name,
      name: file.name,
      language: getLanguageForFile(file.name, file.content),
      code: file.content,
    });

    if (["react", "jsx"].includes(selectedLanguage)) {
      const reactPreviewFile = buildReactPreviewFile(files, selectedFile);
      setPreviewBlocks([toBlock(reactPreviewFile)]);
      setIsPreviewOpen(true);
      return;
    }

    const staticFiles = files
      .map((file) => ({ ...file, language: getLanguageForFile(file.name, file.content) }))
      .filter((file) => ["html", "css", "javascript"].includes(file.language));

    const selectedBlock = toBlock(selectedFile);
    const companionBlocks = staticFiles
      .filter((file) => file.name !== selectedFile.name)
      .filter((file) => {
        if (selectedLanguage === "html") return ["css", "javascript"].includes(file.language);
        if (selectedLanguage === "css") return ["html", "javascript"].includes(file.language);
        if (selectedLanguage === "javascript") return ["html", "css"].includes(file.language);
        return false;
      })
      .sort((a, b) => {
        const order = { html: 0, css: 1, javascript: 2 };
        return order[a.language] - order[b.language];
      })
      .map(toBlock);

    const blocks = ["html", "css", "javascript"].includes(selectedLanguage)
      ? [...companionBlocks, selectedBlock]
      : [selectedBlock];

    setPreviewBlocks(blocks);
    setIsPreviewOpen(true);
  }, [activeFile, buildReactPreviewFile, currentFileTree, flattenFileTree, getLanguageForFile, openFiles]);

  const handleClearPreview = useCallback(() => {
    setPreviewBlocks([]);
    setIsPreviewOpen(false);
  }, []);

  const handleInsertAICode = useCallback((block) => {
    if (!block?.code?.trim()) {
      toast.error("No code to insert");
      return;
    }

    const language = detectCodeLanguage(block.code, block.language || block.providedLanguage);
    const fileName = getDefaultFileNameForLanguage(language);
    const newTree = upsertFileInTree(currentFileTree, fileName, block.code);
    const insertedFile = { name: fileName, content: block.code, isModified: false };

    setCurrentFileTree(newTree);
    setOpenFiles((prev) => {
      const exists = prev.some((file) => file.name === fileName);
      if (exists) {
        return prev.map((file) => (file.name === fileName ? insertedFile : file));
      }
      return [...prev, insertedFile];
    });
    setActiveFile(insertedFile);
    setEditingFiles((prev) => ({ ...prev, [fileName]: false }));

    emitEvent('update-file-tree', newTree);
    emitEvent('ai-code:inserted', {
      fileName,
      language,
      insertedBy: user?.email || 'Unknown user',
      timestamp: new Date().toISOString(),
    });

    toast.success(`Inserted AI code into ${fileName}`);
  }, [currentFileTree, user?.email]);

  const handleCreateFile = (requestedFileName) => {
    const fileName = requestedFileName.trim().replaceAll('\\', '/').replace(/^\/+/, '');

    if (!fileName || fileName.endsWith('/')) {
      toast.error("Enter a valid file name");
      return;
    }

    const existingFiles = flattenFileTree(currentFileTree);
    if (existingFiles.some((file) => file.name === fileName)) {
      const existingFile = existingFiles.find((file) => file.name === fileName);
      handleFileSelect(existingFile.name, existingFile.content);
      toast.error(`${fileName} already exists`);
      return;
    }

    const content = getStarterContentForFile(fileName);
    const newTree = upsertFileInTree(currentFileTree, fileName, content);
    const newFile = { name: fileName, content, isModified: false };

    setCurrentFileTree(newTree);
    setOpenFiles((prev) => [...prev, newFile]);
    setActiveFile(newFile);
    setEditingFiles((prev) => ({ ...prev, [fileName]: true }));

    emitEvent('update-file-tree', newTree);
    toast.success(`Created ${fileName}`);
  };

  const handleCancelEdit = useCallback((fileName) => {
    setEditingFiles(prev => ({ ...prev, [fileName]: false }));
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && activeFile) {
        e.preventDefault();
        if (editingFiles[activeFile.name]) {
          handleSaveFile(activeFile.name, activeFile.content);
        }
      }
      if (e.key === 'Escape' && activeFile && editingFiles[activeFile.name]) {
        e.preventDefault();
        handleCancelEdit(activeFile.name);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeFile, editingFiles, handleSaveFile, handleCancelEdit]);

  useEffect(() => {
    if (isAuthenticated && projectId) fetchProject();
  }, [isAuthenticated, projectId, fetchProject]);

  useEffect(() => {
    if (project && project._id) {
      createSocketConnection(project._id);
      receiveMessage('project-message', (message) => {
        const messageWithId = {
          ...message,
          id: message.id || generateUniqueId(),
          timestamp: message.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        if (message.sender === "AI") {
          if (message.fileTree) {
            setCurrentFileTree(message.fileTree);
            
            // Auto-open first file to display in workspace
            const openFirstFile = (tree, path = '') => {
              if (!tree || typeof tree !== 'object') return null;

              for (const [name, content] of Object.entries(tree)) {
                const fullPath = path ? `${path}/${name}` : name;
                if (content.file) {
                  return { name: fullPath, content: content.file.contents };
                } else if (typeof content === 'string') {
                  return { name: fullPath, content };
                } else if (typeof content === 'object' && content !== null) {
                  const nested = openFirstFile(content, fullPath);
                  if (nested) return nested;
                }
              }
              return null;
            };
            
            const firstFileToOpen = openFirstFile(message.fileTree);
            if (firstFileToOpen) {
              setOpenFiles(prev => {
                if (!prev.some(f => f.name === firstFileToOpen.name)) {
                  return [...prev, firstFileToOpen];
                }
                return prev;
              });
              setActiveFile(firstFileToOpen);
            }

            setBuildCommand(message.buildCommand);
            setStartCommand(message.startCommand);
            toast.success("AI generated new files!", { icon: '🤖' });
          }
        }

        setMessages(prev => {
          if (prev.some(existingMessage => existingMessage.id === messageWithId.id)) return prev;
          return [...prev, messageWithId];
        });
      });

      // Peer broadcast listener
      receiveMessage('file-tree-updated', (newTree) => {
        setCurrentFileTree(newTree);
      });

      receiveMessage('ai-code:inserted', (payload) => {
        if (payload?.insertedBy && payload.insertedBy !== user?.email) {
          toast.success(`${payload.insertedBy} inserted AI code into ${payload.fileName}`);
        }
      });
    }
    return () => disconnectSocket();
  }, [project, user?.email]);

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
        if (prev.some(existingMessage => existingMessage.id === message.id)) return prev;
        return [...prev, message];
      });
      sendMessage(message);
      setNewMessage("");
    }
  };

  const handleFileSelect = (fileName, content) => {
    const existingFile = openFiles.find(file => file.name === fileName);
    if (!existingFile) {
      setOpenFiles(prev => [...prev, { name: fileName, content }]);
    }
    setActiveFile({ name: fileName, content });
  };

  const handleCloseFile = (fileName) => {
    setOpenFiles(prev => prev.filter(file => file.name !== fileName));
    if (activeFile && activeFile.name === fileName) {
      const remainingFiles = openFiles.filter(file => file.name !== fileName);
      setActiveFile(remainingFiles.length > 0 ? remainingFiles[remainingFiles.length - 1] : null);
    }
  };

  const handleTabClick = (file) => setActiveFile(file);
  const handleEditFile = (fileName) => setEditingFiles(prev => ({ ...prev, [fileName]: true }));

  const handleFileContentChange = (fileName, newContent) => {
    setOpenFiles(prev => prev.map(file =>
      file.name === fileName ? { ...file, content: newContent, isModified: true } : file
    ));
    if (activeFile && activeFile.name === fileName) {
      setActiveFile(prev => ({ ...prev, content: newContent, isModified: true }));
    }
  };

  const toggleAddCollaboratorModal = async () => {
    if (!showAddCollaboratorModal) await fetchAllUsers();
    setShowAddCollaboratorModal(!showAddCollaboratorModal);
  };

  const fetchAllUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await axios.get('/users/all');
      setAllUsers(response.data.allUsers || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const addUserToProject = async (userId) => {
    const loadId = toast.loading("Adding collaborator...");
    try {
      await axios.put('/projects/add-users', {
        projectId: projectId,
        users: [userId]
      });
      await fetchProject();
      setShowAddCollaboratorModal(false);
      toast.success("Collaborator added successfully", { id: loadId });
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error("Failed to add collaborator", { id: loadId });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <Motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-modal p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-8">You must be logged in to access this secure workspace.</p>
          <Link to="/login" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl transition-colors font-medium w-full block">
            Return to Login
          </Link>
        </Motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-400 font-medium animate-pulse">Establishing workspace connection...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-modal p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Workspace Not Found</h2>
          <p className="text-gray-400 mb-8">{error || "The workspace link might be invalid or deleted."}</p>
          <Link to="/" className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white px-6 py-3 rounded-xl transition-colors font-medium block">
            Back to Dashboard
          </Link>
        </Motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-950 flex flex-col overflow-hidden font-sans text-gray-200 selection:bg-blue-500/30">
      {/* Header */}
      <header className="glass-panel border-b border-gray-800 flex-shrink-0 z-20">
        <div className="px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            
            <div className="h-4 w-px bg-gray-700" />
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Code2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-white leading-tight">{project.name}</h1>
                <p className="text-[10px] uppercase tracking-wider text-green-400 font-medium">Online</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={toggleAddCollaboratorModal}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 border border-blue-500/20 transition-colors text-sm font-medium"
            >
              <UserPlus className="w-4 h-4" />
              <span>Invite</span>
            </button>
            
            <div className="relative">
              <button
                onClick={() => setShowUserList(!showUserList)}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-xs text-white">
                  {user?.email?.[0].toUpperCase()}
                </div>
                <Users className="w-4 h-4 text-gray-400" />
              </button>

              <AnimatePresence>
                {showUserList && (
                  <Motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-64 glass-modal rounded-xl z-50 p-4 border border-gray-700"
                  >
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4" /> Team Members
                    </h3>
                    <div className="space-y-1">
                      {project.users?.length ? project.users.map((u, i) => (
                        <div key={u._id || i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/50 transition-colors">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-white text-xs font-semibold shadow-inner border border-gray-600">
                            {u.email ? u.email[0].toUpperCase() : 'U'}
                          </div>
                          <span className="text-sm text-gray-300 truncate">{u.email || 'Unknown'}</span>
                        </div>
                      )) : <p className="text-xs text-gray-500 py-2">No collaborators yet.</p>}
                    </div>
                  </Motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Side: Chat Panel */}
        <div className="w-[380px] flex-shrink-0 flex flex-col border-r border-gray-800 bg-gray-900/50 z-10">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800 bg-gray-900">
            <MessageSquare className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-200">Terminal Chat</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 chatArea">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-3 opacity-60">
                <Sparkles className="w-8 h-8 text-blue-500/50" />
                <p className="text-sm text-center">Empty workspace.<br/>Use <strong className="text-blue-400">@ai</strong> to summon intelligence.</p>
              </div>
            ) : (
              messages.map(message => {
                const isMe = message.sender === user?.email || message.sender === 'You';
                const isAI = message.sender === "AI";

                return (
                  <Motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={message.id} 
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-baseline gap-2 mb-1 px-1">
                      <span className={`text-[11px] font-medium ${isAI ? 'text-indigo-400' : 'text-gray-400'}`}>
                        {isMe ? 'You' : isAI ? 'CoBuilder AI' : message.sender}
                      </span>
                      <span className="text-[10px] text-gray-600">{message.timestamp}</span>
                    </div>
                    
                    <div className={`
                      chat-message-bubble ${isMe ? 'chat-message-bubble-user' : isAI ? 'chat-message-bubble-ai' : 'chat-message-bubble-peer'}
                      max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm
                      ${isMe ? 'bg-blue-600 text-white rounded-tr-sm' : 
                        isAI ? 'bg-indigo-900/40 text-indigo-100 border border-indigo-500/20 rounded-tl-sm' : 
                        'bg-gray-800 text-gray-200 border border-gray-700 rounded-tl-sm'}
                    `}>
                      <MessageContent
                        message={message}
                        isCurrentUser={isMe}
                        onInsertCode={handleInsertAICode}
                      />
                    </div>
                  </Motion.div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 bg-gray-900 border-t border-gray-800">
            <form onSubmit={handleSendMessage} className="relative flex items-center">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message or @ai to generate..."
                className="w-full bg-gray-950 border border-gray-700 rounded-xl pl-4 pr-12 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-inner"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="absolute right-2 p-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Code Editor Workspace */}
        <div className="flex-1 flex bg-[#0d1117] relative min-w-0">
          <div className="flex-1 flex flex-col min-w-0">
          {currentFileTree ? (
            <div className="flex-1 flex w-full min-w-0">
              <div className="w-64 flex-shrink-0 border-r border-gray-800 bg-gray-900/80">
                <FileTreePanel
                  fileTree={currentFileTree}
                  buildCommand={buildCommand}
                  startCommand={startCommand}
                  onFileSelect={handleFileSelect}
                  activeFile={activeFile}
                  onRunActiveFile={handleRunActiveFile}
                  onCreateFile={handleCreateFile}
                />
              </div>
              <div className="flex-1 bg-gray-950 overflow-hidden relative min-w-0">
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
            <div className="flex-1 flex items-center justify-center relative">
              {/* Background gradient blob */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 via-transparent to-blue-900/10 pointer-events-none" />
              
              <Motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center max-w-md z-10"
              >
                <div className="w-20 h-20 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                  <Code2 className="w-10 h-10 text-gray-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-200 mb-2 tracking-tight">Empty Workspace</h3>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Your project environment is ready. Use the chat to prompt the AI to generate scaffolding, components, or a full application structure.
                </p>
                <div className="inline-flex items-center gap-2 text-sm text-blue-400 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20">
                  <Sparkles className="w-4 h-4" />
                  Try: &quot;@ai create a React todo app&quot;
                </div>
                <button
                  type="button"
                  onClick={() => handleCreateFile("index.html")}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-600/10 px-4 py-2 text-sm font-medium text-blue-300 transition-colors hover:bg-blue-600/20"
                >
                  <FilePlus2 className="w-4 h-4" />
                  Create index.html
                </button>
              </Motion.div>
            </div>
          )}
          </div>
          <LivePreview
            blocks={previewBlocks}
            isOpen={isPreviewOpen}
            onClose={() => setIsPreviewOpen(false)}
            onClear={handleClearPreview}
          />
        </div>

      </div>

      {/* Add Collaborator Modal (Global overlay) */}
      <AnimatePresence>
        {showAddCollaboratorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowAddCollaboratorModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            />
            
            <Motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="relative glass-modal w-full max-w-md rounded-2xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-blue-400" /> Invite Collaborator
                </h3>
                <button
                  onClick={() => setShowAddCollaboratorModal(false)}
                  className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-800 rounded-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                {loadingUsers ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-3">
                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                    <span className="text-gray-400 text-sm">Searching users...</span>
                  </div>
                ) : allUsers.length > 0 ? (
                  <div className="space-y-2">
                    {allUsers
                      .filter(u => !project.users?.some(pu => pu._id === u._id))
                      .map((u) => (
                        <div key={u._id} className="flex items-center justify-between p-3 bg-gray-900/60 border border-gray-800 rounded-xl hover:border-gray-600 transition-colors group">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-inner">
                              {u.email.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-gray-300 font-medium text-sm">{u.email}</span>
                          </div>
                          <button
                            onClick={() => addUserToProject(u._id)}
                            className="opacity-0 group-hover:opacity-100 bg-white text-black hover:bg-gray-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm"
                          >
                            Invite
                          </button>
                        </div>
                      ))}
                      {allUsers.filter(u => !project.users?.some(pu => pu._id === u._id)).length === 0 && (
                        <div className="text-center py-6 text-gray-500 text-sm">
                          All available users are already in this project.
                        </div>
                      )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No active users found on the platform.
                  </div>
                )}
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Project;
