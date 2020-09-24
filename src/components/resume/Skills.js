import React from 'react'
import LinearProgress from '@material-ui/core/LinearProgress';
import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'


const BorderLinearProgress = withStyles((theme) => ({
  root: {
    height: 10,
    borderRadius: 5,
  },
  colorPrimary: {
    backgroundColor: theme.palette.grey[theme.palette.type === 'light' ? 200 : 700],
  },
  bar: {
    borderRadius: 5,
    backgroundColor: '#1a90ff',
  },
}))(LinearProgress)


export default (props) => {
  return (
    <div className='skill'>
      <Grid container>
        <Grid item xs={4} style={{ textAlign: 'right' }}>
          <span> {props.skill}</span>
        </Grid>
        <Grid item xs={8}>
          <BorderLinearProgress
            variant="determinate"
            value={props.progress}
            style={{
              margin: 'auto',
              width: '75%',
              transform: `translate(0, 0.8em)`
            }}
          />
        </Grid>
      </Grid>
    </div>
  )
}