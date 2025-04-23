// client/src/App.tsx (Refactored)
import React, { useState, useRef, useCallback, useEffect } from "react";
import domtoimage from "dom-to-image-more";
import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

// Impor dari file config dan utils
import {
  ViewState,
  FrameStyle,
  LayoutType,
  frameColorPresets,
  layoutOptions,
} from "./config";
import { getContrastStyle, delay } from "./utils";

// Impor komponen view
import StartView from "./components/views/StartView";
import CaptureView from "./components/views/CaptureView";
import CustomizationView from "./components/views/CustomizationView";
import ResultView from "./components/views/ResultView";

// Impor komponen lain (pastikan path benar)
import { type CameraCaptureHandle } from "./components/CameraCapture";
import tittleLogo from "./assets/tittle.png"; // Sesuaikan path logo Anda

const App: React.FC = () => {
  // --- State ---
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const frameRef = useRef<HTMLDivElement>(null);
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
  const [selectedLayout, setSelectedLayout] = useState<LayoutType>(
    layoutOptions[0].id
  );

  // --- Handlers Utama ---
  const startCaptureSequence = useCallback(() => {
    setCapturedImages([]);
    setSequenceProgress(0);
    setCountdownValue(null);
    setViewState("capturing");
    setIsCapturingSequence(true);
  }, []);

  const handleReset = useCallback((): void => {
    setCapturedImages([]);
    setIsCapturingSequence(false);
    setSequenceProgress(0);
    setCountdownValue(null);
    setViewState("start");
    setFrameStyle(frameColorPresets[0]);

    setSelectedLayout(layoutOptions[0].id);
  }, []);

  // Efek untuk sequence capture
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
          console.error(`Gagal mengambil gbr ${sequenceProgress + 1}`);
          alert(`Gagal gbr ${sequenceProgress + 1}`);
          if (isMounted) {
            setIsCapturingSequence(false);
            setViewState("start");
          }
        }
      } catch (error) {
        console.error("Error sequence:", error);
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

  // Handler untuk download
  const handleDownload = useCallback(() => {
    const node = frameRef.current;
    if (!node) {
      alert("Elemen frame tidak ditemukan.");
      return;
    }
    setIsDownloading(true);
    const scale = 3;
    const options = {
      quality: 1.0,
      bgcolor: "#ffffff",
      width: node.offsetWidth * scale,
      height: node.offsetHeight * scale,
    };
    domtoimage
      .toPng(node, options)
      .then((imageDataUrl: string) => {
        if (!imageDataUrl || !imageDataUrl.startsWith("data:image/png")) {
          throw new Error("Data URL tidak valid");
        }
        const link = document.createElement("a");
        link.href = imageDataUrl;
        link.download = `photobooth-${Date.now()}.png`;
        link.click();
        setIsDownloading(false);
      })
      .catch((error: unknown) => {
        console.error("Download GAGAL:", error);
        setIsDownloading(false);
        alert("Gagal membuat gambar unduhan.");
      });
  }, [frameRef]); // Dependensi ref saja

  // Handler untuk lanjut dari kustomisasi
  const proceedToResult = () => {
    setViewState("result");
  };

  // Handler untuk perubahan warna custom
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

  // Handler untuk memilih warna preset
  const handlePresetColorSelect = (preset: FrameStyle) => {
    if (preset.type === "preset") {
      // Type guard
      setFrameStyle(preset);
    }
  };

  // Handler untuk drag-and-drop
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setCapturedImages((items) => {
      const oldIndex = items.findIndex((_, index) => index === active.id);
      const newIndex = items.findIndex((_, index) => index === over.id);
      if (oldIndex === -1 || newIndex === -1) return items;
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  // Array ID untuk dnd-kit
  const imageIds = capturedImages.map((_, index) => index);

  // --- Render ---
  return (
    <div className="App min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-gradient-to-br from-slate-900 to-gray-900">
      <img
        src={tittleLogo}
        alt="Yawwnan Photobooth"
        className="h-10 sm:h-12 w-auto mx-auto mb-8"
      />

      {viewState === "start" && (
        <StartView onStartSequence={startCaptureSequence} />
      )}

      {viewState === "capturing" && (
        <CaptureView
          isCapturingSequence={isCapturingSequence}
          sequenceProgress={sequenceProgress}
          countdownValue={countdownValue}
          capturedImages={capturedImages}
          cameraRef={cameraRef}
        />
      )}

      {viewState === "customizing" && (
        <CustomizationView
          capturedImages={capturedImages}
          frameStyle={frameStyle}
          selectedLayout={selectedLayout}
          customHexColor={customHexColor}
          imageIds={imageIds}
          onLayoutChange={setSelectedLayout} // Langsung pass setter
          onPresetColorSelect={handlePresetColorSelect} // Pass handler spesifik
          onCustomColorChange={handleCustomColorChange} // Pass handler spesifik
          onProceed={proceedToResult}
          onDragEnd={handleDragEnd}
        />
      )}

      {viewState === "result" && (
        <ResultView
          capturedImages={capturedImages}
          frameStyle={frameStyle}
          layout={selectedLayout}
          isDownloading={isDownloading}
          onDownload={handleDownload}
          onReset={handleReset}
          frameRef={frameRef} // Pass ref ke result view
        />
      )}

      <footer className="mt-10 text-center text-xs text-gray-500 dark:text-gray-400">
        Didukung oleh Teknologi Gacor ✨ - {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default App;
