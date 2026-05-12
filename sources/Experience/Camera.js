import * as THREE from 'three'

export default class Camera {
  constructor(experience) {
    this.experience = experience
    this.scene = experience.scene
    this.sizes = experience.sizes

    // How far behind/above the car the camera sits
    this.offset = new THREE.Vector3(0, 5, 15)

    // Smoothing — lower = more lag (cinematic), higher = snappier
    this.lerpFactor = 0.08

    // Internal state
    this._targetPosition = new THREE.Vector3()
    this._targetLookAt = new THREE.Vector3()
    this._currentLookAt = new THREE.Vector3()

    this._setInstance()
  }

  _setInstance() {
    this.instance = new THREE.PerspectiveCamera(
      60,                                        // field of view
      this.sizes.width / this.sizes.height,      // aspect ratio
      0.1,                                       // near clip
      500                                        // far clip
    )

    // Start somewhere sensible before the player loads
    this.instance.position.set(0, 10, 20)
    this.scene.add(this.instance)
  }

  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height
    this.instance.updateProjectionMatrix()
  }

  update() {
    const player = this.experience.world?.player
    if (!player || !player.mesh) return

    const playerPos = player.mesh.position
    const playerQuat = player.mesh.quaternion

    // Rotate the camera offset by the car's rotation so it always sits behind it
    const rotatedOffset = this.offset.clone().applyQuaternion(playerQuat)

    // Target position = player position + rotated offset
    this._targetPosition.copy(playerPos).add(rotatedOffset)

    // Where the camera should look — slightly in front of the car
    this._targetLookAt.copy(playerPos).add(
      new THREE.Vector3(0, 0.5, 0)
    )

    // Smooth (lerp) towards target — this gives the floaty follow feel
    this.instance.position.lerp(this._targetPosition, this.lerpFactor)
    this._currentLookAt.lerp(this._targetLookAt, this.lerpFactor)
    this.instance.lookAt(this._currentLookAt)
  }
}
