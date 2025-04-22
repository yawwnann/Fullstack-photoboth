// client/src/App.tsx
import React, { useState, useRef, useCallback } from "react";
import html2canvas from "html2canvas"; // <-- Import html2canvas

import CameraCapture from "./components/CameraCapture";
import ImageFrame from "./components/ImageFrame";

const App: React.FC = () => {
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const frameRef = useRef<HTMLDivElement>(null); // Ref tetap digunakan untuk html2canvas
  const [isDownloading, setIsDownloading] = useState<boolean>(false); // State untuk loading unduh

  const handleCapture = useCallback((imageDataUrl: string): void => {
    setCapturedImages((prevImages) => {
      if (prevImages.length < 4) {
        return [...prevImages, imageDataUrl];
      }
      return prevImages;
    });
  }, []);

  const handleReset = useCallback((): void => {
    setCapturedImages([]);
  }, []);

  // Hapus hook useReactToPrint
  // const handlePrint = useReactToPrint({ ... });

  // Fungsi baru untuk menangani download
  const handleDownload = useCallback(() => {
    if (!frameRef.current) {
      console.error("Error: Frame ref is not available.");
      return;
    }
    setIsDownloading(true); // Mulai loading

    html2canvas(frameRef.current, {
      useCORS: true, // Penting jika gambar berasal dari domain lain (meskipun di sini base64)
      // scale: 2, // Tingkatkan skala untuk resolusi lebih tinggi (opsional)
      backgroundColor: null, // Gunakan background dari elemen itu sendiri
    })
      .then((canvas) => {
        // Ubah canvas menjadi data URL (PNG)
        const imageDataUrl = canvas.toDataURL("image/png");

        // Buat link anchor sementara untuk trigger download
        const downloadLink = document.createElement("a");
        downloadLink.href = imageDataUrl;
        // Tentukan nama file yang akan diunduh
        downloadLink.download = `photobooth-frame-${Date.now()}.png`;

        // Klik link secara programatik
        document.body.appendChild(downloadLink); // Perlu ditambahkan ke body di beberapa browser
        downloadLink.click();
        document.body.removeChild(downloadLink); // Hapus link setelah diklik

        setIsDownloading(false); // Selesai loading
      })
      .catch((error) => {
        console.error("Error generating image with html2canvas:", error);
        setIsDownloading(false); // Selesai loading (error)
        // Tambahkan notifikasi error untuk pengguna jika perlu
        alert("Gagal membuat gambar untuk diunduh.");
      });
  }, [frameRef]); // Dependensi pada frameRef

  const isCaptureComplete = capturedImages.length === 4;

  return (
    <div className="App min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-800">
        Aplikasi Photobooth
      </h1>

      <div className="w-full max-w-lg bg-white rounded-lg shadow-xl p-4 md:p-6">
        {!isCaptureComplete ? (
          // ... (bagian CameraCapture dan Preview tetap sama) ...
          <>
            <CameraCapture
              onCapture={handleCapture}
              captureCount={capturedImages.length}
            />
            {capturedImages.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <p className="text-sm text-gray-600 mb-2 text-center">
                  Preview ({capturedImages.length}/4):
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {capturedImages.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-16 h-16 border border-gray-300 object-cover rounded shadow-sm"
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-700">
              Frame Siap!
            </h2>
            {/* Pastikan ref masih terpasang di ImageFrame */}
            <ImageFrame ref={frameRef} images={capturedImages} />
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0 mt-4 w-full justify-center">
              {/* --- Tombol Cetak diubah menjadi Tombol Unduh --- */}
              <button
                onClick={handleDownload}
                disabled={isDownloading} // Nonaktifkan saat sedang proses unduh
                className={`w-full sm:w-auto px-6 py-2 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-colors flex items-center justify-center
                  ${
                    isDownloading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-indigo-500 hover:bg-indigo-600 focus:ring-indigo-400"
                  }`}
              >
                {isDownloading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Memproses...
                  </>
                ) : (
                  "Unduh Frame" // Ganti teks tombol
                )}
              </button>
              {/* --- Akhir Perubahan Tombol --- */}

              <button
                onClick={handleReset}
                disabled={isDownloading} // Nonaktifkan juga saat proses lain berjalan
                className={`w-full sm:w-auto px-6 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 transition-colors ${
                  isDownloading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-red-600"
                }`}
              >
                Ambil Ulang
              </button>
            </div>
          </div>
        )}
      </div>
      <footer className="mt-6 text-center text-xs text-gray-500">
        Dibuat dengan Vite, React, TS & Tailwind CSS -{" "}
        {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default App;
