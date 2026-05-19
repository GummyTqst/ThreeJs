import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

export default class Terrain {
  constructor(experience) {
    this.experience = experience
    this.scene = experience.scene
    this.physics = experience.physics

    this._load()
  }

  _load() {
    const loader = new GLTFLoader()
    const bar = document.getElementById('loading-bar')

    loader.load(
      '/models/Town.glb',

      // Success
      (gltf) => {
        console.log('Town GLB loaded')
        if (bar) bar.style.width = '100%'

        gltf.scene.traverse((child) => {
          if (!child.isMesh) return

          child.receiveShadow = true
          child.castShadow = false

          // Build physics trimesh from this mesh's geometry
          this._buildCollider(child)
        })

        this.scene.add(gltf.scene)
      },

      // Progress
      (xhr) => {
        if (bar && xhr.total > 0) {
          const pct = 60 + (xhr.loaded / xhr.total) * 35
          bar.style.width = pct + '%'
        }
      },

      // Error
      (error) => {
        console.warn('⚠️  terrain.glb not found — using procedural terrain instead.')
        this._buildProceduralTerrain()
        if (bar) bar.style.width = '100%'
      }
    )
  }

  // Rapier collider
  _buildCollider(mesh) {
    const geometry = mesh.geometry

    // We need the position attribute as a flat Float32Array
    const posAttr = geometry.getAttribute('position')
    const vertices = new Float32Array(posAttr.array)

    // And the index buffer as a flat Uint32Array
    let indices
    if (geometry.index) {
      indices = new Uint32Array(geometry.index.array)
    } else {
      // Non-indexed geometry — generate sequential indices
      indices = new Uint32Array(vertices.length / 3)
      for (let i = 0; i < indices.length; i++) indices[i] = i
    }

    // Apply the mesh's world transform to the vertices
    mesh.updateWorldMatrix(true, false)
    const matrix = mesh.matrixWorld
    const vec = new THREE.Vector3()

    for (let i = 0; i < vertices.length; i += 3) {
      vec.set(vertices[i], vertices[i + 1], vertices[i + 2])
      vec.applyMatrix4(matrix)
      vertices[i]     = vec.x
      vertices[i + 1] = vec.y
      vertices[i + 2] = vec.z
    }

    const body = this.physics.createFixed({ x: 0, y: 0, z: 0 })
    this.physics.addTrimeshCollider(body, vertices, indices)
    console.log(`  ↳ Trimesh collider built (${indices.length / 3} triangles)`)
  }

  _buildProceduralTerrain() {
    const size = 100
    const segments = 40
    const geometry = new THREE.PlaneGeometry(size, size, segments, segments)
    geometry.rotateX(-Math.PI / 2)

    // Deform vertices to make hills
    const pos = geometry.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const z = pos.getZ(i)
      const y =
        Math.sin(x * 0.15) * 1.5 +
        Math.sin(z * 0.2)  * 1.2 +
        Math.sin((x + z) * 0.1) * 2.0
      pos.setY(i, y)
    }

    geometry.computeVertexNormals()

    const material = new THREE.MeshStandardMaterial({
      color: '#5a8a45',
      roughness: 0.85,
      metalness: 0.0
    })

    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.receiveShadow = true
    this.scene.add(this.mesh)

    // Build collider for procedural terrain too
    this._buildCollider(this.mesh)
  }
}
