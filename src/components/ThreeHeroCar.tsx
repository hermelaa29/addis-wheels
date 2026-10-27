"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Sparkles, Compass } from "lucide-react";

interface ThreeHeroCarProps {
  imageUrl?: string;
  carName?: string;
  carSpec?: string;
  hubLocation?: string;
}

export function ThreeHeroCar({
  imageUrl = "/hero-car-cutout.png",
  carName = "Suzuki Swift DualJet",
  carSpec = "Pearl White • 1.2L DualJet • 23 km/L • 5-Speed",
  hubLocation = "Bole, Piassa & Kazanchis Hubs",
}: ThreeHeroCarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current || !canvasRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const width = container.clientWidth || 550;
    const height = container.clientHeight || 420;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.8);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 2. Lighting (Atmospheric Luxury Showroom)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x10b981, 2.0); // Emerald rim light
    keyLight.position.set(4, 3, 3);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.2); // Ice blue fill
    fillLight.position.set(-4, -2, 2);
    scene.add(fillLight);

    // Interactive Point Light that tracks cursor
    const cursorLight = new THREE.PointLight(0xffffff, 2.5, 10);
    cursorLight.position.set(0, 1, 3);
    scene.add(cursorLight);

    // 3. Ambient Particle Sparkles / Showroom Atmosphere
    const particleCount = 45;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 8;
      particlePositions[i + 1] = (Math.random() - 0.5) * 5;
      particlePositions[i + 2] = (Math.random() - 0.5) * 4;
    }
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0x34d399,
      size: 0.045,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // 4. Car Mesh with High-Definition Texture
    const textureLoader = new THREE.TextureLoader();
    let carMesh: THREE.Mesh | null = null;
    let shadowMesh: THREE.Mesh | null = null;

    // Load car texture
    textureLoader.load(
      imageUrl,
      (texture) => {
        texture.minFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;

        // Calculate aspect ratio dynamically from loaded image
        const imgWidth = texture.image?.width || 600;
        const imgHeight = texture.image?.height || 340;
        const aspect = imgWidth / imgHeight;

        // Plane geometry matching automotive cutout proportions
        const planeWidth = 4.2;
        const planeHeight = planeWidth / aspect;
        const planeGeo = new THREE.PlaneGeometry(planeWidth, planeHeight, 32, 32);

        // Subtle curved displacement for authentic 3D body volume
        const pos = planeGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i);
          const y = pos.getY(i);
          // Gently curve edges inward so it feels like a physical 3D car body
          pos.setZ(i, -Math.pow(x / 2.2, 2) * 0.16 + -Math.pow(y / 1.5, 2) * 0.08);
        }
        planeGeo.computeVertexNormals();

        // Standard Material with alphaTest to discard transparent background completely
        const planeMat = new THREE.MeshStandardMaterial({
          map: texture,
          transparent: true,
          alphaTest: 0.05, // Discards transparent background pixels completely
          roughness: 0.18,
          metalness: 0.55,
          side: THREE.DoubleSide,
          depthWrite: true,
        });

        carMesh = new THREE.Mesh(planeGeo, planeMat);
        carMesh.position.set(0, 0.1, 0);
        scene.add(carMesh);

        // Ground Shadow Ellipse aligned directly under the car's wheels
        const shadowGeo = new THREE.PlaneGeometry(planeWidth * 0.95, 1.1);
        const shadowCanvas = document.createElement("canvas");
        shadowCanvas.width = 256;
        shadowCanvas.height = 128;
        const sctx = shadowCanvas.getContext("2d");
        if (sctx) {
          const grad = sctx.createRadialGradient(128, 64, 10, 128, 64, 110);
          grad.addColorStop(0, "rgba(0,0,0,0.85)");
          grad.addColorStop(0.4, "rgba(16,185,129,0.22)");
          grad.addColorStop(1, "rgba(0,0,0,0)");
          sctx.fillStyle = grad;
          sctx.fillRect(0, 0, 256, 128);
        }
        const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
        const shadowMat = new THREE.MeshBasicMaterial({
          map: shadowTexture,
          transparent: true,
          opacity: 0.85,
        });
        shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
        shadowMesh.rotation.x = -Math.PI / 2.2;
        shadowMesh.position.set(0, -planeHeight / 2 - 0.05, 0.2);
        scene.add(shadowMesh);

        setIsLoaded(true);
      },
      undefined,
      (err) => {
        console.error("Failed to load 3JS car texture:", err);
      }
    );

    // 5. Mouse / Cursor 3D Tracking & Scroll Effect
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;
    let targetPositionX = 0;
    let targetPositionY = 0;

    let currentRotationX = 0;
    let currentRotationY = 0;
    let currentPositionX = 0;
    let currentPositionY = 0;

    let scrollProgress = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      // Normalized coordinates (-1 to 1)
      mouseX = (x - 0.5) * 2;
      mouseY = (y - 0.5) * 2;

      // 3D Perspective Angles
      targetRotationY = mouseX * 0.32; // Horizontal yaw tilt
      targetRotationX = -mouseY * 0.18; // Vertical pitch tilt
      targetPositionX = mouseX * 0.35; // Gentle float
      targetPositionY = -mouseY * 0.22;

      // Move point light
      cursorLight.position.x = mouseX * 2.5;
      cursorLight.position.y = -mouseY * 1.8 + 0.8;
    };

    const handleMouseLeave = () => {
      targetRotationX = 0;
      targetRotationY = 0;
      targetPositionX = 0;
      targetPositionY = 0;
    };

    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Scroll effect: Normalized between 0 and 1 for first 600px of page scroll
      scrollProgress = Math.min(scrollY / 600, 1);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    container.addEventListener("mouseleave", handleMouseLeave);

    // 6. Resize Observer
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 550;
      const h = container.clientHeight || 420;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // 7. Animation Loop with Smooth Interpolation
    let animationFrameId: number;
    const startTime = performance.now();

    const animate = (timestamp: number) => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = ((timestamp || performance.now()) - startTime) * 0.001;

      // Smooth damping (lerp) for cursor response
      currentRotationX += (targetRotationX - currentRotationX) * 0.08;
      currentRotationY += (targetRotationY - currentRotationY) * 0.08;
      currentPositionX += (targetPositionX - currentPositionX) * 0.08;
      currentPositionY += (targetPositionY - currentPositionY) * 0.08;

      // Subtle resting idle float
      const idleFloat = Math.sin(elapsedTime * 1.5) * 0.04;
      const idleRoll = Math.cos(elapsedTime * 1.2) * 0.015;

      if (carMesh) {
        // Apply cursor 3D movement + 3JS scroll driving effect
        // On scroll down: car drives forward (translates along Z), shifts slightly and banks
        const scrollDriveZ = scrollProgress * 1.2;
        const scrollDriveX = scrollProgress * 0.6;
        const scrollPitch = scrollProgress * 0.15;

        carMesh.rotation.y = currentRotationY + (scrollProgress * 0.25);
        carMesh.rotation.x = currentRotationX + scrollPitch;
        carMesh.rotation.z = idleRoll + (-currentRotationY * 0.2);

        carMesh.position.x = currentPositionX + scrollDriveX;
        carMesh.position.y = 0.15 + currentPositionY + idleFloat - (scrollProgress * 0.15);
        carMesh.position.z = scrollDriveZ;

        // Synchronize shadow with car position
        if (shadowMesh) {
          shadowMesh.position.x = carMesh.position.x;
          shadowMesh.position.z = 0.2 + (scrollDriveZ * 0.8);
          shadowMesh.rotation.z = carMesh.rotation.z * 0.5;
        }
      }

      // Rotate particles slowly in 3D
      particleSystem.rotation.y = elapsedTime * 0.05 + (currentRotationY * 0.2);
      particleSystem.rotation.x = Math.sin(elapsedTime * 0.08) * 0.1;

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    // 8. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mouseleave", handleMouseLeave);

      particleGeometry.dispose();
      particleMaterial.dispose();
      if (carMesh) {
        carMesh.geometry.dispose();
        if (Array.isArray(carMesh.material)) {
          carMesh.material.forEach((m) => m.dispose());
        } else {
          carMesh.material.dispose();
        }
      }
      renderer.dispose();
    };
  }, [imageUrl]);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[4/3] sm:aspect-[16/11] max-w-lg lg:max-w-none flex items-center justify-center select-none"
    >
      {/* Background Radial Ambient Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 via-teal-500/10 to-transparent rounded-full blur-[80px] pointer-events-none -z-10" />

      {/* Showroom 3D Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing relative z-10 transition-opacity duration-500"
        style={{ opacity: isLoaded ? 1 : 0.4 }}
      />

      {/* Floating Precision Spec Glass Pill */}
      <div className="absolute bottom-2 inset-x-3 sm:inset-x-6 z-20 flex items-center justify-between p-3 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-white/80 dark:border-white/10 backdrop-blur-xl shadow-xl shadow-black/10 dark:shadow-black/40">
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-black tracking-wide text-slate-950 dark:text-white uppercase">
              {carName}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            {carSpec}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
          <Sparkles className="w-3 h-3" />
          <span>Interactive 3D Preview</span>
        </div>
      </div>

      {/* Subtle Hint Pill */}
      <div className="absolute top-2 right-3 z-20 pointer-events-none flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/40 dark:bg-white/10 text-white text-[9px] font-semibold tracking-wider uppercase backdrop-blur-md border border-white/15">
        <Compass className="w-3 h-3 text-emerald-400 animate-spin" style={{ animationDuration: "8s" }} />
        <span>Move Cursor to Rotate</span>
      </div>
    </div>
  );
}
