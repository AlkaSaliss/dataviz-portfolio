import React, { useRef, useEffect } from 'react'
import * as d3 from 'd3'


export default ({ data, columns, id, scales, innerWidth, innerHeight, clickedCategory, setClickedCategory }) => {

  const circlesGroup = useRef(null)

  // data and labels
  const { xColumn, yColumn, catColumn } = columns
  // scales
  const { xScale, yScale, colorScale } = scales
  const animationDuration = 1500
  const unselectOpacity = 0.05


  useEffect(
    () => {
      if (circlesGroup.current) {
        // create data join

        // Define the global group containing circles, title and 
        let scatterGroup = d3.select(circlesGroup.current).selectAll('.unique-group')
          .data(data, d => d[id])
        scatterGroup.exit().remove()
        let globalEnter = scatterGroup.enter().append('g').attr('class', 'unique-group')

        scatterGroup = scatterGroup.merge(globalEnter)

        // Add circles
        globalEnter
          .append('circle')
          .attr('class', 'circle-class')
          .attr('cx', innerWidth / 2)
          .attr('cy', innerHeight / 2)
          .attr('r', 0)
          .on('click', d => setClickedCategory(d[catColumn]))
          .on('mouseover', function (d) {
            d3.select(this)
              .transition().duration(250)
              // .attr('fill', 'black')
              .attr('r', 15)
          })
          .on('mouseout', function (d) {
            d3.select(this)
              .transition().duration(250)
              .attr('r', 10)
              // .attr('fill', colorScale(d[catColumn]))
          })

        // Add hover title
        globalEnter
          .append('title')
          .attr('class', 'title-class')
          .text(d => `(${d[xColumn]}, ${d[yColumn]})`)

        // add transition for animating circle
        scatterGroup.select('.circle-class')
          .transition().duration(animationDuration)
          .delay((d, i) => i * 10)
          .attr('cx', d => xScale(d[xColumn]))
          .attr('cy', d => yScale(d[yColumn]))
          .attr('r', 10)
          .attr('fill', d => colorScale(d[catColumn]))
          .attr('fill-opacity', d =>
            clickedCategory ?
              d[catColumn] === clickedCategory ? 0.7 : unselectOpacity
              :
              0.7
          )

        scatterGroup.select('.title-class')
          .text(d => `(${d[xColumn]}, ${d[yColumn]})`)



        // Adding Legend
        const legendRadius = 30
        const spacing = 30
        const legendYOffset = 170
        const n = colorScale.domain().length
        const legendGroup = d3.select(circlesGroup.current).selectAll('rect').data([null])
        legendGroup.enter().append('rect')
          .merge(legendGroup)
          .attr('x', -legendRadius * 2)
          .attr('y', -legendRadius * 2)
          .attr('rx', 10)
          .attr('width', 135)
          .attr('height', spacing * n + legendRadius * 1.25)
          .attr('fill', 'black')
          .attr('opacity', 0.1)
          .attr('transform', `translate(850, ${legendYOffset})`)


        let legendCircles = d3.select(circlesGroup.current).selectAll('.circle-tick').data(colorScale.domain())
        legendCircles.exit().remove()

        let legendCirclesEnter = legendCircles.enter()
          .append('g')
          .attr('class', 'circle-tick')
          .attr('transform', (d, i) => `translate(800, ${i * spacing + legendYOffset - 30})`)

        legendCircles = legendCircles.merge(legendCirclesEnter)

        legendCirclesEnter.append('circle')
          .attr('class', 'circle-legend')
          .attr('r', 10)
          .attr('fill', colorScale)
          .attr('opacity', 0.8)
          .on('click', setClickedCategory)
        legendCircles.select('.circle-legend')
          .transition().duration(animationDuration)
          .attr('opacity',
            d => clickedCategory ?
              clickedCategory === d ? 0.8 : unselectOpacity
              : 0.8
          )

        legendCirclesEnter.append('text')
          .attr('class', 'text-legend')
          .text(d => d)
          .attr('dy', '0.32em')
          .attr('x', 20)
          .on('click', setClickedCategory)
        legendCircles.select('.text-legend')
          .transition().duration(animationDuration)
          .attr('opacity',
            d => clickedCategory ?
              clickedCategory === d ? 1.0 : 0.2
              : 1.0
          )

      }

    },
    [circlesGroup, catColumn, data, innerWidth, innerHeight, id, xScale, xColumn, yScale, yColumn, colorScale, setClickedCategory, clickedCategory]
  )

  return (
    <g ref={circlesGroup} >
    </g>
  )
}