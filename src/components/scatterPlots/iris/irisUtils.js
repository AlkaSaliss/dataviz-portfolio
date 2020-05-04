export const rowProcessor = (row) => {
  row.PetalLengthCm = +row.PetalLengthCm
  row.PetalWidthCm = +row.PetalWidthCm
  row.SepalLengthCm = +row.SepalLengthCm
  row.SepalWidthCm = +row.SepalWidthCm
  return row
}

export const removeChildrenNodes = (node) => {
  var child = node.lastElementChild
  while (child) {
    node.removeChild(child)
    child = node.lastElementChild
  }
}
