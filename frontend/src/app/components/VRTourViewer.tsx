import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const videoUrl = '/YTDown.com_YouTube_Telenor-360-DVC_Media_fZMWZNUZDzE_001_1080s.mp4';

export function VRTourViewer({ className = '' }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 0.1);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.domElement.className = 'h-full w-full';
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1);

    const video = document.createElement('video');
    video.src = videoUrl;
    video.crossOrigin = 'anonymous';
    video.playsInline = true;
    video.loop = true;
    video.muted = true;
    video.preload = 'auto';

    const texture = new THREE.VideoTexture(video);
    texture.colorSpace = THREE.SRGBColorSpace;

    const material = new THREE.MeshBasicMaterial({ map: texture });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    const targetRotation = { x: 0, y: 0 };
    const currentRotation = { x: 0, y: 0 };
    let isDragging = false;
    let previousX = 0;
    let previousY = 0;

    const handlePointerDown = (event: PointerEvent) => {
      isDragging = true;
      previousX = event.clientX;
      previousY = event.clientY;
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = event.clientX - previousX;
      const deltaY = event.clientY - previousY;
      previousX = event.clientX;
      previousY = event.clientY;

      targetRotation.y += deltaX * 0.005;
      targetRotation.x += deltaY * 0.005;
      targetRotation.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, targetRotation.x));
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('resize', handleResize);

    const animate = () => {
      currentRotation.x += (targetRotation.x - currentRotation.x) * 0.1;
      currentRotation.y += (targetRotation.y - currentRotation.y) * 0.1;
      sphere.rotation.y = currentRotation.y;
      sphere.rotation.x = currentRotation.x;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    const frame = requestAnimationFrame(animate);

    video.addEventListener('loadeddata', () => {
      void video.play().catch(() => undefined);
    });

    video.addEventListener('canplay', () => {
      void video.play().catch(() => undefined);
    });

    video.load();

    return () => {
      cancelAnimationFrame(frame);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      texture.dispose();
      video.pause();
      video.src = '';
      video.remove();
      container.innerHTML = '';
    };
  }, []);

  return <div ref={containerRef} className={`relative overflow-hidden rounded-none border border-black/10 bg-black ${className}`.trim()} />;
}
