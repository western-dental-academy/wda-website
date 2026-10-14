"use client";

import { useSyncExternalStore } from "react";

type WesPose = "wave" | "thumbs-up" | "thinking";

const ALT: Record<WesPose, string> = {
  wave: "Wes, the WDA tooth mascot, waving hello",
  "thumbs-up": "Wes, the WDA tooth mascot, giving a thumbs up",
  thinking: "Wes, the WDA tooth mascot, looking puzzled",
};

// Wes, the WDA mascot. Renders the static transparent PNG on the server, then
// swaps in the looping transparent WebM after mount. Safari/iOS can't show VP9
// alpha (it renders a black box), and reduced-motion users get the still.
const noopSubscribe = () => () => {};

function canAnimate() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ua = navigator.userAgent;
  const webkitOnly =
    /iPhone|iPad|iPod/.test(ua) || (/Safari/.test(ua) && !/Chrome|Chromium|Edg|Firefox|OPR/.test(ua));
  const canWebm = document.createElement("video").canPlayType('video/webm; codecs="vp9"') !== "";
  return !reduced && !webkitOnly && canWebm;
}

export default function Wes({
  pose,
  size = 120,
  className,
}: {
  pose: WesPose;
  size?: number;
  className?: string;
}) {
  const animate = useSyncExternalStore(noopSubscribe, canAnimate, () => false);

  const src = `/wes/wes-${pose}`;
  const style = { width: size, height: size };

  if (!animate) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={`${src}.png`} alt={ALT[pose]} width={size} height={size} className={className} style={style} />;
  }

  return (
    <video
      src={`${src}.webm`}
      poster={`${src}.png`}
      autoPlay
      loop
      muted
      playsInline
      aria-label={ALT[pose]}
      role="img"
      width={size}
      height={size}
      className={className}
      style={style}
    />
  );
}
