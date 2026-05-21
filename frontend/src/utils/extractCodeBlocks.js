import { detectCodeLanguage } from "./detectCodeLanguage";

const fencedBlockPattern = /```([A-Za-z0-9_+.#-]*)?[ \t]*\n([\s\S]*?)```/g;

const looksLikeLooseCode = (text) => {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length < 12) return false;

  const language = detectCodeLanguage(trimmed);
  if (language !== "unknown") return true;

  const codeSignals = [
    /;\s*$/,
    /{\s*[\s\S]*}\s*$/,
    /=>/,
    /<\/?[A-Za-z][\w.-]*(\s|>|\/>)/,
  ];

  return codeSignals.some((pattern) => pattern.test(trimmed));
};

export const extractCodeBlocks = (aiResponseText = "") => {
  const text = String(aiResponseText || "");
  const blocks = [];
  let match;

  fencedBlockPattern.lastIndex = 0;

  while ((match = fencedBlockPattern.exec(text)) !== null) {
    const providedLanguage = match[1] || "";
    const code = (match[2] || "").trim();

    if (!code) continue;

    blocks.push({
      id: `${match.index}-${blocks.length}`,
      language: detectCodeLanguage(code, providedLanguage),
      providedLanguage: providedLanguage || "plain",
      code,
    });
  }

  if (blocks.length === 0 && looksLikeLooseCode(text)) {
    const code = text.trim();
    blocks.push({
      id: "loose-0",
      language: detectCodeLanguage(code),
      providedLanguage: "plain",
      code,
    });
  }

  return blocks;
};

export const splitMarkdownByCodeBlocks = (aiResponseText = "") => {
  const text = String(aiResponseText || "");
  const parts = [];
  let lastIndex = 0;
  let blockIndex = 0;
  let match;

  fencedBlockPattern.lastIndex = 0;

  while ((match = fencedBlockPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "markdown", text: text.slice(lastIndex, match.index) });
    }

    const providedLanguage = match[1] || "";
    const code = (match[2] || "").trim();

    parts.push({
      type: "code",
      block: {
        id: `${match.index}-${blockIndex}`,
        language: detectCodeLanguage(code, providedLanguage),
        providedLanguage: providedLanguage || "plain",
        code,
      },
    });

    blockIndex += 1;
    lastIndex = fencedBlockPattern.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "markdown", text: text.slice(lastIndex) });
  }

  return parts.length ? parts : [{ type: "markdown", text }];
};

export default extractCodeBlocks;
