import * as THREE from "three";

function turbineBlades() {
  const g = new THREE.Group();
  const metal = new THREE.MeshStandardMaterial({ color: 0x9aa3ac, metalness: 0.85, roughness: 0.3 });
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 0.5, 32), metal);
  g.add(hub);

  const blades = [];
  const bladeGeo = new THREE.BoxGeometry(0.08, 0.9, 0.28);
  bladeGeo.translate(0, 0.55, 0);
  for (let i = 0; i < 12; i++) {
    const blade = new THREE.Mesh(bladeGeo, metal);
    blade.rotation.y = (i / 12) * Math.PI * 2;
    blade.rotation.z = 0.35;
    blade.position.y = 0.1;
    g.add(blade);
    blades.push(blade);
  }

  return {
    object: g,
    update(t) {
      g.rotation.y = t * 1.5;
    },
  };
}

function dnaHelix() {
  const g = new THREE.Group();
  const matA = new THREE.MeshStandardMaterial({ color: 0x1d3e4e, roughness: 0.4 });
  const matB = new THREE.MeshStandardMaterial({ color: 0xc97a1a, roughness: 0.4 });
  const rungMat = new THREE.MeshStandardMaterial({ color: 0xd9d8d2, roughness: 0.6 });

  const sphereGeo = new THREE.SphereGeometry(0.07, 16, 16);
  const N = 24;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 4;
    const y = (i / N) * 2 - 1;
    const x1 = Math.cos(a) * 0.5, z1 = Math.sin(a) * 0.5;
    const x2 = Math.cos(a + Math.PI) * 0.5, z2 = Math.sin(a + Math.PI) * 0.5;

    const s1 = new THREE.Mesh(sphereGeo, matA);
    s1.position.set(x1, y, z1);
    const s2 = new THREE.Mesh(sphereGeo, matB);
    s2.position.set(x2, y, z2);
    g.add(s1, s2);

    if (i % 2 === 0) {
      const rungGeo = new THREE.CylinderGeometry(0.02, 0.02, 1, 8);
      const rung = new THREE.Mesh(rungGeo, rungMat);
      rung.position.set((x1 + x2) / 2, y, (z1 + z2) / 2);
      rung.lookAt(s2.position);
      rung.rotateX(Math.PI / 2);
      g.add(rung);
    }
  }
  g.position.y = 0.9;

  return {
    object: g,
    update(t) {
      g.rotation.y = t * 0.6;
    },
  };
}

export const FACTS = [
  {
    id: "turbine",
    titre: "Des lames sous contrainte extrême",
    description:
      "Un moteur à réaction repose sur des aubes de turbine usinées avec une précision micrométrique : elles doivent résister à des températures supérieures à 1000°C et à des forces centrifuges considérables sans se déformer.",
    builder: turbineBlades,
  },
  {
    id: "adn",
    titre: "La double hélice, une architecture optimale",
    description:
      "La structure en double hélice de l'ADN n'est pas qu'esthétique : elle permet un stockage extrêmement compact de l'information génétique tout en facilitant sa réplication précise lors de la division cellulaire.",
    builder: dnaHelix,
  },
];