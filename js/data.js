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

const ANIMALS = [
  { id: "kucing", nama: "Kucing",
    info: "Kucing adalah hewan karnivora yang gesit. Ia tidur 12 sampai 16 jam sehari dan bisa mendengar suara ultrasonik." },
  { id: "burung", nama: "Burung",
    info: "Burung berbulu dan bertelur. Sebagian besar bisa terbang berkat sayap dan tulang yang ringan." },
  { id: "anjing", nama: "Anjing",
    info: "Anjing adalah sahabat manusia yang setia. Penciumannya jauh lebih tajam dibanding manusia." },
  { id: "monyet", nama: "Monyet",
    info: "Monyet adalah primata cerdas yang hidup berkelompok. Ia pandai memanjat dan memakan buah serta dedaunan." },
];

// Uji satu marker saja: buka index.html?only=monyet
const ONLY = new URLSearchParams(location.search).get("only");
if (ONLY) {
  const dipilih = ANIMALS.filter((a) => a.id === ONLY);
  ANIMALS.length = 0;
  ANIMALS.push(...dipilih);
}
