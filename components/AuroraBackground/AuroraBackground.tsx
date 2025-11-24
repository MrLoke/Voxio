"use client";

import Aurora from "./Aurora";

export const AuroraBackground = () => {
  return (
    <Aurora
      colorStops={["#E08116", "#AAB0CF", "#CA7311"]}
      blend={0.5}
      amplitude={1.0}
      speed={0.5}
    />
  );
};
