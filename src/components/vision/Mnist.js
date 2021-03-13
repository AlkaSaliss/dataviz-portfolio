import React, { useRef, useEffect, useState } from 'react'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import { Tensor, InferenceSession, } from "onnxjs"
import ndarray from 'ndarray'
import ops from 'ndarray-ops'
import BarChart from './visionCharts/BarChart'
// import saveAs from 'file-saver'


var session = new InferenceSession({ backendHint: 'webgl' })
const MODEL_URL = "static/ml_models/mnist.onnx"


const softMaxFunc = (ar) => {
  const denom = ar.map(x => Math.exp(x)).reduce((a, b) => a + b)
  const res = ar.map(x => Math.exp(x) / denom)
  return res
}


export default () => {

  const canvasRef = useRef(null)
  const canvasRefScaled = useRef(null)
  const contextRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  // ****************************************
  const defaultBarData = [
    { pred: 0.1, category: "0", key: 0 },
    { pred: 0.1, category: "1", key: 1 },
    { pred: 0.1, category: "2", key: 2 },
    { pred: 0.1, category: "3", key: 3 },
    { pred: 0.1, category: "4", key: 4 },
    { pred: 0.1, category: "5", key: 5 },
    { pred: 0.1, category: "6", key: 6 },
    { pred: 0.1, category: "7", key: 7 },
    { pred: 0.1, category: "8", key: 8 },
    { pred: 0.1, category: "9", key: 9 }
  ]
  const [barData, setBarData] = useState(defaultBarData)
  const barColumns = { xColumn: 'pred', yColumn: 'category' }
  const barKey = 'key'
  const barDimensions = { width: 500, height: 400, marginBottom: 20, marginTop: 20, marginRight: 20, marginLeft: 20 }
  const barTitle = 'Predicted Digit'
  // ************************************************


  // loading model
  const loadONNXModel = async () => {
    await session.loadModel(MODEL_URL)
  }

  useEffect(() => {
    const dimensions = {
      width: 340,
      height: 340,
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
    canvasContext.lineWidth = 20
    contextRef.current = canvasContext

    // load model
    loadONNXModel()
    return () => {
      // reinitialize model otherwise exception raised : already initialized
      session = new InferenceSession({ backendHint: 'webgl' })
    }
  }
    , [])


  const handlePredict = async () => {
    const canvasContextScaled = canvasRefScaled.current.getContext('2d')
    canvasContextScaled.clearRect(0, 0, contextRef.current.canvas.width, contextRef.current.canvas.height)
    canvasContextScaled.drawImage(document.getElementById('input-img-canvas'), 0, 0, contextRef.current.canvas.width, contextRef.current.canvas.height, 0, 0, 28, 28)
    const imgScaled = canvasContextScaled.getImageData(0, 0, canvasContextScaled.canvas.width, canvasContextScaled.canvas.height)
    const { data, width, height } = imgScaled

    const imgArray = ndarray(new Float32Array(data), [width, height, 4])
    const inputArray = ndarray(new Float32Array(width * height * 1), [1, 1, width, height])
    ops.assign(inputArray.pick(0, 0, null, null), imgArray.pick(null, null, 3))
    ops.divseq(inputArray, 255)
    ops.subseq(inputArray, 0.1307)
    ops.divseq(inputArray, 0.3081)

    const imgTensor = [
      new Tensor(inputArray.data, 'float32', [1, 1, width, height])
    ]

    const outputMap = await session.run(imgTensor);
    const outputTensor = outputMap.values().next().value
    const predProba = [...softMaxFunc(outputTensor.data)]
    const predData = predProba.map((p, idx) => ({ pred: p, category: idx.toString(), key: idx }))
    setBarData(predData)
  }


  const handleClear = () => {
    if (contextRef.current) {
      contextRef.current.clearRect(0, 0, contextRef.current.canvas.width, contextRef.current.canvas.height)
    }
    setBarData(defaultBarData)
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
    handlePredict()
  }

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return

    const { offsetX, offsetY } = nativeEvent
    contextRef.current.lineTo(offsetX, offsetY)
    contextRef.current.stroke()
  }

  return (
    <Grid container className='mnist-container'>
      <Grid item xs={12} style={{ textAlign: 'center', marginBottom: '1vw' }}>
        <Typography variant='h4' style={{ fontSize: '1.15vw' }}>
          Digit Recognition : Draw a digit (from 0 to 9) and an embedded (in your browser)
          AI model will try to predict the probabilities that the Drawing corresponds to each digit.
        </Typography>
      </Grid>
      <Grid item xs={6} className='digit-draw' style={{ textAlign: 'center' }}>
        <canvas
          id='input-img-canvas'
          className='digit-draw-canvas'
          onMouseDown={drawingStart}
          onMouseUp={drawingEnd}
          onMouseMove={draw}
          ref={canvasRef}
        />
        <canvas
          height="28"
          width="28"
          style={{ display: 'none' }}
          ref={canvasRefScaled}
        />

      </Grid>
      <Grid item xs={6} className='digit-predict' style={{ textAlign: 'center' }}>
        <BarChart
          data={barData}
          columns={barColumns}
          dimensions={barDimensions}
          title={barTitle}
          id={barKey}
        />
      </Grid>
      <Grid item xs={12} className='digit-predict'>
        <div style={{ textAlign: 'center', marginBottom: '50px', marginTop: '50px' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleClear}
          >
            Clear Drawing
          </Button>
        </div>
      </Grid>
    </Grid>

  )
}
