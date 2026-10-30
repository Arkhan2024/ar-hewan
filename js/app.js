// Logika utama: marker -> info, audio, dan interaksi (scale & rotate).

const $ = (id) => document.getElementById(id);
const MIN_SCALE = 0.4, MAX_SCALE = 3;

// Kondisi tiap model (ukuran & rotasi), jumlahnya mengikuti jumlah marker
const state = ANIMALS.map(() => ({ scale: 1, rotation: 0 }));
let current = 0;        // marker yang sedang terlihat
const modelGagal = new Set();   // indeks model yang gagal dimuat
let modelEls = [];      // elemen model 3D, urut sesuai ANIMALS

/* ---------- 1. Status kamera & error ---------- */
function showStatus(text, isError = false) {
  const el = $("status");
  el.textContent = text;
  el.className = isError ? "error" : "";
  el.hidden = false;
}

/* ---------- 2. Bangun scene AR dari data ---------- */
function buildScene(mindUrl) {
  const targets = ANIMALS.map((hewan, i) => `
    <a-entity mindar-image-target="targetIndex: ${i}">
      <a-entity class="model"></a-entity>
    </a-entity>`).join("");

  $("ar-container").innerHTML = `
    <a-scene mindar-image="imageTargetSrc: ${mindUrl}; maxTrack: 1; autoStart: true; uiLoading: no; uiScanning: no; uiError: yes;"
             embedded color-space="sRGB"
             renderer="colorManagement: true; physicallyCorrectLights: true"
             vr-mode-ui="enabled: false" device-orientation-permission-ui="enabled: false">
      <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>
      <a-entity light="type: ambient; intensity: 1.1"></a-entity>
      <a-entity light="type: directional; intensity: 0.8" position="1 2 2"></a-entity>
      ${targets}
    </a-scene>`;

  const scene = document.querySelector("a-scene");
  modelEls = [...document.querySelectorAll(".model")];

  // Laporan tahap per detik selama MindAR belum siap
  const mulai = Date.now();
  const timer = setInterval(() => laporTahap(scene, mulai), 1000);

  scene.addEventListener("arReady", () => {
    clearInterval(timer);
    muatModel();     // model 3D dimuat SETELAH kamera dan marker siap
  });
  scene.addEventListener("arError", () => {
    clearInterval(timer);
    showStatus("Gagal membuka kamera. Izinkan akses kamera lalu muat ulang halaman.", true);
  });

  document.querySelectorAll("[mindar-image-target]").forEach((target, i) => {
    target.addEventListener("targetFound", () => onMarkerFound(i));
    target.addEventListener("targetLost", onMarkerLost);
  });
}

/* ---------- 2b. Tahap loading MindAR (urutan sesuai kode MindAR) ---------- */
function laporTahap(scene, mulai) {
  const sistem = AFRAME.systems["mindar-image-system"];
  const video = document.querySelector("#ar-container video");
  let tahap;
  if (!scene.hasLoaded)            tahap = "1/5 menyiapkan scene";
  else if (!video)                 tahap = "2/5 menunggu MindAR memulai";
  else if (!video.srcObject)       tahap = "3/5 menunggu izin kamera (cek pop-up izin di browser)";
  else if (!video.videoWidth)      tahap = "3/5 kamera terbuka, menunggu gambar pertama";
  else if (!sistem.controller)     tahap = "4/5 menyiapkan pelacak";
  else                             tahap = "5/5 memuat data marker dan menyiapkan pelacak (bisa lama di ponsel)";
  const detik = Math.round((Date.now() - mulai) / 1000);
  showStatus(`Memulai MindAR… ${detik} dtk · tahap ${tahap}`);
}

/* ---------- 2c. Muat model 3D setelah AR siap ---------- */
function muatModel() {
  let selesai = 0;
  showStatus(`Memuat model 3D… 0/${ANIMALS.length}`);
  modelEls.forEach((el, i) => {
    el.innerHTML = `<a-gltf-model src="${ASSET_FOLDER}/${ANIMALS[i].id}.glb" visible="false"
                                  fit-model="size: 0.9" play-animation></a-gltf-model>`;
    const gltf = el.firstElementChild;
    gltf.addEventListener("model-loaded", () => {
      selesai++;
      showStatus(selesai < ANIMALS.length
        ? `Memuat model 3D… ${selesai}/${ANIMALS.length}`
        : "Arahkan kamera ke marker");
    });
    gltf.addEventListener("model-error", () => {
      modelGagal.add(i);
      showStatus(`Model ${ANIMALS[i].id}.glb gagal dimuat (cek folder assets).`, true);
    });
  });
}

