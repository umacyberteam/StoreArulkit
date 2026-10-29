"use client";

import { useEffect, useState } from "react";
import { Code2, LoaderCircle, Volume2, VolumeX } from "lucide-react";

const VIDEO_URL = process.env.NEXT_PUBLIC_INTRO_VIDEO_URL || "/intro.mp4";
const MAX_VIDEO_SECONDS = 17;

export default function IntroLoader() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [muted, setMuted] = useState(true);
  const [videoRatio, setVideoRatio] = useState("16 / 9");

  useEffect(() => {
    try {
      if (sessionStorage.getItem("arulkit-intro-seen") === "1") return;
    } catch {}

    setVisible(true);
    let cancelled = false;
    let loadDone = document.readyState === "complete";
    let mediaDone = false;
    let currentProgress = 3;
    const startedAt = Date.now();

    const updateProgress = () => {
      if (cancelled) return;
      // The progress is driven by real readiness signals, not a fixed-duration timer.
      const target = loadDone && mediaDone ? 100 : loadDone ? 88 : mediaDone ? 78 : 65;
      currentProgress = Math.min(target, currentProgress + Math.max(1, (target - currentProgress) * 0.13));
      setProgress(Math.floor(currentProgress));
      if (loadDone && mediaDone) {
        setProgress(100);
        window.setTimeout(() => {
          if (cancelled) return;
          setVisible(false);
          try { sessionStorage.setItem("arulkit-intro-seen", "1"); } catch {}
        }, 180);
      }
    };

    const onLoad = () => {
      loadDone = true;
      updateProgress();
    };
    if (!loadDone) window.addEventListener("load", onLoad, { once: true });

    const interval = window.setInterval(updateProgress, 100);
    // Don't trap visitors when the video or a network request stalls.
    const timeout = window.setTimeout(() => {
      if (cancelled) return;
      loadDone = true;
      mediaDone = true;
      setProgress(100);
      setVisible(false);
      try { sessionStorage.setItem("arulkit-intro-seen", "1"); } catch {}
    }, 9000);

    if (document.readyState === "complete") updateProgress();

    return () => {
      cancelled = true;
      window.removeEventListener("load", onLoad);
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, []);

  if (!visible) return null;

  const markVideoReady = (video: HTMLVideoElement) => {
    if (Number.isFinite(video.duration) && video.duration > MAX_VIDEO_SECONDS) {
      setVideoFailed(true);
      setVideoReady(true);
      return;
    }
    setVideoReady(true);
  };

  return (
    <div className="intro-overlay" role="status" aria-live="polite" aria-label="Memuat ArulKit Store">
      <div className="intro-content">
        <div className="intro-brand">
          <span className="intro-logo"><Code2 size={23} /></span>
          <span>ArulKit <b>Store</b></span>
        </div>

        <div className={`intro-video-frame ${videoFailed ? "intro-video-fallback" : ""}`} style={{ aspectRatio: videoRatio, maxHeight: "min(58vh, 540px)" }}>
          {!videoFailed ? (
            <video
              className="intro-video"
              src={VIDEO_URL}
              autoPlay
              muted={muted}
              playsInline
              preload="auto"
              onLoadedMetadata={(event) => {
                const video = event.currentTarget;
                if (video.videoWidth > 0 && video.videoHeight > 0) setVideoRatio(`${video.videoWidth} / ${video.videoHeight}`);
                if (Number.isFinite(video.duration) && video.duration > MAX_VIDEO_SECONDS) {
                  setVideoFailed(true);
                  setVideoReady(true);
                  video.pause();
                  return;
                }
                if (video.readyState >= 3) markVideoReady(video);
              }}
              onCanPlay={(event) => markVideoReady(event.currentTarget)}
              onError={() => {
                setVideoFailed(true);
                setVideoReady(true);
              }}
              onEnded={(event) => {
                // If the site is ready, finish with the video; otherwise hold the final frame.
                if (progress >= 100) event.currentTarget.currentTime = Math.max(0, event.currentTarget.duration - 0.05);
              }}
            />
          ) : (
            <div className="intro-video-placeholder">
              <Code2 size={42} />
              <span>ArulKit Store</span>
              <small>Tambahkan video intro di public/intro.mp4</small>
            </div>
          )}
          <span className="intro-video-tag">{videoFailed ? "INTRO VIDEO" : "WELCOME TO ARULKIT"}</span>
          {!videoFailed && (
            <button
              className="intro-sound-button"
              type="button"
              onClick={() => setMuted((value) => !value)}
              aria-label={muted ? "Aktifkan suara video" : "Matikan suara video"}
            >
              {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
            </button>
          )}
        </div>

        <div className="intro-loading-row">
          <span>{progress >= 100 ? "Menyiapkan toko..." : videoReady ? "Menyiapkan katalog..." : "Memuat pengalaman..."}</span>
          <span className="intro-percent">{progress}%</span>
        </div>
        <div className="intro-progress-track"><span style={{ width: `${progress}%` }} /></div>
        <div className="intro-footer"><LoaderCircle size={14} className="intro-spinner" /> Digital products for builders.</div>
      </div>
    </div>
  );
}
