import { PointerLockControls } from '@react-three/drei'
import { useCompoundBody } from '@react-three/cannon'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Euler, Group, Mesh, Plane, Quaternion, Raycaster, Vector3 } from 'three'

type MoveState = {
  forward: boolean
  backward: boolean
  left: boolean
  right: boolean
}

type Flash = {
  id: number
  pos: [number, number, number]
  ttl: number
  size: number
}

type Impact = {
  id: number
  pos: [number, number, number]
  ttl: number
  size: number
  rot: number
}

const MOVE_SPEED = 6
const HEAD_BOB_INTENSITY = 0.045
const HEAD_BOB_SPEED = 11
const IMPACT_LIFETIME = 7

export default function Player() {
  const { camera } = useThree()
  const velocity = useRef<[number, number, number]>([0, 0, 0])
  const position = useRef<[number, number, number]>([0, 2, 8])
  const movement = useRef<MoveState>({ forward: false, backward: false, left: false, right: false })

  const frontVector = useRef(new Vector3())
  const sideVector = useRef(new Vector3())
  const direction = useRef(new Vector3())

  const shotCounter = useRef(0)
  const muzzlePlane = useMemo(() => new Plane(new Vector3(0, 1, 0), 0), [])
  const raycaster = useMemo(() => new Raycaster(), [])
  const impactPoint = useMemo(() => new Vector3(), [])
  const rifleRef = useRef<Group>(null)

  const [muzzleFlashes, setMuzzleFlashes] = useState<Flash[]>([])
  const [impacts, setImpacts] = useState<Impact[]>([])

  const [playerRef, api] = useCompoundBody<Mesh>(() => ({
    mass: 1,
    fixedRotation: true,
    linearDamping: 0.9,
    position: [0, 2, 8],
    shapes: [
      { type: 'Sphere', args: [0.35], position: [0, 0.55, 0] },
      { type: 'Cylinder', args: [0.35, 0.35, 1, 10], position: [0, 0, 0], rotation: [Math.PI / 2, 0, 0] },
      { type: 'Sphere', args: [0.35], position: [0, -0.55, 0] },
    ],
  }))

  useEffect(() => api.velocity.subscribe((v) => (velocity.current = v)), [api.velocity])
  useEffect(() => api.position.subscribe((p) => (position.current = p)), [api.position])

  useEffect(() => {
    const onKey = (pressed: boolean) => (event: KeyboardEvent) => {
      if (event.code === 'KeyW') movement.current.forward = pressed
      if (event.code === 'KeyS') movement.current.backward = pressed
      if (event.code === 'KeyA') movement.current.left = pressed
      if (event.code === 'KeyD') movement.current.right = pressed
    }

    const onKeyDown = onKey(true)
    const onKeyUp = onKey(false)

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  useEffect(() => {
    const shoot = () => {
      shotCounter.current += 1

      const camPos = camera.position.clone()
      const forward = new Vector3()
      camera.getWorldDirection(forward)
      const right = new Vector3().crossVectors(forward, camera.up).normalize()

      const muzzlePos = camPos
        .clone()
        .add(forward.multiplyScalar(0.75))
        .add(right.multiplyScalar(0.2))
        .add(new Vector3(0, -0.16, 0))

      setMuzzleFlashes((prev) => [
        ...prev,
        {
          id: shotCounter.current,
          pos: [muzzlePos.x, muzzlePos.y, muzzlePos.z],
          ttl: 0.08,
          size: 0.2,
        },
      ])

      const fireDirection = new Vector3()
      camera.getWorldDirection(fireDirection)
      raycaster.set(camera.position, fireDirection)

      if (raycaster.ray.intersectPlane(muzzlePlane, impactPoint)) {
        setImpacts((prev) => {
          const next = [
            ...prev,
            {
              id: shotCounter.current,
              pos: [impactPoint.x, Math.max(0.015, impactPoint.y + 0.01), impactPoint.z],
              ttl: IMPACT_LIFETIME,
              size: 0.2 + (shotCounter.current % 4) * 0.05,
              rot: (shotCounter.current % 10) * 0.35,
            },
          ]

          return next.slice(-40)
        })
      }
    }

    window.addEventListener('mousedown', shoot)
    return () => window.removeEventListener('mousedown', shoot)
  }, [camera, impactPoint, muzzlePlane, raycaster])

  useFrame((state, delta) => {
    frontVector.current.set(0, 0, Number(movement.current.backward) - Number(movement.current.forward))
    sideVector.current.set(Number(movement.current.left) - Number(movement.current.right), 0, 0)

    direction.current
      .subVectors(frontVector.current, sideVector.current)
      .normalize()
      .applyEuler(camera.rotation)

    direction.current.y = 0

    const x = direction.current.x * MOVE_SPEED
    const z = direction.current.z * MOVE_SPEED

    api.velocity.set(x, velocity.current[1], z)

    const moving = movement.current.forward || movement.current.backward || movement.current.left || movement.current.right
    const bob = moving ? Math.sin(state.clock.elapsedTime * HEAD_BOB_SPEED) * HEAD_BOB_INTENSITY : 0

    camera.position.set(position.current[0], position.current[1] + 0.75 + bob, position.current[2])

    setMuzzleFlashes((prev) => prev.map((flash) => ({ ...flash, ttl: flash.ttl - delta })).filter((flash) => flash.ttl > 0))
    setImpacts((prev) => prev.map((impact) => ({ ...impact, ttl: impact.ttl - delta })).filter((impact) => impact.ttl > 0))

    if (rifleRef.current) {
      const forward = new Vector3()
      const right = new Vector3()
      const up = new Vector3(0, 1, 0)
      camera.getWorldDirection(forward)
      right.crossVectors(forward, up).normalize()

      rifleRef.current.position
        .copy(camera.position)
        .add(forward.multiplyScalar(0.65))
        .add(right.multiplyScalar(0.26))
        .add(new Vector3(0, -0.25, 0))

      const targetRotation = new Quaternion().setFromEuler(new Euler(0.02, -0.12, -0.08))
      rifleRef.current.quaternion.copy(camera.quaternion).multiply(targetRotation)
    }
  })

  return (
    <>
      <PointerLockControls />
      <mesh ref={playerRef} visible={false} />

      <group ref={rifleRef}>
        <mesh castShadow>
          <boxGeometry args={[0.85, 0.1, 0.1]} />
          <meshStandardMaterial color="#684729" roughness={0.95} />
        </mesh>
        <mesh position={[0.2, 0.08, 0]}>
          <boxGeometry args={[0.5, 0.05, 0.05]} />
          <meshStandardMaterial color="#2f343a" metalness={0.72} roughness={0.35} />
        </mesh>
        <mesh position={[-0.25, -0.06, 0]}>
          <boxGeometry args={[0.24, 0.12, 0.08]} />
          <meshStandardMaterial color="#3d2a16" roughness={1} />
        </mesh>
      </group>

      {muzzleFlashes.map((flash) => (
        <mesh key={flash.id} position={flash.pos}>
          <sphereGeometry args={[flash.size, 8, 8]} />
          <meshBasicMaterial color="#ffd483" transparent opacity={Math.max(0, flash.ttl / 0.08)} />
        </mesh>
      ))}

      {impacts.map((impact) => (
        <mesh key={impact.id} position={impact.pos} rotation={[-Math.PI / 2, impact.rot, 0]}>
          <circleGeometry args={[impact.size, 14]} />
          <meshBasicMaterial color="#4f3f2b" transparent opacity={Math.min(0.75, impact.ttl / IMPACT_LIFETIME)} />
        </mesh>
      ))}
    </>
  )
}
