import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/cannon'
import Experience from './Experience'

export default function App() {
  return (
    <Canvas camera={{ position: [0, 2.2, 10], fov: 70 }} shadows>
      <Physics gravity={[0, -20, 0]} broadphase="SAP" allowSleep>
        <Experience />
      </Physics>
    </Canvas>
  )
}
