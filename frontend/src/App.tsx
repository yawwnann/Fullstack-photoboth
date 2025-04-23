// client/src/App.tsx (Revisi dengan Kelas Tailwind Standar)
import React, { useState, useRef, useCallback, useEffect } from "react";
import html2canvas from "html2canvas";
import CameraCapture, { CameraCaptureHandle } from "./components/CameraCapture";
import ImageFrame from "./components/ImageFrame";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const App: React.FC = () => {
  // --- State dan Refs (Sama) ---
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const frameRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<CameraCaptureHandle>(null);
  const [isCapturingSequence, setIsCapturingSequence] =
    useState<boolean>(false);
  const [sequenceProgress, setSequenceProgress] = useState<number>(0);
  const [countdownValue, setCountdownValue] = useState<number | null>(null);
  const [isSequenceComplete, setIsSequenceComplete] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // --- Logika Fungsi (Sama) ---
  const startCaptureSequence = useCallback(() => {
    /* ...kode sama... */
    setCapturedImages([]);
    setSequenceProgress(0);
    setIsSequenceComplete(false);
    setCountdownValue(null);
    setIsCapturingSequence(true);
  }, []);
  const handleReset = useCallback((): void => {
    /* ...kode sama... */
    setCapturedImages([]);
    setIsCapturingSequence(false);
    setSequenceProgress(0);
    setCountdownValue(null);
    setIsSequenceComplete(false);
  }, []);
  useEffect(() => {
    /* ...kode sequence sama... */
    // (Logika useEffect dari langkah sebelumnya)
    if (!isCapturingSequence || sequenceProgress >= 4) {
      if (sequenceProgress >= 4 && !isSequenceComplete) {
        setIsSequenceComplete(true);
        setIsCapturingSequence(false);
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
          }
        }
      } catch (error) {
        console.error("Error dalam sequence:", error);
        if (isMounted) {
          setIsCapturingSequence(false);
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
  }, [isCapturingSequence, sequenceProgress, isSequenceComplete]);
  const handleDownload = useCallback(() => {
    /* ...kode download sama... */
    if (!frameRef.current) return;
    setIsDownloading(true);
    html2canvas(frameRef.current, {
      useCORS: true,
      scale: 2,
      backgroundColor: "#ffffff",
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

  // --- Render Logic (Sama) ---
  // client/src/App.tsx (Bagian Dalam Render Function)

  // --- Render Logic (Sama) ---
  const showStartButton = !isCapturingSequence && !isSequenceComplete;
  const showCaptureView =
    isCapturingSequence ||
    (!isSequenceComplete &&
      capturedImages.length > 0 &&
      capturedImages.length < 4);
  const showResultView = isSequenceComplete;

  return (
    // Container utama - pastikan background sesuai (misal: gelap)
    <div className="App min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-gradient-to-br from-slate-900 to-gray-900">
      {/* Judul Aplikasi */}
      <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-gray-100 text-center tracking-tight">
        Foto Otomatis Keren
      </h1>

      {/* Tombol Mulai (Kode sama seperti sebelumnya) */}
      {showStartButton && (
        <div className="w-full max-w-md text-center p-8 bg-gray-800 rounded-2xl shadow-xl transform transition-all hover:scale-[1.02]">
          {/* ... isi tombol start ... */}
          <div className="text-6xl mb-5 text-indigo-400 mx-auto w-fit">📸</div>
          <h2 className="text-2xl font-semibold mb-3 text-gray-100">
            Yuk, Mulai Foto!
          </h2>
          <p className="text-gray-400 mb-8">
            Empat foto akan diambil otomatis dengan hitungan mundur. Siapkan
            gayamu!
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

      {/* ============================================= */}
      {/* == PERBAIKAN TAMPILAN BAGIAN INI == */}
      {/* ============================================= */}
      {showCaptureView && (
        <div className="w-full max-w-5xl bg-slate-800 rounded-2xl shadow-xl p-5 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Kolom Kiri: Kamera & Countdown */}
          <div className="flex-1 flex flex-col items-center justify-start min-w-0">
            {/* Wrapper Kamera: Tambahkan aspect-video dan perbesar max-w */}
            <div className="relative w-full max-w-3xl mx-auto overflow-hidden rounded-xl shadow-lg mb-3 ring-1 ring-white/10 aspect-video bg-black flex items-center justify-center">
              {" "}
              {/* TAMBAHKAN aspect-video, PERBESAR max-w-3xl, tambah bg-black */}
              {/* Komponen Kamera */}
              <CameraCapture
                ref={cameraRef}
                countdownValue={countdownValue}
                // Pastikan komponen CameraCapture bisa mengisi parent (akan kita sesuaikan di langkah 2)
              />
              {/* Overlay Countdown - ini akan muncul di atas wrapper ini karena 'relative' */}
              {countdownValue !== null && countdownValue > 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span
                    className="text-white text-8xl md:text-9xl lg:text-[10rem] font-bold animate-pulse" // Perbesar lagi font countdown?
                    style={{ textShadow: "0 5px 20px rgba(0,0,0,0.9)" }}
                  >
                    {" "}
                    {/* Shadow lebih tebal */}
                    {countdownValue}
                  </span>
                </div>
              )}
            </div>
            {/* Teks Progress (Sama) */}
            {isCapturingSequence && (
              <p className="mt-1 text-base text-indigo-400 font-medium animate-pulse text-center">
                Siap-siap... Foto ke-{sequenceProgress + 1} / 4
              </p>
            )}
          </div>

          {/* Kolom Kanan: Hasil Sementara (Kode sama seperti sebelumnya) */}
          <div className="w-full md:w-[180px] lg:w-[200px] flex-shrink-0 flex flex-col items-center md:border-l border-slate-700 md:pl-6 lg:pl-8">
            {/* ... isi kolom kanan ... */}
            <h3 className="text-lg font-semibold text-gray-200 mb-5 text-center w-full">
              Hasil Jepretan
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-1 gap-4 w-full">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className={`relative aspect-square border-2 border-dashed border-slate-600 rounded-lg shadow-sm bg-slate-700 flex items-center justify-center overflow-hidden transition-all duration-300 group ${
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
      {/* ============================================= */}
      {/* == AKHIR BAGIAN YANG DIPERBAIKI == */}
      {/* ============================================= */}

      {/* Tampilan Hasil Akhir (Kode sama seperti sebelumnya) */}
      {showResultView && (
        <div className="w-full max-w-lg bg-gray-800 rounded-2xl shadow-xl p-5 md:p-8 flex flex-col items-center transform transition-all duration-500 ease-out scale-100 opacity-100">
          {/* ... isi tampilan hasil ... */}
          <h2 className="text-2xl font-semibold text-gray-100 mb-5">
            Selesai! Ini Hasilnya:
          </h2>
          <div className="mb-8 transform -rotate-1 hover:rotate-0 transition-transform duration-200">
            <ImageFrame ref={frameRef} images={capturedImages} />
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

      {/* Footer (Kode sama) */}
      <footer className="mt-10 text-center text-xs text-gray-500 dark:text-gray-400">
        Didukung oleh Teknologi Modern ✨ - {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default App;
