// frontend/src/components/AnimatedBackground.jsx
import { Canvas } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';

export default function AnimatedBackground() {
  return (
    <Canvas style={{ position: 'absolute', top: 0, left: 0, zIndex: -1 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[-2, 5, 2]} intensity={1} />
      <Sphere visible args={[1, 100, 200]} scale={1.2}>
        <MeshDistortMaterial
          color="#8352FD"
          attach="material"
          distort={0.5}
          speed={1.5}
          roughness={0}
        />
      </Sphere>
      <Sphere visible args={[1, 100, 200]} scale={0.7} position={[2, -1, 0]}>
        <MeshDistortMaterial
          color="#E04DB0"
          attach="material"
          distort={0.6}
          speed={2}
          roughness={0.1}
        />
      </Sphere>
    </Canvas>
  );
}