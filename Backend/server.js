// Backend/server.js
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001; // Port untuk server backend ini

// __dirname di Node.js (CommonJS) merujuk ke direktori tempat file server.js berada (yaitu folder 'Backend')
// Kita perlu naik satu level ('..') untuk mencapai root proyek, lalu masuk ke 'client/dist'
const staticPath = path.join(__dirname, "..", "client", "dist");

console.log(`[Server Info] Mencoba menyajikan file statis dari: ${staticPath}`);

// Middleware untuk menyajikan file statis
app.use(express.static(staticPath));

// Rute 'catch-all' (*) untuk Single Page Application (SPA) React
// Semua permintaan yang tidak cocok dengan file statis akan diarahkan ke index.html
app.get("*", (req, res) => {
  const indexPath = path.join(__dirname, "..", "client", "dist", "index.html");
  console.log(
    `[Server Info] Mengirim file: ${indexPath} untuk request ${req.path}`
  );
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error(`[Server Error] Gagal mengirim file index.html:`, err);
      // Kirim respons error hanya jika header belum terkirim untuk menghindari error lanjutan
      if (!res.headersSent) {
        // Cek apakah error karena file tidak ada
        if (err.code === "ENOENT") {
          res
            .status(404)
            .send(
              "Halaman utama aplikasi tidak ditemukan. Pastikan Anda sudah menjalankan `npm run build` di folder `client`."
            );
        } else {
          res
            .status(500)
            .send("Terjadi kesalahan internal saat memuat aplikasi.");
        }
      }
    }
  });
});

app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`  Server backend berjalan di http://localhost:${PORT}`);
  console.log(`  Melayani file dari folder ../client/dist`);
  console.log(`=================================================`);
});
