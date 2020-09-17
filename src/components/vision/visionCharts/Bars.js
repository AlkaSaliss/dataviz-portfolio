import React, { useRef, useEffect } from 'react'
import * as d3 from 'd3'


export default ({ data, columns, scales, id }) => {

  const gRef = useRef(null)
  const { xColumn, yColumn } = columns
  const { xScale, yScale } = scales

  useEffect(() => {

    const gSelect = d3.select(gRef.current)

    const rects = gSelect
      .selectAll('rect')
      .data(data)

    rects
      .enter().append('rect')
      .attr('class', 'rect-prob-class')
      .attr('y', d => yScale(d[yColumn]))
      .attr('height', yScale.bandwidth())
      .attr('width', 0)
      .attr('key', d => d[id])
      .style('fill', '#7d2ab0')
      .merge(rects)
      .transition().duration(1000)
      .delay((d, i) => i * 10)
      .attr('y', d => yScale(d[yColumn]))
      .attr('height', yScale.bandwidth())
      .attr('width', d => xScale(d[xColumn]))
      .attr('key', d => d[id])
      .style('fill', '#7d2ab0')
  })

  return (
    <g ref={gRef}>
    </g>
  )
}
