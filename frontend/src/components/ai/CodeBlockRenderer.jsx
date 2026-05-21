import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import AICodeActions from "./AICodeActions";
import { detectCodeLanguage } from "../../utils/detectCodeLanguage";

const CodeBlockRenderer = ({
  block,
  onInsertCode,
}) => {
  const [editableCode, setEditableCode] = useState(block.code || "");

  const language = useMemo(
    () => detectCodeLanguage(editableCode, block.language || block.providedLanguage),
    [editableCode, block.language, block.providedLanguage]
  );

  const currentBlock = {
    ...block,
    language,
    code: editableCode,
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(editableCode);
      toast.success("Code copied");
    } catch {
      toast.error("Could not copy code");
    }
  };

  return (
    <div className="my-3 overflow-hidden rounded-lg border border-gray-700 bg-gray-950/80">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-800 bg-gray-900 px-3 py-2">
        <span className="rounded bg-gray-800 px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide text-gray-300">
          {language}
        </span>
        <AICodeActions
          onCopy={copyCode}
          onInsert={() => onInsertCode(currentBlock)}
        />
      </div>

      <textarea
        value={editableCode}
        onChange={(event) => setEditableCode(event.target.value)}
        spellCheck={false}
        className="h-56 w-full resize-y border-0 bg-[#0a0d12] p-3 font-mono text-[12px] leading-relaxed text-gray-200 outline-none selection:bg-blue-500/30 focus:ring-1 focus:ring-inset focus:ring-blue-500/40"
        aria-label={`${language} code editor`}
      />

    </div>
  );
};

export default CodeBlockRenderer;
