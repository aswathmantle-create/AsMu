import { usePlane } from '@react-three/cannon'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  CanvasTexture,
  InstancedMesh,
  Matrix4,
  NearestFilter,
  Object3D,
  RepeatWrapping,
  ShaderMaterial,
  Texture,
} from 'three'
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader'

const GRASS_COUNT = 2000
const PALM_COUNT = 10

const GRASS_VERTEX_SHADER = `
uniform float uTime;
uniform float uWindStrength;
varying vec2 vUv;

void main() {
  vUv = uv;

  vec3 transformed = position;
  float bladeHeightFactor = uv.y;
  float gust = sin((instanceMatrix[3].x + instanceMatrix[3].z) * 1.25 + uTime * 1.7);
  transformed.x += gust * bladeHeightFactor * uWindStrength;
  transformed.z += cos((instanceMatrix[3].x - instanceMatrix[3].z) * 1.1 + uTime * 1.4) * bladeHeightFactor * uWindStrength * 0.45;

  vec4 worldPos = instanceMatrix * vec4(transformed, 1.0);
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`

const GRASS_FRAGMENT_SHADER = `
uniform sampler2D uMap;
uniform bool uUseTexture;
varying vec2 vUv;

void main() {
  vec3 baseColor = vec3(0.28, 0.50, 0.18);
  vec4 tex = texture2D(uMap, vUv);
  vec3 color = uUseTexture ? tex.rgb : baseColor;
  color *= mix(0.75, 1.2, vUv.y);
  gl_FragColor = vec4(color, 1.0);
}
`

function buildFallbackTexture(): Texture {
  const canvas = document.createElement('canvas')
  canvas.width = 2
  canvas.height = 2
  const ctx = canvas.getContext('2d')

  if (ctx) {
    ctx.fillStyle = '#4f7f2b'
    ctx.fillRect(0, 0, 2, 2)
    ctx.fillStyle = '#78a347'
    ctx.fillRect(1, 0, 1, 1)
    ctx.fillStyle = '#365f1d'
    ctx.fillRect(0, 1, 1, 1)
  }

  const texture = new CanvasTexture(canvas)
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.magFilter = NearestFilter
  texture.minFilter = NearestFilter
  return texture
}

export default function Level() {
  const { gl } = useThree()
  const [groundRef] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], position: [0, 0, 0] }))

  const grassRef = useRef<InstancedMesh>(null)
  const palmTrunkRef = useRef<InstancedMesh>(null)
  const palmLeafRef = useRef<InstancedMesh>(null)
  const grassMaterialRef = useRef<ShaderMaterial>(null)

  const [grassTexture, setGrassTexture] = useState<Texture>(() => buildFallbackTexture())

  useEffect(() => {
    const loader = new KTX2Loader()
    loader.setTranscoderPath('https://unpkg.com/three@0.171.0/examples/jsm/libs/basis/')
    loader.detectSupport(gl)

    loader.load(
      '/textures/grass_color.ktx2',
      (texture) => {
        texture.wrapS = RepeatWrapping
        texture.wrapT = RepeatWrapping
        setGrassTexture(texture)
      },
      undefined,
      () => {
        // Keep fallback texture when KTX2 file is unavailable.
      },
    )

    return () => loader.dispose()
  }, [gl])

  const grassMatrices = useMemo(() => {
    const dummy = new Object3D()
    const matrices = new Array<Matrix4>(GRASS_COUNT)

    for (let i = 0; i < GRASS_COUNT; i += 1) {
      const angle = (i / GRASS_COUNT) * Math.PI * 2
      const radius = 4 + (i % 120) * 0.22
      const noise = ((i * 13) % 9) * 0.06

      dummy.position.set(Math.cos(angle * 5.2) * radius + noise, 0.5, Math.sin(angle * 5.2) * radius - noise)
      dummy.rotation.set(0, angle * 2.3, 0)
      dummy.scale.set(0.18, 0.6 + (i % 6) * 0.1, 0.18)
      dummy.updateMatrix()
      matrices[i] = dummy.matrix.clone()
    }

    return matrices
  }, [])

  const palmMatrices = useMemo(() => {
    const dummy = new Object3D()
    const trunks = new Array<Matrix4>(PALM_COUNT)
    const leaves = new Array<Matrix4>(PALM_COUNT)

    for (let i = 0; i < PALM_COUNT; i += 1) {
      const angle = (i / PALM_COUNT) * Math.PI * 2
      const radius = 12 + (i % 3) * 2
      const height = 4 + (i % 4) * 0.5

      dummy.position.set(Math.cos(angle) * radius, height * 0.5, Math.sin(angle) * radius)
      dummy.rotation.set(0, angle + Math.PI * 0.25, 0)
      dummy.scale.set(0.7, height, 0.7)
      dummy.updateMatrix()
      trunks[i] = dummy.matrix.clone()

      dummy.position.set(Math.cos(angle) * radius, height + 1.9, Math.sin(angle) * radius)
      dummy.rotation.set(0, angle, 0)
      dummy.scale.set(2.2, 2.8, 2.2)
      dummy.updateMatrix()
      leaves[i] = dummy.matrix.clone()
    }

    return { trunks, leaves }
  }, [])

  useLayoutEffect(() => {
    const grass = grassRef.current
    if (grass) {
      grassMatrices.forEach((matrix, idx) => grass.setMatrixAt(idx, matrix))
      grass.instanceMatrix.needsUpdate = true
    }

    const trunks = palmTrunkRef.current
    if (trunks) {
      palmMatrices.trunks.forEach((matrix, idx) => trunks.setMatrixAt(idx, matrix))
      trunks.instanceMatrix.needsUpdate = true
    }

    const leaves = palmLeafRef.current
    if (leaves) {
      palmMatrices.leaves.forEach((matrix, idx) => leaves.setMatrixAt(idx, matrix))
      leaves.instanceMatrix.needsUpdate = true
    }
  }, [grassMatrices, palmMatrices])

  useFrame(({ clock }) => {
    if (grassMaterialRef.current) {
      grassMaterialRef.current.uniforms.uTime.value = clock.elapsedTime
    }
  })

  return (
    <group>
      <mesh ref={groundRef} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[220, 220]} />
        <meshStandardMaterial color="#5d6f3a" roughness={0.98} metalness={0.01} />
      </mesh>

      <instancedMesh ref={grassRef} args={[undefined, undefined, GRASS_COUNT]} frustumCulled={false}>
        <planeGeometry args={[0.3, 1.2, 1, 3]} />
        <shaderMaterial
          ref={grassMaterialRef}
          uniforms={{
            uTime: { value: 0 },
            uWindStrength: { value: 0.22 },
            uMap: { value: grassTexture },
            uUseTexture: { value: true },
          }}
          vertexShader={GRASS_VERTEX_SHADER}
          fragmentShader={GRASS_FRAGMENT_SHADER}
          side={2}
        />
      </instancedMesh>

      <instancedMesh ref={palmTrunkRef} args={[undefined, undefined, PALM_COUNT]} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.35, 1, 6]} />
        <meshStandardMaterial color="#86613a" roughness={0.92} metalness={0.02} />
      </instancedMesh>

      <instancedMesh ref={palmLeafRef} args={[undefined, undefined, PALM_COUNT]} castShadow>
        <coneGeometry args={[1, 1, 5]} />
        <meshStandardMaterial color="#4f8b2d" roughness={0.88} metalness={0.01} flatShading />
      </instancedMesh>
    </group>
  )
}
