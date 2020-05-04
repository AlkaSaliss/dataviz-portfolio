import React, { useRef, useEffect } from 'react'
import {
  zoom,
  select,
  event
} from 'd3'
import {
  Scene,
  Object3D,
  PerspectiveCamera,
  WebGLRenderer,
  CanvasTexture,
  Sprite,
  SpriteMaterial
} from 'three'
import { removeChildrenNodes } from '../irisUtils'

export default ({ data, xScale, yScale, zScale, colorScale, xColumn, yColumn, zColumn }) => {

  const myContainer = useRef(null)

  useEffect(
    () => {
      if (myContainer.current) {

        // remove the canvas if it exists ==> because at each re-render a new canvas is appended
        var divElement = document.getElementById('iris-3d-div')
        removeChildrenNodes(divElement)

        // Tweakables

        const width = 800
        const height = 700
        const circleSize = 0.10
        const circleOpacity = 0.9
        const circleStrokeWidth = 0.7 //0.5
        const cameraDistance = 2.5 // 2.3
        const rotationSensitivity = 0.009 //0.004
        const rotationIncrement = -0.2//-0.2

        // Generates a circle sprite for the given color.
        // Inspired by https://takahirox.github.io/three.js/examples/canvas_particles_sprites.html
        const generateSprite = color => {
          const canvas = document.createElement('canvas')
          const side = 64
          const radius = side / 2 - 4
          canvas.width = side
          canvas.height = side

          const context = canvas.getContext('2d')

          // Draw a circle on the canvas
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


        // Cache materials for colors.
        const materials = {}
        const material = color => {
          if (!materials[color]) {
            materials[color] = new SpriteMaterial({
              map: new CanvasTexture(generateSprite(color))
            })
          }
          return materials[color]
        }

        const scene = new Scene()
        const camera = new PerspectiveCamera(75, width / height, 0.1, 1000)

        const renderer = new WebGLRenderer({ alpha: true })
        renderer.setSize(width, height)

        myContainer.current.appendChild(renderer.domElement)

        const root = new Object3D()
        scene.add(root)
        camera.position.z = cameraDistance

        // Set up rotation interaction.
        const rotationInteraction = zoom()

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
          root.rotation.y = event.transform.x * rotationSensitivity
          root.rotation.x = event.transform.y * rotationSensitivity
        })

        // Set up the interaction to respond to the DOM events.
        const rotationSelection = select(renderer.domElement).call(rotationInteraction)

        // Initialize rotation
        rotationInteraction.translateBy(rotationSelection, 0, 0)

        // Rotate slowly all the time.
        const animate = () => {
          requestAnimationFrame(animate)
          rotationInteraction.translateBy(rotationSelection, rotationIncrement, 0)
          renderer.render(scene, camera)
        }
        animate()

        const addSprite = ({ x, y, z, color }) => {
          const sprite = new Sprite(material(color))
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
            color: colorScale(d['Species'])
          }))
          .forEach(addSprite)


      }
    }
  )

  return (

    <div ref={myContainer} id='iris-3d-div' className='iris-3d-div'>
    </div>
  )
}
