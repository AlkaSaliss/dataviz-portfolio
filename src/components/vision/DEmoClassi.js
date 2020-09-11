import React, { useState } from 'react'
import Webcam from 'react-webcam'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import PlayArrow from '@material-ui/icons/PlayArrow'
import Pause from '@material-ui/icons/PauseCircleFilled'
import CircularProgress from '@material-ui/core/CircularProgress'
import Avatar from '@material-ui/core/Avatar'


export default () => {

  const [isPlaying, setIsPlaying] = useState(false)

  const handlePlayClick = () => setIsPlaying(!isPlaying)


  return (
    <Grid container className='democlassi-container'>
      <Grid item xs={8} className='democlassi-camera' style={{ textAlign: 'center' }}>
        {isPlaying ?
          <Webcam
            audio={false}
            height={500}
            screenshotFormat="image/jpeg"
            width={600}
          />
          :
          <CircularProgress size='15em' />
        }

      </Grid>
      <Grid item xs={4} className='democlassi-camera' style={{ textAlign: 'center' }}>
        <Avatar alt='emoji'
          src={'/static/images/upside-down-dizzy-face.png'}
          style={{height: '250px', width: '250px'}}
        />
      </Grid>
      <Grid item xs={12} className='democlassi-camera'>
        <div style={{ textAlign: 'center', marginBottom: '50px', marginTop: '50px' }}>
          <Button
            variant="contained"
            color="primary"
            endIcon={isPlaying ? <Pause /> : <PlayArrow />}
            onClick={handlePlayClick}
            style={{ marginRight: '50px' }}
          >
            {isPlaying ? 'Pause Camera' : 'Play Camera'}
          </Button>
        </div>
      </Grid>
    </Grid>

  )
}
