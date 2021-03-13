import React from 'react'
import * as d3 from 'd3'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Axes from './Axes'
import ScatterCircles from './ScatterCircles'
import { rowProcessor } from '../irisUtils'


const formControlStyle = {
  marginLeft: '5em',
  marginRight: '5em',
  minWidth: 120,
  height: '4vmin'
}

const inputLabelStyle = {
  fontSize: "1.5em",
  paddingBottom: "5vmin"
}


const getDimensions = () => {

  // const width = window.innerWidth * 0.90
  // const height = window.innerHeight * 0.60
  // const margins = { left: width*0.07, right: width*0.15, top: height*0.084, bottom: height*0.084 }
  // const innerWidth = width - margins.left - margins.right
  // const innerHeight = height - margins.top - margins.bottom


  const width = window.innerWidth * 0.9
  const height = window.innerHeight * 0.55
  const margins = { left: width*0.07, right: width*0.12, top: height*0.084, bottom: height*0.084 }
  const innerWidth = width - margins.left - margins.right
  const innerHeight = height - margins.top - margins.bottom

  const dimensions = {
    width,
    height,
    margins,
    innerWidth,
    innerHeight
  }
  return dimensions
}


export default class IrisAnimated extends React.Component {

  constructor(props) {

    super(props)

    this.state = {
      data: null,
      xColumn: 'PetalLengthCm',
      yColumn: 'PetalWidthCm',
      clickedCategory: null,
      dimensions: getDimensions()
    }
  }

