import React from "react";
import { SortablePhoto } from "./SortablePhoto";
import { FrameStyle } from "../App";

interface ImageFrameSortableProps {
  images: (string | null)[];
  frameStyle: FrameStyle;
}

const ImageFrame_Sortable: React.FC<ImageFrameSortableProps> = ({
  images,
  frameStyle,
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

  return (
    <div
      className={`p-3 border-4 ${frameClasses} shadow-lg w-[300px] sm:w-[350px] h-auto aspect-[3/4] mx-auto my-4 rounded-lg flex flex-col`}
      style={inlineStyle}
    >
      <div className="grid grid-cols-2 gap-1.5 w-full flex-grow">
        {displayItems.map((url, index) => (
          <SortablePhoto
            key={index}
            id={index}
            url={url}
            frameStyle={frameStyle}
          />
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
};

export default ImageFrame_Sortable;
