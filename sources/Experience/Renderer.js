import * as THREE from 'three'

export default class Renderer {
  constructor(experience) {
    this.experience = experience
    this.canvas = experience.canvas
    this.scene = experience.scene
    this.sizes = experience.sizes

    this._setInstance()
  }

  _setInstance() {
    this.instance = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true
    })

    this.instance.setSize(this.sizes.width, this.sizes.height)
    this.instance.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Nice shadow settings
    this.instance.shadowMap.enabled = true
    this.instance.shadowMap.type = THREE.PCFSoftShadowMap

    // Tone mapping makes colours look more natural
    this.instance.toneMapping = THREE.ACESFilmicToneMapping
    this.instance.toneMappingExposure = 1.2
  }

  resize() {
    this.instance.setSize(this.sizes.width, this.sizes.height)
    this.instance.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  }

  render() {
    this.instance.render(this.scene, this.experience.camera.instance)
  }
}
