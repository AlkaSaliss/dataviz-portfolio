import React from 'react'
import CircularProgress from '@material-ui/core/CircularProgress'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'


export default () => {
  return (
    <Grid container className='nlp-placeholder-container'>
      <Grid item xs={12} className='nlp-placeholder-circular' style={{ textAlign: 'center' }}>
        <CircularProgress size='15em' />
      </Grid>
      <Grid item xs={12} className='nlp-placeholder-circular' style={{ textAlign: 'center' }}>
        <Typography variant='h4' style={{ fontSize: '1.25vw', marginBottom: '10px', marginTop: '50px' }}>
          Work In Progress <span role="img" aria-label="desc">☕☕☕</span>
        </Typography>
      </Grid>
    </Grid>)
}
