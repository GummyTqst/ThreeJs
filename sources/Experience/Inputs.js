export default class Inputs {
  constructor() {
    this.keys = {
      forward: false,   // W or ArrowUp
      backward: false,  // S or ArrowDown
      left: false,      // A or ArrowLeft
      right: false,     // D or ArrowRight
      brake: false,      // Space
      reset: false       // R
    }

    window.addEventListener('keydown', (e) => this._onKey(e, true))
    window.addEventListener('keyup',   (e) => this._onKey(e, false))
  }

  _onKey(event, isDown) {
    switch (event.code) {
      case 'KeyW':      case 'ArrowUp':    this.keys.forward   = isDown; break
      case 'KeyS':      case 'ArrowDown':  this.keys.backward  = isDown; break
      case 'KeyA':      case 'ArrowLeft':  this.keys.left     = isDown; break
      case 'KeyD':      case 'ArrowRight': this.keys.right     = isDown; break
      case 'Space':                        this.keys.brake      = isDown; break
      case 'KeyR':                          this.keys.reset      = isDown; break
    }
  }
}
