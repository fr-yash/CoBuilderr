const externalFetchPattern = /fetch\s*\(\s*(['"`])https?:\/\/(?!localhost|127\.0\.0\.1|0\.0\.0\.0)[^'"`]+\1/gi;

export const sanitizeGeneratedCode = (code = "") => {
  let sanitized = String(code || "");
  const warnings = [];

  const replacements = [
    {
      pattern: /\bdocument\.cookie\b/g,
      replacement: "undefined",
      warning: "Blocked document.cookie access inside generated code.",
    },
    {
      pattern: /\bwindow\.(parent|top|opener)\b/g,
      replacement: "null",
      warning: "Blocked access to parent, top, or opener windows.",
    },
    {
      pattern: /\b(localStorage|sessionStorage)\b/g,
      replacement: "__blockedStorage",
      warning: "Blocked browser storage access inside generated code.",
    },
  ];

  replacements.forEach(({ pattern, replacement, warning }) => {
    if (pattern.test(sanitized)) {
      sanitized = sanitized.replace(pattern, replacement);
      warnings.push(warning);
    }
  });

  externalFetchPattern.lastIndex = 0;
  if (externalFetchPattern.test(sanitized)) {
    externalFetchPattern.lastIndex = 0;
    sanitized = sanitized.replace(
      externalFetchPattern,
      "Promise.reject(new Error('External network request blocked by preview sandbox')) /* blocked fetch */"
    );
    warnings.push("Blocked fetch calls to external URLs.");
  }

  if (/\bwhile\s*\(\s*true\s*\)|\bfor\s*\(\s*;\s*;\s*\)/.test(sanitized)) {
    warnings.push("Possible infinite loop detected. The preview may become unresponsive.");
  }

  return {
    code: sanitized,
    warnings: [...new Set(warnings)],
  };
};

export default sanitizeGeneratedCode;
