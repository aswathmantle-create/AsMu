import { PointerLockControls } from '@react-three/drei'
import { useCompoundBody } from '@react-three/cannon'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { Mesh, Vector3 } from 'three'

type MoveState = {
  forward: boolean
  backward: boolean
  left: boolean
  right: boolean
}

const MOVE_SPEED = 6
const HEAD_BOB_INTENSITY = 0.045
const HEAD_BOB_SPEED = 11

export default function Player() {
  const { camera } = useThree()
  const velocity = useRef<[number, number, number]>([0, 0, 0])
  const position = useRef<[number, number, number]>([0, 2, 8])
  const movement = useRef<MoveState>({ forward: false, backward: false, left: false, right: false })

  const frontVector = useRef(new Vector3())
  const sideVector = useRef(new Vector3())
  const direction = useRef(new Vector3())

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

  useFrame((state) => {
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
  })

  return (
    <>
      <PointerLockControls />
      <mesh ref={playerRef} visible={false} />
    </>
  )
}
