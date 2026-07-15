import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import { TopPageNav } from '../components/TopPageNav';
import { HeroVideo } from './HeroVideo';

const videoUrl = '/YTDown.com_YouTube_Telenor-360-DVC_Media_fZMWZNUZDzE_001_1080s.mp4';

export function VRTourPage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

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
    videoRef.current = video;

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

  return (
    <div className="min-h-screen bg-white text-black">
      <section className="relative overflow-hidden bg-black text-white">
        <div className="absolute inset-0">
          <HeroVideo src="/hero-products.mp4" />
        </div>

        <div className="relative mx-auto flex min-h-[360px] max-w-7xl flex-col justify-center px-6 py-16 text-center sm:min-h-[420px] md:px-10 md:py-20 lg:px-12 lg:py-24">
          <div className="mx-auto max-w-3xl">
            <p className="mb-4 text-[11px] uppercase tracking-[0.35em] text-white/70">
              360 VR Tour
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Step inside the experience.
            </h1>
            <p className="mt-4 text-base leading-relaxed text-white/80 sm:text-lg">
              This version uses a real 360° viewer so the downloaded tour can be explored by dragging around the scene, just like a VR experience.
            </p>
          </div>
        </div>
      </section>

      <section className="relative w-full overflow-visible">
        <TopPageNav />
        <div className="w-full px-4 py-8 sm:px-6 md:px-8 lg:px-12 lg:py-12 bg-white">
          <div className="w-full rounded-none border border-black/10 bg-white p-4 shadow-sm sm:p-6 md:p-10">
            <div className="relative w-full overflow-visible rounded-none border border-black/10 bg-black">
              <div ref={containerRef} className="w-full h-[500px] sm:h-[600px] md:h-[700px] lg:h-[800px]" />
            </div>

            <div className="mt-8 w-full grid gap-6 lg:grid-cols-2">
              <div className="rounded-none border border-black/10 bg-[#fafafa] p-6">
                <h2 className="text-lg font-semibold text-black">How to enjoy it</h2>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-black/70">
                  <li>• Drag inside the scene to change your viewing direction.</li>
                  <li>• The 360 tour begins automatically as soon as the scene is ready.</li>
                  <li>• This is rendered as a real 360 environment rather than a flat video frame.</li>
                </ul>
              </div>

              <div className="rounded-none border border-black/10 bg-[#fafafa] p-6">
                <h2 className="text-lg font-semibold text-black">Playback</h2>
                <p className="mt-3 text-sm leading-relaxed text-black/70">
                  The video is playing from your local project file, so it can be viewed directly on the site without relying on a blocked YouTube embed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
    );
  }
