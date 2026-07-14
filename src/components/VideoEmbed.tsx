"use client";

import { useEffect, useRef } from "react";

function getYouTubeEmbedUrl(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtube\.com\/shorts\/|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{6,})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
  }
  return null;
}

function isFacebookVideoUrl(url: string): boolean {
  return /(?:facebook\.com|fb\.watch)/.test(url);
}

function isTikTokUrl(url: string): boolean {
  return /tiktok\.com/.test(url);
}

function TikTokEmbed({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // TikTok's embed.js scans the DOM for blockquote.tiktok-embed on load/script-insert;
    // it doesn't re-scan on its own if we swap the URL, so we drop + re-append the
    // script each time this mounts to force it to re-render the blockquote below.
    const script = document.createElement("script");
    script.src = "https://www.tiktok.com/embed.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [url]);

  return (
    <div ref={containerRef} className="flex justify-center overflow-hidden rounded-2xl bg-slate-100">
      <blockquote className="tiktok-embed" cite={url} data-video-id="">
        <a href={url} target="_blank" rel="noopener noreferrer">
          ดูวิดีโอบน TikTok
        </a>
      </blockquote>
    </div>
  );
}

export default function VideoEmbed({ url, className = "" }: { url: string; className?: string }) {
  const youtubeUrl = getYouTubeEmbedUrl(url);
  if (youtubeUrl) {
    return (
      <iframe
        src={youtubeUrl}
        title="วิดีโอบรรยากาศฝึกซ้อม"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className={`aspect-video w-full rounded-2xl shadow-xl ${className}`}
      />
    );
  }

  if (isFacebookVideoUrl(url)) {
    const embedSrc = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`;
    return (
      <iframe
        src={embedSrc}
        title="วิดีโอบรรยากาศฝึกซ้อม"
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        allowFullScreen
        className={`aspect-video w-full rounded-2xl shadow-xl ${className}`}
      />
    );
  }

  if (isTikTokUrl(url)) {
    return <TikTokEmbed url={url} />;
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-pitch-300 bg-pitch-50 text-center text-pitch-700 shadow-xl ${className}`}
    >
      <span className="text-sm font-medium">ดูวิดีโอ</span>
      <span className="max-w-[80%] truncate text-xs text-pitch-500">{url}</span>
    </a>
  );
}
