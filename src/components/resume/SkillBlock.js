import React from 'react'
import Grid from '@material-ui/core/Grid'


export default (props) => {

  return (
    <Grid container>
      <Grid item xs={2}>
        <div style={{ fontSize: '2.5vmin', fontWeight: 'bold' }}>
          {props.blockName}
        </div>
      </Grid>
      <Grid item xs={10}>
        <div>
          {props.children}
        </div>
      </Grid>


    </Grid>
  )
}