// client/src/components/CameraCapture.tsx
import React, { useRef, useState, useEffect, useCallback } from "react";

interface CameraCaptureProps {
  onCapture: (imageDataUrl: string) => void;
  captureCount: number;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({
  onCapture,
  captureCount,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState<boolean>(false);

  const startCamera = useCallback(async (): Promise<void> => {
    setError(null);
    setIsCameraReady(false);
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        }, // Prefer front camera
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          setIsCameraReady(true);
        };
      }
    } catch (err: unknown) {
      console.error("Error accessing camera:", err);
      let message = "Terjadi kesalahan saat mengakses kamera.";
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          message =
            "Akses kamera tidak diizinkan. Mohon berikan izin pada browser Anda.";
        } else if (err.name === "NotFoundError") {
          message = "Tidak ada kamera yang ditemukan.";
        } else {
          message = `Error kamera: ${err.message}.`;
        }
      }
      setError(message);
      setStream(null);
    }
  }, [stream]); // Dependensi stream agar fungsi dibuat ulang jika stream berubah (misal saat coba lagi)

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Hanya jalankan sekali saat mount

  const takePicture = (): void => {
    if (!videoRef.current || !canvasRef.current || !isCameraReady) {
      console.warn("Kamera atau canvas belum siap.");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) {
      console.error("Tidak bisa mendapatkan context 2D.");
      setError("Gagal memproses gambar (context error).");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Gambar ke canvas dengan flip horizontal agar hasil tidak terbalik
    context.save();
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    context.restore();

    try {
      const dataUrl = canvas.toDataURL("image/png");
      onCapture(dataUrl);
    } catch (e) {
      console.error("Gagal membuat data URL:", e);
      setError("Gagal memproses gambar (data URL error). Coba lagi.");
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      <div className="relative w-full max-w-md border border-gray-300 bg-black overflow-hidden rounded">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`block w-full h-auto transition-opacity duration-500 ${
            isCameraReady ? "opacity-100" : "opacity-0"
          }`}
          style={{ transform: "scaleX(-1)" }} // Efek cermin di tampilan video
        />
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
            isCameraReady || error
              ? "opacity-0 pointer-events-none"
              : "opacity-100"
          }`}
        >
          <div className="text-white bg-black bg-opacity-60 p-3 rounded text-center">
            <svg
              className="animate-spin h-5 w-5 text-white inline-block mr-2"
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
            Memulai kamera...
          </div>
        </div>
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-100 text-red-800 p-4 text-center rounded">
            <p className="font-semibold">Gagal Memulai Kamera</p>
            <p className="text-sm mb-3">{error}</p>
            <button
              onClick={startCamera} // Coba lagi
              className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm shadow transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        )}
      </div>
      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>

      {isCameraReady && !error && (
        <button
          onClick={takePicture}
          disabled={captureCount >= 4}
          className={`px-6 py-3 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-75 transition-all duration-150 ease-in-out
             ${
               captureCount >= 4
                 ? "bg-gray-400 cursor-not-allowed"
                 : "bg-blue-500 hover:bg-blue-600 focus:ring-blue-400 active:bg-blue-700 transform active:scale-95"
             }`}
        >
          Ambil Gambar ({captureCount < 4 ? captureCount + 1 : 4}/4)
        </button>
      )}
    </div>
  );
};

export default CameraCapture;
