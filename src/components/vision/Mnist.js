import React, { useRef, useEffect, useState } from 'react'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'


export default () => {

  const canvasRef = useRef(null)
  const contextRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)

  useEffect(() => {
    const dimensions = {
      width: 600,
      height: 500,
      marginTop: 20,
      marginBottom: 20,
      marginRight: 20,
      marginLeft: 20
    }

    const innerWidth = dimensions.width - dimensions.marginLeft - dimensions.marginRight
    const innerHeight = dimensions.height - dimensions.marginBottom - dimensions.marginTop

    const canvas = canvasRef.current
    canvas.width = innerWidth * 3
    canvas.height = innerHeight * 3
    canvas.style.width = `${innerWidth}px`
    canvas.style.height = `${innerHeight}px`

    const canvasContext = canvas.getContext('2d')
    canvasContext.scale(3, 3)
    canvasContext.lineCap = 'round'
    canvasContext.strokeStyle = 'black'
    canvasContext.lineWidth = 15
    contextRef.current = canvasContext
  }, [])

  const handlePredict = () => {
    console.log("Predict Clicked!!!")
  }
  const handleClear = () => {
    if (contextRef.current) {
      contextRef.current.clearRect(0, 0, contextRef.current.canvas.width, contextRef.current.canvas.height)
    }
  }

  const drawingStart = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent

    contextRef.current.beginPath()
    contextRef.current.moveTo(offsetX, offsetY)
    setIsDrawing(true)
  }

  const drawingEnd = () => {
    contextRef.current.closePath()
    setIsDrawing(false)
  }

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return

    const { offsetX, offsetY } = nativeEvent
    contextRef.current.lineTo(offsetX, offsetY)
    contextRef.current.stroke()
  }

  return (
    <Grid container className='mnist-container'>
      <Grid item xs={8}  className='digit-draw' style={{ textAlign: 'center' }}>
        <canvas
          className='digit-draw-canvas'
          onMouseDown={drawingStart}
          onMouseUp={drawingEnd}
          onMouseMove={draw}
          ref={canvasRef}
        />

      </Grid>
      <Grid item xs={4} className='digit-predict' style={{ textAlign: 'center' }}>
        Hello
      </Grid>
      <Grid item xs={12} className='digit-predict'>
        <div style={{ textAlign: 'left', marginBottom: '50px', marginTop: '50px' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handlePredict}
            style={{ marginLeft: '100px' }}
          >
            Predict
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleClear}
            style={{ marginLeft: '100px' }}
          >
            Clear Drawing
          </Button>
        </div>
      </Grid>
    </Grid>

  )
}
