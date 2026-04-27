export default function Level() {
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>

      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshStandardMaterial color="#22d3ee" />
      </mesh>
    </group>
  )
}
