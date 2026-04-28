import { Sky } from '@react-three/drei'
import Level from './Level'
import Player from './Player'

export default function Experience() {
  return (
    <>
      <color attach="background" args={['#ffb56b']} />
      <fogExp2 attach="fog" args={['#ff8a00', 0.05]} />

      <Sky
        distance={450000}
        sunPosition={[4, 1, -2]}
        inclination={0.49}
        azimuth={0.2}
        turbidity={10}
        rayleigh={1}
        mieCoefficient={0.026}
        mieDirectionalG={0.82}
      />

      <ambientLight intensity={0.4} />
      <directionalLight castShadow intensity={1.4} position={[6, 10, 4]} shadow-mapSize-width={2048} shadow-mapSize-height={2048} />

      <Level />
      <Player />
    </>
  )
}
