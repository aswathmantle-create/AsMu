import { Suspense } from 'react'
import Level from './Level'

export default function Experience() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 2]} intensity={1.5} castShadow />
      <Suspense fallback={null}>
        <Level />
      </Suspense>
    </>
  )
}
