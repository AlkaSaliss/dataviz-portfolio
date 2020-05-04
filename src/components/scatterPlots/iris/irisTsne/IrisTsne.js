import React from 'react'
import * as d3 from 'd3'
import Button from '@material-ui/core/Button'
import PlayArrow from '@material-ui/icons/PlayArrow'
import Pause from '@material-ui/icons/PauseCircleFilled'
import Stop from '@material-ui/icons/Stop'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Slider from '@material-ui/core/Slider'
import { rowProcessor } from '../irisUtils'

const tSNEJs = require('../../../../externalLibs/tsne')
function myDelayer(ms) {
  return new Promise(res => setTimeout(res, ms))
}


export default class IrisAnimated extends React.Component {

  constructor(props) {

    super(props)

    this.state = {
      data: null,
      dataTSNE: null,
      plotContainer: null,
      colorScale: null,
      isPlaying: false,
      tsne: null,
      circleGroup: null,
      initialPerplexity: 10,
      initialEpsilon: 10
    }
  }

  componentDidMount() {

    const dimensions = this.getDimensions()

    d3.csv('static/data/Iris.csv', rowProcessor).then(data => {

      const dataTSNE = data.map(d => ({ id: d.Id, x: Math.random(), y: Math.random(), Species: d.Species }))

      const colorExtent = [...new Set(dataTSNE.map(d => d.Species))]
      const colorScale = d3.scaleOrdinal().domain(colorExtent).range(['red', 'steelblue', 'green'])


      const tsne = new tSNEJs.tSNE(
        {
          epsilon: 10,
          perplexity: 10,
          dim: 2
        }
      )
      tsne.initDataRaw(
        data.map(d => ([d.PetalLengthCm, d.PetalWidthCm, d.SepalLengthCm, d.SepalWidthCm]))
      )

      var circleGroup = d3.select('.iris-tsne-plot-container')
        .selectAll('.circle-tsne-group')
        .data(dataTSNE, d => d.id)

      // Exit 
      circleGroup.exit().remove()

      // Enter / update
      var circleGroupEnter = circleGroup.enter()
        .append('g')
        .attr('class', 'circle-tsne-group')

      circleGroup = circleGroup.merge(circleGroupEnter)

      circleGroupEnter.append('circle')
        .attr('class', 'circle-tsne-point')
        .attr('cx', dimensions.innerWidth / 2)
        .attr('cy', dimensions.innerHeight / 2)
        .attr('r', 0)

      const embeddings = tsne.getSolution()
      const xExtent = d3.extent(embeddings.map(d => d[0]))
      const yExtent = d3.extent(embeddings.map(d => d[1]))

      const xScale = d3.scaleLinear().domain(xExtent).range([5, dimensions.innerWidth - 5])
      const yScale = d3.scaleLinear().domain(yExtent).range([dimensions.innerHeight - 5, 5])

      circleGroup.select('.circle-tsne-point')
        .transition().duration(1000)
        .delay((d, i) => i * 10)
        .attr('cx', (d, i) => xScale(embeddings[i][0]))
        .attr('cy', (d, i) => yScale(embeddings[i][1]))
        .attr('r', 10)
        .attr('fill', d => colorScale(d.Species))
        .attr('fill-opacity', 0.8)

      this.setState((prevState, prevProps) => (
        {
          ...prevState,
          data,
          dataTSNE,
          xScale,
          yScale,
          colorScale,
          tsne,
          circleGroup
        }
      )
      )
    }
    )

  }

