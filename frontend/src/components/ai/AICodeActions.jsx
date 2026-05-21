import React from "react";
import { Copy, Eraser, FilePlus2, Play } from "lucide-react";

const buttonBase =
  "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors";

const AICodeActions = ({
  onRun,
  onCopy,
  onInsert,
  onClear,
  runLabel = "Run Code",
  showClear = false,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {onRun && (
        <button
          type="button"
          onClick={onRun}
          className={`${buttonBase} border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20`}
        >
          <Play className="h-3.5 w-3.5" />
          {runLabel}
        </button>
      )}
      {onCopy && (
        <button
          type="button"
          onClick={onCopy}
          className={`${buttonBase} border-gray-600 bg-gray-800/80 text-gray-300 hover:bg-gray-700`}
        >
          <Copy className="h-3.5 w-3.5" />
          Copy
        </button>
      )}
      {onInsert && (
        <button
          type="button"
          onClick={onInsert}
          className={`${buttonBase} border-blue-500/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20`}
        >
          <FilePlus2 className="h-3.5 w-3.5" />
          Insert into Editor
        </button>
      )}
      {showClear && onClear && (
        <button
          type="button"
          onClick={onClear}
          className={`${buttonBase} border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20`}
        >
          <Eraser className="h-3.5 w-3.5" />
          Clear Preview
        </button>
      )}
    </div>
  );
};

export default AICodeActions;
