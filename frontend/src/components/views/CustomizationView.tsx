// client/src/components/views/CustomizationView.tsx
import React, { useState } from "react";
import { HexColorPicker, HexColorInput } from "react-colorful";
import {
  DndContext,
  closestCenter,
  useSensors,
  useSensor,
  PointerSensor,
  KeyboardSensor,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSwappingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import ImageFrame_Sortable from "../ImageFrame_Sortable";
// Impor tipe dan konstanta dari config.ts
import {
  FrameStyle,
  LayoutType,
  frameColorPresets,
  layoutOptions,
} from "../../config";

// Definisikan Props untuk komponen ini
interface CustomizationViewProps {
  capturedImages: string[];
  frameStyle: FrameStyle;
  selectedLayout: LayoutType;
  customHexColor: string;
  imageIds: number[]; // Array ID (index 0-3) untuk dnd-kit
  onLayoutChange: (layoutId: LayoutType) => void;
  onPresetColorSelect: (preset: FrameStyle) => void; // Handler spesifik untuk preset
  onCustomColorChange: (newColor: string) => void;
  onProceed: () => void;
  onDragEnd: (event: DragEndEvent) => void;
}

const CustomizationView: React.FC<CustomizationViewProps> = ({
  capturedImages,
  frameStyle,
  selectedLayout,
  customHexColor,
  imageIds,
  onLayoutChange,
  onPresetColorSelect,
  onCustomColorChange,
  onProceed,
  onDragEnd,
}) => {
  // State lokal hanya untuk visibility color picker
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <div className="w-full max-w-5xl bg-slate-800 rounded-2xl shadow-xl p-5 md:p-8 flex flex-col lg:flex-row gap-6 md:gap-8 relative">
        {/* Kolom Kiri: Preview Frame */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">
            {" "}
            Preview Bingkai (Geser untuk Ubah Urutan){" "}
          </h2>
          <SortableContext items={imageIds} strategy={rectSwappingStrategy}>
            <ImageFrame_Sortable
              images={capturedImages}
              frameStyle={frameStyle}
              layout={selectedLayout}
            />
          </SortableContext>
        </div>

        {/* Kolom Kanan: Opsi Kustomisasi */}
        <div className="w-full lg:w-1/3 flex-shrink-0 flex flex-col">
          <h2 className="text-xl font-semibold text-gray-100 mb-5 text-center lg:text-left">
            {" "}
            Kustomisasi Bingkai{" "}
          </h2>

          {/* Pilihan Layout */}
          <div className="mb-6">
            <h3 className="text-base font-medium text-gray-300 mb-3">
              Layout Bingkai:
            </h3>
            <div className="flex flex-wrap gap-3">
              {layoutOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => onLayoutChange(option.id)}
                  // Pastikan styling lengkap ada di sini
                  className={`px-4 py-2 text-sm font-medium rounded-lg border-2 transition-all ${
                    selectedLayout === option.id
                      ? "bg-indigo-500 border-indigo-400 ring-2 ring-offset-2 ring-offset-slate-800 ring-indigo-400 text-white scale-105" // Aktif
                      : "bg-slate-700 border-slate-600 text-gray-300 hover:bg-slate-600 hover:border-slate-500" // Normal
                  }`}
                >
                  {option.name}
                </button>
              ))}
            </div>
          </div>

          {/* Pilihan Warna Preset */}
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
                        onPresetColorSelect(option); // Panggil handler preset
                        setShowColorPicker(false);
                      }}
                      // Pastikan styling lengkap ada di sini
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

          {/* Pilihan Warna Custom */}
          <div className="mb-6 relative">
            <h3 className="text-base font-medium text-gray-300 mb-3">
              {" "}
              Warna Kustom:{" "}
            </h3>
            <div className="flex items-center gap-3">
              {/* Swatch Warna Custom */}
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                // Pastikan styling lengkap ada di sini
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
              {/* Input Hex */}
              <HexColorInput
                color={customHexColor}
                onChange={onCustomColorChange} // Panggil handler custom color change
                className="p-2 w-24 rounded border border-slate-600 bg-slate-700 text-gray-200 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                prefixed
              />
            </div>
            {/* Color Picker */}
            {showColorPicker && (
              <div className="absolute mt-2 z-20 left-0">
                <HexColorPicker
                  color={customHexColor}
                  onChange={onCustomColorChange}
                />
              </div>
            )}
          </div>

          {/* Tombol Lanjut */}
          <div className="mt-auto pt-4">
            <button
              onClick={onProceed} // Panggil prop onProceed
              // Pastikan styling lengkap ada di sini
              className="w-full px-6 py-3 bg-slate-600 text-white font-semibold rounded-lg shadow-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-slate-500 transition-colors"
            >
              Lanjut ke Hasil
            </button>
          </div>
        </div>
      </div>
    </DndContext>
  );
};

export default CustomizationView;
