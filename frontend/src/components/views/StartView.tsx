// client/src/components/views/StartView.tsx
import React from "react";

interface StartViewProps {
  onStartSequence: () => void; // Fungsi untuk memulai sequence
}

const StartView: React.FC<StartViewProps> = ({ onStartSequence }) => {
  return (
    <div className="w-full max-w-md text-center p-8 bg-gray-800 rounded-2xl shadow-xl transform transition-all hover:scale-[1.02]">
      <div className="text-6xl mb-5 text-indigo-400 mx-auto w-fit">📸</div>
      <h2 className="text-2xl font-semibold mb-3 text-gray-100">
        Yuk, Mulai Foto!
      </h2>
      <p className="text-gray-400 mb-8">
        Empat foto akan diambil otomatis. Siapkan gayamu!
      </p>
      <button
        onClick={onStartSequence} // Panggil prop saat diklik
        className="inline-flex items-center justify-center px-8 py-3 bg-indigo-600 text-white font-semibold rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-800 focus:ring-opacity-50 transition-all duration-300 transform hover:scale-105 active:scale-100"
      >
        Mulai Sesi
      </button>
    </div>
  );
};

export default StartView;
