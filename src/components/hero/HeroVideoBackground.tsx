"use client";

import { useEffect, useRef, useState } from "react";
import { OnlineLearningBackdrop } from "./OnlineLearningBackdrop";

const VIDEO_SRC = "/videos/montessori-children-learning.mp4";

export function HeroVideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || videoFailed) return;

    const play = async () => {
      try {
        await video.play();
        setVideoReady(true);
      } catch {
        setVideoFailed(true);
      }
    };

    const onLoaded = () => void play();
    const onError = () => setVideoFailed(true);

    video.addEventListener("loadeddata", onLoaded);
    video.addEventListener("error", onError);

    if (video.readyState >= 2) void play();

    return () => {
      video.removeEventListener("loadeddata", onLoaded);
      video.removeEventListener("error", onError);
    };
  }, [videoFailed]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <OnlineLearningBackdrop active={!videoReady || videoFailed} />

      {!videoFailed && (
        <video
          ref={videoRef}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            videoReady ? "opacity-100" : "opacity-0"
          }`}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onError={() => setVideoFailed(true)}
        >
          <source src={VIDEO_SRC} type="video/mp4" />
        </video>
      )}
    </div>
  );
}
