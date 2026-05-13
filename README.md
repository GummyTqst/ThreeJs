# Three JS School prototype

A minimal 3D driving world inspired by Bruno Simon's folio-2025.

## Stack
- **Three.js** — 3D rendering
- **Rapier** — physics engine (same as Bruno's, uses WASM)
- **Vite** — dev server / bundler

---

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
