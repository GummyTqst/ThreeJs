import * as THREE from 'three'

export default class Floor {
  constructor(experience) {
    this.experience = experience
    this.scene = experience.scene
    this.physics = experience.physics

    this._createMesh()
    this._createPhysicsBody()
  }

  _createMesh() {
    const geometry = new THREE.PlaneGeometry(400, 400)
    const material = new THREE.MeshStandardMaterial({
      color: '#4a7c59',    // grass green
      roughness: 0.9,
      metalness: 0.0
    })

    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.rotation.x = -Math.PI / 2   // rotate flat
    this.mesh.receiveShadow = true
    this.scene.add(this.mesh)
  }

  _createPhysicsBody() {
    // A big flat cuboid collider — effectively infinite ground
    const body = this.physics.createFixed({ x: 0, y: -0.05, z: 0 })
    this.physics.addBoxCollider(body, { x: 200, y: 0.05, z: 200 }, 0.8)
  }
}
