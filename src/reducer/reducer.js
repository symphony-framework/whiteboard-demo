import { fabric } from "fabric";
import { newSquare, newTriangle, newCircle, newText } from "../shared/draw";
import { drawLine, combinePaths } from "../shared/paths"

import { DEFAULT_IMAGE_SCALE } from "../utils/constants";
import { randColor } from "../utils/canvasHelpers";

const Reducer = (state, action) => {
  const { type } = action;
  const syncedMap = state.syncedMap;

  if (type === 'init') {
    const {newSyncedMap, room, canvas} = action;
    
    if (!newSyncedMap || !canvas || !room) return {...state}

    return {
      ...state, 
      syncedMap: newSyncedMap, 
      canvas, room, 
      color: randColor(),
    }
  }

  if (!syncedMap) return {...state};

  if (type === 'cursor') {
    if (!state.canvas) return {...state}

    state.canvas.isDrawingMode = false;
    return { ...state }
  }

  if (type === 'brush') {
    if (!state.canvas) return {...state}
    const { brush } = action;

    state.canvas.freeDrawingBrush = new fabric.PencilBrush(state.canvas);
    state.canvas.freeDrawingBrush.type = brush

    /// BRUSH SCALE
    state.canvas.freeDrawingBrush.width = state.canvas.brushWidth * state.canvas.width;
    
    state.canvas.freeDrawingBrush.color = action.color;
    state.canvas.isDrawingMode = true;
    return {...state};
  }

  if (type === 'brushWidth') {
    if (!state.canvas || !state.canvas.freeDrawingBrush) return {...state}

    const { width } = action;

    if (!width) return;

    state.canvas.brushWidth = width;
    state.canvas.freeDrawingBrush.width = width * state.canvas.width;
    return {...state};
  }

  if (type === 'color') {
    if(!state.canvas){
      return state;
    }

    const { color } = action;

    if (!color) {
      return {...state}
    }

    state.canvas.freeDrawingBrush.color = color;
    state.color = color;

    return { ...state}  
  }

  if (type === "shape") {
    if (!state.canvas) return {...state}

    let newShape;
    
    switch (action.shape) {
      case "square":
        newShape = newSquare(action.color, action.id, state.canvas);
        break;
      case "triangle":
        newShape = newTriangle(action.color, action.id, state.canvas);
        break;
      case "circle":
        newShape = newCircle(action.color, action.id, state.canvas);
        break;
      default:
        return;
    }

    state.canvas.add(newShape);
    if (action.creator) {
      const {id, color, shape, type} = action;

      state.canvas.isDrawingMode = false;
      state.canvas.setActiveObject(newShape);

      syncedMap.set(id, {type, action: "newShape", color, shape: shape})
    }
    return { ...state}
  }

  if (type === 'newLine') {
    if (!state.canvas) return {...state};

    const {id, startPoint, endPoint, color, width} = action;

    const getPathEnds = () => {
      const paths = state.canvas.getObjects().filter(obj => {
        if (obj.id !== +id) return false;

        state.canvas.remove(obj)
        return true;
      })

      if (!paths || !paths.length) return;
      return {start: paths[0].path, end: paths[paths.length - 1].path};
    }

    const endPoints = getPathEnds();
    if (!endPoints) {
      const newLinePoints = drawLine(startPoint, endPoint)
      const newLinePath = combinePaths(newLinePoints, color, width);
  
      newLinePath.id = +id;
      state.canvas.add(newLinePath)
      return {...state}
    }

    if (endPoints) {
      const {start, end} = endPoints;
      if (!start || !end) return {...state};
      
      const linePath = drawLine(start, end)
      const onePath = combinePaths(linePath, color, width)
      onePath.id = id;
  
      state.canvas.add(onePath)
      return {...state};
    }
  }

  if (type === 'finishDrawing') {
    const { id, width, color, offsetPath } = action;
    
    const clearOldPath = () => {
      state.canvas.getObjects().forEach(obj => {
        if (+obj.id !== +id) return;
        state.canvas.remove(obj)
      })
    }

    clearOldPath();

    const points = offsetPath.map((pathCommand, idx) => [idx === 0 ? "M" : "L", pathCommand[1] * state.canvas.width, pathCommand[2] * state.canvas.height]);
    const pencil = new fabric.PencilBrush(state.canvas);
    const path = pencil.createPath(points.toString());

    path.set({
      id, 
      strokeWidth: width,
      stroke: color,
      selectable: true,
      hasControls: true,
      drawingMode: false,
    });

    state.canvas.add(path);
    return {...state};
  }

  if (type === "text") {
    if (!state.canvas) return {...state};
    const text = newText(action.color, action.id, state.canvas)

    if (action.creator) {
      const {id, color} = action

      state.canvas.setActiveObject(text);
      state.canvas.isDrawingMode = false;
      
      syncedMap.set(id, {type, action: "newText", color})
    }

    state.canvas.add(text)
    return {...state}
  }

  if (type === 'clear') {
    if (!state.canvas) return {...state};

    const selected = state.canvas.getActiveObject();
    if (!selected) return { ...state };

    if (selected.type === 'activeSelection') {
      selected._objects.forEach(element => {
        const { id } = element;
        state.canvas.remove(element)


        if (id) {
          syncedMap.set(id, {action: 'clear'})
          syncedMap.delete(id)
        }
        // if (id) syncedMap.set(id, {action: 'clear'})
      })

    } else {
      state.canvas.remove(selected)
      const { id } = selected;

      if (id) {
        syncedMap.set(id, {action: 'clear'})
        syncedMap.delete(id)
      }
    }

    state.canvas.discardActiveObject();
    state.canvas.requestRenderAll();

    return { ...state }
  }

  if (type === 'image/upload') {
    const { image, id, creator, } = action
    if (!state.canvas || !image) return {...state};
    
    image.set('left', state.canvas.width * DEFAULT_IMAGE_SCALE);
    image.set('top', state.canvas.height * DEFAULT_IMAGE_SCALE);
    image.id = id;

    state.canvas.add(image);

    if (creator) {
      const imageUrl = image.toDataURL();
      syncedMap.set(id, {type, imageUrl, action: type})
      state.canvas.isDrawingMode = false;
    }
    
    return {...state}  }

  if (type === 'download') {
    if(!state.canvas){
      return {...state};
  }
    const link = document.createElement("a");
    const uri = state.canvas.toDataURL({format: 'png', multiplier: 4});
    link.href = uri
    link.download = "canvas.png";
    link.click();

    return {...state};
  }
}

export default Reducer;