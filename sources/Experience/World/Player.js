import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'


export default class Player {
  constructor(experience) {
    this.experience = experience
    this.scene = experience.scene
    this.physics = experience.physics
    this.inputs = experience.inputs

    // Driving feel — tune these to taste
    this.engineForce = 200    // forward/backward thrust
    this.steerTorque = 50     // turning strength
    this.brakeForce  = 40     // space bar braking
    this.maxSpeed    = 20     // m/s cap

    // Wheel nodes — populated after GLB loads
    this.wheels = []

    // Spawn
    this.spawnPoint = {
      default: { x: -10, y: 2, z: -20 },
      ramp:    { x: -11,  y: 2, z: 83 },
      rooftop: { x: -15, y: 18, z: 30 },
    }

    // mesh is a Group that wraps the GLB; physics follows it
    // We create it immediately so Camera has something to reference
    this.mesh = new THREE.Group()
    this.mesh.position.set(0, 5, 0)
    this.scene.add(this.mesh)

    this._createPhysicsBody()
    this._loadGLB()
  }

  // ─── Load the GLB ───────────────────────────────────────────────────────────

  _loadGLB() {
    const loader = new GLTFLoader()

    loader.load(
      '/static/models/Car.glb',

      (gltf) => {
        console.log('Car.glb loaded')

        const root = gltf.scene

        // The Blender origin of the root body node is offset by x=-3.047, z=-1.886
        // We compensate so the car is visually centred on the physics body
        root.position.set(3.047, -0.363, 1.886)

        // car_seperate_red has a -90° Y rotation baked in the GLB — reset it
        root.children[0]?.rotation.set(0, 0, 0)

        // Enable shadows on every mesh in the car
        root.traverse((child) => {
          if (!child.isMesh) return
          child.castShadow = true
          child.receiveShadow = false
        })

        this.mesh.add(root)

        // Grab the 4 wheel nodes by name so we can spin them
        this.wheels = [
          root.getObjectByName('car_fl_wheel_mesh'),
          root.getObjectByName('car_fr_wheel_mesh'),
          root.getObjectByName('car_rl_wheel_mesh'),
          root.getObjectByName('car_rr_wheel_mesh'),
        ].filter(Boolean)   // drop any that weren't found

        console.log(`  ↳ ${this.wheels.length} wheel nodes found`)
      },

      undefined,

      (err) => {
        console.warn('⚠️  Car.glb not found — using fallback box car')
        this._buildFallbackCar()
      }
    )
  }

  // ─── Fallback box car (shown if GLB is missing) ──────────────────────────────

