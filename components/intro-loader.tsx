"use client";

import { useEffect, useState } from "react";
import { Code2, LoaderCircle, Volume2, VolumeX } from "lucide-react";

const VIDEO_URL = process.env.NEXT_PUBLIC_INTRO_VIDEO_URL || "/intro.mp4";

export default function IntroLoader() {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [muted, setMuted] = useState(false);
  const [videoRatio, setVideoRatio] = useState("16 / 9");

  useEffect(() => {
    try {
      if (sessionStorage.getItem("arulkit-intro-seen") === "1") return;
    } catch {}

    setVisible(true);
    setExiting(false);
    let cancelled = false;
    let loadDone = document.readyState === "complete";
    let currentProgress = Math.max(3, progress);
    let finishTimer: number | undefined;
    const startedAt = Date.now();

    const finishIntro = () => {
      if (cancelled || finishTimer !== undefined) return;
      // Give the bar time to visibly reach 100%, then fade the whole intro away.
      finishTimer = window.setTimeout(() => {
        if (cancelled) return;
        setExiting(true);
        window.setTimeout(() => {
          if (cancelled) return;
          setVisible(false);
          try { sessionStorage.setItem("arulkit-intro-seen", "1"); } catch {}
        }, 750);
      }, 350);
    };

    const updateProgress = () => {
      if (cancelled) return;
      const target = loadDone && videoReady ? 100 : loadDone ? 88 : videoReady ? 78 : 65;
      const remaining = target - currentProgress;
      if (remaining > 0) {
        // Ease toward the target instead of stopping abruptly at 88%.
        currentProgress = Math.min(target, currentProgress + Math.max(0.35, remaining * 0.075));
        setProgress(Math.min(100, Math.floor(currentProgress)));
      }
      if (loadDone && videoReady && currentProgress >= 99.5) {
        currentProgress = 100;
        setProgress(100);
        // Do not dismiss a valid intro video until playback has actually ended.
        if (videoEnded || videoFailed) finishIntro();
      }
    };

    const onLoad = () => {
      loadDone = true;
      updateProgress();
    };
    if (!loadDone) window.addEventListener("load", onLoad, { once: true });

    const interval = window.setInterval(updateProgress, 45);
    // Avoid trapping visitors if a media/network request never becomes ready.
    const timeout = window.setTimeout(() => {
      if (cancelled) return;
      // Prevent the progress bar from getting stuck, but never cut off a video
      // that is still playing. A valid video must reach its ended event.
      currentProgress = 100;
      setProgress(100);
      if (videoEnded || videoFailed) finishIntro();
    }, Math.max(20000 - (Date.now() - startedAt), 1000));

    updateProgress();

    return () => {
      cancelled = true;
      window.removeEventListener("load", onLoad);
      window.clearInterval(interval);
      window.clearTimeout(timeout);
      if (finishTimer !== undefined) window.clearTimeout(finishTimer);
    };
  }, [videoReady, videoEnded, videoFailed]);

  if (!visible) return null;

  const markVideoReady = (_video: HTMLVideoElement) => {
    setVideoReady(true);
  };

  const skipIntro = () => {
    setProgress(100);
    setExiting(true);
    window.setTimeout(() => {
      setVisible(false);
      try { sessionStorage.setItem("arulkit-intro-seen", "1"); } catch {}
    }, 750);
  };

  return (
    <div className="intro-overlay" role="status" aria-live="polite" aria-label="Memuat ArulKit Store" style={{ opacity: exiting ? 0 : 1, transition: "opacity 750ms ease-in-out", pointerEvents: exiting ? "none" : "auto", willChange: "opacity" }}>
      <button
        type="button"
        onClick={skipIntro}
        disabled={exiting}
        style={{
          position: "absolute",
          top: 18,
          right: 18,
          zIndex: 30,
          border: "1px solid rgba(255,255,255,0.3)",
          borderRadius: 999,
          padding: "9px 14px",
          background: "rgba(15,15,25,0.75)",
          color: "#fff",
          fontSize: 13,
          fontWeight: 700,
          cursor: exiting ? "default" : "pointer",
          backdropFilter: "blur(8px)",
        }}
      >
        Skip Intro
      </button>
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
              onLoadedMetadata={async (event) => {
                const video = event.currentTarget;
                if (video.videoWidth > 0 && video.videoHeight > 0) setVideoRatio(`${video.videoWidth} / ${video.videoHeight}`);
                // Try autoplay with sound first. Browsers may block it; if so, fall back to muted autoplay.
                video.muted = false;
                try {
                  await video.play();
                  setMuted(false);
                } catch {
                  video.muted = true;
                  setMuted(true);
                  try { await video.play(); } catch {}
                }

                if (video.readyState >= 3) markVideoReady(video);
              }}
              onCanPlay={(event) => markVideoReady(event.currentTarget)}
              onError={() => {
                setVideoFailed(true);
                setVideoReady(true);
              }}
              onEnded={() => {
                // Let the progress finish, then fade out only after the entire video played.
                setVideoEnded(true);
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
        <div className="intro-progress-track"><span style={{ width: `${progress}%`, transition: "width 180ms linear" }} /></div>
        <div className="intro-footer"><LoaderCircle size={14} className="intro-spinner" /> Digital products for builders.</div>
      </div>
    </div>
  );
}
