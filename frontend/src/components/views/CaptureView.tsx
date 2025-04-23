// client/src/components/views/CaptureView.tsx
import React from "react";
import CameraCapture, { CameraCaptureHandle } from "../CameraCapture";

interface CaptureViewProps {
  isCapturingSequence: boolean;
  sequenceProgress: number;
  countdownValue: number | null;
  capturedImages: string[];
  cameraRef: React.RefObject<CameraCaptureHandle | null>;
}

const CaptureView: React.FC<CaptureViewProps> = ({
  isCapturingSequence,
  sequenceProgress,
  countdownValue,
  capturedImages,
  cameraRef,
}) => {
  return (
    <div className="w-full max-w-5xl bg-slate-800 rounded-2xl shadow-xl p-5 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8">
      {/* Kolom Kiri */}
      <div className="flex-1 flex flex-col items-center justify-start min-w-0">
        <div className="relative w-full max-w-3xl mx-auto overflow-hidden rounded-xl shadow-lg mb-3 ring-1 ring-white/10 bg-black flex items-center justify-center">
          <CameraCapture ref={cameraRef} countdownValue={countdownValue} />
        </div>
        {isCapturingSequence && (
          <p className="mt-1 text-base text-indigo-400 font-medium animate-pulse text-center">
            Siap-siap... Foto ke-{sequenceProgress + 1} / 4
          </p>
        )}
      </div>
      {/* Kolom Kanan */}
      <div className="w-full md:w-[180px] lg:w-[200px] flex-shrink-0 flex flex-col items-center md:border-l border-slate-700 md:pl-6 lg:pl-8">
        <h3 className="text-lg font-semibold text-gray-200 mb-5 text-center w-full">
          Hasil Jepretan
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-1 gap-4 w-full">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className={`relative aspect-[4/3] border-2 border-dashed border-slate-600 rounded-lg shadow-sm bg-slate-700 flex items-center justify-center overflow-hidden transition-all duration-300 group ${
                capturedImages[index]
                  ? "border-solid border-indigo-500 ring-2 ring-indigo-500/50"
                  : ""
              }`}
            >
              {!capturedImages[index] && (
                <span className="absolute text-slate-600 text-5xl font-bold opacity-50 group-hover:opacity-80 transition-opacity">
                  {index + 1}
                </span>
              )}
              {capturedImages[index] && (
                <img
                  src={capturedImages[index]}
                  alt={`Captured ${index + 1}`}
                  className="object-cover w-full h-full thumbnail-enter thumbnail-enter-active"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CaptureView;
