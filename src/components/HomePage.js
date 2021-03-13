import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Avatar from '@material-ui/core/Avatar'
import Grid from '@material-ui/core/Grid'
import Typist from 'react-typist'
import { Icon } from '@iconify/react'
import stackOverflow from '@iconify/icons-mdi/stack-overflow'



const useStyles = makeStyles((theme) => ({
  homePage: {
    position: 'fixed',
    width: '100%',
    textAlign: 'center',
    display: 'flex',
    flexGrow: 1,
    borderRadius: 0
  },
  avatar: {
    width: '30vmin',
    height: '30vmin',
    textAlign: 'center',
    margin: 'auto',
    top: '3vw',
    bottom: '15vh',
  }
}));



export default (props) => {

  const classes = useStyles()

  return (

    <Paper className={`${classes.homePage} home-page`} onClick={props.handleClickAway} >
      <Grid container className='home-grid'>
        <Grid item xs={12}>
          <Avatar alt="Profil" src="/static/images/alka2.jpg" className={`avatar-img ${classes.avatar}`} />
        </Grid>
        <Grid item xs={12}>
          <div className='banner-text' >
            <Typist avgTypingDelay={50} cursor={{ show: false, blink: false }} >
              <h2>Mahamadou S. A. ALKA</h2>
              <Typist.Delay ms={1000} />
              <h4 >
                <span>Statistici</span>
                <Typist.Backspace count={10} delay={500} />
                <span>Machine Learning Research Engineer</span>
              </h4>
            </Typist>

            <hr />
            <p> Python | Pytorch | Tensorflow/Keras | Scikit-Learn | Pandas/Numpy | D3.js/Matplotlib/Bokeh </p>
            <div className='social-links' >
              <a href='https://www.linkedin.com/in/mahamadou-salissou-aboubacar-alka-038491133' rel="noopener noreferrer" target='_blank' >
                <i className="fa fa-linkedin-square" aria-hidden='true'></i>
              </a>

              <a href='https://github.com/AlkaSaliss?tab=repositories' rel="noopener noreferrer" target='_blank' >
                <i className="fa fa-github-square" aria-hidden='true'></i>
              </a>

              <a href='https://twitter.com/salissoualka' rel="noopener noreferrer" target='_blank' >
                <i className="fa fa-twitter-square" aria-hidden='true'></i>
              </a>

              <a href='https://stackoverflow.com/users/7437524/alka?tab=profile' rel="noopener noreferrer" target='_blank' >
                <Icon icon={stackOverflow} className='stack-overflow-icon' />
              </a>
            </div>
          </div>
        </Grid>
      </Grid>
    </Paper>

  )
}
