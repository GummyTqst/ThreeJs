# Mini Folio — Three.js + Rapier

A minimal 3D driving world inspired by Bruno Simon's folio-2025.

## Stack
- **Three.js** — 3D rendering
- **Rapier** — physics engine (same as Bruno's, uses WASM)
- **Vite** — dev server / bundler

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Get Bruno's terrain (optional but recommended)
1. Clone Bruno's repo: `git clone https://github.com/brunosimon/folio-2025`
2. Find `terrain.glb` inside his `static/` folder
3. Copy it to **your** `static/models/terrain.glb`

> If you skip this step, a procedural hilly terrain is used as a fallback — the car still drives on it!

### 3. Run the dev server
```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Controls
| Key | Action |
|---|---|
| W / ↑ | Drive forward |
| S / ↓ | Reverse |
| A / ← | Steer left |
| D / → | Steer right |
| Space | Brake |

---

## File structure
```
mini-folio/
├── index.html                          ← Entry HTML + loading screen
├── vite.config.js                      ← Vite config (handles Rapier WASM)
├── package.json
├── static/
│   └── models/
│       └── terrain.glb                 ← ← ← PUT BRUNO'S TERRAIN HERE
└── sources/
    ├── index.js                        ← Boots the Experience
    └── Experience/
        ├── index.js                    ← Main orchestrator + game loop
        ├── Renderer.js                 ← Three.js WebGL renderer
        ├── Camera.js                   ← Follow camera (like Bruno's View.js)
        ├── Inputs.js                   ← Keyboard input tracker
        ├── Physics.js                  ← Rapier world + helpers
        └── World/
            ├── index.js               ← Lighting + assembles the world
            ├── Floor.js               ← Flat ground plane + physics collider
            ├── Terrain.js             ← Loads terrain.glb + builds trimesh collider
            └── Player.js             ← Car mesh + physics body + input forces
```

---

## How it works (game loop)

Every frame, in this order:

1. **Inputs** — keyboard state is always live via event listeners
2. **prePhysics** — Player reads inputs, applies engine/steering forces to Rapier body
3. **Physics step** — Rapier simulates one fixed 60Hz timestep
4. **postPhysics** — Player syncs Three.js mesh to Rapier body position/rotation
5. **Camera update** — Camera lerps behind the car
6. **Render** — Three.js draws the frame

This is the same pattern Bruno uses — inputs → physics → visuals → camera → render.

---

## Tuning the car feel

In `Player.js`, tweak these values:

```js
this.engineForce  = 28   // higher = more acceleration
this.steerTorque  = 6    // higher = sharper turns
this.brakeForce   = 18   // higher = shorter stopping distance
this.maxSpeed     = 20   // m/s cap
```

In `Camera.js`:
```js
this.offset      = new THREE.Vector3(0, 4, 10)  // camera position behind car
this.lerpFactor  = 0.08  // 0.01 = very floaty, 0.2 = very snappy
```
