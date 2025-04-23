// client/src/App.tsx
import React, { useState, useRef, useCallback, useEffect } from "react";
import html2canvas from "html2canvas";
import { HexColorPicker, HexColorInput } from "react-colorful";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSwappingStrategy, // Strategi untuk grid swap
} from "@dnd-kit/sortable";

import CameraCapture, { CameraCaptureHandle } from "./components/CameraCapture";
import ImageFrame_Sortable from "./components/ImageFrame_Sortable"; // Komponen baru untuk view kustomisasi
import ImageFrame from "./components/ImageFrame"; // Komponen lama untuk view hasil (display only)

// --- Tipe dan Opsi Warna ---
type ViewState = "start" | "capturing" | "customizing" | "result";

export type FrameStyle = // Ekspor tipe agar bisa diimport

    | {
        type: "preset";
        name: string;
        bgClass: string;
        borderClass: string;
        textColor?: string;
      }
    | { type: "custom"; name: "Custom"; style: React.CSSProperties };

const frameColorPresets: FrameStyle[] = [
  {
    type: "preset",
    name: "Putih",
    bgClass: "bg-white",
    borderClass: "border-gray-800",
    textColor: "text-gray-500",
  },
  {
    type: "preset",
    name: "Hitam",
    bgClass: "bg-black",
    borderClass: "border-gray-300",
    textColor: "text-gray-400",
  },
  {
    type: "preset",
    name: "Pink",
    bgClass: "bg-pink-100",
    borderClass: "border-pink-400",
    textColor: "text-pink-600",
  },
  {
    type: "preset",
    name: "Biru",
    bgClass: "bg-blue-100",
    borderClass: "border-blue-400",
    textColor: "text-blue-600",
  },
  {
    type: "preset",
    name: "Ungu",
    bgClass: "bg-purple-100",
    borderClass: "border-purple-400",
    textColor: "text-purple-600",
  },
  {
    type: "preset",
    name: "Hijau",
    bgClass: "bg-green-100",
    borderClass: "border-green-400",
    textColor: "text-green-600",
  },
];

