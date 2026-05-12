import * as THREE from 'three'
import Renderer from './Renderer.js'
import Camera from './Camera.js'
import World from './World/index.js'
import Inputs from './Inputs.js'
import Physics from './Physics.js'
import Settings from './Settings.js'

export default class Experience {
  constructor(canvas) {
    this.canvas = canvas

    // Core Three.js setup
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color('#87CEEB') // sky blue
    this.scene.fog = new THREE.Fog('#87CEEB', 30, 120)

    this.sizes = {
      width: window.innerWidth,
      height: window.innerHeight
    }

    // Handle window resize
    window.addEventListener('resize', () => {
      this.sizes.width = window.innerWidth
      this.sizes.height = window.innerHeight
      this.camera.resize()
      this.renderer.resize()
    })

    // Initialise systems
    this.inputs = new Inputs()
    this.renderer = new Renderer(this)
    this.camera = new Camera(this)
    this.settings = new Settings(this)

    // Physics is async (Rapier uses WASM)
    this.physics = new Physics(this)
    this.physics.init().then(() => {
      this.world = new World(this)
      this._hideLoadingScreen()
      this._startLoop()
    })
  }

  _hideLoadingScreen() {
    const el = document.getElementById('loading')
    if (el) el.classList.add('hidden')
  }

  _startLoop() {
    const clock = new THREE.Clock()

    const tick = () => {
      const delta = clock.getDelta() // seconds since last frame

      if (this.world?.player) {
        this.world.player.prePhysics(delta)
      }

      this.physics.step(delta)

      if (this.world?.player) {
        this.world.player.postPhysics()
      }

      this.camera.update()

      this.renderer.render()

      requestAnimationFrame(tick)
    }

    tick()
  }
}
