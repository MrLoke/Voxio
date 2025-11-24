"use client";

import React from "react";
import { ImageSlider } from "./ImageSlider";

const InformationBackground: React.FC = () => {
  return (
    <div className="relative w-full flex-1 overflow-hidden flex flex-col items-center justify-center p-10 text-white">
      <div className="absolute inset-0 z-10  opacity-30 pointer-events-none" />

      <div className="relative z-20 max-w-lg text-center mb-10">
        <h2 className="text-4xl font-extrabold mb-3 leading-tight text-app-primary">
          Przenieś Rozmowę do Innego Wymiaru! 🦊
        </h2>
        <p className="text-xl font-light text-slate-800 dark:text-zinc-200">
          VOXIO to innowacyjny komunikator stworzony do spontanicznych spotkań.
        </p>
      </div>

      <div className="relative z-20 w-full max-w-xl">
        <ImageSlider />

        <div className="absolute left-0 top-0 bottom-0 w-10 z-30 pointer-events-none bg-linear-to-r from-[#cad5e2] dark:from-[#0f172b] to-transparent" />

        <div className="absolute right-0 top-0 bottom-0 w-10 z-30 pointer-events-none bg-linear-to-l from-[#cad5e2] dark:from-[#0f172b] to-transparent" />
      </div>
    </div>
  );
};

export default InformationBackground;
