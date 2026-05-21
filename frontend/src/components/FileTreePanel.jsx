import React, { useState } from "react";
import { Folder, FileCode2, Play, Hammer, FilePlus2 } from "lucide-react";
import { motion as Motion } from "framer-motion";

const FileTreePanel = ({
  fileTree,
  buildCommand,
  startCommand,
  onFileSelect,
  activeFile,
  onRunActiveFile,
  onCreateFile,
}) => {
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState("");

  const submitNewFile = (event) => {
    event.preventDefault();
    const fileName = newFileName.trim();

    if (!fileName) return;

    onCreateFile?.(fileName);
    setNewFileName("");
    setIsCreatingFile(false);
  };

  const renderFileTree = (tree, path = '') => {
    if (!tree || typeof tree !== 'object') return null;

    return Object.entries(tree).map(([name, content], index) => {
      const fullPath = path ? `${path}/${name}` : name;
      const isFileNode = content?.file || typeof content === "string";
      const fileContents = content?.file?.contents ?? (typeof content === "string" ? content : "");

      if (isFileNode) {
        return (
          <Motion.div
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(index * 0.03, 0.3) }}
            key={fullPath}
            className={`flex items-center space-x-2.5 px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
              activeFile && activeFile.name === fullPath 
                ? 'bg-blue-600/20 text-blue-400' 
                : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
            }`}
            onClick={() => onFileSelect(fullPath, fileContents)}
          >
            <FileCode2 className={`w-4 h-4 ${activeFile && activeFile.name === fullPath ? 'text-blue-400' : 'text-gray-500'}`} />
            <span className="text-[13px] font-medium truncate">{name}</span>
          </Motion.div>
        );
      }

      if (content && typeof content === "object") {
        return (
          <Motion.div 
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
          </Motion.div>
        );
      }

      return null;
    });
  };

  return (
    <div className="h-full flex flex-col pt-1">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-[#0d1117]">
        <h3 className="text-sm font-semibold text-gray-200 tracking-wider">Explorer</h3>
        <div className="flex gap-2">
          <Motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCreatingFile((value) => !value)}
            className="flex items-center gap-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-300 px-2.5 py-1 rounded-md text-xs font-semibold border border-blue-500/20 transition-colors"
            title="Create new file"
          >
            <FilePlus2 className="w-3 h-3" /> New
          </Motion.button>
          <Motion.button
            whileHover={activeFile ? { scale: 1.05 } : undefined}
            whileTap={activeFile ? { scale: 0.95 } : undefined}
            onClick={onRunActiveFile}
            disabled={!activeFile}
            className="flex items-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 disabled:hover:bg-emerald-600/20 disabled:opacity-40 disabled:cursor-not-allowed text-emerald-300 px-2.5 py-1 rounded-md text-xs font-semibold border border-emerald-500/20 transition-colors"
            title={activeFile ? `Run ${activeFile.name}` : "Select a file to run"}
          >
            <Play className="w-3 h-3" /> Run
          </Motion.button>
          {buildCommand && (
            <Motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 px-2.5 py-1 rounded-md text-xs font-medium border border-gray-700 transition-colors"
            >
              <Hammer className="w-3 h-3" /> Build
            </Motion.button>
          )}
          {startCommand && (
            <Motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-2.5 py-1 rounded-md text-xs font-semibold border border-blue-500/20 transition-colors"
            >
              <Play className="w-3 h-3" /> Start
            </Motion.button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-20">
        {isCreatingFile && (
          <form onSubmit={submitNewFile} className="mb-3 rounded-lg border border-blue-500/20 bg-blue-500/5 p-2">
            <input
              value={newFileName}
              onChange={(event) => setNewFileName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setNewFileName("");
                  setIsCreatingFile(false);
                }
              }}
              autoFocus
              placeholder="src/App.jsx"
              className="w-full rounded-md border border-gray-700 bg-gray-950 px-2.5 py-1.5 font-mono text-xs text-gray-200 outline-none focus:border-blue-500"
              spellCheck={false}
            />
            <div className="mt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setNewFileName("");
                  setIsCreatingFile(false);
                }}
                className="rounded px-2 py-1 text-[11px] text-gray-400 hover:bg-gray-800 hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded bg-blue-600 px-2 py-1 text-[11px] font-medium text-white hover:bg-blue-500"
              >
                Create
              </button>
            </div>
          </form>
        )}

        {fileTree && typeof fileTree === "object" && Object.keys(fileTree).length > 0 ? renderFileTree(fileTree) : (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <Motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-12 h-12 rounded-xl bg-gray-800/50 border border-gray-700/50 flex items-center justify-center mb-3"
            >
              <Folder className="w-6 h-6 text-gray-600" />
            </Motion.div>
            <Motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm font-medium text-gray-400">No project files</Motion.p>
            <Motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-xs text-gray-500 mt-1">Prompt the AI to generate scaffolding.</Motion.p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileTreePanel;
