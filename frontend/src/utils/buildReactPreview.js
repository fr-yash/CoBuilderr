import { sanitizeGeneratedCode } from "./sanitizeGeneratedCode";

const serializeForScript = (value = "") => JSON.stringify(String(value)).replace(/<\/script/gi, "<\\/script");

export const normalizeReactCode = (code = "") => {
  let source = String(code || "").trim();
  let defaultComponentName = "";

  source = source.replace(/^\s*import\s+.*?;?\s*$/gm, "");

  source = source.replace(/export\s+default\s+function\s*\(/, () => {
    defaultComponentName = "App";
    return "function App(";
  });

  source = source.replace(
    /export\s+default\s+function\s+([A-Za-z_$][\w$]*)\s*\(/g,
    (_, componentName) => {
      defaultComponentName = componentName;
      return `function ${componentName}(`;
    }
  );

  source = source.replace(
    /export\s+default\s+class\s+([A-Za-z_$][\w$]*)\s+extends/g,
    (_, componentName) => {
      defaultComponentName = componentName;
      return `class ${componentName} extends`;
    }
  );

  source = source.replace(
    /export\s+default\s+(\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>/g,
    (_, params) => {
      defaultComponentName = "App";
      return `const App = ${params} =>`;
    }
  );

  source = source.replace(
    /export\s+default\s+([A-Za-z_$][\w$]*)\s*;?/g,
    (_, componentName) => {
      defaultComponentName = componentName;
      return "";
    }
  );

  source = source.replace(/export\s+(function|const|let|class)\s+/g, "$1 ");

  const isJsxBody =
    !/\b(function|const|let|var|class)\s+App\b/.test(source) &&
    !/\bApp\s*=/.test(source) &&
    /^\s*(return\s+)?\(?\s*<[A-Za-z][\s\S]*[;)]?\s*$/.test(source);

  if (isJsxBody) {
    source = source.replace(/^\s*return\s+/, "").replace(/;?\s*$/, "");
    source = `function App() {
  return (
    ${source}
  );
}`;
  }

  const hasAppComponent = /\b(function|const|let|var|class)\s+App\b|\bApp\s*=/.test(source);
  if (!hasAppComponent) {
    const inferredComponentName =
      defaultComponentName ||
      source.match(/\bfunction\s+([A-Z][A-Za-z0-9_$]*)\s*\(/)?.[1] ||
      source.match(/\b(?:const|let|var)\s+([A-Z][A-Za-z0-9_$]*)\s*=/)?.[1] ||
      source.match(/\bclass\s+([A-Z][A-Za-z0-9_$]*)\s+extends/)?.[1];

    if (inferredComponentName) {
      source = `${source}

const App = ${inferredComponentName};`;
    }
  }

  return source;
};

export const buildReactPreview = (code = "") => {
  const normalizedCode = normalizeReactCode(code);
  const sanitized = sanitizeGeneratedCode(normalizedCode);
  const runnableCode = `const {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useReducer,
  useContext,
  createContext,
  Fragment
} = React;
const createRoot = ReactDOM.createRoot;

${sanitized.code}

if (typeof App === "undefined") {
  throw new Error("App component was not found. Run App.jsx or define/export an App component.");
}

class PreviewErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    if (typeof showPreviewError === "function") {
      showPreviewError(error && error.stack ? error.stack : String(error));
    }
  }

  render() {
    if (this.state.error) return null;
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  React.createElement(PreviewErrorBoundary, null, React.createElement(App))
);`;

  return {
    warnings: sanitized.warnings,
    srcDoc: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script>
      window.__previewErrorQueue = [];
      window.showPreviewError = (message) => {
        window.__previewErrorQueue.push(message);
        const box = document.getElementById("preview-errors");
        if (!box) return;
        box.style.display = "block";
        box.textContent = "Preview failed: " + window.__previewErrorQueue.join("\\n\\n");
      };
      window.reportPreviewLibraryError = (name) => {
        window.showPreviewError(name + " failed to load. Check your internet connection, then click Refresh Preview.");
      };
    </script>
    <script crossorigin="anonymous" src="https://unpkg.com/react@18/umd/react.development.js" onerror="reportPreviewLibraryError('React')"></script>
    <script crossorigin="anonymous" src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" onerror="reportPreviewLibraryError('ReactDOM')"></script>
    <script crossorigin="anonymous" src="https://unpkg.com/@babel/standalone/babel.min.js" onerror="reportPreviewLibraryError('Babel')"></script>
    <style>
      :root { color-scheme: light dark; }
      body {
        margin: 0;
        min-height: 100vh;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: #ffffff;
        color: #111827;
      }
      #root { min-height: 100vh; }
      #preview-errors {
        display: none;
        margin: 12px;
        padding: 10px 12px;
        border: 1px solid #fecaca;
        border-radius: 8px;
        background: #fef2f2;
        color: #991b1b;
        font: 12px/1.4 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        white-space: pre-wrap;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <pre id="preview-errors"></pre>
    <script>
      // AI React code is compiled and mounted inside this sandboxed iframe only.
      window.__blockedStorage = new Proxy({}, {
        get() { throw new Error("Storage access is blocked in AI preview."); },
        set() { throw new Error("Storage access is blocked in AI preview."); }
      });
      const showPreviewError = (message) => {
        const box = document.getElementById("preview-errors");
        if (!box) return;
        box.style.display = "block";
        window.__previewErrorQueue = window.__previewErrorQueue || [];
        if (message && !window.__previewErrorQueue.includes(message)) {
          window.__previewErrorQueue.push(message);
        }
        box.textContent = "Preview failed: " + window.__previewErrorQueue.join("\\n\\n");
      };
      window.onerror = (message, source, lineno, colno, error) => {
        const errorMessage = error && error.stack ? error.stack : message;
        if (errorMessage && errorMessage !== "Script error.") {
          showPreviewError(errorMessage);
        }
      };
      window.onunhandledrejection = (event) => {
        showPreviewError(event.reason && event.reason.stack ? event.reason.stack : String(event.reason));
      };
    </script>
    <script>
      try {
        if (!window.React || !window.ReactDOM || !window.Babel) {
          throw new Error("React preview libraries failed to load. Check your internet connection and try Refresh Preview.");
        }

        const compiled = Babel.transform(${serializeForScript(runnableCode)}, {
          presets: ["env", "react"],
          filename: "AIComponent.jsx"
        }).code;

        // This executes only inside the sandboxed iframe, never in the parent app.
        new Function("React", "ReactDOM", "showPreviewError", compiled)(React, ReactDOM, showPreviewError);
      } catch (error) {
        showPreviewError(error && error.stack ? error.stack : String(error));
      }
    </script>
  </body>
</html>`,
  };
};

export default buildReactPreview;
