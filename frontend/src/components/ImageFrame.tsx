// client/src/components/ImageFrame.tsx
import React from "react";
import { FrameStyle, LayoutType } from "../config"; // Import tipe layout juga

interface ImageFrameProps {
  images: string[];
  frameStyle: FrameStyle;
  layout: LayoutType; // Terima prop layout
}

const ImageFrame = React.forwardRef<HTMLDivElement, ImageFrameProps>(
  ({ images, frameStyle, layout }, ref) => {
    // Tambah layout

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

    // Tentukan kelas grid dan rasio aspek berdasarkan layout
    let gridClass = "grid-cols-2";
    let photoAspectRatioClass = "aspect-[3/4]";
    let frameAspectRatioClass = "aspect-[3/4]";
    let showFooterText = true;

    if (layout === "1x4") {
      gridClass = "grid-cols-1";
      photoAspectRatioClass = "aspect-[4/3]";
      frameAspectRatioClass = ""; // Tinggi otomatis
      showFooterText = true;
    }

    return (
      <div
        ref={ref}
        className={`p-3 border-4 ${frameClasses} shadow-lg ${
          layout === "1x4" ? "w-[200px]" : "w-[300px] sm:w-[350px]"
        } h-auto ${frameAspectRatioClass} mx-auto my-4 rounded-lg flex flex-col`}
        style={inlineStyle}
      >
        <div className={`grid ${gridClass} gap-1.5 w-full flex-grow`}>
          {displayImages.map((imgSrc, index) => (
            <div
              key={index}
              // Terapkan photoAspectRatioClass
              className={`border border-black/10 dark:border-white/10 rounded-md flex items-center justify-center bg-black/5 dark:bg-white/5 ${photoAspectRatioClass} overflow-hidden`}
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
                  {" "}
                  <span
                    className={`text-4xl font-light opacity-50 ${placeholderClass}`}
                    style={placeholderStyle}
                  >
                    {" "}
                    {index + 1}{" "}
                  </span>{" "}
                </div>
              )}
            </div>
          ))}
        </div>
        {showFooterText && (
          <div className="pt-1 mt-auto text-center">
            {" "}
            <p
              className={`text-xs italic ${footerTextColor} opacity-75`}
              style={footerTextStyle}
            >
              {" "}
              Your Brand / Text Here{" "}
            </p>{" "}
          </div>
        )}
      </div>
    );
  }
);

ImageFrame.displayName = "ImageFrame";
export default ImageFrame;
