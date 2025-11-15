'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface PieChart3DProps {
  completed: number
  pending: number
  autoClosed: number
}

export default function PieChart3D({ completed, pending, autoClosed }: PieChart3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const groupRef = useRef<THREE.Group | null>(null)
  const rotationRef = useRef({ x: 0, y: 0, z: 0 })
  const previousMouseRef = useRef({ x: 0, y: 0 })
  const isDraggingRef = useRef(false)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const width = container.clientWidth || 400
    const height = container.clientHeight || 300

    const scene = new THREE.Scene()
    sceneRef.current = scene
    scene.background = new THREE.Color(0xffffff)

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.set(0, 0, 5)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setClearColor(0xffffff, 1)
    renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const group = new THREE.Group()
    groupRef.current = group
    scene.add(group)

    const total = completed + pending + autoClosed
    if (total === 0) return

    const data = [
      { value: completed, color: 0x10b981, label: 'Completed' },
      { value: pending, color: 0x003149, label: 'Pending' },
      { value: autoClosed, color: 0xf59e0b, label: 'Auto Closed' },
    ]

    let startAngle = -Math.PI / 2
    const radius = 1.2
    const depth = 0.3
    const segmentResolution = 256

    data.forEach((item) => {
      if (item.value === 0) return

      const sliceAngle = (item.value / total) * Math.PI * 2
      const geometry = new THREE.BufferGeometry()

      const vertices: number[] = []
      const indices: Uint32Array | number[] = []
      let vertexIndex = 0

      // Create front face (z = depth)
      const frontFaceStart = vertexIndex
      for (let i = 0; i <= segmentResolution; i++) {
        const angle = startAngle + (i / segmentResolution) * sliceAngle
        vertices.push(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          depth
        )
      }
      vertices.push(0, 0, depth)
      const frontCenter = vertexIndex + segmentResolution + 1
      vertexIndex += segmentResolution + 2

      // Create back face (z = 0)
      const backFaceStart = vertexIndex
      for (let i = 0; i <= segmentResolution; i++) {
        const angle = startAngle + (i / segmentResolution) * sliceAngle
        vertices.push(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          0
        )
      }
      vertices.push(0, 0, 0)
      const backCenter = vertexIndex + segmentResolution + 1
      vertexIndex += segmentResolution + 2

      // Front face triangles
      for (let i = 0; i < segmentResolution; i++) {
        indices.push(frontFaceStart + i, frontFaceStart + i + 1, frontCenter)
      }

      // Back face triangles
      for (let i = 0; i < segmentResolution; i++) {
        indices.push(backFaceStart + i + 1, backFaceStart + i, backCenter)
      }

      // Side faces (curved edges)
      for (let i = 0; i <= segmentResolution; i++) {
        const current = frontFaceStart + i
        const next = frontFaceStart + ((i + 1) % (segmentResolution + 1))
        const backCurrent = backFaceStart + i
        const backNext = backFaceStart + ((i + 1) % (segmentResolution + 1))

        indices.push(current, backCurrent, backNext)
        indices.push(current, backNext, next)
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3))
      geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1))
      geometry.computeVertexNormals()

      const material = new THREE.MeshStandardMaterial({
        color: item.color,
        metalness: 0.4,
        roughness: 0.3,
        emissive: item.color,
        emissiveIntensity: 0.1,
      })

      const mesh = new THREE.Mesh(geometry, material)
      mesh.castShadow = true
      mesh.receiveShadow = true
      group.add(mesh)

      startAngle += sliceAngle
    })

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2)
    directionalLight.position.set(5, 5, 5)
    directionalLight.castShadow = true
    scene.add(directionalLight)

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
    scene.add(ambientLight)

    let lastInteractionTime = Date.now()

    const onMouseMove = (event: MouseEvent) => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      if (isDraggingRef.current) {
        const deltaX = x - previousMouseRef.current.x
        const deltaY = y - previousMouseRef.current.y

        rotationRef.current.y += deltaX * 0.01
        rotationRef.current.x += deltaY * 0.01

        lastInteractionTime = Date.now()
      }

      previousMouseRef.current = { x, y }
    }

    const onMouseDown = (event: MouseEvent) => {
      isDraggingRef.current = true
      const rect = containerRef.current!.getBoundingClientRect()
      previousMouseRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      }
      container.style.cursor = 'grabbing'
    }

    const onMouseUp = () => {
      isDraggingRef.current = false
      container.style.cursor = 'grab'
    }

    const onMouseEnter = () => {
      container.style.cursor = 'grab'
    }

    const onMouseLeave = () => {
      isDraggingRef.current = false
      container.style.cursor = 'default'
    }

    let animationId: number
    const autoRotationSpeed = 0.002

    const animate = () => {
      animationId = requestAnimationFrame(animate)

      const timeSinceLastInteraction = Date.now() - lastInteractionTime
      const shouldAutoRotate = !isDraggingRef.current && timeSinceLastInteraction > 3000

      if (shouldAutoRotate) {
        rotationRef.current.y += autoRotationSpeed
      }

      if (groupRef.current) {
        groupRef.current.rotation.x = rotationRef.current.x
        groupRef.current.rotation.y = rotationRef.current.y
        groupRef.current.rotation.z = rotationRef.current.z
      }

      renderer.render(scene, camera)
    }

    animate()

    renderer.domElement.addEventListener('mousemove', onMouseMove)
    renderer.domElement.addEventListener('mousedown', onMouseDown)
    renderer.domElement.addEventListener('mouseup', onMouseUp)
    renderer.domElement.addEventListener('mouseenter', onMouseEnter)
    renderer.domElement.addEventListener('mouseleave', onMouseLeave)

    const handleResize = () => {
      if (!containerRef.current) return
      const newWidth = containerRef.current.clientWidth || 400
      const newHeight = containerRef.current.clientHeight || 300
      camera.aspect = newWidth / newHeight
      camera.updateProjectionMatrix()
      renderer.setSize(newWidth, newHeight)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      renderer.domElement.removeEventListener('mousemove', onMouseMove)
      renderer.domElement.removeEventListener('mousedown', onMouseDown)
      renderer.domElement.removeEventListener('mouseup', onMouseUp)
      renderer.domElement.removeEventListener('mouseenter', onMouseEnter)
      renderer.domElement.removeEventListener('mouseleave', onMouseLeave)
      cancelAnimationFrame(animationId)
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [completed, pending, autoClosed])

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-square max-h-80 rounded-lg bg-white border border-primary/10 overflow-hidden"
      style={{ pointerEvents: 'auto' }}
    />
  )
}
