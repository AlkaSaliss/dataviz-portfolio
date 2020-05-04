import React, { useRef, useEffect } from 'react'
import * as d3 from 'd3'
import * as THREE from 'three'





export default ({ data, xScale, yScale, zScale, colorScale, xColumn, yColumn, zColumn }) => {

  const myContainer = useRef(null)
  const width = 700
  const height = 700
  const circleSize = 0.15;
  const circleOpacity = 0.7;
  const circleStrokeWidth = 0.5;
  const cameraDistance = 2.3;
  // const colorScheme = schemeCategory10;
  const rotationSensitivity = 0.004;
  const rotationIncrement = -0.2;


  const generateSprite = (color) => {
    const canvas = document.createElement('canvas')
    // const canvas = myContainer.current.createElement('canvas')
    const side = 64
    const radius = side / 2
    canvas.width = side
    canvas.height = side

    const context = canvas.getContext('2d')

    // Draw a circle on the canvas.
    context.beginPath()
    context.arc(side / 2, side / 2, radius, 0, 2 * Math.PI, false)
    context.globalAlpha = circleOpacity
    context.fillStyle = color
    context.fill()
    context.lineWidth = circleStrokeWidth
    context.strokeStyle = 'black'
    context.stroke()

    return canvas
  }


  useEffect(
    () => {
      if (myContainer.current) {

        // Cache materials for colors.
        const materials = {}
        const material = (color) => {
          if (!materials[color]) {
            materials[color] = new THREE.SpriteMaterial({
              map: new THREE.CanvasTexture(generateSprite(color))
            })
          }

          return materials[color]
        }


        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
        const renderer = new THREE.WebGLRenderer({ alpha: true })
        renderer.setSize(width, height)
        // document.body.appendChild(renderer.domElement)
        myContainer.current.appendChild(renderer.domElement)

        const root = new THREE.Object3D()
        scene.add(root)
        camera.position.z = cameraDistance

        // Set up rotation interaction.
        const rotationInteraction = d3.zoom()
        // Disable zoom, only use panning.
        rotationInteraction.scaleExtent([1, 1])

        // Limit panning so it can't go beyond the north and south poles.
        // Without this, moving the mouse right and left could cause
        // undesirable inverse rotation.
        rotationInteraction.translateExtent([
          [-Infinity, -Math.PI / 2 / rotationSensitivity],
          [Infinity, height + Math.PI / 2 / rotationSensitivity]
        ])

        // Update scenegraph root rotation on pan.
        rotationInteraction.on('zoom', () => {
          root.rotation.y = d3.event.transform.x * rotationSensitivity
          root.rotation.x = d3.event.transform.y = rotationSensitivity
        })

        // Set up the interaction to respond to the DOM events.
        const rotationSelection = d3.select(renderer.domElement).call(rotationInteraction)

        // Initialize rotation
        rotationInteraction.translateBy(rotationSelection, rotationIncrement, 0)

        // Rotate slowly all the time.
        const animate = () => {
          requestAnimationFrame(animate)
          rotationInteraction.translateBy(rotationSelection, rotationIncrement, 0)
          renderer.render(scene, camera)
        }
        animate()

        const addSprite = (x, y, z, color) => {
          const sprite = new THREE.Sprite(material(color))
          sprite.position.x = x
          sprite.position.y = y
          sprite.position.z = z
          sprite.scale.set(circleSize, circleSize, 1)
          root.add(sprite)
        }

        data
          .map(d => ({
            x: xScale(d[xColumn]),
            y: yScale(d[yColumn]),
            z: zScale(d[zColumn]),
            color: colorScale(colorScale(d['Species']))
          }))
          .forEach(addSprite);
      }
    },
    [colorScale, data, rotationIncrement, xColumn, xScale, yColumn, yScale, zColumn, zScale]
  )




  return (
    // <h1>Hello 3D</h1>
    <div ref={myContainer} className='iris-3d-div'>
      Hello world
    </div>
  )
}
