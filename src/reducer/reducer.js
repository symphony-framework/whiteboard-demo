import { fabric } from "fabric";
import { newSquare, newTriangle, newCircle, newText } from "../shared/draw";
import { drawLine, combinePaths } from "../shared/paths"

// import {syncedMap} from "../utils/symphony.config";

// import { DEFAULT_CANVAS_BACKGROUND, DEFAULT_ERASE_WIDTH } from "../utils/constants";
import { DEFAULT_IMAGE_WIDTH, DEFAULT_IMAGE_SCALE } from "../utils/constants";

const Reducer = (state, action) => {
  const { type } = action;
  const syncedMap = state.syncedMap;

  if (type === 'init') {
    const {newSyncedMap, room, canvas} = action;
    
    if (!newSyncedMap || !canvas || !room) return {...state}

    return {...state, syncedMap: newSyncedMap, canvas, room,}
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

    state.canvas.freeDrawingBrush.width = state.brushWidth * state.canvas.width;
    state.canvas.freeDrawingBrush.color = action.color;
    state.canvas.isDrawingMode = true;
    state.canvas.freeDrawingCursor = 'url("icons/Brush.svg") 50 0, auto'
    return {...state};
  }

  if (type === 'brushWidth') {
    if (!state.canvas || !state.canvas.freeDrawingBrush) return {...state}

    const { width } = action;

    if (!width) return;
    // const newWidth = width / 100;

    state.canvas.freeDrawingBrush.width = width * state.canvas.width;
    return {...state, brushWidth: width};
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
    state.canvas.isDrawingMode = false;
    
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
    const { id, width, color, pathStr, offsetX, offsetY } = action;

    const getPaths = () => {
      state.canvas.getObjects().forEach(obj => {
        if (+obj.id !== +id) return;
        state.canvas.remove(obj)
      })
    }

    getPaths()

    const pencil = new fabric.PencilBrush(state.canvas);
    const path = pencil.createPath(pathStr);

    const left = state.canvas.width * offsetX;
    const top = state.canvas.height * offsetY;

    path.set("strokeWidth", width)
    path.set("stroke", color)
    path.id = id;

    path.set("left", left);
    path.set("top", top);

    state.canvas.add(path)
    return {...state}
  }
  
  // if (type === 'eraser') {
  //   if(!state.canvas) return {...state};

  //   state.canvas.freeDrawingBrush = new fabric.PencilBrush(state.canvas);
  //   state.canvas.freeDrawingBrush.width = DEFAULT_ERASER_WIDTH * state.canvas.width;
  //   state.canvas.freeDrawingBrush.color = DEFAULT_CANVAS_BACKGROUND;
  //   state.canvas.isDrawingMode = true;
  //   state.canvas.isErasingMode = true;

  //   state.canvas.freeDrawingBrush.type = type;
  //   state.canvas.freeDrawingCursor = 'url("icons/Eraser.svg") 30 10, auto'
  //   state.canvas.freeDrawingBrush.inverted = true;

  //   return {...state};
  // }

  if (type === "text") {
    if (!state.canvas) return {...state};
    state.canvas.isDrawingMode = false;
    const text = newText(action.color, action.id, state.canvas)

    state.canvas.add(text)
    if (action.creator) {
      const {id, color} = action
      state.canvas.setActiveObject(text)
      syncedMap.set(id, {type, action: "newText", color})
    }

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
    const { image, id, creator } = action
    if (!state.canvas || !image) return {...state};


    // const width = state.canvas.width;

    image.scaleToWidth( DEFAULT_IMAGE_WIDTH);
    image.set('left', state.canvas.width * DEFAULT_IMAGE_SCALE)
    image.set('top', state.canvas.height * DEFAULT_IMAGE_SCALE)
    
    image.id = id;

    state.canvas.add(action.image)

    if (creator) {
      const imageUrl = image.toDataURL();
      syncedMap.set(id, {type, imageUrl, action: "image/upload"})
      state.canvas.isDrawingMode = false;
    }
    
    return {...state}
  }

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