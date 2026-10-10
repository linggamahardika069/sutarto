# Portofolio Minisite: Sutarto Nugroho

Situs statis tanpa build step: `index.html`, `style.css`, `app.js`, dan data di `projects.json`.

## Struktur

```
index.html          halaman utama
style.css           tampilan (otomatis terang/gelap)
app.js              memuat projects.json dan menggambar kartu
projects.json       DAFTAR MINISITE (satu-satunya file yang sering diedit)
add-minisite.mjs    skrip penambah minisite baru
assets/sutarto.jpg  foto profil
assets/shots/       (opsional) screenshot manual
```

## Menambah minisite baru

### Jalur cepat (satu perintah)

```bash
node add-minisite.mjs https://nama-situs.pages.dev
```

Judul dan deskripsi diambil otomatis dari situsnya. Mau mengisi sendiri:

```bash
node add-minisite.mjs https://nama-situs.pages.dev \
  --name "Nama Situs" \
  --desc "Deskripsi singkat dengan gaya Anda." \
  --tags "Niche,Negara,EN,USD"
```

Lalu:

```bash
git add . && git commit -m "tambah minisite" && git push
```

### Jalur santai (lewat browser / HP)

1. Buka repo di GitHub, klik `projects.json`, klik ikon pensil.
2. Salin satu blok `{ ... }`, tempel di bawahnya (jangan lupa koma antar blok).
3. Ganti `name`, `url`, `desc`, `tags`, `added`.
4. Klik **Commit changes**. Cloudflare Pages menayangkan ulang otomatis.

### Format satu entri

```json
{
  "name": "Nama Situs",
  "url": "https://nama-situs.pages.dev/",
  "desc": "Deskripsi singkat.",
  "tags": ["Niche", "Negara", "EN", "USD"],
  "added": "2026-10-10"
}
```

Catatan: **tag kedua = negara**, dipakai untuk tombol filter di atas daftar.
Urutan kartu: yang `added`-nya paling baru tampil paling atas.

## Screenshot

Screenshot dibuat otomatis dari URL (layanan mshots WordPress, cadangan thum.io). Pertama kali
sebuah situs diminta, gambarnya bisa butuh beberapa detik, dan sesekali kosong; muat ulang saja.

Mau gambar permanen dan lebih cepat? Simpan screenshot ke `assets/shots/nama.jpg` lalu tambahkan
`"screenshot": "assets/shots/nama.jpg"` di entri terkait.

## Deploy (GitHub -> Cloudflare Pages)

1. Buat repo baru di GitHub, unggah semua isi folder ini.
2. Cloudflare Dashboard -> Workers & Pages -> Create -> Pages -> Connect to Git -> pilih repo.
3. Build command: kosongkan. Output directory: `/` (root). Simpan.
4. Setiap `git push` akan menayangkan ulang otomatis.

## Menjalankan lokal

`projects.json` dimuat lewat `fetch`, jadi jangan buka `index.html` langsung dari file:

```bash
python3 -m http.server 8000
# buka http://localhost:8000
```
