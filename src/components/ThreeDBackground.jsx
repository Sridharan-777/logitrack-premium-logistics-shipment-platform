import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeDBackground() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Particle Constellation
    const particleCount = 180;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorOptions = [
      new THREE.Color("#38BDF8"), // Sky Blue
      new THREE.Color("#2563EB"), // Royal Blue
      new THREE.Color("#10B981"), // Emerald
      new THREE.Color("#F59E0B"), // Amber
    ];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60;

      const chosenColor = colorOptions[Math.floor(Math.random() * colorOptions.length)];
      colors[i * 3] = chosenColor.r;
      colors[i * 3 + 1] = chosenColor.g;
      colors[i * 3 + 2] = chosenColor.b;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.6,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Floating 3D Logistics Wireframe Cubes
    const cubesGroup = new THREE.Group();
    const cubeCount = 12;
    const cubeGeom = new THREE.BoxGeometry(2, 2, 2);

    for (let i = 0; i < cubeCount; i++) {
      const edges = new THREE.EdgesGeometry(cubeGeom);
      const lineMat = new THREE.LineBasicMaterial({
        color: i % 2 === 0 ? "#38BDF8" : "#2563EB",
        transparent: true,
        opacity: 0.25 + Math.random() * 0.35,
      });
      const wireframeCube = new THREE.LineSegments(edges, lineMat);

      wireframeCube.position.set(
        (Math.random() - 0.5) * 70,
        (Math.random() - 0.5) * 70,
        (Math.random() - 0.5) * 40
      );
      wireframeCube.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        0
      );
      const scale = 0.5 + Math.random() * 1.5;
      wireframeCube.scale.set(scale, scale, scale);

      wireframeCube.userData = {
        rotSpeedX: (Math.random() - 0.5) * 0.01,
        rotSpeedY: (Math.random() - 0.5) * 0.01,
        floatSpeed: 0.005 + Math.random() * 0.01,
        initialY: wireframeCube.position.y,
      };

      cubesGroup.add(wireframeCube);
    }
    scene.add(cubesGroup);

    // Dynamic Mouse Tracking
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e) => {
      mouseX = (e.clientX - window.innerWidth / 2) / 100;
      mouseY = (e.clientY - window.innerHeight / 2) / 100;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // Animation Loop
    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera motion
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      camera.position.x = targetX;
      camera.position.y = -targetY;
      camera.lookAt(scene.position);

      // Rotate particle cloud
      particles.rotation.y = elapsedTime * 0.03;
      particles.rotation.x = elapsedTime * 0.015;

      // Animate floating wireframe cubes
      cubesGroup.children.forEach((cube) => {
        cube.rotation.x += cube.userData.rotSpeedX;
        cube.rotation.y += cube.userData.rotSpeedY;
        cube.position.y =
          cube.userData.initialY + Math.sin(elapsedTime * 1.5 + cube.position.x) * 1.5;
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      cubeGeom.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-80"
    />
  );
}
