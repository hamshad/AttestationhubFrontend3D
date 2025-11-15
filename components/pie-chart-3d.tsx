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

  // Raycaster and mouse for hover interaction
  const raycaster = new THREE.Raycaster()
  const mouse = new THREE.Vector2()
  const meshes: THREE.Mesh[] = []
  const hoveredRef = { index: -1 }

  // Label info will store DOM elements and the 3D anchor points we use for projection
      const labelInfos: {
        el: HTMLDivElement
        // radial out point in local space (unchanged after creation)
        radialOutLocal: THREE.Vector3
        // rim point in local space (outer boundary)
        rimPointLocal?: THREE.Vector3
        // line object we update each frame
        line: THREE.Line
        // the 2D projected end point used for label placement (updated each frame)
        endPoint: THREE.Vector3
        // horizontal offset distance for the outward label
        offset?: number
        arrow?: THREE.ArrowHelper
        side: 'left' | 'right'
      }[] = []

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

    // Helper to create a subtle, non-reflective texture from a color.
    function createCanvasTextureFromHex(hexColor: number) {
      const canvas = document.createElement('canvas')
      const size = 128
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')!

      // Fill with base color
      const hex = hexColor.toString(16).padStart(6, '0')
      ctx.fillStyle = `#${hex}`
      ctx.fillRect(0, 0, size, size)

      // Add a soft paper-like noise to make it look textured and non-reflective
      ctx.globalAlpha = 0.07
      ctx.fillStyle = '#ffffff'
      for (let i = 0; i < 5000; i++) {
        ctx.fillRect(Math.random() * size, Math.random() * size, 1, 1)
      }

      // Add a fine crosshatch overlay for subtle detail
      ctx.globalAlpha = 0.04
      ctx.strokeStyle = '#000000'
      for (let i = 0; i < 25; i++) {
        const pos = (i / 25) * size
        ctx.beginPath()
        ctx.moveTo(pos, 0)
        ctx.lineTo(0, pos)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(size - pos, 0)
        ctx.lineTo(size, pos)
        ctx.stroke()
      }

      const texture = new THREE.CanvasTexture(canvas)
      texture.wrapS = THREE.RepeatWrapping
      texture.wrapT = THREE.RepeatWrapping
      texture.repeat.set(1, 1)
      return texture
    }

  data.forEach((item, idx) => {
      if (item.value === 0) return

      const sliceAngle = (item.value / total) * Math.PI * 2
  const geometry = new THREE.BufferGeometry()

  const vertices: number[] = []
  const uvs: number[] = []
  const indices: Uint32Array | number[] = []
      let vertexIndex = 0

      // Create front face (z = depth)
      const frontFaceStart = vertexIndex
      for (let i = 0; i <= segmentResolution; i++) {
        const angle = startAngle + (i / segmentResolution) * sliceAngle
        const vx = Math.cos(angle) * radius
        const vy = Math.sin(angle) * radius
        vertices.push(vx, vy, depth)
        // Basic planar UV mapping based on XY coordinates
        uvs.push(vx / (radius * 2) + 0.5, vy / (radius * 2) + 0.5)
      }
      vertices.push(0, 0, depth)
      uvs.push(0.5, 0.5)
      const frontCenter = vertexIndex + segmentResolution + 1
      vertexIndex += segmentResolution + 2

      // Create back face (z = 0)
      const backFaceStart = vertexIndex
      for (let i = 0; i <= segmentResolution; i++) {
        const angle = startAngle + (i / segmentResolution) * sliceAngle
        const vx = Math.cos(angle) * radius
        const vy = Math.sin(angle) * radius
        vertices.push(vx, vy, 0)
        uvs.push(vx / (radius * 2) + 0.5, vy / (radius * 2) + 0.5)
      }
      vertices.push(0, 0, 0)
      uvs.push(0.5, 0.5)
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
  geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2))
      geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1))
      geometry.computeVertexNormals()

      // Create a non-reflective, matte material using a subtle canvas-based texture.
      const texture = createCanvasTextureFromHex(item.color)
      const material = new THREE.MeshStandardMaterial({
        // use the texture as the base visual; the color should be neutral (white) so the
        // texture provides the color itself. We set metalness to 0 and roughness to 1
        // for a non-reflective result.
        map: texture,
        color: 0xffffff,
        metalness: 0,
        roughness: 1,
        emissive: 0x000000,
        emissiveIntensity: 0,
      })

      const mesh = new THREE.Mesh(geometry, material)
      mesh.castShadow = true
      mesh.receiveShadow = true
  group.add(mesh)
  

      // --- Leader line + label ---
  const midAngle = startAngle + sliceAngle / 2
  // store index and radial direction on mesh for interaction and keep a list
  mesh.userData.sliceIndex = idx
  mesh.userData.midAngle = midAngle
  mesh.userData.radialDir = new THREE.Vector3(Math.cos(midAngle), Math.sin(midAngle), 0)
  meshes.push(mesh)

      // radial start from outer rim
  const rimPoint = new THREE.Vector3(Math.cos(midAngle) * radius, Math.sin(midAngle) * radius, depth / 2)
      const radialOut = new THREE.Vector3(Math.cos(midAngle) * (radius + 0.2), Math.sin(midAngle) * (radius + 0.2), depth / 2)

      // horizontal endpoint to left or right
      const horizontalOffset = 0.6
  // Decide whether the label should be placed to the right or left of the section.
  // Use strict > 0 so top/bottom (cos===0) consistently choose the left side.
  const toRight = Math.cos(midAngle) > 0
      const horizontalEnd = new THREE.Vector3(
        radialOut.x + (toRight ? horizontalOffset : -horizontalOffset),
        radialOut.y,
        radialOut.z
      )

  const points = [rimPoint, radialOut, horizontalEnd]
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x0f172a, linewidth: 2 })
      const line = new THREE.Line(lineGeometry, lineMaterial)
      line.renderOrder = 999
  group.add(line)
  // Add a small pulsing arrow at the horizontal end (initially hidden)
  const arrowDir = new THREE.Vector3(Math.cos(midAngle), Math.sin(midAngle), 0).normalize()
  const arrow = new THREE.ArrowHelper(arrowDir, horizontalEnd, 0.36, item.color, 0.08, 0.04)
  arrow.visible = false
  group.add(arrow)

      // Create DOM label
      const labelEl = document.createElement('div')
      labelEl.style.position = 'absolute'
      labelEl.style.pointerEvents = 'none'
  labelEl.style.fontWeight = '700'
  labelEl.style.fontSize = '20px'
  labelEl.style.padding = '4px 8px'
  labelEl.style.background = 'rgba(255,255,255,0.9)'
  labelEl.style.borderRadius = '6px'
      labelEl.style.color = '#003149'
      labelEl.style.whiteSpace = 'nowrap'
      labelEl.style.transform = `translate(-50%, -50%)`
  labelEl.style.textShadow = '0 1px 0 rgba(255,255,255,0.6)'
  labelEl.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
      const percent = Math.round((item.value / total) * 100)
      labelEl.textContent = `${percent}%`
      container.appendChild(labelEl)

  // Save radialOut in local-space for future recomputation and the line to update
  labelInfos.push({ el: labelEl, radialOutLocal: radialOut, line, endPoint: horizontalEnd, rimPointLocal: rimPoint, offset: horizontalOffset, side: toRight ? 'right' : 'left', arrow })

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
      // update normalized mouse for raycasting (Three.js NDC)
      const rect2 = containerRef.current!.getBoundingClientRect()
      mouse.x = ((event.clientX - rect2.left) / rect2.width) * 2 - 1
      mouse.y = -((event.clientY - rect2.top) / rect2.height) * 2 + 1
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

      // check hover state (raycast based on mouse) so we can animate hovered slice
      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(meshes, true)
      const hoveredIndex = intersects.length > 0 ? (intersects[0].object as any).userData.sliceIndex : -1
      if (hoveredRef.index !== hoveredIndex) {
        hoveredRef.index = hoveredIndex
        labelInfos.forEach((li, idx) => {
          if (li.arrow) li.arrow.visible = idx === hoveredIndex
        })
      }

      // update label positions by projecting 3D point into 2D
      const canvas = renderer.domElement
      labelInfos.forEach((li, i) => {
  // Lines are fixed with the pie in local coordinates so they rotate together.
  // We just need to project the local horizontal endpoint into screen space for label placement.
  const group = groupRef.current!
  group.updateMatrixWorld(true)

  const horizontalWorld = li.endPoint.clone().applyMatrix4(group.matrixWorld)
  const pos = horizontalWorld.clone().project(camera)
        const x = (pos.x * 0.5 + 0.5) * canvas.clientWidth
        const y = (-pos.y * 0.5 + 0.5) * canvas.clientHeight

  // hide if behind camera
  const isVisible = pos.z < 1 && pos.z > -1
        li.el.style.visibility = isVisible ? 'visible' : 'hidden'

  if (li.side === 'right') {
          li.el.style.left = `${x + 8}px`
          li.el.style.top = `${y}px`
          li.el.style.transform = 'translate(0%, -50%)'
          li.el.style.textAlign = 'left'
  } else {
          li.el.style.left = `${x - 8}px`
          li.el.style.top = `${y}px`
          li.el.style.transform = 'translate(-100%, -50%)'
          li.el.style.textAlign = 'right'
        }

        // Hover animation: push the mesh a bit outward along its radial direction and pulse arrow
        const mesh = meshes[i]
        const radialDir = mesh?.userData?.radialDir as THREE.Vector3 | undefined
        const isHover = hoveredRef.index === i
        const targetPos = new THREE.Vector3(0, 0, 0)
        if (isHover && radialDir) {
          targetPos.copy(radialDir).multiplyScalar(0.15)
        }
        if (mesh) mesh.position.lerp(targetPos, 0.12)

        if (li.arrow) {
          if (li.arrow.visible) {
            const pulse = 0.02 * Math.sin(Date.now() * 0.01 * 12)
            const baseLen = 0.36
            li.arrow.setLength(baseLen + pulse, 0.08 + pulse * 0.2, 0.04 + pulse * 0.4)
          }
        }
      })

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
      // remove any DOM labels created
      labelInfos.forEach((li) => {
        if (container.contains(li.el)) container.removeChild(li.el)
        // remove the THREE line if it's still attached
        if (groupRef.current && li.line && groupRef.current.children.includes(li.line)) {
          groupRef.current.remove(li.line)
        }
        // remove arrow if present
        if (groupRef.current && li.arrow && groupRef.current.children.includes(li.arrow)) {
          groupRef.current.remove(li.arrow)
        }
      })
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