  componentDidMount() {

    window.addEventListener('resize', this.handleResize)

    d3.csv('static/data/Iris.csv', rowProcessor).then(data => {
      this.setState((prevState, prevProps) => (
        {
          ...prevState,
          data,
        }
      )
      )
    }
    )
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize)
  }

  handleResize = () => {
    const dimensions = getDimensions()
    this.setState((prevState, props) =>
        ({
          ...prevState,
          dimensions
        })
      )
  }


  // getDimensions = () => {

  //   const width = 1000
  //   const height = 600
  //   const margins = { left: 70, right: 150, top: 50, bottom: 50 }
  //   const innerWidth = width - margins.left - margins.right
  //   const innerHeight = height - margins.top - margins.bottom

  //   const dimensions = {
  //     width,
  //     height,
  //     margins,
  //     innerWidth,
  //     innerHeight
  //   }
  //   return dimensions
  // }


  handleXColumnChange = (event) => {
    if (event.target.value !== this.state.xColumn) {
      this.setState((prevState, props) =>
        ({
          ...prevState,
          xColumn: event.target.value
        })
      )
    }
  }

  handleYColumnChange = (event) => {
    if (event.target.value !== this.state.yColumn) {
      this.setState((prevState, props) =>
        ({
          ...prevState,
          yColumn: event.target.value
        })
      )
    }
  }

  setClickedCategory = (cat) => {
    this.setState(
      (prevState, props) => {
        if (prevState.clickedCategory === cat) {
          return {
            ...prevState,
            clickedCategory: null
          }
        }
        return {
          ...prevState,
          clickedCategory: cat
        }

      }
    )

  }

  render() {
    const listColumns = ['PetalLengthCm', 'PetalWidthCm', 'SepalLengthCm', 'SepalWidthCm']
    if (this.state.data) {

      // const dimensions = this.getDimensions()
      const dimensions = this.state.dimensions

      const xExtent = d3.extent(this.state.data.map(d => d[this.state.xColumn]))
      const yExtent = d3.extent(this.state.data.map(d => d[this.state.yColumn]))
      const colorExtent = [...new Set(this.state.data.map(d => d.Species))]

      const xScale = d3.scaleLinear().domain(xExtent).range([0, dimensions.innerWidth]).nice()
      const yScale = d3.scaleLinear().domain(yExtent).range([dimensions.innerHeight, 0]).nice()
      const colorScale = d3.scaleOrdinal().domain(colorExtent).range(['red', 'steelblue', 'green'])

      const xProps = {
        orient: 'Bottom',
        scale: xScale,
        axisLabel: this.state.xColumn,
        axisLabelText: `${this.state.xColumn}`,
        axisLabelPositions: { axisLabelPositionX: dimensions.innerWidth / 2,
           axisLabelPositionY: dimensions.innerHeight/11 },
        innerHeight: dimensions.innerHeight,
        removeTickLine: '.domain',
        translate: `translate(${0},${dimensions.innerHeight})`,
      }

      const yProps = {
        orient: 'Left',
        scale: yScale,
        axisLabel: this.state.yColumn,
        axisLabelText: `${this.state.yColumn}`,
        axisLabelPositions: { axisLabelPositionX: dimensions.innerWidth / 6, axisLabelPositionY: dimensions.innerHeight / 11 },
        innerWidth: dimensions.innerWidth,
        removeTickLine: '.domain',
        translate: `translate(${0},${0})`,
      }
      
      return (

        <Grid container className='iris-grid-container'>
          <Grid item xs={12} style={{ textAlign: 'center', marginBottom: '0.5em' }}>
            <Typography variant='h6' style={{ fontSize: '1.0em' }}>
              Change interactively X or Y axis using dropdown Menus. Hover on a given point to display (x, y) 
              values.
              Click on any point from plot or legend highlight all points from the same color. Click again to unselect
            </Typography>
          </Grid>
          <Grid item xs={12} className='iris-form-container'>
            <FormControl style={formControlStyle}>
              <InputLabel id="demo-simple-select-label" style={inputLabelStyle}>X Axis</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={this.state.xColumn}
                onChange={this.handleXColumnChange}
              >
                {listColumns.map(
                  col => (<MenuItem value={col} key={col}>{col}</MenuItem>)
                )}
              </Select>
            </FormControl>
            <FormControl style={formControlStyle}>
              <InputLabel id="demo-simple-select-label" style={inputLabelStyle}>Y Axis</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={this.state.yColumn}
                onChange={this.handleYColumnChange}
              >
                {listColumns.map(
                  col => (<MenuItem value={col} key={col}>{col}</MenuItem>)
                )}
              </Select>
            </FormControl>
          </Grid>

          <Grid
            item
            xs={12}
            className='iris-plot-container'
          >
            {
              this.state.data &&
              <svg width={dimensions.width} height={dimensions.height}>
                <g transform={`translate(${dimensions.margins.left}, ${dimensions.margins.top})`}>
                  <Axes
                    axisProps={{ xProps, yProps }}
                  />

                  <text x={dimensions.width*0.25} y={-dimensions.height/27} fontSize='1.25em' >{'Iris Scatter Plot'}</text>

                  <ScatterCircles
                    data={this.state.data}
                    columns={{ xColumn: this.state.xColumn, yColumn: this.state.yColumn, catColumn: 'Species' }}
                    scales={{ xScale: xScale, yScale: yScale, colorScale: colorScale }}
                    id='Id'
                    innerWidth={dimensions.innerWidth}
                    innerHeight={dimensions.innerHeight}
                    clickedCategory={this.state.clickedCategory}
                    setClickedCategory={this.setClickedCategory}
                  />
                </g>
              </svg>

            }
          </Grid>

        </Grid>

      )

    }

    return (

      <Grid container >
        <Grid 
          item
          xs={12} 
          // style={{ height: '200px' }}
        >
          <FormControl style={formControlStyle}>
            <InputLabel id="demo-simple-select-label">X column</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={this.state.xColumn}
              onChange={this.handleXColumnChange}
            >
              {listColumns.map(
                col => (<MenuItem value={col} key={col}>{col}</MenuItem>)
              )}
            </Select>
          </FormControl>
          <FormControl style={formControlStyle}>
            <InputLabel id="demo-simple-select-label">Y Column</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={this.state.yColumn}
              onChange={this.handleYColumnChange}
            >
              {listColumns.map(
                col => (<MenuItem value={col} key={col}>{col}</MenuItem>)
              )}
            </Select>
          </FormControl>
        </Grid>

        <Grid
          item
          xs={12}
        >

        </Grid>

      </Grid>

    )

  }


}