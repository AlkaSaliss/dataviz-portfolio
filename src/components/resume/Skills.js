import React from 'react'
import LinearProgress from '@material-ui/core/LinearProgress';
import Grid from '@material-ui/core/Grid'


export default (props) => {
  return (
    <div className='skill'>
      <Grid container>
        <Grid item xs={4} style={{ textAlign: 'right' }}>
          <span> {props.skill}</span>
        </Grid>
        <Grid item xs={8}>
          <LinearProgress
            variant='buffer'
            value={props.progress}
            valueBuffer={50}
            style={{
              margin: 'auto',
              width: '75%',
              backgroundColor: '#70ace6',
              transform: `translate(0, 0.8em)`
            }}
          />
        </Grid>
      </Grid>
    </div>
  )
}