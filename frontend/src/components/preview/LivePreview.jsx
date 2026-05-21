import React, { useMemo, useState } from "react";
import { AlertTriangle, Code2, Eraser, Play, RefreshCw } from "lucide-react";
import StaticPreview from "./StaticPreview";
import ReactPreview from "./ReactPreview";
import PreviewErrorBoundary from "./PreviewErrorBoundary";
import { detectCodeLanguage } from "../../utils/detectCodeLanguage";

const mergeBlocksForPreview = (blocks = []) => {
  const normalized = blocks.map((block) => ({
    ...block,
    language: detectCodeLanguage(block.code, block.language || block.providedLanguage),
  }));

  const reactBlock = normalized.find((block) => ["react", "jsx"].includes(block.language));
  if (reactBlock) {
    return {
      mode: "react",
      code: reactBlock.code,
      languages: normalized.map((block) => block.language),
    };
  }

  return {
    mode: "static",
    html: normalized.filter((block) => block.language === "html").map((block) => block.code).join("\n\n"),
    css: normalized.filter((block) => block.language === "css").map((block) => block.code).join("\n\n"),
    js: normalized.filter((block) => block.language === "javascript").map((block) => block.code).join("\n\n"),
    unknown: normalized.filter((block) => block.language === "unknown").map((block) => block.code),
    languages: normalized.map((block) => block.language),
  };
};

const LivePreview = ({ blocks = [], isOpen, onClose, onClear }) => {
  const [activeTab, setActiveTab] = useState("preview");
  const [runKey, setRunKey] = useState(0);
  const [warnings, setWarnings] = useState([]);
  const preview = useMemo(() => mergeBlocksForPreview(blocks), [blocks]);

  if (!isOpen) return null;

  const hasBlocks = blocks.length > 0;
  const unsupported =
    hasBlocks &&
    preview.mode === "static" &&
    !preview.html &&
    !preview.css &&
    !preview.js;

  const refresh = () => {
    setRunKey((value) => value + 1);
    setActiveTab("preview");
  };

  const clear = () => {
    setWarnings([]);
    onClear?.();
  };

  return (
    <aside className="w-[42%] min-w-[360px] border-l border-gray-800 bg-[#0b1020] flex flex-col">
      <div className="flex items-center justify-between border-b border-gray-800 bg-gray-900 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-300">
            <Play className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-gray-100">AI Live Preview</h2>
            <p className="text-[11px] text-gray-500">
              {hasBlocks ? `${preview.mode === "react" ? "React" : "Static"} sandbox` : "No code selected"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refresh}
            disabled={!hasBlocks}
            className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
            title="Refresh Preview"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={clear}
            className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-800 hover:text-red-300"
            title="Clear Preview"
          >
            <Eraser className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-xs text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-100"
          >
            Close
          </button>
        </div>
      </div>

      <div className="flex border-b border-gray-800 bg-gray-950">
        {["code", "preview", "errors"].map((tab) => (
          <button
            type="button"
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-medium capitalize transition-colors ${
              activeTab === tab
                ? "border-b-2 border-blue-500 text-white"
                : "text-gray-500 hover:text-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1">
        {!hasBlocks ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center text-gray-500">
            <Code2 className="h-8 w-8 text-gray-600" />
            <p className="text-sm">Run a code block from an AI message to see it here.</p>
          </div>
        ) : activeTab === "code" ? (
          <div className="h-full overflow-auto bg-[#0a0d12] p-4">
            <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-gray-300">
              {blocks.map((block) => `// ${block.language || "unknown"}\n${block.code}`).join("\n\n")}
            </pre>
          </div>
        ) : activeTab === "errors" ? (
          <div className="h-full overflow-auto p-4">
            {unsupported && (
              <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                Preview failed: Unsupported language. Use HTML, CSS, JavaScript, JSX, or React code.
              </div>
            )}
            {warnings.length > 0 ? (
              <div className="space-y-2">
                {warnings.map((warning) => (
                  <div key={warning} className="flex gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">
                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{warning}</span>
                  </div>
                ))}
              </div>
            ) : !unsupported ? (
              <p className="text-sm text-gray-500">No preview errors have been reported.</p>
            ) : null}
          </div>
        ) : (
          <div className="h-full bg-white">
            {unsupported ? (
              <div className="flex h-full items-center justify-center p-6 text-center text-sm text-gray-600">
                Unsupported code type. Select HTML/CSS/JS or React/JSX code.
              </div>
            ) : (
              <PreviewErrorBoundary>
                {preview.mode === "react" ? (
                  <ReactPreview code={preview.code} runKey={runKey} onWarnings={setWarnings} />
                ) : (
                  <StaticPreview
                    html={preview.html}
                    css={preview.css}
                    js={preview.js}
                    runKey={runKey}
                    onWarnings={setWarnings}
                  />
                )}
              </PreviewErrorBoundary>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};

export default LivePreview;
