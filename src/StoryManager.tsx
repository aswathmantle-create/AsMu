import { Html } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useState } from 'react'
import { Vector3 } from 'three'

const TRIGGER_CENTER = new Vector3(10, 0, 10)
const TRIGGER_RADIUS = 2.25

export default function StoryManager() {
  const { camera } = useThree()
  const [hasTriggered, setHasTriggered] = useState(false)
  const [insideZone, setInsideZone] = useState(false)

  useFrame(() => {
    const playerPos = camera.position
    const distance = Math.hypot(playerPos.x - TRIGGER_CENTER.x, playerPos.z - TRIGGER_CENTER.z)
    const nowInside = distance <= TRIGGER_RADIUS

    if (nowInside && !hasTriggered) {
      setHasTriggered(true)
    }

    if (nowInside !== insideZone) {
      setInsideZone(nowInside)
    }
  })

  return (
    <>
      <mesh position={[TRIGGER_CENTER.x, 0.05, TRIGGER_CENTER.z]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[TRIGGER_RADIUS * 0.92, TRIGGER_RADIUS, 48]} />
        <meshBasicMaterial color={insideZone ? '#ffdd99' : '#ff9d00'} transparent opacity={0.55} />
      </mesh>

      <group position={[6.5, 0, 8.8]}>
        <mesh position={[0, 1.65, 0]} castShadow>
          <capsuleGeometry args={[0.32, 0.9, 4, 8]} />
          <meshStandardMaterial color="#3f5f4f" roughness={0.9} metalness={0.02} />
        </mesh>
        <mesh position={[0, 2.45, 0]} castShadow>
          <sphereGeometry args={[0.24, 12, 12]} />
          <meshStandardMaterial color="#d6b194" roughness={0.95} metalness={0.01} />
        </mesh>
        <mesh position={[0.1, 2.46, 0.19]}>
          <boxGeometry args={[0.2, 0.06, 0.01]} />
          <meshStandardMaterial color="#2f2f2f" />
        </mesh>
        <mesh position={[0, 0.9, 0]} receiveShadow>
          <cylinderGeometry args={[0.5, 0.6, 0.14, 10]} />
          <meshStandardMaterial color="#6f7f47" roughness={1} />
        </mesh>

        <Html position={[0, 3.05, 0]} center>
          <div
            style={{
              background: 'rgba(16, 16, 16, 0.6)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#f6e4c8',
              padding: '4px 8px',
              borderRadius: 4,
              fontSize: 12,
              whiteSpace: 'nowrap',
            }}
          >
            Subedar (Placeholder)
          </div>
        </Html>
      </group>

      {hasTriggered && (
        <Html fullscreen>
          <div
            style={{
              position: 'absolute',
              top: 24,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(18, 18, 18, 0.78)',
              color: '#ffe0a9',
              border: '1px solid rgba(255, 190, 120, 0.65)',
              padding: '12px 18px',
              borderRadius: 6,
              fontWeight: 600,
              letterSpacing: '0.02em',
            }}
          >
            The Japanese are near...
          </div>
        </Html>
      )}

    </>
  )
}
