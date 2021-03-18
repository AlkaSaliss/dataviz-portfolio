import React, { useState, useEffect, useRef } from 'react'
import Webcam from 'react-webcam'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import PlayArrow from '@material-ui/icons/PlayArrow'
import Pause from '@material-ui/icons/PauseCircleFilled'
import CircularProgress from '@material-ui/core/CircularProgress'
import Typography from '@material-ui/core/Typography'
// import Avatar from '@material-ui/core/Avatar'
import {Alert, AlertTitle} from '@material-ui/lab'
import * as tf_face_detector from '@tensorflow-models/face-landmarks-detection'
import { InferenceSession, Tensor } from "onnxjs"
import ndarray from 'ndarray'
import ops from 'ndarray-ops'


var session_fer = new InferenceSession({ backendHint: 'webgl' })
var session_rag = new InferenceSession({ backendHint: 'webgl' })
const MODEL_URL_FER = "static/ml_models/fer.onnx"
const MODEL_URL_RAG = "static/ml_models/rag.onnx"
const LABEL_FER = {
  0: 'Angry',
  1: 'Disgust',
  2: 'Fear',
  3: 'Happy',
  4: 'Sad',
  5: 'Surprise',
  6: 'Neutral'
}
const LABEL_GENDER = {0: 'Man', 1: 'Woman'}
const LABEL_RACE = {0: 'White', 1: 'Black', 2: 'Asian', 3: 'Indian', 4: 'Other'}

// loading model
const loadONNXModel = async () => {
  await session_fer.loadModel(MODEL_URL_FER)
  await session_rag.loadModel(MODEL_URL_RAG)
}