const getContrastStyle = (
  hexColor: string
): { borderColor: string; color: string } => {
  try {
    const rgb = parseInt(hexColor.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    if (luma > 128) {
      return { borderColor: "#374151", color: "#4b5563" };
    } else {
      return { borderColor: "#d1d5db", color: "#9ca3af" };
    }
  } catch (e) {
    console.error("Gagal memproses warna hex:", hexColor, e);
    return { borderColor: "#6b7280", color: "#6b7280" };
  }
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const App: React.FC = () => {
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const frameRef = useRef<HTMLDivElement>(null); // Ref untuk ImageFrame display-only
  const cameraRef = useRef<CameraCaptureHandle>(null);
  const [isCapturingSequence, setIsCapturingSequence] =
    useState<boolean>(false);
  const [sequenceProgress, setSequenceProgress] = useState<number>(0);
  const [countdownValue, setCountdownValue] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [viewState, setViewState] = useState<ViewState>("start");
  const [frameStyle, setFrameStyle] = useState<FrameStyle>(
    frameColorPresets[0]
  );
  const [customHexColor, setCustomHexColor] = useState<string>("#FFFFFF");
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);

  const startCaptureSequence = useCallback(() => {
    setCapturedImages([]);
    setSequenceProgress(0);
    setCountdownValue(null);
    setViewState("capturing");
    setIsCapturingSequence(true);
    setShowColorPicker(false);
  }, []);
  const handleReset = useCallback((): void => {
    setCapturedImages([]);
    setIsCapturingSequence(false);
    setSequenceProgress(0);
    setCountdownValue(null);
    setViewState("start");
    setFrameStyle(frameColorPresets[0]);
    setShowColorPicker(false);
  }, []);

  useEffect(() => {
    if (
      !isCapturingSequence ||
      viewState !== "capturing" ||
      sequenceProgress >= 4
    ) {
      if (sequenceProgress >= 4 && viewState === "capturing") {
        setIsCapturingSequence(false);
        setViewState("customizing");
      }
      return;
    }
    let isMounted = true;
    let sequenceTimer: NodeJS.Timeout | null = null;
    const runSequenceStep = async () => {
      try {
        if (!isMounted) return;
        setCountdownValue(3);
        await delay(1000);
        if (!isMounted) return;
        setCountdownValue(2);
        await delay(1000);
        if (!isMounted) return;
        setCountdownValue(1);
        await delay(1000);
        if (!isMounted) return;
        setCountdownValue(null);
        await delay(200);
        if (!isMounted) return;
        const imageDataUrl = cameraRef.current?.takePicture();
        if (imageDataUrl && isMounted) {
          setCapturedImages((prev) => [...prev, imageDataUrl]);
          const nextProgress = sequenceProgress + 1;
          setSequenceProgress(nextProgress);
        } else if (isMounted) {
          console.error(`Gagal mengambil gambar ke-${sequenceProgress + 1}.`);
          alert(
            `Gagal mengambil gambar ke-${
              sequenceProgress + 1
            }. Menghentikan sesi.`
          );
          if (isMounted) {
            setIsCapturingSequence(false);
            setViewState("start");
          }
        }
      } catch (error) {
        console.error("Error dalam sequence:", error);
        if (isMounted) {
          setIsCapturingSequence(false);
          setViewState("start");
        }
      }
    };
    sequenceTimer = setTimeout(
      runSequenceStep,
      sequenceProgress === 0 ? 500 : 1500
    );
    return () => {
      isMounted = false;
      if (sequenceTimer) clearTimeout(sequenceTimer);
      setCountdownValue(null);
    };
  }, [isCapturingSequence, sequenceProgress, viewState]);

  const handleDownload = useCallback(() => {
    if (!frameRef.current) return;
    setIsDownloading(true);
    html2canvas(frameRef.current, {
      useCORS: true,
      scale: 2,
      backgroundColor: null,
    })
      .then((canvas) => {
        const imageDataUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = imageDataUrl;
        downloadLink.download = `photobooth-frame-${Date.now()}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        setIsDownloading(false);
      })
      .catch((error) => {
        console.error("Error generating image:", error);
        setIsDownloading(false);
        alert("Gagal membuat gambar.");
      });
  }, [frameRef]);

  const proceedToResult = () => {
    setShowColorPicker(false);
    setViewState("result");
  };

  const handleCustomColorChange = (newColor: string) => {
    setCustomHexColor(newColor);
    const contrastStyle = getContrastStyle(newColor);
    setFrameStyle({
      type: "custom",
      name: "Custom",
      style: {
        backgroundColor: newColor,
        borderColor: contrastStyle.borderColor,
        color: contrastStyle.color,
      },
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over.id) {
      setCapturedImages((items) => {
        const oldIndex = items.findIndex((_, index) => index === active.id);
        const newIndex = items.findIndex((_, index) => index === over.id);
        if (oldIndex === -1 || newIndex === -1) return items;
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const imageIds = capturedImages.map((_, index) => index); // Gunakan index 0,1,2,3 sebagai ID

  return (
    <div className="App min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-gradient-to-br from-slate-900 to-gray-900">
      <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-gray-100 text-center tracking-tight">
        Foto Otomatis Keren
      </h1>

      {viewState === "start" && (
        <div className="w-full max-w-md text-center p-8 bg-gray-800 rounded-2xl shadow-xl transform transition-all hover:scale-[1.02]">
          <div className="text-6xl mb-5 text-indigo-400 mx-auto w-fit">📸</div>
          <h2 className="text-2xl font-semibold mb-3 text-gray-100">
            Yuk, Mulai Foto!
          </h2>
          <p className="text-gray-400 mb-8">
            Empat foto akan diambil otomatis. Siapkan gayamu!
          </p>
          <button
            onClick={startCaptureSequence}
            className="inline-flex items-center justify-center px-8 py-3 bg-indigo-600 text-white font-semibold rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-800 focus:ring-opacity-50 transition-all duration-300 transform hover:scale-105 active:scale-100"
          >
            {" "}
            Mulai Sesi{" "}
          </button>
        </div>
      )}

      {viewState === "capturing" && (
        <div className="w-full max-w-5xl bg-slate-800 rounded-2xl shadow-xl p-5 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8">
          <div className="flex-1 flex flex-col items-center justify-start min-w-0">
            <div className="relative w-full max-w-3xl mx-auto overflow-hidden rounded-xl shadow-lg mb-3 ring-1 ring-white/10 bg-black flex items-center justify-center">
              <CameraCapture ref={cameraRef} countdownValue={countdownValue} />
            </div>
            {isCapturingSequence && (
              <p className="mt-1 text-base text-indigo-400 font-medium animate-pulse text-center">
                {" "}
                Siap-siap... Foto ke-{sequenceProgress + 1} / 4{" "}
              </p>
            )}
          </div>
          <div className="w-full md:w-[180px] lg:w-[200px] flex-shrink-0 flex flex-col items-center md:border-l border-slate-700 md:pl-6 lg:pl-8">
            <h3 className="text-lg font-semibold text-gray-200 mb-5 text-center w-full">
              {" "}
              Hasil Jepretan{" "}
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
      )}

      {viewState === "customizing" && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="w-full max-w-5xl bg-slate-800 rounded-2xl shadow-xl p-5 md:p-8 flex flex-col lg:flex-row gap-6 md:gap-8 relative">
            <div className="flex-1 flex flex-col items-center justify-center">
              <h2 className="text-xl font-semibold text-gray-100 mb-4">
                {" "}
                Preview Bingkai (Geser untuk Ubah Urutan){" "}
              </h2>
              <SortableContext items={imageIds} strategy={rectSwappingStrategy}>
                {/* Gunakan ImageFrame_Sortable di sini */}
                <ImageFrame_Sortable
                  images={capturedImages}
                  frameStyle={frameStyle}
                />
              </SortableContext>
            </div>
            <div className="w-full lg:w-1/3 flex-shrink-0 flex flex-col">
              <h2 className="text-xl font-semibold text-gray-100 mb-5 text-center lg:text-left">
                {" "}
                Kustomisasi Bingkai{" "}
              </h2>
              <div className="mb-6">
                <h3 className="text-base font-medium text-gray-300 mb-3">
                  {" "}
                  Warna Preset:{" "}
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {frameColorPresets.map(
                    (option) =>
                      option.type === "preset" && (
                        <button
                          key={option.name}
                          onClick={() => {
                            setFrameStyle(option);
                            setShowColorPicker(false);
                          }}
                          className={`px-3 py-2 text-sm font-medium rounded-lg border-2 transition-all ${
                            frameStyle.type === "preset" &&
                            frameStyle.name === option.name
                              ? `ring-2 ring-offset-2 ring-offset-slate-800 ${option.borderClass.replace(
                                  "border-",
                                  "ring-"
                                )} border-transparent scale-110`
                              : `${option.borderClass} ${option.bgClass} hover:opacity-80`
                          } ${option.bgClass}`}
                          style={{
                            color: ["bg-black"].includes(option.bgClass)
                              ? "white"
                              : "black",
                          }}
                        >
                          {option.name}
                        </button>
                      )
                  )}
                </div>
              </div>
              <div className="mb-6 relative">
                <h3 className="text-base font-medium text-gray-300 mb-3">
                  {" "}
                  Warna Kustom:{" "}
                </h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                      frameStyle.type === "custom"
                        ? "ring-2 ring-offset-2 ring-offset-slate-800 ring-indigo-400 border-transparent scale-110"
                        : "border-slate-600 hover:border-slate-400"
                    }`}
                    style={{
                      backgroundColor:
                        frameStyle.type === "custom"
                          ? frameStyle.style.backgroundColor
                          : customHexColor,
                    }}
                  ></button>
                  <HexColorInput
                    color={customHexColor}
                    onChange={handleCustomColorChange}
                    className="p-2 w-24 rounded border border-slate-600 bg-slate-700 text-gray-200 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    prefixed
                  />
                </div>
                {showColorPicker && (
                  <div className="absolute mt-2 z-20 left-0">
                    <HexColorPicker
                      color={customHexColor}
                      onChange={handleCustomColorChange}
                    />
                  </div>
                )}
              </div>
              <div className="mt-auto pt-4">
                <button
                  onClick={proceedToResult}
                  className="w-full px-6 py-3 bg-slate-100 text-black font-semibold rounded-lg shadow-md hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-blue-500 transition-colors"
                >
                  {" "}
                  Lanjut ke Hasil{" "}
                </button>
              </div>
            </div>
          </div>
        </DndContext>
      )}

      {viewState === "result" && (
        <div className="w-full max-w-lg bg-gray-800 rounded-2xl shadow-xl p-5 md:p-8 flex flex-col items-center transform transition-all duration-500 ease-out scale-100 opacity-100">
          <h2 className="text-2xl font-semibold text-gray-100 mb-5">
            {" "}
            Selesai! Ini Hasilnya:{" "}
          </h2>
          <div className="mb-8 transform -rotate-1 hover:rotate-0 transition-transform duration-200">
            {/* Gunakan ImageFrame biasa (display only) di sini */}
            <ImageFrame
              ref={frameRef}
              images={capturedImages}
              frameStyle={frameStyle}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-xs mx-auto">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className={`inline-flex items-center justify-center w-full px-6 py-3 text-base font-medium rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ease-in-out ${
                isDownloading
                  ? "bg-gray-500 text-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 focus:ring-offset-gray-800"
              }`}
            >
              {" "}
              {isDownloading ? "Memproses..." : "Unduh Gambar"}{" "}
            </button>
            <button
              onClick={handleReset}
              disabled={isDownloading}
              className={`inline-flex items-center justify-center w-full px-6 py-3 text-base font-medium rounded-full border border-gray-600 bg-gray-700 text-gray-200 shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-800 transition-colors duration-200 ease-in-out ${
                isDownloading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {" "}
              Ambil Ulang{" "}
            </button>
          </div>
        </div>
      )}

      <footer className="mt-10 text-center text-xs text-gray-500 dark:text-gray-400">
        Didukung oleh Teknologi Modern ✨ - {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default App;
