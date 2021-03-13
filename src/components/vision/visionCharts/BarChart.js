import React from 'react'
import * as d3 from 'd3'
import Axes from './Axes'
import Bars from './Bars'


export default (props) => {

  const data = props.data
  const { xColumn, yColumn } = props.columns
  const { width, height } = props.dimensions
  const title = props.title
  const innerDimensions = {
    width: width - props.dimensions.marginLeft - props.dimensions.marginRight,
    height: height - props.dimensions.marginTop - props.dimensions.marginBottom
  }
  const titleOffset = 70

  // compute scales for x and y axis
  const xScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d[xColumn])])
    .range([0, innerDimensions.width])

  const yScale = d3.scaleBand()
    .domain(data.map(d => d[yColumn]))
    .range([0, innerDimensions.height])
    .padding(0.1)

  const xProps = {
    orient: 'Bottom',
    scale: xScale,
    axisLabel: xColumn,
    axisLabelPositions: { axisLabelPositionX: width / 2, axisLabelPositionY: 60 },
    innerHeight: innerDimensions.height,
    axisLabelText: `Number of ${xColumn}`,
    translate: `translate(${0},${height})`
  }

  const yProps = {
    orient: 'Left',
    scale: yScale,
    translate: `translate(${0},${0})`
  }

  return (
    <svg width={width} height={height}>
      <g transform={`translate(${30}, ${50})`}>
        <Axes axisProps={{ xProps, yProps }} />
        <text x={innerDimensions.width / 2 - titleOffset} y={-20} style={{ fontSize: '1.5vw' }}>{title}</text>
        <Bars
          data={data}
          columns={props.columns}
          scales={{ xScale, yScale }}
          id={props.id}
        />
      </g>
    </svg>
  )
}
