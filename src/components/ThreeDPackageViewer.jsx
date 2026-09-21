import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RotateCw, Maximize2, ShieldCheck, AlertTriangle, Box } from "lucide-react";

export default function ThreeDPackageViewer({
  weight = 5.0,
  category = "Electronics",
  dimensions = "40 x 30 x 20",
  fragile = false,
  insurance = true,
  trackingId = "PREVIEW-3D",
  status = "Inspected & Verified",
}) {
  const mountRef = useRef(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const autoRotateRef = useRef(autoRotate);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  // Parse dimensions string "W x D x H"
  const parseDim = (str) => {
    if (!str) return [1.5, 1.2, 1.0];
    const parts = str.split("x").map((p) => parseFloat(p.trim()) || 10);
    // Scale for 3D viewport (e.g. 40cm -> 2 units)
    const scale = 0.05;
    const w = Math.max(0.8, Math.min(3.5, (parts[0] || 40) * scale));
    const h = Math.max(0.8, Math.min(3.5, (parts[2] || 20) * scale));
    const d = Math.max(0.8, Math.min(3.5, (parts[1] || 30) * scale));
    return [w, h, d];
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 260;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(4, 3, 5);

    let renderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); } catch { return; }
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 1.2);
    dirLight1.position.set(5, 10, 7);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xf59e0b, 0.5);
    dirLight2.position.set(-5, -2, -5);
    scene.add(dirLight2);

    // Ground Shadow Plane
    const shadowGeo = new THREE.PlaneGeometry(10, 10);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.25 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1.2;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // Create 3D Cargo Box Mesh based on dimensions & category
    const [dimW, dimH, dimD] = parseDim(dimensions);
    const boxGroup = new THREE.Group();

    // Box Body Material
    const boxGeo = new THREE.BoxGeometry(dimW, dimH, dimD);
    const isMedical = category === "Medical";
    const isDocs = category === "Documents";

    const boxColor = fragile
      ? 0xef4444 // Fragile Red
      : isMedical
      ? 0x0ea5e9 // Medical Sky Blue
      : isDocs
      ? 0x64748b // Document Slate Gray
      : 0xd97706; // Standard Craft Amber/Brown

    const boxMat = new THREE.MeshStandardMaterial({
      color: boxColor,
      roughness: 0.4,
      metalness: 0.2,
    });

    const boxMesh = new THREE.Mesh(boxGeo, boxMat);
    boxMesh.castShadow = true;
    boxMesh.receiveShadow = true;
    boxGroup.add(boxMesh);

    // Edge Outlines / Wireframe accent
    const edgesGeo = new THREE.EdgesGeometry(boxGeo);
    const edgesMat = new THREE.LineBasicMaterial({
      color: fragile ? 0xfecaca : 0x78350f,
      linewidth: 2,
    });
    const edgeLines = new THREE.LineSegments(edgesGeo, edgesMat);
    boxGroup.add(edgeLines);

    // Security Tape Strip across top
    const tapeGeo = new THREE.BoxGeometry(dimW * 1.01, dimH * 0.05, dimD * 0.2);
    const tapeMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.3,
      roughness: 0.2,
    });
    const tapeMesh = new THREE.Mesh(tapeGeo, tapeMat);
    tapeMesh.position.y = dimH / 2;
    boxGroup.add(tapeMesh);

    // Fragile Alert Badge in 3D if fragile
    if (fragile) {
      const alertGeo = new THREE.BoxGeometry(dimW * 0.4, dimH * 0.4, 0.02);
      const alertMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const alertMesh = new THREE.Mesh(alertGeo, alertMat);
      alertMesh.position.set(0, 0, dimD / 2 + 0.01);
      boxGroup.add(alertMesh);
    }

    scene.add(boxGroup);
    camera.lookAt(0, 0, 0);

    // Drag rotation controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      boxGroup.rotation.y += deltaX * 0.01;
      boxGroup.rotation.x += deltaY * 0.01;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // Touch support for mobile/tablets
    const onTouchStart = (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    const onTouchMove = (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePosition.x;
      const deltaY = e.touches[0].clientY - previousMousePosition.y;
      boxGroup.rotation.y += deltaX * 0.01;
      boxGroup.rotation.x += deltaY * 0.01;
      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchEnd = () => {
      isDragging = false;
    };

    domElement.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    // Render loop
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (autoRotateRef.current && !isDragging) {
        boxGroup.rotation.y += 0.008;
        boxGroup.rotation.x = Math.sin(Date.now() * 0.001) * 0.1;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      domElement.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      domElement.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      if (container && domElement) {
        container.removeChild(domElement);
      }
      boxGeo.dispose();
      boxMat.dispose();
      renderer.dispose();
    };
  }, [dimensions, category, fragile]);

  return (
    <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-4 shadow-2xl text-slate-100 flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Box className="h-5 w-5 text-sky-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
            3D Cargo Parcel Model
          </span>
        </div>
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
            autoRotate ? "bg-sky-500/20 text-sky-300 border border-sky-500/40" : "bg-slate-800 text-slate-400"
          }`}
          title="Toggle 3D Auto Spin"
        >
          <RotateCw className={`h-3.5 w-3.5 ${autoRotate ? "animate-spin" : ""}`} />
          {autoRotate ? "Auto Spin On" : "Manual Orbit"}
        </button>
      </div>

      {/* 3D WebGL Canvas Frame */}
      <div
        ref={mountRef}
        className="w-full h-56 cursor-grab active:cursor-grabbing rounded-xl bg-gradient-to-b from-slate-950 to-slate-900 overflow-hidden relative border border-slate-800"
      >
        <div className="absolute top-2 left-2 z-10 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-700 text-[10px] font-mono text-slate-300">
          ID: <span className="text-sky-400 font-bold">{trackingId}</span>
        </div>

        {fragile && (
          <div className="absolute top-2 right-2 z-10 bg-rose-500/20 border border-rose-500/50 text-rose-300 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-rose-400" /> FRAGILE
          </div>
        )}

        <div className="absolute bottom-2 left-2 z-10 text-[10px] text-slate-400 font-mono">
          Drag to rotate in 3D space
        </div>
      </div>

      {/* Specs Badge Bar */}
      <div className="w-full grid grid-cols-3 gap-2 mt-3 text-center">
        <div className="bg-slate-800/60 border border-slate-700/50 p-2 rounded-xl">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Weight</div>
          <div className="text-sm font-bold text-sky-300">{weight} kg</div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 p-2 rounded-xl">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Category</div>
          <div className="text-sm font-bold text-amber-300 truncate">{category}</div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 p-2 rounded-xl">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Dimensions</div>
          <div className="text-sm font-bold text-emerald-300">{dimensions} cm</div>
        </div>
      </div>
    </div>
  );
}
