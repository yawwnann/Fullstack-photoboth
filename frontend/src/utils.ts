// client/src/utils.ts

// Fungsi delay sederhana
export const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Fungsi untuk menentukan warna kontras (border & teks) berdasarkan background hex
export const getContrastStyle = (
  hexColor: string
): { borderColor: string; color: string } => {
  try {
    const rgb = parseInt(hexColor.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    // Formula kecerahan perseptual
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    // Jika background terang (luma > 128), gunakan warna gelap
    if (luma > 128) {
      return { borderColor: "#374151", color: "#4b5563" }; // gray-700 border, gray-600 text
    } else {
      // Jika background gelap, gunakan warna terang
      return { borderColor: "#d1d5db", color: "#9ca3af" }; // gray-300 border, gray-400 text
    }
  } catch (e) {
    console.error("Gagal memproses warna hex untuk kontras:", hexColor, e);
    // Fallback jika error
    return { borderColor: "#6b7280", color: "#6b7280" }; // gray-500
  }
};
