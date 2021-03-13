import React from 'react'
import Axis from './Axis'

export default ({ axisProps }) => {

  const { xProps, yProps } = axisProps

  return (
    <g>
      <Axis {...xProps} />
      <Axis {...yProps} />
    </g>
  )

}