// ============================================================
//  DAFTAR MARKER  (1 baris = 1 marker)
//
//  Semua file aset ada di folder assets/ dengan nama sesuai `id`:
//     assets/<id>.mind   -> marker (berisi 1 marker)
//     assets/<id>.glb    -> model 3D
//     assets/<id>.mp3    -> suara hewan (tombol "Dengarkan")
//
//  Cara menambah marker:
//   1. Masukkan <id>.mind, <id>.glb, dan <id>.mp3 ke folder assets/
//   2. Tambahkan satu baris di bawah, contoh:
//      { id: "sapi", nama: "Sapi", info: "Sapi adalah ..." },
//
//  Jumlah marker otomatis mengikuti jumlah baris di sini.
// ============================================================
const ASSET_FOLDER = "assets";

// Jika model 3D tampil terbalik/miring, atur `rotasi` (derajat sumbu X Y Z), contoh:
//   rotasi: "180 0 0"  -> dibalik atas-bawah (depan-belakang)
//   rotasi: "0 0 180"  -> diputar 180 derajat searah layar
//   rotasi: "-90 0 0"  -> berdiri dari posisi rebah ke depan (kalau model Z-up)
// Urutan di daftar = nomor marker (index). Marker ke-0 menampilkan hewan pertama, dst.
//   index 0 -> Kucing   index 1 -> Burung   index 2 -> Anjing
const ANIMALS = [
  // index 0
  { id: "kucing", nama: "Kucing", rotasi: "180 0 0",
    info: "Kucing adalah hewan karnivora yang gesit. Ia tidur 12 sampai 16 jam sehari dan bisa mendengar suara ultrasonik." },
  // index 1
  { id: "burung", nama: "Burung",
    info: "Burung berbulu dan bertelur. Sebagian besar bisa terbang berkat sayap dan tulang yang ringan." },
  // index 2
  { id: "anjing", nama: "Anjing",
    info: "Anjing adalah sahabat manusia yang setia. Penciumannya jauh lebih tajam dibanding manusia." },
];

// Uji satu marker saja: buka index.html?only=kucing
const ONLY = new URLSearchParams(location.search).get("only");
if (ONLY) {
  const dipilih = ANIMALS.filter((a) => a.id === ONLY);
  ANIMALS.length = 0;
  ANIMALS.push(...dipilih);
}
