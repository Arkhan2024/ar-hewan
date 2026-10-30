// MindAR hanya menerima SATU file .mind per sesi.
// Fungsi ini menggabungkan banyak file .mind (masing-masing berisi marker)
// menjadi satu di browser, jadi menambah marker cukup menambah file.
//
// Format .mind (msgpack): {v: 2, dataList: [target1, target2, ...]}
//   13 byte pertama = header sampai kunci "dataList", lalu header array, lalu isi target.

const MIND_HEADER_BYTES = 13;

// Baca jumlah target dan isi targetnya dari satu file .mind
function readMind(bytes) {
  const tipe = bytes[MIND_HEADER_BYTES];
  if (tipe >= 0x90 && tipe <= 0x9f)   // array kecil (maks 15 target)
    return { jumlah: tipe & 15, isi: bytes.subarray(MIND_HEADER_BYTES + 1) };
  if (tipe === 0xdc)                  // array besar (16 target atau lebih)
    return { jumlah: (bytes[14] << 8) | bytes[15], isi: bytes.subarray(MIND_HEADER_BYTES + 3) };
  throw new Error("Format file .mind tidak dikenali");
}

// Header array msgpack untuk sejumlah target
function headerArray(jumlah) {
  return jumlah <= 15 ? [0x90 + jumlah] : [0xdc, jumlah >> 8, jumlah & 255];
}

// Gabungkan semua file; hasil: alamat blob + jumlah target per file
async function mergeMindFiles(daftarUrl) {
  const bagian = [];
  let header = null;

  for (const url of daftarUrl) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`File marker tidak ditemukan: ${url}`);
    const bytes = new Uint8Array(await res.arrayBuffer());
    header = header || bytes.slice(0, MIND_HEADER_BYTES);
    bagian.push(readMind(bytes));
  }

  const total = bagian.reduce((n, b) => n + b.jumlah, 0);
  const blob = new Blob(
    [header, Uint8Array.from(headerArray(total)), ...bagian.map((b) => b.isi)],
    { type: "application/octet-stream" });

  return { url: URL.createObjectURL(blob), jumlahPerFile: bagian.map((b) => b.jumlah) };
}
