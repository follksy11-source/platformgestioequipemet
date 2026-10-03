import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

/**
 * Moteur minimal : une scène, un modèle (procédural OU chargé depuis une URL .glb),
 * rotation automatique douce, orbite à la souris. Pas de hologramme, pas d'UI —
 * juste l'essentiel pour illustrer un fait ou un équipement.
 */
export function createFactEngine(canvas, { builder, glbUrl, onLoading, onError }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(2.6, 1.7, 3.2);

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 0.6, 0);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 1.5;
  controls.maxDistance = 8;

  const hemi = new THREE.HemisphereLight(0xf6f6f3, 0x1d3e4e, 0.9);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff, 1.8);
  key.position.set(3, 4, 2);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x8fb8c9, 0.8);
  rim.position.set(-3, 2, -2);
  scene.add(rim);

  const stage = new THREE.Group();
  scene.add(stage);

  let disposed = false;
  let updateFn = null;
  let autoRotate = true;

  function frameModel(root) {
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const scale = 1.8 / Math.max(size.x, size.y, size.z, 0.001);
    root.scale.setScalar(scale);
    box.setFromObject(root);
    const center = box.getCenter(new THREE.Vector3());
    root.position.x -= center.x;
    root.position.z -= center.z;
    root.position.y -= box.min.y;
    stage.add(root);
  }

  if (builder) {
    const built = builder();
    frameModel(built.object);
    updateFn = built.update || null;
    onLoading?.(false);
  } else if (glbUrl) {
    onLoading?.(true);
    new GLTFLoader().load(
      glbUrl,
      (gltf) => {
        if (disposed) return;
        frameModel(gltf.scene);
        onLoading?.(false);
      },
      undefined,
      (err) => {
        onLoading?.(false);
        onError?.(err);
      }
    );
  }

  const clock = new THREE.Clock();
  let raf = 0;
  function loop() {
    if (disposed) return;
    raf = requestAnimationFrame(loop);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    controls.update();
    if (autoRotate) stage.rotation.y += dt * 0.25;
    if (updateFn) updateFn(t, dt);
    renderer.render(scene, camera);
  }
  loop();

  const ro = new ResizeObserver(() => {
    const w = canvas.clientWidth,
      h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  });
  ro.observe(canvas.parentElement);

  return {
    setAutoRotate(v) {
      autoRotate = v;
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      stage.traverse((o) => {
        if (!o.isMesh) return;
        o.geometry?.dispose();
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((m) => m?.dispose?.());
      });
      renderer.dispose();
    },
  };
}