import React from 'react'
import Grid from '@material-ui/core/Grid'


export default (props) => {

  return (
    <div className='education'>
      <Grid container>
        <Grid item xs={4}>
          <p style={{ fontSize: '2.5vmin' }}>{props.startYear} - {props.endYear} </p>
        </Grid>
        <Grid item xs={8}>
          <h4 style={{ marginTop: '0px', fontSize: '2.5vmin' }} >{props.degree}</h4>
          <p> <strong>School: </strong>{props.schoolName}</p>
          <p> <strong>Major: </strong>{props.major}</p>
        </Grid>
      </Grid>
    </div>
  )
}