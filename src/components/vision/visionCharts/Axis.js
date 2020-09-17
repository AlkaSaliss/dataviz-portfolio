import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import * as d3Axis from 'd3-axis'


export default (props) => {

  const groupRef = useRef(null)

  useEffect(() => {
    renderAxis()
  })

  const renderAxis = () => {

    // get scale and extra args
    const orient = props.orient
    const scale = props.scale
    const axisLabel = props.axisLabel

    const axisLabelText = props.axisLabelText

    const allowedOrient = ['Left', 'Bottom']
    if (!allowedOrient.includes(orient)) {

      throw new Error("axisType must be 'Left' or 'Bottom'")
    }

    const axisType = `axis${orient}`
    const axis = d3Axis[axisType]()
      .scale(scale)
      .tickPadding([12])
      .ticks([5])

    // font size of axis tick label
    if (orient === 'Bottom') {
      d3.selectAll(".tick text")
        .each(function (d, i) {
          d3.select(this).style('font-size', '1.5vw')
        })
    }


    const selectedAxis = d3.select(groupRef.current)
      .call(axis)

    // If axisLabel prop is provided then add text label to the axis
    if (axisLabel) {

      let { axisLabelPositionX, axisLabelPositionY } = props.axisLabelPositions
      axisLabelPositionX = orient === 'Left' ? -axisLabelPositionX : axisLabelPositionX
      axisLabelPositionY = orient === 'Left' ? -axisLabelPositionY : axisLabelPositionY

      selectedAxis
        .append('text')
        .attr('class', `yaxis-label-${axisLabel}`)

      let labelTextSelector = d3.selectAll(`text.yaxis-label-${axisLabel}`)
        .data([null])

      const rotation = orient === 'Left' ? `rotate(-90)` : `rotate(0)`

      labelTextSelector.enter()
        .merge(labelTextSelector)
        .attr('y', axisLabelPositionY)
        .attr('x', axisLabelPositionX)
        .attr('fill', 'black')
        .text(axisLabelText)
        // .attr('text-anchor', 'middle')
        .attr('transform', rotation)

      if (orient === 'Bottom') {
        const innerHeight = props.innerHeight
        selectedAxis.selectAll('g.tick line')
          .attr('y2', -innerHeight)
      } else {
        const innerWidth = props.innerWidth
        selectedAxis.selectAll('g.tick line')
          .attr('x2', innerWidth)
      }
    }

    // const removeTickLine = orient === 'Left' ? '.domain, .tick line' : '.domain'
    // const removeTickLine = props.removeTickLine
    // if (removeTickLine) {
    if (orient === 'Bottom') {
      selectedAxis
        .selectAll('.tick line')
        .remove()
    }


  }

  const translate = props.translate
  return (
    <g
      transform={translate}
      ref={groupRef}
    >
    </g>
  )

}