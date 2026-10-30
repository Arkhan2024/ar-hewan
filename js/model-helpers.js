// Komponen A-Frame kecil untuk model .glb

// 1. fit-model: ukuran model .glb berbeda-beda, jadi disamakan otomatis
//    (sisi terpanjang = `size`, lebar marker = 1), dipusatkan, dan berdiri di atas marker.
AFRAME.registerComponent("fit-model", {
  schema: { size: { default: 0.9 } },
  init() {
    this.el.addEventListener("model-loaded", () => {
      const THREE = AFRAME.THREE;
      const obj = this.el.getObject3D("mesh");
      obj.position.set(0, 0, 0);
      obj.scale.set(1, 1, 1);

      // Hitung kotak pembatas dalam koordinat model sendiri. Matriks induk (marker) sengaja
      // tidak dipakai: saat marker belum terlihat, MindAR mengisinya dengan matriks nol.
      const box = new THREE.Box3();
      obj.traverse((m) => {
        if (!m.isMesh) return;
        const keObj = new THREE.Matrix4();              // posisi mesh relatif terhadap obj
        for (let n = m; n && n !== obj; n = n.parent) { n.updateMatrix(); keObj.premultiply(n.matrix); }
        m.geometry.computeBoundingBox();
        box.union(m.geometry.boundingBox.clone().applyMatrix4(keObj));
      });

      const ukuran = box.getSize(new THREE.Vector3());
      const tengah = box.getCenter(new THREE.Vector3());
      const k = this.data.size / Math.max(ukuran.x, ukuran.y, ukuran.z) || 1;

      obj.scale.setScalar(k);
      obj.position.set(-tengah.x * k, -tengah.y * k, -tengah.z * k);   // pusat model = pusat marker
      this.el.setAttribute("visible", true);   // tampil setelah ukuran pas
    });
  },
});

// 2. play-animation: jalankan animasi bawaan file .glb (jika ada)
AFRAME.registerComponent("play-animation", {
  init() {
    this.el.addEventListener("model-loaded", () => {
      const obj = this.el.getObject3D("mesh");
      const klip = obj.animations || [];
      if (!klip.length) return;
      this.mixer = new AFRAME.THREE.AnimationMixer(obj);
      klip.forEach((k) => this.mixer.clipAction(k).play());
    });
  },
  tick(waktu, selisih) {
    if (this.mixer) this.mixer.update(selisih / 1000);
  },
});
