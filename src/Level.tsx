import { useLayoutEffect, useMemo, useRef } from 'react'
import { InstancedMesh, Matrix4, Object3D } from 'three'

const BAMBOO_COUNT = 100

export default function Level() {
  const bambooRef = useRef<InstancedMesh>(null)

  const bambooMatrices = useMemo(() => {
    const dummy = new Object3D()
    const matrices = new Array<Matrix4>(BAMBOO_COUNT)

    for (let i = 0; i < BAMBOO_COUNT; i += 1) {
      const t = (i / BAMBOO_COUNT) * Math.PI * 2
      const ring = 7 + (i % 10) * 0.55
      const jitter = ((i * 17) % 9) * 0.08

      dummy.position.set(
        Math.cos(t * 2.1) * ring + jitter,
        1.8 + (i % 5) * 0.1,
        Math.sin(t * 2.1) * ring + jitter,
      )
      dummy.rotation.set(0, t * 1.7, 0)
      dummy.scale.set(0.25, 2.8 + (i % 6) * 0.25, 0.25)
      dummy.updateMatrix()
      matrices[i] = dummy.matrix.clone()
    }

    return matrices
  }, [])

  useLayoutEffect(() => {
    const mesh = bambooRef.current
    if (!mesh) return

    bambooMatrices.forEach((matrix, index) => {
      mesh.setMatrixAt(index, matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  }, [bambooMatrices])

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#5d6f3a" roughness={0.98} metalness={0.02} />
      </mesh>

      <instancedMesh ref={bambooRef} args={[undefined, undefined, BAMBOO_COUNT]} castShadow receiveShadow>
        <cylinderGeometry args={[0.12, 0.14, 1, 8]} />
        <meshStandardMaterial color="#7a9a48" roughness={0.88} metalness={0.03} />
      </instancedMesh>
    </group>
  )
}
