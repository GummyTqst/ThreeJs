import RAPIER from '@dimforge/rapier3d-compat'

export default class Physics {
  constructor(experience) {
    this.experience = experience
    this.world = null
    this.RAPIER = null

    // Fixed physics timestep — 60 Hz
    this._fixedStep = 1 / 60
    this._accumulator = 0
  }

  async init() {
    // Initialise the Rapier WASM module
    await RAPIER.init()
    this.RAPIER = RAPIER

    // Create the physics world with gravity
    this.world = new RAPIER.World({ x: 0, y: -9.81, z: 0 })

    // Update loading bar
    const bar = document.getElementById('loading-bar')
    if (bar) bar.style.width = '60%'

    console.log('Rapier physics ready')
  }

  /**
   * Create a fixed (static) rigid body — used for terrain colliders.
   */
  createFixed(position = { x: 0, y: 0, z: 0 }) {
    const desc = this.RAPIER.RigidBodyDesc.fixed().setTranslation(position.x, position.y, position.z)
    return this.world.createRigidBody(desc)
  }

  /**
   * Create a dynamic rigid body — used for the car.
   */
  createDynamic(position = { x: 0, y: 2, z: 0 }) {
    const desc = this.RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(position.x, position.y, position.z)
      .setLinearDamping(0.5)    // air resistance on movement
      .setAngularDamping(2.0)   // resistance on rotation (stops spinning forever)
    return this.world.createRigidBody(desc)
  }

  /**
   * Add a box collider to a rigid body.
   */
  addBoxCollider(body, halfExtents, friction = 0.7, restitution = 0.1) {
    const colliderDesc = this.RAPIER.ColliderDesc
      .cuboid(halfExtents.x, halfExtents.y, halfExtents.z)
      .setFriction(friction)
      .setRestitution(restitution)
    return this.world.createCollider(colliderDesc, body)
  }

  addTrimeshCollider(body, vertices, indices) {
    const colliderDesc = this.RAPIER.ColliderDesc
      .trimesh(vertices, indices)
      .setFriction(0.8)
    return this.world.createCollider(colliderDesc, body)
  }

  step(delta) {
    if (!this.world) return

    this._accumulator += delta

    while (this._accumulator >= this._fixedStep) {
      this.world.step()
      this._accumulator -= this._fixedStep
    }
  }
}
