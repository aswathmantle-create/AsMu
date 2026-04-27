import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Experience from './Experience'

export default function App() {
  return (
    <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
      <color attach="background" args={['#111827']} />
      <OrbitControls makeDefault />
      <Experience />
    </Canvas>
  )
}
