import { fabric } from "fabric";

export const drawLine = (start, end) => {
  console.log("in draw line", {start, end})
  const startX = start[0][1];
  const startY = start[0][2];

  const endX = end[0][1];
  const endY = end[0][2];

  const slope = (endY - startY) / (endX - startX);
  const straightPath = [];
  
  console.log({startX, startY, endX, endY, slope})
  if (startX < endX) {
    let currentX = startX;
    let currentY = startY;

    while ( currentX <= endX ) {
      if (currentX === startX) {     
        straightPath.push(start);
      } else if (currentX === endX) {
        straightPath.push(end)
      } else {
        const currentPath = [
          [start[0][0], currentX, currentY],
          [start[1][0], currentX, currentY],
        ]

        straightPath.push(currentPath)
      }
      
      currentX += 1;
      currentY += slope;
    }
  } else {
    let currentX = endX;
    let currentY = endY;

    while ( currentX <= startX ) {
      if (currentX === endY) {     
        straightPath.push(end);
      } else if (currentX === startX) {
        straightPath.push(start)
      } else {
        const currentPath = [
          [end[0][0], currentX, currentY],
          [end[1][0], currentX, currentY],
        ]

        straightPath.push(currentPath)
      }
      
      currentX += 1;
      currentY += slope;
    }
  }


  return straightPath
} 

export const combinePaths = (paths, strokeColor, strokeWidth) => {
  if (!paths.length) {
      return null;
  }
  
  let singlePath = paths[0];
  for (let i = 1; i < paths.length; i++) {
      if(i === paths.length-1) {
        const len = paths[i].length;  
        paths[i][len] = [];
        paths[i][len].push("Q");
        paths[i][len].push(paths[i][len-1][1]);
        paths[i][len].push(paths[i][len-1][2]);
        paths[i][len].push(paths[0][0][1]);
        paths[i][len].push(paths[0][0][2]);
      }
      singlePath = [...singlePath, ...paths[i]];
  }
  
  return new fabric.Path(singlePath, {
      fill: '',
      stroke: strokeColor,
      strokeWidth: strokeWidth,
      strokeLineCap: 'round',
      strokeDashOffset: 0,
  });
}