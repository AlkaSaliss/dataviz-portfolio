import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Avatar from '@material-ui/core/Avatar'
import SkillBlock from './SkillBlock'
import Skills from './Skills'
import Education from './Education'
import Experience from './Experience'


const useStyles = makeStyles((theme) => ({
  resumeRoot: {
    display: 'flex',
    flexWrap: 'wrap',
    position: 'fixed',
    height: '100%',
  },
  paperLeft: {
    width: '40%',
    height: '100hv',
    padding: '1.1vmin'
  },
  paperRight: {
    width: '60%',
    height: '100%',
    overflowY: 'auto'
  },
  avatar: {
    // width: '250px',
    // height: '250px'
    width: '30vmin',
    height: '30vmin',
  }
}))

export default (props) => {
  const classes = useStyles()

  return (
    <div className={classes.resumeRoot} onClick={props.handleClickAway}>
      <Paper className={`${classes.paperLeft} paper-left`} elevation={0}>
        <Grid container>
          <Grid item xs={12} style={{ display: 'flex', justifyContent: 'center' }}>
            <Avatar alt="Profil" src="/static/images/alka2.jpg" className={classes.avatar} />
          </Grid>
          <Grid item xs={12}>
            <h2 style={{ paddingTop: '0.2em', textAlign: 'center', color: 'white', fontSize: '3vmin' }} >Mahamadou S. A. ALKA</h2>
            <h4 style={{ color: 'white', textAlign: 'center', fontSize: '2.5vmin' }} > Senior consultant </h4>
            <h5 style={{ color: 'white', textAlign: 'center', fontSize: '2vmin' }} > Data Science / Machine Learning</h5>
            <hr
              style={{
                borderTop: '3px solid #833fb2',
                width: '50%',
                margin: 'auto',
                marginBottom: '1em',
                borderBottom: 'none'
              }}
            />
            <p style={{ textAlign: 'justify', fontSize: '2.5vmin', color: '#f6fcfb' }}>
              Currently working as senior data scientist consultant at Quantmetry, on different subject such as NLP, computer vision. 
            </p>
            <p style={{ fontSize: '2.5vmin', color: '#f6fcfb' }}>
              In my free time, I am also interested in subjects related to Computer Vision, NLP, on-device ML and data visualization.
              You can fin some of my side projects on this website and also 
            <a href='https://github.com/AlkaSaliss?tab=repositories' rel="noopener noreferrer" target='_blank' style={{ textDecoration: 'none', color: 'blue' }} > on github here.</a>
            </p>
          </Grid>
        </Grid>

      </Paper>
      <Paper className={`${classes.paperRight} paper-right`} elevation={3}>
        <h2>Experience</h2>
        <Experience
          startYear='october 2021'
          endYear='now'
          jobName='Senior Data Scientist'
          company='Quantmetry, Paris, France'
          team='Computer Vision'
          subject="Working with various customer on different subjects, such as tweets analysis, web 
                  scraping for supply chain, training content creation for reliable AI, ..."
          methods="Machine learning | Deep learning | Data analysis/visualization | Software engineering"
          tools="Python | Pytorch | Scikit-learn | Docker | Linux | Spark"
        />
        <Experience
          startYear='Nov 2018'
          endYear='Oct 2021'
          jobName='Research Engineer - Machine Learning'
          company='Atos, Les Clayes-Sous-Bois, France'
          team='Machine Intelligence for Cyber Security'
          subject="Developed computer vision segmentation models for video surveillance analysis. Also worked on machine learning based frameworks for anomaly detection in cyber security. "
          methods="Machine learning | Deep learning | Data analysis/visualization | Software engineering"
          tools="Python | Pytorch | Tensorflow/Keras | Scikit-learn | Docker | Linux | Spark"
        />
        <Experience
          startYear='Apr'
          endYear='Sep 2018'
          jobName='Deep learning intern'
          company='Equancy , Paris, France'
          team='Data Intelligence'
          subject="Deep learning based approaches for 'translating natural language questions to SQL queries'"
          methods="Sequence-to-sequence Deep Learning models"
          tools="Python | Tensorflow/Keras | Spacy | Scikit-learn | AWS"
        />
        <Experience
          startYear='June'
          endYear='Aug 2017'
          jobName='Statistician intern'
          company='Le Crédit Lyonnais (LCL), Villejuif, France'
          team='Quantitative Models Validation'
          subject="Anomaly analysis on credit risk data"
          methods="Regression models | Exploratory data analysis"
          tools="SAS"
        />
        <Experience
          startYear='Feb'
          endYear='June 2016'
          jobName='Statistician/Economist intern'
          company='Laboratoire de Recherches Economiques et Monétaires (LAREM), Dakar, Sénégal'
          team='LAREM'
          subject="Determinant of innovation in small & medium enterprises in Ivory-Coast"
          methods="Multivariate Probit models | Exploratory data analysis"
          tools="R | Stata"
        />

        <hr style={{ borderTop: '3px solid blue' }} />

        <h2>Education</h2>
        <Education
          startYear={2020}
          endYear={""}
          degree="Data Engineering Nanodegree"
          schoolName='Udacity -Online'
          major="ETL pipelines with PostgreSQL | ETL with AWS RedShift/S3 | Big Data with Pyspark and AWS EMR | Data pipelines with Airflow"
        />
        <Education
          startYear={2016}
          endYear={2018}
          degree="Engineering degree in Data Science / Statistics / Data Engineering"
          schoolName='Ensai - Rennes, France'
          major="Machine Learning | Statistics/Econometrics | Big Data technologies | Software & Web Development"
        />
        <Education
          startYear={2012}
          endYear={2016}
          degree="Engineering degree in Statistics / Economics"
          schoolName='Ensae - Dakar, Senegal'
          major="Statistical modelling | Econometrics | Survey Data collection and analysis | Economics"
        />
        <hr style={{ borderTop: '3px solid blue' }} />

        <h2>Skills</h2>

        <SkillBlock blockName='Data Science'>
          <Skills
            skill='Linear models | Tree-based models | Clustering techniques (Scikit-learn)'
            progress={90}
          />
          <Skills
            skill='Deep Learning (Pytorch, Tensorflow/Keras)'
            progress={90}
          />
          <Skills
            skill='Data Analysis (Pandas, Numpy)'
            progress={90}
          />
          <Skills
            skill='Data Viz (d3.js, Matplotlib, Bokeh, Plotly)'
            progress={80}
          />
        </SkillBlock>
        <hr style={{ borderTop: '1px solid #c1cfcf' }} />
        <SkillBlock blockName='Software | Web | Mobile Dev'>
          <Skills
            skill='Python'
            progress={95}
          />
          <Skills
            skill='Linux | Bash'
            progress={70}
          />
          <Skills
            skill='Git'
            progress={80}
          />
          <Skills
            skill='Docker'
            progress={70}
          />
          <Skills
            skill='Javascript | React | React-Native'
            progress={80}
          />
          <Skills
            skill='HTML | CSS'
            progress={70}
          />
        </SkillBlock>
      </Paper>
    </div>
  )
}