export default () => {

  const [isPlaying, setIsPlaying] = useState(false)
  // const [isPlaying, setIsPlaying] = useState(false)
  const webcamRef = useRef(null)
  const canvasRef = useRef(null)
  const inputImageRef = useRef(null)
  const WIDTH = 640
  const HEIGHT = 450

  const handlePlayClick = () => setIsPlaying(!isPlaying)

  // face detection function
  const detectFace = async (faceModel) => {
    // check video is up and running  
    if (typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      typeof canvasRef.current !== "undefined" &&
      inputImageRef.current !== null &&
      typeof inputImageRef.current !== "undefined" &&
      canvasRef.current !== null &&
      webcamRef.current.video.readyState === 4) {

      const video = webcamRef.current.video
      const videoWidth = webcamRef.current.video.videoWidth
      const videoHeight = webcamRef.current.video.videoHeight
      // Set video width/height
      webcamRef.current.video.width = videoWidth
      webcamRef.current.video.height = videoHeight
      // Set canvas width/height
      canvasRef.current.width = videoWidth
      canvasRef.current.height = videoHeight
      const ctx = canvasRef.current.getContext('2d')
      // // detect faces
      const faces = await faceModel.estimateFaces({ input: video })
      // draw faces
      requestAnimationFrame(() => drawFace(ctx, faces, video))
    }
  }


  // function to draw face bounding box on canvas
  const drawFace = async(ctx, faces, video) => {
    if (faces.length > 0) {
      for (let face of faces) {
        // face = getAlignedBbox(face)
        // console.log(face)
        const predictions = await handlePredictDemoclassi(video, face)

        ctx.beginPath()
        // ctx.strokeStyle = "#42f5e9"
        ctx.strokeStyle = "#7d2ab0"
        ctx.lineWidth = 5
        
        ctx.moveTo(face.boundingBox.topLeft[0], face.boundingBox.topLeft[1])
        ctx.lineTo(face.boundingBox.bottomRight[0], face.boundingBox.topLeft[1])
        ctx.lineTo(face.boundingBox.bottomRight[0], face.boundingBox.bottomRight[1])
        ctx.lineTo(face.boundingBox.topLeft[0], face.boundingBox.bottomRight[1])
        ctx.lineTo(face.boundingBox.topLeft[0], face.boundingBox.topLeft[1])

        ctx.scale(-1, 1)
        const [fontSize, fontFamily, fontColor, textAlign, textBaseline] = [1.25, "cursive", "#7d2ab0", "right", "top"] 
        ctx.font = `${fontSize}em ${fontFamily}`
        ctx.textAlign = textAlign
        ctx.textBaseline = textBaseline
        ctx.fillStyle = fontColor
        ctx.fillText(predictions, -1.15*face.boundingBox.topLeft[0], face.boundingBox.topLeft[1]-20)
        ctx.stroke()
        ctx.closePath()
      }
    }
  }


  const getImgScaled = (ctxScaled, targetWidth, targetHeight, srcVideo, sx, sy, faceWidth, faceHeight) => {

    ctxScaled.clearRect(0, 0, targetWidth, targetHeight)
    ctxScaled.drawImage(srcVideo, sx, sy, faceWidth, faceHeight, 0, 0, targetWidth, targetHeight)
    const imgScaled = ctxScaled.getImageData(0, 0, ctxScaled.canvas.width, ctxScaled.canvas.height)
    const { data, width, height } = imgScaled
    const imgArray = ndarray(new Float32Array(data), [width, height, 4])
    const nChannels = 3
    const inputArray = ndarray(new Float32Array(width * height * nChannels), [1, nChannels, width, height])
    for (let i = 0; i < nChannels; i++) {
      ops.assign(inputArray.pick(0, i, null, null), imgArray.pick(null, null, i))
    }
    ops.divseq(inputArray, 255)
    return inputArray
  }


  const handlePredictDemoclassi = async (srcVideo, face) => {
    if (typeof inputImageRef.current !== "undefined" &&
      inputImageRef.current !== null){
        const faceWidth = face.boundingBox.bottomRight[0] - face.boundingBox.topLeft[0]
        const faceHeight = face.boundingBox.bottomRight[1] - face.boundingBox.topLeft[1]
        const faceX = face.boundingBox.topLeft[0]
        const faceY = face.boundingBox.topLeft[1]
        const [targetWidth, targetHeight] = [128, 128]
        const ctxInputImage = inputImageRef.current.getContext("2d")
        const imgScaled = getImgScaled(ctxInputImage, targetWidth, targetHeight, srcVideo, faceX, faceY, faceWidth, faceHeight)

        const imgTensor = [
          new Tensor(imgScaled.data, 'float32', [1, 3, targetWidth, targetHeight])
        ]
        const outputMapFer = await session_fer.run(imgTensor)
        const outputMapRag = await session_rag.run(imgTensor)
        let outputTensorFer = ops.argmax(ndarray(new Float32Array(outputMapFer.values().next().value.data)))
        let outputTensorAge = outputMapRag.get("age").data[0]
        let outputTensorGender = ops.argmax(ndarray(new Float32Array(outputMapRag.get("gender").data)))
        let outputTensorRace = ops.argmax(ndarray(new Float32Array(outputMapRag.get("race").data)))
        outputTensorFer = LABEL_FER[outputTensorFer]
        outputTensorGender = LABEL_GENDER[outputTensorGender]
        outputTensorRace = LABEL_RACE[outputTensorRace] 
        const finalOutput = `${outputTensorFer} ${outputTensorRace} ${outputTensorGender} --- Age ${outputTensorAge.toFixed(0)}`
        return finalOutput
      }
    return "Predicting ..."
  }


  useEffect(() => {
    const runDetection = async () => {
      const faceModel = await tf_face_detector.load(
        tf_face_detector.SupportedPackages.mediapipeFacemesh
      )
      setInterval(() => detectFace(faceModel), 100)
    }

    loadONNXModel()
    runDetection()

    return () => {
      // reinitialize models otherwise exception raised : already initialized
      session_fer = new InferenceSession({ backendHint: 'webgl' })
      session_rag = new InferenceSession({ backendHint: 'webgl' })
    }

  }, [])


  return (
    <Grid container className='democlassi-container'>
      <Grid item xs={8} className='democlassi-camera' style={{ textAlign: 'center' }}>
        {isPlaying ?
          <div
            style={{ display: 'inline-block' }}
          >
            <Webcam
              ref={webcamRef}
              mirrored={true}
              audio={false}
              forceScreenshotSourceSize={true}
              screenshotFormat="image/jpeg"
              screenshotQuality={1.0}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                textAlign: "center",
                zindex: 9,
                width: WIDTH,
                height: HEIGHT,
              }}
            />
            <canvas
              ref={canvasRef}
              style={{
                transform: 'scaleX(-1)',
                position: "absolute",
                left: 0,
                right: 0,
                textAlign: "center",
                zindex: 9,
                width: WIDTH,
                height: HEIGHT,
              }}
            />
            <canvas
              ref={inputImageRef}
              height="128"
              width="128"
              style={{
                display: "none"
              }}
            />
          </div>
          :
          <CircularProgress size='15em' />
        }

      </Grid>
      <Grid item xs={4} className='democlassi-camera' style={{ textAlign: 'center' }}>
        <Alert severity="info">
          <AlertTitle>Info</AlertTitle>
            If camera not showing after clicking the button, make sure you access the website via <strong> https</strong>
        </Alert>
        <Typography variant='h4' style={{ fontSize: '1.25vw', marginBottom: '10px',  marginTop: '50px'}}>
          If you're not scared of hackers <span role="img" aria-label="desc">👨🏿‍💻</span>, push the start button & let the MaGiC happen <span role="img" aria-label="desc">🧠</span>.
          <br/>(Don't worry the model is embedded in your browser! So No data sent anywhere! Yeah We are RGPD compliant ᕙ(▀̿̿Ĺ̯̿̿▀̿ ̿) ᕗ)
        </Typography>
        {/* <div style={{ textAlign: 'center', alignItems: 'center', alignContent: 'center'}}>
          <Avatar alt='emoji'
            src={'/static/images/upside-down-dizzy-face.png'}
            style={{ height: '100px', width: '100px', float:'left', marginRight: "10"}}
          />
          <Avatar alt='emoji'
            src={'/static/images/upside-down-dizzy-face.png'}
            style={{ height: '100px', width: '100px', float:'right'}}
          />
        </div> */}
      </Grid>
      <Grid item xs={12} className='democlassi-camera'>
        <div style={{ position: 'relative', textAlign: 'center', paddingLeft: '150px', marginBottom: '100px', marginTop: '50px' }}>
          <Button
            variant="contained"
            color="primary"
            endIcon={isPlaying ? <Pause /> : <PlayArrow />}
            onClick={handlePlayClick}
            style={{ marginRight: '50px' }}
          >
            {isPlaying ? 'Pause Camera' : 'Start Face Detection'}
          </Button>
        </div>
      </Grid>
    </Grid>

  )
}
