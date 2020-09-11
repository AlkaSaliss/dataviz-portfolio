import React from 'react'
import Grid from '@material-ui/core/Grid'

export default (props) => {

  return (
    <div className='experience'>
      <Grid container style={{ marginBottom: '2em' }}>
        <Grid item xs={4}>
          <p style={{ fontSize: '1vw' }}>{props.startYear} - {props.endYear} </p>
        </Grid>
        <Grid item xs={8}>
          <h4 style={{ marginTop: '0px', fontSize: '1vw' }} >{props.jobName}</h4>
          <p> <strong>Company: </strong>{props.company} | <strong>Team: </strong>{props.team}</p>
          <p> <strong>Subject: </strong>{props.subject}</p>
          <p> <strong>Methods: </strong>{props.methods}</p>
          <p> <strong>Tools: </strong>{props.tools}</p>
          <p>{props.jobDescription}</p>
        </Grid>
      </Grid>
    </div>
  )
}