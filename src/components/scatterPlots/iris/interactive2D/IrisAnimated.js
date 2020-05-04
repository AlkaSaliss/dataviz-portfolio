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
  height: '200px'
}


export default class IrisAnimated extends React.Component {

  constructor(props) {

    super(props)

    this.state = {
      data: null,
      xColumn: 'PetalLengthCm',
      yColumn: 'PetalWidthCm',
      // xScale: null,
      // yScale: null,
      // colorScale: null,
      clickedCategory: null
    }
  }

  componentDidMount() {

    // const dimensions = this.getDimensions()

    d3.csv('static/data/Iris.csv', rowProcessor).then(data => {

      // const xExtent = d3.extent(data.map(d => d[this.state.xColumn]))
      // const yExtent = d3.extent(data.map(d => d[this.state.yColumn]))
      // const colorExtent = [...new Set(data.map(d => d.Species))]

      // const xScale = d3.scaleLinear().domain(xExtent).range([0, dimensions.innerWidth])
      // const yScale = d3.scaleLinear().domain(yExtent).range([0, dimensions.innerHeight])
      // const colorScale = d3.scaleOrdinal().domain(colorExtent).range(['red', 'steelblue', 'green'])

      this.setState((prevState, prevProps) => (
        {
          ...prevState,
          data,
          // xScale,
          // yScale,
          // colorScale
        }
      )
      )
    }
    )
  }


  getDimensions = () => {
    const width = 1000
    const height = 600
    const margins = { left: 70, right: 150, top: 50, bottom: 50 }
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

      const dimensions = this.getDimensions()

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
        axisLabelPositions: { axisLabelPositionX: dimensions.innerWidth / 2, axisLabelPositionY: 45 },
        innerHeight: dimensions.innerHeight,
        removeTickLine: '.domain',
        translate: `translate(${0},${dimensions.innerHeight})`,
      }

      const yProps = {
        orient: 'Left',
        scale: yScale,
        axisLabel: this.state.yColumn,
        axisLabelText: `${this.state.yColumn}`,
        axisLabelPositions: { axisLabelPositionX: dimensions.innerWidth / 3, axisLabelPositionY: dimensions.innerHeight / 11 },
        innerWidth: dimensions.innerWidth,
        removeTickLine: '.domain',
        translate: `translate(${0},${0})`,
      }

      return (

        <Grid container className='iris-grid-container'>
          <Grid item xs={12} className='iris-form-container'>
            <FormControl style={formControlStyle}>
              <InputLabel id="demo-simple-select-label">X Axis</InputLabel>
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
              <InputLabel id="demo-simple-select-label">Y Axis</InputLabel>
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

          <Grid item xs={12} style={{ textAlign: 'center', marginBottom: '0.05vw' }}>
            <Typography variant='h6' style={{ fontSize: '1vw' }}>
              Click on any point from the Plot or Legend to select a given Species. Click again to unselect
            </Typography>
          </Grid>

          <Grid
            item
            xs={12}
            className='iris-plot-container'
          >
          {/* this.state.data && this.state.xScale && this.state.yScale && this.state.colorScale && */}
            {
              this.state.data &&
              <svg width={dimensions.width} height={dimensions.height}>
                <g transform={`translate(${dimensions.margins.left}, ${dimensions.margins.top})`}>
                  <Axes
                    axisProps={{ xProps, yProps }}
                  />

                  <text y={-20} x={250} fontSize='1.8vw' >{'Iris Scatter Plot'}</text>

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
        <Grid item xs={12} style={{ height: '200px' }}>
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