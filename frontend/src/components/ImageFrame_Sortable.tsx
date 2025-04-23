// client/src/components/ImageFrame_Sortable.tsx
import React from "react";
import { SortablePhoto } from "./SortablePhoto";
import { FrameStyle, LayoutType } from "../config";

interface ImageFrameSortableProps {
  images: (string | null)[];
  frameStyle: FrameStyle;
  layout: LayoutType; // Terima prop layout
}

const ImageFrame_Sortable: React.FC<ImageFrameSortableProps> = ({
  images,
  frameStyle,
  layout,
}) => {
  const displayItems = [...images];
  while (displayItems.length < 4) {
    displayItems.push(null);
  }

  const frameClasses =
    frameStyle.type === "preset"
      ? `${frameStyle.bgClass} ${frameStyle.borderClass}`
      : "";
  const inlineStyle = frameStyle.type === "custom" ? frameStyle.style : {};
  const footerTextColor =
    frameStyle.type === "preset" ? frameStyle.textColor || "text-gray-500" : "";
  const footerTextStyle =
    frameStyle.type === "custom"
      ? { color: frameStyle.style.color || "#6b7280" }
      : {};

  // Tentukan kelas grid dan rasio aspek berdasarkan layout
  let gridClass = "grid-cols-2"; // Default 2x2
  let photoAspectRatioClass = "aspect-[3/4]"; // Default potret untuk 2x2
  let frameAspectRatioClass = "aspect-[3/4]"; // Default frame potret
  let showFooterText = true; // Tampilkan footer by default

  if (layout === "1x4") {
    gridClass = "grid-cols-1"; // 1 kolom untuk vertikal
    photoAspectRatioClass = "aspect-[4/3]"; // Foto landscape untuk strip vertikal
    frameAspectRatioClass = ""; // Biarkan tinggi otomatis untuk strip vertikal
    showFooterText = true; // Tetap tampilkan footer (atau false jika tidak mau)
  }
  // Tambahkan else if untuk layout lain jika ada

  return (
    // Terapkan frameAspectRatioClass (atau hilangkan jika kosong)
    // Sesuaikan width/height agar lebih cocok untuk strip vertikal?
    <div
      className={`p-3 border-4 ${frameClasses} shadow-lg ${
        layout === "1x4" ? "w-[200px]" : "w-[300px] sm:w-[350px]"
      } h-auto ${frameAspectRatioClass} mx-auto my-4 rounded-lg flex flex-col`}
      style={inlineStyle}
    >
      {/* Terapkan gridClass */}
      <div className={`grid ${gridClass} gap-1.5 w-full flex-grow`}>
        {displayItems.map((url, index) => (
          <SortablePhoto
            key={index}
            id={index}
            url={url}
            frameStyle={frameStyle}
            aspectRatioClass={photoAspectRatioClass} // Kirim kelas rasio aspek
          />
        ))}
      </div>
      {/* Tampilkan footer secara kondisional */}
      {showFooterText && (
        <div className="pt-1 mt-auto text-center">
          {" "}
          <p
            className={`text-xs italic ${footerTextColor} opacity-75`}
            style={footerTextStyle}
          >
            {" "}
            Yawwnan{" "}
          </p>{" "}
        </div>
      )}
    </div>
  );
};

export default ImageFrame_Sortable;
