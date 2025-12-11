"use client";

import React, { useEffect, useId, useRef } from "react";
import "plyr/dist/plyr.css";

interface PlyrVideoPlayerProps {
  src: string;
}

const PlyrVideoPlayer: React.FC<PlyrVideoPlayerProps> = ({ src }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const uniqueId = `video-player-${useId()}`;

  useEffect(() => {
    let playerInstance: any = null;

    const loadPlyr = async () => {
      if (videoRef.current) {
        const Plyr = (await import("plyr")).default;

        playerInstance = new Plyr(videoRef.current, {
          controls: [
            "play",
            "progress",
            "current-time",
            "duration",
            "mute",
            "volume",
            "fullscreen",
          ],
          hideControls: true,
        });
      }
    };

    loadPlyr();

    return () => {
      if (playerInstance) {
        playerInstance.destroy();
        playerInstance = null;
      }
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      src={src}
      controls
      className="w-full h-full object-contain"
      preload="metadata"
      playsInline
    />
  );
};

import dynamic from "next/dynamic";

export default dynamic(() => Promise.resolve(PlyrVideoPlayer), {
  ssr: false,
  loading: () => (
    <div className="bg-black/80 flex items-center justify-center text-white h-full w-full">
      Loading Video...
    </div>
  ),
});
