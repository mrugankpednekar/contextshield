"use client";

import { motion } from "framer-motion";

const blobs = [
  { top: "-10%", left: "-5%", size: 420, color: "rgba(16,185,129,0.25)" },
  { top: "50%", left: "70%", size: 360, color: "rgba(59,130,246,0.18)" },
  { top: "75%", left: "10%", size: 280, color: "rgba(244,114,182,0.15)" },
];

export function AuroraBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.9),_rgba(2,6,23,0.95))]" />
      {blobs.map((blob, idx) => (
        <motion.div
          key={idx}
          className="absolute blur-3xl"
          style={{
            top: blob.top,
            left: blob.left,
            width: blob.size,
            height: blob.size,
            borderRadius: blob.size,
            background: blob.color,
          }}
          animate={{
            scale: [1, 1.2, 0.9, 1],
            x: [0, 20, -15, 0],
            y: [0, -10, 25, 0],
          }}
          transition={{
            duration: 18 + idx * 4,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
