/* eslint-disable react/no-unknown-property */
'use client';
import { useEffect, useMemo, useRef, useState, Suspense } from 'react';
import { Canvas, extend, useFrame } from '@react-three/fiber';
import { useGLTF, useTexture, Environment, Lightformer } from '@react-three/drei';
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';

// replace with your own imports, see the usage snippet for details
import cardGLB from '../assets/lanyard/card.glb';
import lanyard from '../assets/lanyard/lanyard.png';

import * as THREE from 'three';

extend({ MeshLineGeometry, MeshLineMaterial });

// 1x1 transparent pixel — lets useTexture be called unconditionally when a
// front/back image isn't supplied.
const BLANK_PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// The card model's front face is UV-mapped to the LEFT half of the texture
// atlas and the back face to the RIGHT half (measured from card.glb). Each
// custom image is composited into its own half so the two faces render
// independently, aspect-preserving (no stretching).
const FRONT_UV_RECT = { x: 0, y: 0, w: 0.5, h: 0.755 };
const BACK_UV_RECT = { x: 0.5, y: 0, w: 0.5, h: 0.757 };

export default function Lanyard({
  position = [0, 0, 30],
  gravity = [0, -40, 0],
  fov = 20,
  transparent = true,
  frontImage = null,
  backImage = null,
  imageFit = 'cover',
  lanyardImage = null,
  lanyardWidth = 1
}) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth < 1280);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1280);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      className="relative z-0 w-full h-full flex justify-center items-center transform scale-100 origin-center">
      <Canvas
        camera={{ position: position, fov: fov }}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{ alpha: transparent }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)}>
        <ambientLight intensity={Math.PI} />
        <Suspense fallback={null}>
          <Physics key={isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'} gravity={gravity} timeStep={isMobile ? 1 / 30 : 1 / 60}>
            <Band
              isMobile={isMobile}
              isTablet={isTablet}
              frontImage={frontImage}
              backImage={backImage}
              imageFit={imageFit}
              lanyardImage={lanyardImage}
              lanyardWidth={lanyardWidth} />
          </Physics>
          <Environment blur={0.75}>
            <Lightformer
              intensity={2}
              color="white"
              position={[0, -1, 5]}
              rotation={[0, 0, Math.PI / 3]}
              scale={[100, 0.1, 1]} />
          <Lightformer
            intensity={3}
            color="white"
            position={[-1, -1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]} />
          <Lightformer
            intensity={3}
            color="white"
            position={[1, 1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]} />
          <Lightformer
            intensity={10}
            color="white"
            position={[-10, 0, 14]}
            rotation={[0, Math.PI / 2, Math.PI / 3]}
            scale={[100, 10, 1]} />
        </Environment>
        </Suspense>
      </Canvas>
    </div>
  );
}
function Band({
  maxSpeed = 50,
  minSpeed = 0,
  isMobile = false,
  isTablet = false,
  frontImage = null,
  backImage = null,
  imageFit = 'cover',
  lanyardImage = null,
  lanyardWidth = 1
}) {
  const band = useRef(),
    fixed = useRef(),
    j1 = useRef(),
    j2 = useRef(),
    j3 = useRef(),
    card = useRef();
  const vec = new THREE.Vector3(),
    ang = new THREE.Vector3(),
    rot = new THREE.Vector3(),
    dir = new THREE.Vector3();
  const segmentProps = { type: 'dynamic', canSleep: true, colliders: false, angularDamping: 4, linearDamping: 4 };
  const { nodes, materials } = useGLTF(cardGLB);
  const texture = useTexture(lanyardImage || lanyard);
  // useTexture must be called unconditionally; use a blank pixel when an image
  // isn't supplied for a given face, then skip compositing it below.
  const frontTex = useTexture(frontImage || BLANK_PIXEL);
  const backTex = useTexture(backImage || BLANK_PIXEL);

  // Composite the front/back images into the card's texture atlas (front = left
  // half, back = right half). Each image is drawn aspect-preserving (no stretch).
  const cardMap = useMemo(() => {
    const baseMap = materials.base.map;
    if (!frontImage && !backImage) return baseMap;

    const baseImg = baseMap.image;
    const W = baseImg.width;
    const H = baseImg.height;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return baseMap;
    // Keep the original baked atlas for the card edges and any untouched face.
    ctx.drawImage(baseImg, 0, 0, W, H);

    const drawCustomCard = (rect) => {
      const rx = rect.x * W;
      const ry = rect.y * H;
      const rw = rect.w * W;
      const rh = rect.h * H;

      ctx.save();
      ctx.beginPath();
      ctx.rect(rx, ry, rw, rh);
      ctx.clip();

      // 1. Draw pup bg (cover)
      if (backTex.image) {
        const bgImg = backTex.image;
        const scale = Math.max(rw / bgImg.width, rh / bgImg.height);
        const dw = bgImg.width * scale;
        const dh = bgImg.height * scale;
        const dx = rx + (rw - dw) / 2;
        const dy = ry + (rh - dh) / 2;
        ctx.drawImage(bgImg, dx, dy, dw, dh);
      }

      // 2. Draw maroon overlay (matches Image 2 style)
      ctx.fillStyle = 'rgba(50, 15, 25, 0.85)';
      ctx.fillRect(rx, ry, rw, rh);

      // 3. Draw PUP logo
      if (frontTex.image) {
        const logoSize = Math.min(rw, rh) * 0.38; 
        const lx = rx + (rw - logoSize) / 2;
        const ly = ry + rh * 0.15; 
        ctx.drawImage(frontTex.image, lx, ly, logoSize, logoSize);
      }

      // 4. Draw PUP TAGUIG text
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      const titleSize = rw * 0.115;
      ctx.font = `900 ${titleSize}px "Inter", sans-serif`;
      ctx.fillText('PUP TAGUIG', rx + rw / 2, ry + rh * 0.65);

      // 5. Draw ONE PORTAL text
      const subSize = rw * 0.055;
      ctx.font = `600 ${subSize}px "Inter", sans-serif`;
      if ('letterSpacing' in ctx) {
        ctx.letterSpacing = `${rw * 0.015}px`;
      }
      ctx.fillText('ONE PORTAL', rx + rw / 2, ry + rh * 0.74);
      
      ctx.restore();
    };

    drawCustomCard(FRONT_UV_RECT);
    drawCustomCard(BACK_UV_RECT);

    const composite = new THREE.CanvasTexture(canvas);
    composite.colorSpace = THREE.SRGBColorSpace;
    composite.flipY = baseMap.flipY;
    composite.anisotropy = 16;
    composite.needsUpdate = true;
    return composite;
  }, [frontImage, backImage, imageFit, frontTex, backTex, materials.base.map]);
  
  // Dynamically generate a maroon lanyard texture with the PUP logo
  const customLanyardTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128; // Wide and short so it wraps cleanly along the string
    const ctx = canvas.getContext('2d');
    if (!ctx) return texture;

    // Fill Black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the text "PUP" 3 times with wide gaps
    ctx.fillStyle = '#ffffff'; // White text
    ctx.font = 'bold 50px Poppins, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const y = canvas.height / 2;
    // Draw twice per texture tile to create medium gaps
    ctx.fillText('PUP', canvas.width * 0.25, y);
    ctx.fillText('PUP', canvas.width * 0.75, y);

    const composite = new THREE.CanvasTexture(canvas);
    composite.colorSpace = THREE.SRGBColorSpace;
    composite.wrapS = composite.wrapT = THREE.RepeatWrapping;
    composite.anisotropy = 16;
    composite.needsUpdate = true;
    return composite;
  }, [frontTex, texture]);
  const [curve] = useState(() =>
    new THREE.CatmullRomCurve3(
      [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]
    ));
  const [dragged, drag] = useState(false);
  const [hovered, hover] = useState(false);

  const stringLength = 2.8;
  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], stringLength]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], stringLength]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], stringLength]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 1.15, 0]
  ]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => void (document.body.style.cursor = 'auto');
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({ x: vec.x - dragged.x, y: vec.y - dragged.y, z: vec.z - dragged.z });
    }
    if (fixed.current) {
      [j1, j2].forEach(ref => {
        if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
        const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
        ref.current.lerped.lerp(
          ref.current.translation(),
          delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed))
        );
      });
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());
      band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32));
      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
    }
  });

  curve.curveType = 'chordal';
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  return (
    <>
      <group position={[0, isTablet ? 8.45 : isMobile ? 8.9 : 8.25, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[2, 0, 0]}
          ref={card}
          {...segmentProps}
          type={dragged ? 'kinematicPosition' : 'dynamic'}>
          <CuboidCollider args={[0.62, 0.875, 0.01]} />
          <group
            scale={1.75}
            position={[0, -0.93, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={e => (e.target.releasePointerCapture(e.pointerId), drag(false))}
            onPointerDown={e => (
              e.target.setPointerCapture(e.pointerId),
              drag(
                new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation()))
              )
            )}>
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                map={cardMap}
                map-anisotropy={16}
                clearcoat={isMobile ? 0 : 1}
                clearcoatRoughness={0.15}
                roughness={0.9}
                metalness={0.8} />
            </mesh>
            <mesh
              geometry={nodes.clip.geometry}
              material={materials.metal}
              material-roughness={0.3}
              material-transparent={true}
              material-opacity={0.4} />
            <mesh 
              geometry={nodes.clamp.geometry} 
              material={materials.metal}
              material-transparent={true}
              material-opacity={0.4} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={isMobile ? [1000, 2000] : [1000, 1000]}
          useMap
          map={customLanyardTexture}
          repeat={[-4, 1]}
          lineWidth={lanyardWidth}
          transparent={true}
          opacity={0.4} />
      </mesh>
    </>
  );
}