  _buildFallbackCar() {
    const bodyMat = new THREE.MeshStandardMaterial({ color: '#cc2200', roughness: 0.4, metalness: 0.3 })
    const wheelMat = new THREE.MeshStandardMaterial({ color: '#111111', roughness: 0.9 })

    const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.8, 3.6), bodyMat)
    body.position.y = 0.4
    body.castShadow = true
    this.mesh.add(body)

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 2.0), bodyMat)
    cabin.position.set(0, 1.1, -0.1)
    cabin.castShadow = true
    this.mesh.add(cabin)

    const wheelGeo = new THREE.CylinderGeometry(0.363, 0.363, 0.3, 16)
    const wheelPositions = [
      [-1.112, 0.363, -1.622],
      [ 1.112, 0.363, -1.622],
      [-1.112, 0.363,  1.734],
      [ 1.112, 0.363,  1.734],
    ]

    this.wheels = wheelPositions.map((pos) => {
      const w = new THREE.Mesh(wheelGeo, wheelMat)
      w.rotation.z = Math.PI / 2
      w.position.set(...pos)
      w.castShadow = true
      this.mesh.add(w)
      return w
    })
  }

  // ─── Physics body ────────────────────────────────────────────────────────────

  _createPhysicsBody() {
    this.body = this.physics.createDynamic({ x: 0, y: 2, z: 0 })

    this.physics.addBoxCollider(
      this.body,
      { x: 1.11, y: 0.5, z: 1.68 },   // half-extents
      0.6,    // friction
      0.05    // restitution (barely bouncy)
    )

    // Lock X and Z rotation — stops the car from flipping over on slopes
    this.body.setEnabledRotations(false, true, false)
  }

  // ─── Game loop ───────────────────────────────────────────────────────────────

  /**
   * prePhysics() — read inputs, apply forces, spin wheels.
   * Called BEFORE the physics world steps.
   */
  prePhysics(delta) {
    const keys = this.inputs.keys
    const vel  = this.body.linvel()

    // Speed along the car's local forward axis (0, 0, -1)
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.mesh.quaternion)
    const speed   = forward.dot(new THREE.Vector3(vel.x, vel.y, vel.z))
    this.speed = speed

    // Reset
    if (keys.reset) {
      const spawn = this.spawnPoint.default
      this.body.setTranslation(spawn, true)
      this.body.setLinvel({ x: 0, y: 0, z: 0 }, true)
      this.body.setAngvel({ x: 0, y: 0, z: 0 }, true)
      this.body.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true)
      return   // skip applying forces this frame
    }


    // ── Acceleration / braking ──
    if (keys.brake) {
      this.body.applyImpulse({
        x: -vel.x * this.brakeForce * delta,
        y: 0,
        z: -vel.z * this.brakeForce * delta
      }, true)

    } else if (keys.forward && Math.abs(speed) < this.maxSpeed) {
      this.body.applyImpulse({
        x: forward.x * this.engineForce * delta,
        y: 0,
        z: forward.z * this.engineForce * delta
      }, true)

    } else if (keys.backward && Math.abs(speed) < this.maxSpeed) {
      this.body.applyImpulse({
        x: -forward.x * this.engineForce * delta,
        y: 0,
        z: -forward.z * this.engineForce * delta
      }, true)
    }

    // ── Steering (only when moving) ──
    if (Math.abs(speed) > 0.5) {
      const dir = speed > 0 ? 1 : -1

      if (keys.left) {
        this.body.applyTorqueImpulse({ x: 0, y:  this.steerTorque * dir * delta, z: 0 }, true)
      }
      if (keys.right) {
        this.body.applyTorqueImpulse({ x: 0, y: -this.steerTorque * dir * delta, z: 0 }, true)
      }
    }

    // ── Spin the GLB wheel nodes ──
    // Wheels rotate around their local X axis (they lie on their side in the GLB)
    const spinAmount = speed * 2 * delta
    this.wheels.forEach((wheel) => {
      wheel.rotateX(spinAmount)
    })
  }

  /**
   * postPhysics() — sync Three.js mesh to Rapier body transform.
   * Called AFTER the physics world has stepped.
   */
  postPhysics() {
    const pos = this.body.translation()
    const rot = this.body.rotation()

    this.mesh.position.set(pos.x, pos.y, pos.z)
    this.mesh.quaternion.set(rot.x, rot.y, rot.z, rot.w)

    const element = document.getElementById('cords')
    if (element) {
      element.innerHTML = `x: ${pos.x.toFixed(2)}<br>y: ${pos.y.toFixed(2)}<br>z: ${pos.z.toFixed(2)}`;
    }

    // SpeedoMeter
    const kmh = Math.abs(this.speed * 3.6)
    const maxKmh = this.maxSpeed * 3.6
    const ratio = Math.min(kmh / maxKmh, 1)

    const textEl = document.getElementById('speedo-text')
    if (textEl) textEl.textContent = Math.round(kmh)
    
    const arc = document.getElementById('meter-bg-bar')
    if (arc) {
      const len = arc.getTotalLength()
      arc.setAttribute('stroke-dasharray', len)
      arc.setAttribute('stroke-dashoffset', len * (1 - ratio))
    }

    const needle = document.getElementById('speedo-needle')
    if (needle) {
      const angle = 120 - ratio * -120 
      needle.setAttribute('transform', `rotate(${angle * 2}, 173.5, 173.5)`)
    }

    // Safety respawn if the car falls off the world
    if (pos.y < -20) {
      this.body.setTranslation({ x: 0, y: 2, z: 0 }, true)
      this.body.setLinvel({ x: 0, y: 0, z: 0 }, true)
      this.body.setAngvel({ x: 0, y: 0, z: 0 }, true)
    }
  }
}
