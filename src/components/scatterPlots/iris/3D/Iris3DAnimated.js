import React from 'react'
import * as d3 from 'd3'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import Grid from '@material-ui/core/Grid'
import { rowProcessor } from '../irisUtils'
import Scatter3D from './Scatter3D'


const formControlStyle = {
  marginLeft: '5em',
  marginRight: '5em',
  minWidth: 120,
  height: '200px'
}


export default class Iris3D extends React.Component {

  constructor(props) {

    super(props)

    this.state = {
      data: null,
      xColumn: 'PetalLengthCm',
      yColumn: 'PetalWidthCm',
      zColumn: 'SepalLengthCm',
      xScale: null,
      yScale: null,
      zScale: null,
      colorScale: null,
      clickedCategory: null
    }
  }

  componentDidMount() {

    d3.csv('static/data/Iris.csv', rowProcessor).then(data => {

      const xExtent = d3.extent(data.map(d => d[this.state.xColumn]))
      const yExtent = d3.extent(data.map(d => d[this.state.yColumn]))
      const zExtent = d3.extent(data.map(d => d[this.state.zColumn]))
      const colorExtent = [...new Set(data.map(d => d.Species))]

      const xScale = d3.scaleLinear().domain(xExtent).range([-1, 1])
      const yScale = d3.scaleLinear().domain(yExtent).range([-1, 1])
      const zScale = d3.scaleLinear().domain(zExtent).range([-1, 1])
      const colorScale = d3.scaleOrdinal().domain(colorExtent).range(['red', 'steelblue', 'green'])

      this.setState((prevState, prevProps) => (
        {
          ...prevState,
          data,
          xScale,
          yScale,
          zScale,
          colorScale
        }
      )
      )
    }
    ).then(() => {
      this.drawLegend(this.state.colorScale)
    })

  }

  componentDidUpdate() {
    this.drawLegend(this.state.colorScale)
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

  handleZColumnChange = (event) => {
    if (event.target.value !== this.state.zColumn) {
      this.setState((prevState, props) =>
        ({
          ...prevState,
          zColumn: event.target.value
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

  drawLegend = (colorScale) => {
    // Adding Legend
    const legendRadius = 30
    const spacing = 30
    const legendYOffset = 50
    const n = colorScale.domain().length
    const legendGroup = d3.select('.legend-group-3d').selectAll('rect').data([null])
    legendGroup.enter().append('rect')
      .merge(legendGroup)
      .attr('x', -legendRadius * 2)
      .attr('y', -legendRadius * 2)
      .attr('rx', 10)
      .attr('width', 135)
      .attr('height', spacing * n + legendRadius * 0.7)
      .attr('fill', 'black')
      .attr('opacity', 0.1)
      .attr('transform', `translate(60, ${legendYOffset + 20})`)


    let legendCircles = d3.select('.legend-group-3d').selectAll('.circle-tick-3d').data(colorScale.domain())
    legendCircles.exit().remove()

    let legendCirclesEnter = legendCircles.enter()
      .append('g')
      .attr('class', 'circle-tick-3d')
      .attr('transform', (d, i) => `translate(12, ${i * spacing + legendYOffset - 17})`)

    legendCircles = legendCircles.merge(legendCirclesEnter)

    legendCirclesEnter.append('circle')
      .attr('r', 10)
      .attr('fill', colorScale)
      .attr('opacity', 0.8)

    legendCirclesEnter.append('text')
      .attr('class', 'text-legend')
      .text(d => d)
      .attr('dy', '0.32em')
      .attr('x', 20)
  }



  render() {
    const listColumns = ['PetalLengthCm', 'PetalWidthCm', 'SepalLengthCm', 'SepalWidthCm']
    if (this.state.data) {


      const xExtent = d3.extent(this.state.data.map(d => d[this.state.xColumn]))
      const yExtent = d3.extent(this.state.data.map(d => d[this.state.yColumn]))
      const zExtent = d3.extent(this.state.data.map(d => d[this.state.zColumn]))
      const colorExtent = [...new Set(this.state.data.map(d => d.Species))]

      const xScale = d3.scaleLinear().domain(xExtent).range([-1, 1])
      const yScale = d3.scaleLinear().domain(yExtent).range([-1, 1])
      const zScale = d3.scaleLinear().domain(zExtent).range([-1, 1])

      const colorScale = d3.scaleOrdinal().domain(colorExtent).range(['red', 'steelblue', 'green'])



      return (

        <Grid container >
          <Grid item xs={12} className='iris3d-form-container' style={{ marginBottom: '0px' }}>
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
            <FormControl style={formControlStyle}>
              <InputLabel id="demo-simple-select-label">Z Axis</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={this.state.zColumn}
                onChange={this.handleZColumnChange}
              >
                {listColumns.map(
                  col => (<MenuItem value={col} key={col}>{col}</MenuItem>)
                )}
              </Select>
            </FormControl>
          </Grid>

          <Grid
            item
            xs={8}
            className='iris3d-plot-container'
          >
            <Scatter3D
              data={this.state.data}
              xScale={xScale}
              yScale={yScale}
              zScale={zScale}
              colorScale={colorScale}
              xColumn={this.state.xColumn}
              yColumn={this.state.yColumn}
              zColumn={this.state.zColumn}
            />
          </Grid>
          <Grid item xs={4} className='legend-container-3d'>
            <svg height={150} width={300}>
              <g className='legend-group-3d'>
              </g>
            </svg>
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