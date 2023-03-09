//Draw Rect
import { fabric } from "fabric";

import { offsetLeft, offsetTop } from "../utils/constants";

export const newSquare = (color, id, canvas) => {
    const left = offsetLeft(canvas.width);
    const top = offsetTop(canvas.height);

    const width = canvas.width * 0.1

    return new fabric.Rect({
      left, 
      top,
      fill: color,
      height: width,
      width,
      objectCaching: false,
      stroke: color,
      strokeWidth: 4,
      id,
      shapeType: "square",
    });
}

export const newTriangle = (color, id, canvas) => {
  const left = offsetLeft(canvas.width)
  const top = offsetTop(canvas.height)

  const width = canvas.width * 0.1;
  const height = canvas.height * 0.075;

  return new fabric.Triangle({
    left,
    top,
    width,
    height,
    fill: color,
    stroke: color,
    strokeWidth: 3,
    cornerColor: color,
    angle: 0,
    id,
    shapeType: "triangle",

  });
}
export const newCircle = (color, id, canvas) => {
  const left = offsetLeft(canvas.width)
  const top = offsetTop(canvas.height)
  
  const size = 0.075;
  const radius = canvas.width * size

  return new fabric.Circle({
    left,
    top,
    radius,
    fill: color,
    stroke: color,
    strokeWidth: 3,
    originX: 'center', 
    originY: 'center', 
    id,
    shapeType: "circle",
  });
}

export const newText = (color, id, canvas) => { 
  const left = offsetLeft(canvas.width)
  const top = offsetTop(canvas.height)

  const fontSize = canvas.height * 0.075
  console.log({left, top, fontSize})
  return new fabric.Text('New', {
      id, 
      left, 
      top,
      fontFamily: 'arial black',
      fill: color,
      fontSize,
  });
}