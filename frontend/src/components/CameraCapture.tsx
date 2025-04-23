// client/src/components/CameraCapture.tsx
import {
  useRef,
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";

// Definisikan tipe untuk props
interface CameraCaptureProps {
  countdownValue: number | null; // Nilai countdown (3, 2, 1) atau null
}

// Definisikan Handle (fungsi yang diekspos)
export interface CameraCaptureHandle {
  takePicture: () => string | null; // Fungsi untuk mengambil gambar, return data URL atau null
}

// Gunakan forwardRef untuk meneruskan ref dari App
const CameraCapture = forwardRef<CameraCaptureHandle, CameraCaptureProps>(
  ({ countdownValue }, ref) => {
    // Terima props countdownValue dan ref
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isCameraReady, setIsCameraReady] = useState<boolean>(false);

    // --- Fungsi startCamera ---
    const startCamera = useCallback(async (): Promise<void> => {
      setError(null);
      setIsCameraReady(false);
      // Hentikan stream lama jika ada sebelum memulai yang baru
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 }, // Minta resolusi ideal
            height: { ideal: 480 },
            facingMode: "user", // Prioritaskan kamera depan
          },
          audio: false,
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          // Tunggu metadata dimuat untuk memastikan dimensi video diketahui
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
        setStream(null); // Reset stream jika error
      }
    }, [stream]); // Dependensi pada stream agar stream lama dihentikan

    // --- useEffect untuk startCamera ---
    useEffect(() => {
      startCamera();
      // Fungsi cleanup untuk mematikan kamera saat komponen unmount
      return () => {
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Hanya jalankan sekali saat komponen pertama kali mount

    // --- Fungsi internal untuk mengambil gambar ---
    const takePictureInternal = (): string | null => {
      if (!videoRef.current || !canvasRef.current || !isCameraReady) {
        console.warn("Kamera atau canvas belum siap untuk mengambil gambar.");
        return null;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (!context) {
        console.error("Tidak bisa mendapatkan context 2D.");
        setError("Gagal memproses gambar (context error).");
        return null;
      }

      // Sesuaikan ukuran canvas dengan dimensi aktual video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Gambar ke canvas (dengan flip horizontal untuk efek cermin)
      context.save();
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      context.restore(); // Kembalikan transformasi context

      try {
        const dataUrl = canvas.toDataURL("image/png");
        return dataUrl;
      } catch (e) {
        console.error("Gagal membuat data URL:", e);
        setError("Gagal memproses gambar (data URL error).");
        return null;
      }
    };

    // --- Expose takePicture menggunakan useImperativeHandle ---
    useImperativeHandle(ref, () => ({
      takePicture: takePictureInternal,
    }));

    return (
      // Wrapper relatif utama untuk video dan overlay
      // w-full h-full agar mengisi kontainer dari App.tsx
      // bg-black sebagai fallback jika video belum tampil
      <div className="relative w-full h-full bg-black overflow-hidden rounded-xl">
        {" "}
        {/* Tambah rounded-xl di sini */}
        {/* Elemen Video: Kembali ke h-auto untuk mencegah layar hitam */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`block w-full h-auto transition-opacity duration-500 ${
            isCameraReady ? "opacity-100" : "opacity-0" // Transisi saat kamera siap
          } ${error ? "!opacity-0 !h-0" : ""}`} // Sembunyikan jika error
          style={{ transform: "scaleX(-1)" }} // Efek cermin
        />
        {/* Overlay Countdown */}
        {countdownValue !== null &&
          countdownValue > 0 &&
          !error && // Hanya tampil jika ada countdown & tidak error
          +(
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {" "}
              {/* Sedikit overlay gelap */}
              <span
                className="text-white text-8xl md:text-9xl lg:text-[10rem] font-bold animate-pulse" // Animasi pulse
                style={{ textShadow: "0 5px 20px rgba(0,0,0,0.9)" }} // Shadow teks
              >
                {countdownValue}
              </span>
            </div>
          )}
        {/* Tampilan Error (jika ada, di atas video) */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900 bg-opacity-80 text-red-100 p-4 text-center">
            {" "}
            {/* Error lebih jelas */}
            <p className="font-semibold mb-2">Gagal Memuat Kamera</p>
            <p className="text-sm mb-3">{error}</p>
            <button
              onClick={startCamera} // Tombol coba lagi
              className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm shadow transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        )}
        {/* Canvas tetap tersembunyi */}
        <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
      </div>
    );
  }
);

// Menambahkan nama display untuk debugging
CameraCapture.displayName = "CameraCapture";

export default CameraCapture;
