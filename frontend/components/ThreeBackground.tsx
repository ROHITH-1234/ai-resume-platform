'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial, MeshDistortMaterial, Float } from '@react-three/drei'
import * as THREE from 'three'

function ParticleField() {
  const ref = useRef<THREE.Points>(null!)
  
  const particles = useMemo(() => {
    const temp = []
    for (let i = 0; i < 2000; i++) {
      const x = (Math.random() - 0.5) * 50
      const y = (Math.random() - 0.5) * 50
      const z = (Math.random() - 0.5) * 50
      temp.push(x, y, z)
    }
    return new Float32Array(temp)
  }, [])

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.05
      ref.current.rotation.y = state.clock.elapsedTime * 0.075
    }
  })

  return (
    <Points ref={ref} positions={particles} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#ef4444"
        size={0.2}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.6}
      />
    </Points>
  )
}

function FloatingBox({ position, color }: { position: [number, number, number], color: string }) {
  return (
    <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
      <mesh position={position}>
        <boxGeometry args={[2, 2, 2]} />
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.3}
          speed={1.5}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </Float>
  )
}

function FloatingTorus({ position, color }: { position: [number, number, number], color: string }) {
  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={1.5}>
      <mesh position={position} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
        <torusGeometry args={[2, 0.6, 16, 32]} />
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
    </Float>
  )
}

function FloatingSphere({ position, color }: { position: [number, number, number], color: string }) {
  return (
    <Float speed={1.8} rotationIntensity={0.5} floatIntensity={2.5}>
      <mesh position={position}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.5}
          speed={1}
          roughness={0}
          metalness={0.7}
        />
      </mesh>
    </Float>
  )
}

function Icosahedron({ position, color }: { position: [number, number, number], color: string }) {
  return (
    <Float speed={1.2} rotationIntensity={2} floatIntensity={1.8}>
      <mesh position={position}>
        <icosahedronGeometry args={[1.8, 1]} />
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.3}
          speed={1.2}
          roughness={0.3}
          metalness={0.6}
        />
      </mesh>
    </Float>
  )
}

export default function ThreeBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 30], fov: 75 }}
        style={{ 
          background: 'linear-gradient(135deg, #000000 0%, #1a0000 25%, #330000 50%, #1a0000 75%, #000000 100%)'
        }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#ff0000" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#dc2626" />
        <pointLight position={[0, 0, 0]} intensity={0.8} color="#991b1b" />
        
        <ParticleField />
        
        {/* Floating geometric shapes */}
        <FloatingBox position={[-8, 4, -5]} color="#dc2626" />
        <FloatingBox position={[10, -3, -8]} color="#ef4444" />
        
        <FloatingTorus position={[-10, -5, -10]} color="#b91c1c" />
        <FloatingTorus position={[8, 6, -6]} color="#f87171" />
        
        <FloatingSphere position={[0, 0, -15]} color="#991b1b" />
        <FloatingSphere position={[-15, 8, -12]} color="#dc2626" />
        <FloatingSphere position={[12, -8, -10]} color="#ef4444" />
        
        <Icosahedron position={[15, 2, -8]} color="#b91c1c" />
        <Icosahedron position={[-6, -8, -12]} color="#dc2626" />
        <Icosahedron position={[5, 10, -14]} color="#f87171" />
      </Canvas>
    </div>
  )
}
