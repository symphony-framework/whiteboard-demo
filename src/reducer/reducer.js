import { fabric } from "fabric";
import { newSquare, newTriangle, newCircle, newText } from "../shared/draw";

// import {syncedMap} from "../utils/symphony.config";

// import { DEFAULT_CANVAS_BACKGROUND, DEFAULT_ERASE_WIDTH } from "../utils/constants";
import { DEFAULT_IMAGE_WIDTH, DEFAULT_IMAGE_SCALE } from "../utils/constants";

const Reducer = (state, action) => {
  const { type } = action;
  const syncedMap = state.syncedMap;

  if (type === 'init') {
    const {newSyncedMap, room, canvas} = action;
    console.log({newSyncedMap, action})
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
    }

    state.canvas.add(newShape);
    if (action.creator) state.canvas.setActiveObject(newShape);
    return { ...state}
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
    if (action.creator) state.canvas.setActiveObject(text)

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

        if (id) syncedMap.set('removeObject', {id})
      })

    } else {
      state.canvas.remove(selected)
      const { id } = selected;

      if (id) syncedMap.set("removeObject", {id})
    }

    state.canvas.discardActiveObject();
    state.canvas.requestRenderAll();

    return { ...state }
  }

  if (type === 'image/upload') {
    const { image, id, creator } = action
    if (!state.canvas || !image) return {...state};

    if (creator) state.canvas.isDrawingMode = false;

    const width = state.canvas.width * DEFAULT_IMAGE_SCALE;

    image.scaleToWidth(width || DEFAULT_IMAGE_WIDTH);
    image.set('left', state.canvas.width * DEFAULT_IMAGE_SCALE)
    image.set('top', state.canvas.height * DEFAULT_IMAGE_SCALE)
    image.id = id;

    state.canvas.add(action.image)
    const imageUrl = image.toDataURL();
    syncedMap.set("image/upload", {imageUrl, id})
    
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