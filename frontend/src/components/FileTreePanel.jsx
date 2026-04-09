import React from "react";
import { Folder, FileCode2, Play, Hammer } from "lucide-react";
import { motion } from "framer-motion";

const FileTreePanel = ({ fileTree, buildCommand, startCommand, onFileSelect, activeFile }) => {
  const renderFileTree = (tree, path = '') => {
    return Object.entries(tree).map(([name, content], index) => {
      const fullPath = path ? `${path}/${name}` : name;

      if (content.file) {
        return (
          <motion.div
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(index * 0.03, 0.3) }}
            key={fullPath}
            className={`flex items-center space-x-2.5 px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
              activeFile && activeFile.name === fullPath 
                ? 'bg-blue-600/20 text-blue-400' 
                : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
            }`}
            onClick={() => onFileSelect(fullPath, content.file.contents)}
          >
            <FileCode2 className={`w-4 h-4 ${activeFile && activeFile.name === fullPath ? 'text-blue-400' : 'text-gray-500'}`} />
            <span className="text-[13px] font-medium truncate">{name}</span>
          </motion.div>
        );
      } else {
        return (
          <motion.div 
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(index * 0.03, 0.3) }}
            key={fullPath} 
            className="mb-1"
          >
            <div className="flex items-center space-x-2.5 px-3 py-1.5">
              <Folder className="w-4 h-4 text-emerald-500/80 fill-emerald-500/20" />
              <span className="text-[13px] font-semibold text-gray-300 truncate">{name}</span>
            </div>
            <div className="ml-4 pl-3 border-l border-gray-800/60 flex flex-col gap-0.5">
              {renderFileTree(content, fullPath)}
            </div>
          </motion.div>
        );
      }
    });
  };

  return (
    <div className="h-full flex flex-col pt-1">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-[#0d1117]">
        <h3 className="text-sm font-semibold text-gray-200 tracking-wider">Explorer</h3>
        <div className="flex gap-2">
          {buildCommand && (
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 px-2.5 py-1 rounded-md text-xs font-medium border border-gray-700 transition-colors"
            >
              <Hammer className="w-3 h-3" /> Build
            </motion.button>
          )}
          {startCommand && (
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-2.5 py-1 rounded-md text-xs font-semibold border border-blue-500/20 transition-colors"
            >
              <Play className="w-3 h-3" /> Start
            </motion.button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-20">
        {fileTree ? renderFileTree(fileTree) : (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-12 h-12 rounded-xl bg-gray-800/50 border border-gray-700/50 flex items-center justify-center mb-3"
            >
              <Folder className="w-6 h-6 text-gray-600" />
            </motion.div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm font-medium text-gray-400">No project files</motion.p>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-xs text-gray-500 mt-1">Prompt the AI to generate scaffolding.</motion.p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileTreePanel;
