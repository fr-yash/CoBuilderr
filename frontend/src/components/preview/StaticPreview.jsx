import React, { useMemo } from "react";
import { buildStaticPreview } from "../../utils/buildStaticPreview";

const StaticPreview = ({ html = "", css = "", js = "", runKey = 0, onWarnings }) => {
  const { srcDoc, warnings } = useMemo(() => buildStaticPreview({ html, css, js }), [html, css, js]);

  React.useEffect(() => {
    onWarnings?.(warnings);
  }, [warnings, onWarnings]);

  return (
    <iframe
      key={runKey}
      title="AI static code preview"
      sandbox="allow-scripts allow-modals"
      srcDoc={srcDoc}
      className="h-full w-full bg-white"
    />
  );
};

export default StaticPreview;
