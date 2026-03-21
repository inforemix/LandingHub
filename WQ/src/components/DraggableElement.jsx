"use client";

import { useEffect, useState } from "react";

export default function DraggableElement({
  children,
  className = "",
  initialX = 0,
  initialY = 0,
  floating = false,
  wobble = false,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const onMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    };

    const onMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragStart.x, dragStart.y, isDragging]);

  const baseAnimations = [];
  if (floating) baseAnimations.push("draggableFloat 3.6s ease-in-out infinite");
  if (wobble) baseAnimations.push("draggableWobble 3.2s ease-in-out infinite");
  if (hovered || isDragging) baseAnimations.push("electricGlow 0.9s ease-in-out infinite");

  return (
    <div
      className={`absolute select-none ${className}`}
      onMouseDown={onMouseDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        transform: `translate(${position.x}px, ${position.y}px) scale(${hovered || isDragging ? 1.1 : 1})`,
        cursor: isDragging ? "grabbing" : "grab",
        outline: "none",
        boxShadow: "none",
        filter: hovered || isDragging ? "drop-shadow(0 0 8px rgba(255,145,0,0.7)) drop-shadow(0 0 14px rgba(255,106,0,0.45))" : "none",
        transition: isDragging ? "none" : "transform 0.28s ease, filter 0.22s ease",
        animation: baseAnimations.length ? baseAnimations.join(", ") : "none",
      }}
    >
      {children}
    </div>
  );
}
