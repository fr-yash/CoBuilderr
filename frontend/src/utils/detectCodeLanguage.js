const normalizeLanguage = (language = "") => {
  const normalized = language.toLowerCase().trim();

  if (["js", "javascript", "mjs", "cjs"].includes(normalized)) return "javascript";
  if (["jsx", "tsx"].includes(normalized)) return "jsx";
  if (["react", "reactjs"].includes(normalized)) return "react";
  if (["html", "htm"].includes(normalized)) return "html";
  if (["css", "scss", "sass"].includes(normalized)) return "css";

  return normalized || "";
};

export const detectCodeLanguage = (code = "", providedLanguage = "") => {
  const language = normalizeLanguage(providedLanguage);

  const source = String(code);
  const lowerSource = source.toLowerCase();

  if (["jsx", "react"].includes(language)) {
    return language;
  }

  const hasReactSignals =
    /import\s+react|from\s+["']react["']|react\.(usestate|useeffect|usememo|usecallback)|\b(usestate|useeffect|usememo|usecallback|useref)\s*\(|export\s+default\s+(function|class|[A-Z][A-Za-z0-9_$]*|\([^)]*\)\s*=>)|classname\s*=|onclick\s*=|\bon[A-Z][A-Za-z]*=/i.test(source) ||
    /<[A-Z][A-Za-z0-9]*[\s>]/.test(source);

  const hasJsxInJs =
    /(function|const|let|var|return|=>|export)\s+[\s\S]*<[A-Za-z][\w.-]*(\s|>|\/>)/.test(source) ||
    /^\s*return\s*\(?\s*<[A-Za-z][\w.-]*/.test(source);

  if (hasReactSignals || hasJsxInJs) {
    return language === "jsx" ? "jsx" : "react";
  }

  if (["html", "css", "javascript"].includes(language)) {
    return language;
  }

  if (
    /<!doctype html/i.test(source) ||
    /<html[\s>]/i.test(source) ||
    /<\/?(body|head|main|section|article|div|button|form|input|h[1-6]|p|span|ul|ol|li|script|style)(\s|>|\/)/i.test(source)
  ) {
    return "html";
  }

  if (
    /(^|\n)\s*([.#]?[A-Za-z][\w-]*|\*)\s*\{[\s\S]*\}/.test(source) &&
    /\b(color|background|margin|padding|border|display|position|font|width|height|grid|flex)\s*:/.test(lowerSource)
  ) {
    return "css";
  }

  if (
    /\b(function|const|let|var|document\.querySelector|document\.getElementById|addEventListener|=>|console\.)\b/.test(source)
  ) {
    return "javascript";
  }

  return "unknown";
};

export default detectCodeLanguage;
