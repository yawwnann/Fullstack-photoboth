// client/src/config.ts
import React from "react";

// Tipe untuk State View Utama
export type ViewState = "start" | "capturing" | "customizing" | "result";

// Tipe untuk Gaya Bingkai (Preset atau Custom)
export type FrameStyle =
  | {
      type: "preset";
      name: string;
      bgClass: string;
      borderClass: string;
      textColor?: string;
    }
  | { type: "custom"; name: "Custom"; style: React.CSSProperties };

// Tipe untuk Pilihan Layout
export type LayoutType = "2x2" | "1x4";

// Interface untuk Opsi Layout
export interface LayoutOption {
  id: LayoutType;
  name: string;
}

// Konstanta Opsi Warna Preset
export const frameColorPresets: FrameStyle[] = [
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

// Konstanta Opsi Layout
export const layoutOptions: LayoutOption[] = [
  { id: "2x2", name: "Grid 2x2" },
  { id: "1x4", name: "Strip Vertikal" },
];
