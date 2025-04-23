// Isi file: Backend/server.js
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001; // Port untuk server backend

const staticPath = path.join(__dirname, "..", "frontend", "dist");

console.log(`[Server Info] Mencoba menyajikan file statis dari: ${staticPath}`);

// Middleware untuk menyajikan file statis dari frontend/dist
app.use(express.static(staticPath));

// Rute catch-all untuk SPA: kirim index.html jika request tidak cocok file statis
app.get("*", (req, res) => {
  const indexPath = path.join(
    __dirname,
    "..",
    "frontend",
    "dist",
    "index.html"
  );
  console.log(
    `[Server Info] Mengirim file: ${indexPath} untuk request ${req.path}`
  );

  // Kirim file index.html
  res.sendFile(indexPath, (err) => {
    // Penanganan error jika file tidak ditemukan atau masalah lain
    if (err) {
      console.error(`[Server Error] Gagal mengirim file index.html:`, err);
      if (!res.headersSent) {
        if (err.code === "ENOENT") {
          // Error spesifik jika index.html tidak ada
          res
            .status(404)
            .send(
              `File index.html tidak ditemukan di ${indexPath}. Pastikan Anda sudah menjalankan 'npm run build' di dalam folder 'frontend'.`
            );
        } else {
          // Error server umum lainnya
          res
            .status(500)
            .send("Terjadi kesalahan internal saat memuat aplikasi.");
        }
      }
    }
  });
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`  Server backend berjalan di http://localhost:${PORT}`);
  // Konfirmasi path yang dilayani
  console.log(`  Melayani file dari folder ../frontend/dist`);
  console.log(`=================================================`);
});
