import React from "react";
import { FrameStyle } from "../App"; // Asumsi tipe diekspor dari App.tsx

interface ImageFrameProps {
  images: string[];
  frameStyle: FrameStyle;
}

const ImageFrame = React.forwardRef<HTMLDivElement, ImageFrameProps>(
  ({ images, frameStyle }, ref) => {
    const placeholders: (string | null)[] = Array(
      Math.max(0, 4 - images.length)
    ).fill(null);
    const displayImages: (string | null)[] = [...images, ...placeholders];

    const frameClasses =
      frameStyle.type === "preset"
        ? `${frameStyle.bgClass} ${frameStyle.borderClass}`
        : "";
    const inlineStyle = frameStyle.type === "custom" ? frameStyle.style : {};

    const placeholderStyle: React.CSSProperties = {};
    if (frameStyle.type === "custom" && frameStyle.style.color) {
      placeholderStyle.color = frameStyle.style.color;
    }
    const placeholderClass =
      frameStyle.type === "preset"
        ? frameStyle.textColor || "text-gray-500"
        : "text-slate-600";

    const footerTextColor =
      frameStyle.type === "preset"
        ? frameStyle.textColor || "text-gray-500"
        : "";
    const footerTextStyle =
      frameStyle.type === "custom"
        ? { color: frameStyle.style.color || "#6b7280" }
        : {};

    return (
      <div
        ref={ref}
        className={`p-3 border-4 ${frameClasses} shadow-lg w-[300px] sm:w-[350px] h-auto aspect-[3/4] mx-auto my-4 rounded-lg flex flex-col`}
        style={inlineStyle}
      >
        <div className="grid grid-cols-2 gap-1.5 w-full flex-grow">
          {displayImages.map((imgSrc, index) => (
            <div
              key={index}
              // Rasio aspek potret 3:4 diterapkan di sini
              className={`border border-black/10 dark:border-white/10  flex items-center justify-center bg-black/5 dark:bg-white/5 aspect-[3/4] overflow-hidden`}
            >
              {imgSrc ? (
                <img
                  src={imgSrc}
                  alt={`Photobooth image ${index + 1}`}
                  className="object-cover w-full h-full"
                  loading="lazy"
                />
              ) : (
                <div className="flex items-center justify-center">
                  <span
                    className={`text-4xl font-light opacity-50 ${placeholderClass}`}
                    style={placeholderStyle}
                  >
                    {index + 1}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
        {/* Teks Footer */}
        <div className="pt-1 mt-auto text-center">
          <p
            className={`text-xs italic ${footerTextColor} opacity-75`}
            style={footerTextStyle}
          >
            Yawwnan
          </p>
        </div>
      </div>
    );
  }
);

ImageFrame.displayName = "ImageFrame";
export default ImageFrame;
