export default class Settings {
    constructor(experience) {
        this.experience = experience

        this.panel = document.getElementById('settings-panel')
        this.toggleBtn = document.getElementById('settings-toggle')
        this.closeBtn = document.getElementById('settings-close')

        this._cache = {}

        this._bindEvents()
    }

    _bindEvents() {
        this.toggleBtn.addEventListener('click', () => this.toggle())
        this.closeBtn.addEventListener('click', () => this.close())

        const sliders = this.panel.querySelectorAll('input[type="range"]')
        sliders.forEach((slider) => {
            slider.addEventListener('input', () => this._onSlider(slider))
        })

        this.panel.querySelectorAll('[data-preset]').forEach((btn) => {
            btn.addEventListener('click', () => this._applyPreset(btn.dataset.preset))
        })

        const transToggle = document.getElementById('transMode')
        if (transToggle) {
            transToggle.addEventListener('change', () => {
                const player = this.experience.world.player
                player.isAuto = transToggle.checked
                document.getElementById('mode-label').textContent = transToggle.checked ? 'Automatic' : 'Manual'
                if (!transToggle.checked) player.currentGear = 1
            })
        }
    }

    toggle() {
        this.panel.classList.toggle('open')
    }

    close() {
        this.panel.classList.remove('open')
    }

    _onSlider(slider) {
        const value = parseFloat(slider.value)
        const id = slider.id
        const label = document.getElementById(`val-${id}`)
        if (label) label.textContent = value

        switch (id) {
            case 'engineForce':
                this.experience.world.player.engineForce = value
                break
            case 'steerTorque':
                this.experience.world.player.steerTorque = value
                break
            case 'brakeForce':
                this.experience.world.player.brakeForce = value
                break
            case 'maxSpeed':
                this.experience.world.player.maxSpeed = value
                break
            case 'camDist':
                this.experience.camera.offset.z = value
                break
            case 'camLerp':
                this.experience.camera.lerpFactor = value
                break
            case 'shiftRpm':
                this.experience.world.player.shiftRpm = value
                break
        }
    }

    _applyPreset(name) {
        const presets = {
            normal: { engineForce: 200, steerTorque: 50, brakeForce: 40, maxSpeed: 20, camDist: 15, camLerp: 0.08 },
            drift:  { engineForce: 280, steerTorque: 80, brakeForce: 20, maxSpeed: 25, camDist: 16, camLerp: 0.06 },
            race:   { engineForce: 450, steerTorque: 35, brakeForce: 60, maxSpeed: 50, camDist: 22, camLerp: 0.12 },
            tank:   { engineForce: 150, steerTorque: 15, brakeForce: 80, maxSpeed: 12, camDist: 12, camLerp: 0.15 },
        }

        const preset = presets[name]
        if (!preset) return

        this._setSlider('engineForce', preset.engineForce)
        this._setSlider('steerTorque', preset.steerTorque)
        this._setSlider('brakeForce', preset.brakeForce)
        this._setSlider('maxSpeed', preset.maxSpeed)
        this._setSlider('camDist', preset.camDist)
        this._setSlider('camLerp', preset.camLerp)

        this.panel.querySelectorAll('[data-preset]').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.preset === name)
        })
    }

    _setSlider(id, value) {
        const slider = document.getElementById(id)
        if (!slider) return
        slider.value = value
        slider.dispatchEvent(new Event('input'))
    }
}