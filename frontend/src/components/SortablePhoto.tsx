import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FrameStyle } from "../App";

interface SortablePhotoProps {
  id: number;
  url: string | null;
  frameStyle: FrameStyle;
}

export function SortablePhoto({ id, url, frameStyle }: SortablePhotoProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "none",
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.8 : 1,
    boxShadow: isDragging ? "0px 10px 15px -3px rgba(0, 0, 0, 0.3)" : undefined,
  };

  const placeholderStyle: React.CSSProperties = {};
  if (!url && frameStyle.type === "custom" && frameStyle.style.color) {
    placeholderStyle.color = frameStyle.style.color;
  }
  const placeholderClass =
    !url && frameStyle.type === "preset"
      ? frameStyle.textColor || "text-gray-500"
      : "text-slate-600";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative touch-none aspect-[3/4] border  shadow-sm flex items-center justify-center overflow-hidden transition-all duration-300 group ${
        url
          ? `border-black/10 dark:border-white/10 bg-slate-900`
          : "border-dashed border-slate-600 bg-slate-700"
      }`}
    >
      {!url && (
        <span
          className={`absolute text-4xl font-light opacity-50 group-hover:opacity-80 transition-opacity ${placeholderClass}`}
          style={placeholderStyle}
        >
          {id + 1}
        </span>
      )}
      {url && (
        <img
          src={url}
          alt={`Captured ${id + 1}`}
          className="object-cover w-full h-full"
          draggable={false}
        />
      )}
    </div>
  );
}
