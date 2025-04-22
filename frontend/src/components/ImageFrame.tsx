import React from "react";

interface ImageFrameProps {
  images: string[];
}

const ImageFrame = React.forwardRef<HTMLDivElement, ImageFrameProps>(
  ({ images }, ref) => {
    const placeholders: (string | null)[] = Array(
      Math.max(0, 4 - images.length)
    ).fill(null);
    const displayImages: (string | null)[] = [...images, ...placeholders];

    return (
      <div
        ref={ref}
        className="p-3 md:p-4 border-4 border-gray-800 bg-white shadow-lg w-[320px] sm:w-[400px] h-auto aspect-[3/4] mx-auto my-4 print:border-black print:shadow-none" // Style khusus print
      >
        <div className="grid grid-cols-2 gap-1.5 md:gap-2 w-full h-full">
          {displayImages.map((imgSrc, index) => (
            <div
              key={index}
              className="border border-gray-400 flex items-center justify-center bg-gray-100 aspect-square overflow-hidden print:border-gray-600"
            >
              {imgSrc ? (
                <img
                  src={imgSrc}
                  alt={`Photobooth image ${index + 1}`}
                  className="object-cover w-full h-full"
                  loading="lazy"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mb-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-xs sm:text-sm">Slot {index + 1}</span>
                </div>
              )}
            </div>
          ))}
        </div>
        {/* Anda bisa tambahkan logo/teks kecil di bawah jika diperlukan */}
        {/* <div className="text-center text-xs text-gray-500 pt-2 print:text-black">
         My Photobooth Event
       </div> */}
      </div>
    );
  }
);

ImageFrame.displayName = "ImageFrame";

export default ImageFrame;
