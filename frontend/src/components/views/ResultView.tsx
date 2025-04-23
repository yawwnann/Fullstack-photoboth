// client/src/components/views/ResultView.tsx
import React from "react";
import ImageFrame from "../ImageFrame"; // Versi display only
import { FrameStyle, LayoutType } from "../../config";

interface ResultViewProps {
  capturedImages: string[];
  frameStyle: FrameStyle;
  layout: LayoutType;
  isDownloading: boolean;
  onDownload: () => void;
  onReset: () => void;
  frameRef: React.RefObject<HTMLDivElement | null>; // Terima ref untuk download
}

const ResultView: React.FC<ResultViewProps> = ({
  capturedImages,
  frameStyle,
  layout,
  isDownloading,
  onDownload,
  onReset,
  frameRef, // Gunakan ref
}) => {
  return (
    <div className="w-full max-w-lg bg-gray-800 rounded-2xl shadow-xl p-5 md:p-8 flex flex-col items-center transform transition-all duration-500 ease-out scale-100 opacity-100">
      <h2 className="text-2xl font-semibold text-gray-100 mb-5">
        {" "}
        Selesai! Ini Hasilnya:{" "}
      </h2>
      <div className="mb-8 transform -rotate-1 hover:rotate-0 transition-transform duration-200">
        <ImageFrame
          ref={frameRef} // Pasang ref di sini
          images={capturedImages}
          frameStyle={frameStyle}
          layout={layout}
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-xs mx-auto">
        <button
          onClick={onDownload}
          disabled={isDownloading}
          className={`inline-flex items-center justify-center w-full px-6 py-3 text-base font-medium rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ease-in-out ${
            isDownloading
              ? "bg-gray-500 text-gray-400 cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 focus:ring-offset-gray-800"
          }`}
        >
          {isDownloading ? "Memproses..." : "Unduh Gambar"}
        </button>
        <button
          onClick={onReset}
          disabled={isDownloading}
          className={`inline-flex items-center justify-center w-full px-6 py-3 text-base font-medium rounded-full border border-gray-600 bg-gray-700 text-gray-200 shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-800 transition-colors duration-200 ease-in-out ${
            isDownloading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Ambil Ulang
        </button>
      </div>
    </div>
  );
};

export default ResultView;
