import { Sky } from '@react-three/drei'
import { useLayoutEffect, useMemo, useRef } from 'react'
import { Color, InstancedMesh, Matrix4, Object3D } from 'three'

const INSTANCE_COUNT = 120

export default function Experience() {
  const instancedRef = useRef<InstancedMesh>(null)
  const matrices = useMemo(() => {
    const dummy = new Object3D()
    const output = new Array<Matrix4>(INSTANCE_COUNT)

    for (let i = 0; i < INSTANCE_COUNT; i += 1) {
      const ring = i % 40
      const radius = 4 + Math.floor(i / 40) * 2.8
      const angle = (ring / 40) * Math.PI * 2
      const wobble = (i % 7) * 0.05

      dummy.position.set(
        Math.cos(angle) * radius + wobble,
        0.18 + (i % 3) * 0.06,
        Math.sin(angle) * radius + wobble,
      )
      dummy.rotation.set(0, angle * 1.35, 0)
      const scale = 0.35 + (i % 5) * 0.08
      dummy.scale.set(scale, 0.3 + (i % 4) * 0.04, scale)
      dummy.updateMatrix()
      output[i] = dummy.matrix.clone()
    }

    return output
  }, [])

  useLayoutEffect(() => {
    const mesh = instancedRef.current
    if (!mesh) {
      return
    }

    matrices.forEach((matrix, index) => {
      mesh.setMatrixAt(index, matrix)
    })

    mesh.instanceMatrix.needsUpdate = true
  }, [matrices])

  return (
    <>
      <color attach="background" args={['#ffb25a']} />
      <fogExp2 attach="fog" args={['#ff9d00', 0.04]} />

      <Sky
        distance={450000}
        sunPosition={[3, 1, -2]}
        inclination={0.48}
        azimuth={0.18}
        turbidity={9}
        rayleigh={0.9}
        mieCoefficient={0.025}
        mieDirectionalG={0.82}
      />

      <ambientLight intensity={0.5} color={new Color('#ffe4ba')} />
      <directionalLight
        castShadow
        intensity={1.6}
        position={[6, 8, 4]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#5f6d3a" roughness={0.96} metalness={0.02} />
      </mesh>

      <instancedMesh ref={instancedRef} args={[undefined, undefined, INSTANCE_COUNT]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#6f7b43" roughness={0.9} metalness={0.02} />
      </instancedMesh>
    </>
  )
}
