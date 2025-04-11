import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';

const BackgroundAnimation = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0.1); // Slightly transparent background
    mountRef.current.appendChild(renderer.domElement);

    // Create circular particle texture
    const particleTexture = new THREE.CanvasTexture(generateParticleTexture());
    particleTexture.needsUpdate = true;

    // Particle system
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 2000;
    
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    // Cyberpunk color palette
    const colorPalette = [
      new THREE.Color('#ff2a6d'), // Neon Pink
      new THREE.Color('#05d9e8'), // Cyan
      new THREE.Color('#7700ff'), // Purple
      new THREE.Color('#00ff9f'), // Neon Green
      new THREE.Color('#ff914d')  // Orange
    ];
    
    for (let i = 0; i < particleCount; i++) {
      // Position
      positions[i * 3] = (Math.random() - 0.5) * 20;       // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;   // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;   // z
      
      // Color
      const randomColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = randomColor.r;
      colors[i * 3 + 1] = randomColor.g;
      colors[i * 3 + 2] = randomColor.b;
      
      // Size
      sizes[i] = Math.random() * 0.2 + 0.05;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.1,
      sizeAttenuation: true,
      transparent: true,
      alphaMap: particleTexture,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true
    });
    
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Animated point lights
    const pointLight1 = new THREE.PointLight(0xff2a6d, 2, 10); // Neon Pink
    pointLight1.position.set(2, 2, 2);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0x05d9e8, 2, 10); // Cyan
    pointLight2.position.set(-2, -2, -2);
    scene.add(pointLight2);
    
    // Animate point lights
    gsap.to(pointLight1.position, {
      x: -2,
      y: -2,
      z: -2,
      duration: 8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
    
    gsap.to(pointLight2.position, {
      x: 2,
      y: 2,
      z: 2,
      duration: 10,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
    
    // 3D Objects
    const torusGeometry = new THREE.TorusGeometry(1, 0.4, 16, 60);
    const torusMaterial = new THREE.MeshStandardMaterial({
      color: 0x05d9e8,
      metalness: 0.7,
      roughness: 0.2,
      emissive: 0x05d9e8,
      emissiveIntensity: 0.2
    });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    torus.position.set(3, 0, -3);
    scene.add(torus);
    
    const icosahedronGeometry = new THREE.IcosahedronGeometry(0.8, 0);
    const icosahedronMaterial = new THREE.MeshStandardMaterial({
      color: 0xff2a6d,
      metalness: 0.7,
      roughness: 0.2,
      emissive: 0xff2a6d,
      emissiveIntensity: 0.2
    });
    const icosahedron = new THREE.Mesh(icosahedronGeometry, icosahedronMaterial);
    icosahedron.position.set(-3, -2, -2);
    scene.add(icosahedron);
    
    const octahedronGeometry = new THREE.OctahedronGeometry(0.6, 0);
    const octahedronMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ff9f,
      metalness: 0.7,
      roughness: 0.2,
      emissive: 0x00ff9f,
      emissiveIntensity: 0.2
    });
    const octahedron = new THREE.Mesh(octahedronGeometry, octahedronMaterial);
    octahedron.position.set(-2, 2, -4);
    scene.add(octahedron);
    
    // Mouse movement effect
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    
    const onDocumentMouseMove = (event) => {
      mouseX = (event.clientX - window.innerWidth / 2) / 100;
      mouseY = (event.clientY - window.innerHeight / 2) / 100;
    };
    
    document.addEventListener('mousemove', onDocumentMouseMove);
    
    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Smooth camera movement
      targetX = mouseX * 0.3;
      targetY = mouseY * 0.3;
      camera.position.x += (targetX - camera.position.x) * 0.05;
      camera.position.y += (-targetY - camera.position.y) * 0.05;
      camera.lookAt(scene.position);
      
      // Rotate objects
      torus.rotation.x += 0.01;
      torus.rotation.y += 0.005;
      
      icosahedron.rotation.x += 0.005;
      icosahedron.rotation.y += 0.01;
      
      octahedron.rotation.x += 0.01;
      octahedron.rotation.z += 0.01;
      
      // Animate particles
      particles.rotation.y += 0.0005;
      
      renderer.render(scene, camera);
    };
    
    animate();

    // Function to generate a circular particle texture
    function generateParticleTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      
      const context = canvas.getContext('2d');
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = canvas.width / 2;
      
      // Create radial gradient
      const gradient = context.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, radius
      );
      
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      // Draw circle
      context.fillStyle = gradient;
      context.beginPath();
      context.arc(centerX, centerY, radius, 0, Math.PI * 2, false);
      context.fill();
      
      return canvas;
    }
    
    // Cleanup
    return () => {
      mountRef.current?.removeChild(renderer.domElement);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousemove', onDocumentMouseMove);
      
      // Dispose geometries and materials
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      torusGeometry.dispose();
      torusMaterial.dispose();
      icosahedronGeometry.dispose();
      icosahedronMaterial.dispose();
      octahedronGeometry.dispose();
      octahedronMaterial.dispose();
      
      // Cancel animations
      gsap.killTweensOf(pointLight1.position);
      gsap.killTweensOf(pointLight2.position);
      
      // Dispose renderer
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={mountRef} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: -1,
      pointerEvents: 'none'
    }}></div>
  );
};

export default BackgroundAnimation; 