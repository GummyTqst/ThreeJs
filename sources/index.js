import Experience from './Experience/index.js'

const experience = new Experience(document.querySelector('canvas') || createCanvas())

function createCanvas() {
  const canvas = document.createElement('canvas')
  document.body.appendChild(canvas)
  return canvas
}
