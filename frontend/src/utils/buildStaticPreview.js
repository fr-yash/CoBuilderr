import { sanitizeGeneratedCode } from "./sanitizeGeneratedCode";

const escapeClosingScript = (value = "") => String(value).replace(/<\/script/gi, "<\\/script");

export const buildStaticPreview = ({ html = "", css = "", js = "" } = {}) => {
  const sanitizedHtml = sanitizeGeneratedCode(html);
  const sanitizedCss = sanitizeGeneratedCode(css);
  const sanitizedJs = sanitizeGeneratedCode(js);
  const warnings = [...sanitizedHtml.warnings, ...sanitizedCss.warnings, ...sanitizedJs.warnings];

  return {
    warnings: [...new Set(warnings)],
    srcDoc: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      :root { color-scheme: light dark; }
      body {
        margin: 0;
        min-height: 100vh;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: #ffffff;
        color: #111827;
      }
      #preview-errors {
        display: none;
        position: fixed;
        left: 12px;
        right: 12px;
        bottom: 12px;
        z-index: 999999;
        padding: 10px 12px;
        border: 1px solid #fecaca;
        border-radius: 8px;
        background: #fef2f2;
        color: #991b1b;
        font: 12px/1.4 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        white-space: pre-wrap;
      }
      ${sanitizedCss.code}
    </style>
  </head>
  <body>
    ${sanitizedHtml.code || "<div style=\"padding:16px;color:#6b7280;\">No HTML was provided.</div>"}
    <pre id="preview-errors"></pre>
    <script>
      // AI code runs in this sandboxed iframe only. The sandbox limits parent-window access,
      // but generated code can still freeze its own preview frame if it contains heavy loops.
      window.__blockedStorage = new Proxy({}, {
        get() { throw new Error("Storage access is blocked in AI preview."); },
        set() { throw new Error("Storage access is blocked in AI preview."); }
      });
      const showPreviewError = (message) => {
        const box = document.getElementById("preview-errors");
        if (!box) return;
        box.style.display = "block";
        box.textContent = "Preview failed: " + message;
      };
      window.onerror = (message, source, lineno, colno, error) => {
        showPreviewError(error && error.stack ? error.stack : message);
      };
      window.onunhandledrejection = (event) => {
        showPreviewError(event.reason && event.reason.stack ? event.reason.stack : String(event.reason));
      };
    </script>
    <script>
      try {
        ${escapeClosingScript(sanitizedJs.code)}
      } catch (error) {
        window.onerror(error.message, "", 0, 0, error);
      }
    </script>
  </body>
</html>`,
  };
};

export default buildStaticPreview;
