import * as THREE from 'three'
import Terrain from './Terrain.js'
import Player from './Player.js'

export default class World {
  constructor(experience) {
    this.experience = experience
    this.scene = experience.scene

    this._setLighting()

    this.terrain = new Terrain(experience)
    this.player = new Player(experience)
  }

  _setLighting() {
    const ambient = new THREE.AmbientLight('#ffffff', 0.6)
    this.scene.add(ambient)

    const sun = new THREE.DirectionalLight('#ffe4b5', 2.0)
    sun.position.set(40, 60, 30)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    sun.shadow.camera.near = 1
    sun.shadow.camera.far = 200
    sun.shadow.camera.left = -80
    sun.shadow.camera.right = 80
    sun.shadow.camera.top = 80
    sun.shadow.camera.bottom = -80
    sun.shadow.bias = -0.001
    this.scene.add(sun)

    const fill = new THREE.DirectionalLight('#aaccff', 0.4)
    fill.position.set(-20, 10, -20)
    this.scene.add(fill)
  }
}