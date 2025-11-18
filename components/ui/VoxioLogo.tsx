"use client";

import React, { useEffect, useState } from "react";

type Props = {
  src?: string;
  className?: string;
  ariaLabel?: string;
};

export default function VoxioLogo({
  src = "/voxio-logo.svg",
  className,
  ariaLabel = "Voxio logo",
}: Props) {
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch(src)
      .then((res) => res.text())
      .then((text) => {
        if (mounted) setSvg(text);
      })
      .catch(() => {
        if (mounted) setSvg(null);
      });

    return () => {
      mounted = false;
    };
  }, [src]);

  if (!svg) {
    // Simple placeholder while SVG loads
    return <div className={className} aria-hidden />;
  }

  // Render the inline SVG markup so it behaves like a React component and
  // can be styled via the wrapper className.
  return (
    <span
      className={className}
      role="img"
      aria-label={ariaLabel}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
