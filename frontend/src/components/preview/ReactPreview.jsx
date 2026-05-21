import React, { useMemo } from "react";
import { buildReactPreview } from "../../utils/buildReactPreview";

const ReactPreview = ({ code = "", runKey = 0, onWarnings }) => {
  const { srcDoc, warnings } = useMemo(() => buildReactPreview(code), [code]);

  React.useEffect(() => {
    onWarnings?.(warnings);
  }, [warnings, onWarnings]);

  return (
    <iframe
      key={runKey}
      title="AI React code preview"
      sandbox="allow-scripts allow-modals"
      srcDoc={srcDoc}
      className="h-full w-full bg-white"
    />
  );
};

export default ReactPreview;