/* ---------- 3. Marker ditemukan / hilang ---------- */
function onMarkerFound(i) {
  hentikanSuara();
  current = i;
  $("animal-name").textContent = ANIMALS[i].nama;
  $("animal-info").textContent = ANIMALS[i].info + (modelGagal.has(i) ? " (Model 3D gagal dimuat.)" : "");
  $("panel").hidden = false;
  $("status").hidden = true;
}
function onMarkerLost() {
  hentikanSuara();
  $("panel").hidden = true;
  showStatus("Arahkan kamera ke marker");
}

/* ---------- 4. Audio: suara hewan (assets/<id>.mp3) ---------- */
let suara = null;

function hentikanSuara() {
  if (suara) { suara.pause(); suara = null; }
  $("btn-audio").textContent = "🔊 Dengarkan";
}
function putarSuara() {
  if (suara) { hentikanSuara(); return; }       // tekan lagi = berhenti
  const hewan = ANIMALS[current];
  suara = new Audio(`${ASSET_FOLDER}/${hewan.id}.mp3`);
  suara.onended = hentikanSuara;
  suara.play()
    .then(() => { $("btn-audio").textContent = "⏹ Berhenti"; })
    .catch(() => { suara = null; showStatus(`Suara ${hewan.id}.mp3 tidak bisa diputar (cek folder assets).`, true); });
}

/* ---------- 5. Interaksi: scale & rotate ---------- */
function applyTransform() {
  const { scale, rotation } = state[current];
  modelEls[current].setAttribute("scale", `${scale} ${scale} ${scale}`);
  modelEls[current].setAttribute("rotation", `0 ${rotation} 0`);
}
function changeScale(factor) {
  const s = state[current];
  s.scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, s.scale * factor));
  applyTransform();
}
function changeRotation(degrees) { state[current].rotation += degrees; applyTransform(); }
function resetModel() { state[current] = { scale: 1, rotation: 0 }; applyTransform(); }

$("btn-audio").onclick   = putarSuara;
$("btn-bigger").onclick  = () => changeScale(1.15);
$("btn-smaller").onclick = () => changeScale(1 / 1.15);
$("btn-left").onclick    = () => changeRotation(-30);
$("btn-right").onclick   = () => changeRotation(30);
$("btn-reset").onclick   = resetModel;

/* ---------- 6. Gestur sentuh: geser = putar, cubit = ukuran ---------- */
let lastX = 0, lastDist = 0;
const jarak = (e) => Math.hypot(
  e.touches[0].clientX - e.touches[1].clientX,
  e.touches[0].clientY - e.touches[1].clientY);

document.addEventListener("touchstart", (e) => {
  if (e.target.closest("button")) return;
  if (e.touches.length === 1) lastX = e.touches[0].clientX;
  if (e.touches.length === 2) lastDist = jarak(e);
}, { passive: true });

document.addEventListener("touchmove", (e) => {
  if (e.target.closest("button")) return;
  if (e.touches.length === 1) {
    const x = e.touches[0].clientX;
    changeRotation((x - lastX) * 0.6);
    lastX = x;
  } else if (e.touches.length === 2) {
    const d = jarak(e);
    changeScale(d / lastDist);
    lastDist = d;
  }
}, { passive: true });

/* ---------- 7. Mulai otomatis saat halaman dibuka ---------- */
function cekLingkungan() {
  if (!AFRAME.systems["mindar-image-system"])
    throw new Error("Library A-Frame/MindAR gagal dimuat. Periksa koneksi internet lalu muat ulang halaman.");
  if (!window.isSecureContext || !navigator.mediaDevices)
    throw new Error("Kamera butuh HTTPS atau localhost. Buka lewat server/hosting HTTPS dengan Chrome atau Safari, bukan browser di dalam WhatsApp/Instagram.");
}

async function start() {
  try {
    cekLingkungan();

    showStatus("Memuat file marker…");
    const { url, jumlahPerFile } = await mergeMindFiles(ANIMALS.map((a) => `${ASSET_FOLDER}/${a.id}.mind`));
    jumlahPerFile.forEach((jumlah, i) => {
      if (jumlah !== 1)
        throw new Error(`${ANIMALS[i].id}.mind harus berisi 1 marker (isinya ${jumlah}).`);
    });

    showStatus("Memulai MindAR… izinkan akses kamera jika diminta.");
    buildScene(url);
  } catch (err) {
    showStatus(err.message, true);
  }
}
start();

// Tampilkan error JavaScript di layar supaya tidak diam-diam gagal
window.addEventListener("error", (e) => showStatus(`Error: ${e.message}`, true));
window.addEventListener("unhandledrejection", (e) => showStatus(`Error: ${e.reason?.message || e.reason}`, true));
