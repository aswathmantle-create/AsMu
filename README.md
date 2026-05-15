# AsMu R3F Prototype

A Vite + React + TypeScript prototype for a first-person React Three Fiber scene with physics, instanced vegetation, a simple story trigger, and shooting visuals.

## What is included

- Vite + React + TypeScript app scaffold.
- `@react-three/fiber` canvas with `@react-three/cannon` physics.
- Golden-hour sky, orange fog, ambient light, and shadow-enabled directional light.
- Physics ground plane with muddy-green terrain material.
- 2,000 instanced grass blades using a custom wind shader.
- KTX2 grass texture loading path with a generated fallback texture.
- 10 low-poly palm trees using instanced meshes.
- First-person player controller with pointer lock, WASD movement, capsule-style physics collider, and head-bob.
- Lee-Enfield-style placeholder view-model.
- Raycast shooting with muzzle flash particles and ground impact decals.
- Story trigger zone at `[10, 0, 10]` that displays `The Japanese are near...`.
- Placeholder Subedar NPC model.

## Run locally

```bash
npm install
npm run dev
```

Open the Vite URL printed in the terminal, usually <http://localhost:5173>.

## Run in GitHub Codespaces

1. Push this branch to GitHub.
2. Open the repository in GitHub Codespaces.
3. Codespaces will use `.devcontainer/devcontainer.json` and run `npm install` automatically.
4. Start the dev server if it is not already running:

```bash
npm run dev -- --host 0.0.0.0
```

5. Open the forwarded **5173** port preview.

## Controls

- Click the scene to enter pointer lock.
- `W`, `A`, `S`, `D` to move.
- Mouse to look around.
- Left click to shoot.
- Walk to `[10, 0, 10]` to trigger the story overlay.

## Notes

The repo intentionally does not commit `node_modules`; dependencies are installed with `npm install` in the target environment. If `/textures/grass_color.ktx2` is not present, the grass shader uses a generated fallback texture.