  componentDidUpdate() {

    this.drawCircles()
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

  handlePlayClick = () => {
    this.setState(
      (prevState, props) => (
        {
          ...prevState,
          isPlaying: !prevState.isPlaying
        }
      )
    )
  }

  handleResetClick = () => {
    this.setState(
      (prevState, props) => {
        const tsne = new tSNEJs.tSNE(
          {
            epsilon: 10,
            perplexity: 10,
            dim: 2
          }
        )
        tsne.initDataRaw(prevState.data.map(d => ([d.PetalLengthCm, d.PetalWidthCm, d.SepalLengthCm, d.SepalWidthCm])))

        const embeddings = tsne.getSolution()
        const { xScale, yScale } = this.computeScales(embeddings)

        prevState.circleGroup.select('.circle-tsne-point')
          .transition().duration(1000)
          .delay((d, i) => i * 10)
          .attr('cx', (d, i) => xScale(embeddings[i][0]))
          .attr('cy', (d, i) => yScale(embeddings[i][1]))
          .attr('r', 10)
          .attr('fill', d => prevState.colorScale(d.Species))
          .attr('fill-opacity', 0.8)

        return {
          ...prevState,
          isPlaying: false,
          initialPerplexity: 10,
          initialEpsilon: 10,
          tsne
        }
      }

    )
  }

  handleSliderChange = (param, value) => {
    this.setState(
      (prevState, props) => {
        const tsne = prevState.tsne
        tsne[param] = value
        return {
          ...prevState,
          isPlaying: false,
          tsne
        }
      }
    )
  }

  computeScales = (data) => {
    const dimensions = this.getDimensions()
    const xExtent = d3.extent(data.map(d => d[0]))
    const yExtent = d3.extent(data.map(d => d[1]))

    const xScale = d3.scaleLinear().domain(xExtent).range([5, dimensions.innerWidth - 5])
    const yScale = d3.scaleLinear().domain(yExtent).range([dimensions.innerHeight - 5, 5])

    return { xScale, yScale }
  }

  drawCircles = () => {

    const animate = async () => {
      while (this.state.isPlaying) {

        this.state.tsne.step()
        // console.log('iter '+this.state.tsne['iter']+' perp '+this.state.tsne['perplexity']+' lr '+this.state.tsne['epsilon'])
        const embeddings = this.state.tsne.getSolution()
        const { xScale, yScale } = this.computeScales(embeddings)

        this.state.circleGroup.select('.circle-tsne-point')
          .transition().duration(1000)
          .delay((d, i) => i * 10)
          .attr('cx', (d, i) => xScale(embeddings[i][0]))
          .attr('cy', (d, i) => yScale(embeddings[i][1]))
          .attr('r', 10)
          .attr('fill', d => this.state.colorScale(d.Species))
          .attr('fill-opacity', 0.8)
        await myDelayer(1020)
      }
    }

    animate()

  }

  render() {
    const dimensions = this.getDimensions()

    return (

      <Grid container className='iris-grid-container-tsne'>
        <Grid item xs={12} style={{ textAlign: 'center', marginBottom: '2vw' }}>
          <Typography variant='h6' style={{ fontSize: '1.1vw' }}>
            This program runs interactively t-SNE to reduce iris 4-dimensional dataset to 2 dimensions.
        </Typography>
          <Typography variant='h6' style={{ fontSize: '1.1vw' }}>
            t-SNE hyperparameters can be set using the left-side interactive widgets. Press Play to start ...
        </Typography>
        </Grid>

        <Grid item xs={4} >
          <div className='iris-form-container-tsne'>
            <div style={{ textAlign: 'left', marginBottom: '50px', marginTop: '50px' }}>
              <Button
                variant="contained"
                color="primary"
                endIcon={this.state.isPlaying ? <Pause /> : <PlayArrow />}
                onClick={this.handlePlayClick}
                style={{ marginRight: '50px' }}
              >
                {this.state.isPlaying ? 'Pause' : 'Play'}
              </Button>
              <Button
                variant="contained"
                color="primary"
                endIcon={<Stop />}
                onClick={this.handleResetClick}
              >
                Reset
            </Button>
            </div>
            <div style={{ width: '200px', alignContent: 'center', textAlign: 'center' }}>
              <Typography id="discrete-slider" gutterBottom>
                Learning Rate
          </Typography>
              <Slider
                defaultValue={this.state.initialEpsilon}
                aria-labelledby="discrete-slider"
                valueLabelDisplay="auto"
                step={1}
                marks
                min={1}
                max={20}
                onChangeCommitted={(event, value) => this.handleSliderChange('epsilon', value)}
              />
            </div>
            <div style={{ width: '200px', alignContent: 'center', textAlign: 'center' }}>
              <Typography id="discrete-slider" gutterBottom>
                Perplexity
          </Typography>
              <Slider
                defaultValue={this.state.initialPerplexity}
                aria-labelledby="discrete-slider"
                valueLabelDisplay="auto"
                step={5}
                marks
                min={5}
                max={100}
                onChangeCommitted={(event, value) => this.handleSliderChange('perplexity', value)}
              />
            </div>
          </div>
        </Grid>

        <Grid
          item
          xs={8}
          className='iris-plot-grid-tsne'
        >
          <svg width={dimensions.width} height={dimensions.height}>
            <g className='iris-tsne-plot-container'>
            </g>
          </svg>

        </Grid>

      </Grid>

    )

  }


}