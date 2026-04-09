import React, { useState } from 'react';
import { Copy, Edit2, Save, X, FileTerminal } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

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
        toast.success("Copied to clipboard!");
      } catch (err) {
        toast.error("Failed to copy");
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
      <div className="h-full flex flex-col items-center justify-center bg-[#0d1117]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-16 h-16 bg-gray-900 border border-gray-800 flex items-center justify-center rounded-2xl mb-4"
        >
          <FileTerminal className="w-8 h-8 text-gray-600" />
        </motion.div>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-gray-400 font-medium text-sm"
        >
          Select a file to view its contents
        </motion.p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#0d1117]">
      {/* Tab Bar */}
      {openFiles.length > 0 && (
        <div className="flex overflow-x-auto file-tabs bg-gray-900 border-b border-gray-800">
          <AnimatePresence initial={false}>
            {openFiles.map((file) => (
              <motion.div
                key={file.name}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, width: 0, overflow: 'hidden' }}
                transition={{ duration: 0.2 }}
                className={`flex flex-shrink-0 items-center min-w-0 max-w-[200px] border-r border-gray-800 group relative ${
                  activeFile.name === file.name
                    ? 'bg-[#0d1117] text-gray-200'
                    : 'bg-gray-900 text-gray-500 hover:bg-gray-800/80 hover:text-gray-300 transition-colors'
                }`}
              >
                {/* Active Indicator Line */}
                {activeFile.name === file.name && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                
                <button
                  onClick={() => onTabClick(file)}
                  className="flex-1 flex items-center gap-2 px-4 py-2.5 text-left min-w-0"
                >
                  <span className="text-[13px] font-mono truncate select-none">
                    {file.name.split('/').pop()}
                  </span>
                  {file.isModified && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseFile(file.name);
                  }}
                  className={`p-1.5 mr-2 rounded-md hover:bg-gray-700/50 transition-colors flex-shrink-0
                    ${activeFile.name === file.name ? 'opacity-100 text-gray-400 hover:text-white' : 'opacity-0 group-hover:opacity-100 text-gray-500 hover:text-white'}
                  `}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Editor Actions Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-[#0d1117]">
        <div className="text-xs font-mono text-gray-500 truncate flex-1 pr-4">
          {activeFile.name}
        </div>
        <div className="flex items-center gap-2">
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div 
                key="editing-actions"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-2"
              >
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-1.5 px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 text-[13px] font-medium transition-colors border border-gray-700"
                >
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1.5 px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-medium transition-colors"
                >
                  <Save className="w-3.5 h-3.5" /> Save
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="viewing-actions"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-2"
              >
                <button
                  onClick={handleCopyContent}
                  className="p-1.5 rounded text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={handleStartEdit}
                  className="flex items-center gap-1.5 px-3 py-1 pl-2.5 rounded bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 text-blue-400 hover:text-blue-300 text-[13px] font-medium transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* File Content Area */}
      <div className="flex-1 overflow-hidden relative bg-[#0a0d12]">
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.textarea
              key={`edit-${activeFile.name}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              value={editContent}
              onChange={handleContentChange}
              className="absolute inset-0 w-full h-full p-4 bg-[#0a0d12] text-gray-300 font-mono text-[13px] leading-relaxed resize-none border-none outline-none focus:ring-inset focus:ring-1 focus:ring-blue-500/30 selection:bg-blue-500/30"
              placeholder="Start typing..."
              spellCheck={false}
            />
          ) : (
            <motion.div 
              key={`view-${activeFile.name}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 w-full h-full overflow-auto p-4 bg-[#0a0d12]"
            >
              <pre className="text-[13px] text-gray-300 font-mono leading-relaxed whitespace-pre-wrap selection:bg-blue-500/30 pb-20">
                {activeFile.content}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FileViewer;
