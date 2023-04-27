import { drawLine, combinePaths } from "../shared/paths";
import { findCanvasObject } from "./canvasHelpers";

const canvasListeners = (syncedMap, canvas) => {
  if (!canvas) return;

  canvas.on('object:moving', function(options) {
    const { id, left, top } = options.target
    const multiSelect = options.target._objects;
    const offsetX = left / canvas.width
    const offsetY = top / canvas.height
    
    if (!left || !top) {
      return;
    }

    if (id && !multiSelect) {
      const otherVals = syncedMap.get(id);

      syncedMap.set(id, {
        ...otherVals, 
        action: "newPosition",
        offsetX, offsetY
      });
      
      return;
    }

    if (multiSelect) {  
      const {top: groupTop, left: groupLeft, width: groupWidth, height: groupHeight} = options.target;

      multiSelect.forEach(obj => {
        const {id, left, top} = obj;

        if (!id || !left || !top);

        const otherVals = syncedMap.get(id);

        let objectInGroupLeft = left + groupLeft + groupWidth / 2
        let objectInGroupTop = top + groupTop + groupHeight / 2

        const offsetX = objectInGroupLeft / canvas.width;
        const offsetY = objectInGroupTop / canvas.height;

        syncedMap.set(id, {
          ...otherVals, 
          action: "newPosition", 
          offsetX,
          offsetY,
        });
      })
    }

    return;
  })

  canvas.on('selection:updated', function(options) {
    const { selected } = options;

    if (!selected.length) return;

    const selectedObj = selected[0];

    if (canvas.editingText && !selectedObj.text) {
      canvas.editingText = null;
    }

    if (selectedObj.text) {
      canvas.editingText = selectedObj.id;
    }
    
  })
  canvas.on('after:render', function(options) {
    if (canvas.editingText) {
      const textObject = findCanvasObject(canvas, canvas.editingText);

      if (!textObject) return;

      if (!textObject.hasOwnProperty("text")) return;

      const { text } = textObject;
      const id = canvas.editingText;

      const otherVals = syncedMap.get(id)
      const oldText = otherVals.text;

      if (oldText === text) return;
      
      syncedMap.set(id, {
        ...otherVals,
        action: 'textChange',
        text,
      })
    }
    return;
  })

  canvas.on('selection:created', function(options) {
    const {selected} = options;

    if (!selected) return;

    const unfinishedDrawings = selected.some(obj => obj.drawingMode);

    if (unfinishedDrawings) {
      canvas.discardActiveObject();
      return;
    }

    if (selected.length === 1) {
      const { id, text} = selected[0];

      if (text && id) {
        canvas.editingText = id;
      }

      return;
    }

    const groupId = Date.now();
  
    canvas.multiSelectId = groupId;
    return;
  })

  canvas.on('selection:cleared', function(options) {
    canvas.editingText = null;
    canvas.multiSelectId = null;
    return;
  })

  canvas.on('mouse:down', function(options) {

    if (canvas.multiSelectId && !options.target) {
      canvas.multiSelectId = null;
    }

    if (canvas.multiSelectId) {
      const {target} = options;

      if (!target._objects || !target._objects.length) {
        canvas.isMultiSelectMode = false;
        return;
      }

      const groupId = canvas.multiSelectId
      const {_objects: objects} = target;
      const group = objects.map(obj => obj.id);

      const {top, left} = options.target;
      const originalOffsetX = left / canvas.width;
      const originalOffsetY = top / canvas.height;

      syncedMap.set('newGroupSelection', {groupId, group, originalOffsetX, originalOffsetY})
      return;
    }

    if (canvas.isDrawingMode) {
      const {freeDrawingBrush} = canvas;

      const {_points , width, color, } = freeDrawingBrush;
      const drawId = Date.now();

      freeDrawingBrush.id = drawId
      canvas.isCurrentlyDrawing = true;

      const points = _points.map(point => {
        return {
          offsetX: point.x / canvas.width, 
          offsetY: point.y / canvas.height,
        }
      })

      syncedMap.set("newDrawing", {action: "newDrawing", id: drawId, points, width, color})
    }
  })

  canvas.on('mouse:move', function() {
    if (canvas.isCurrentlyDrawing) {
      const {freeDrawingBrush} = canvas;

      const {_points, width, color, id} = freeDrawingBrush;
      const lastCoord = _points[_points.length - 2];
      const nextCoord = _points[_points.length - 1];
      
      // map over _points for LOAD TESTING
      const points = [lastCoord, nextCoord].map(point => {
        return {
          offsetX: point.x / canvas.width, 
          offsetY: point.y / canvas.height,
        }
      })

      syncedMap.set('drawing', {action: "drawing", id, points, width, color})
    }
  })

  canvas.on('mouse:up', function(options) {
    if (canvas.multiSelectId) {
      const { target, transform } = options;

      if (!transform || !target) return;
      
        const { _objects: objects } = target;
        const { action } = transform;        

        if (objects && action.includes('scale')) {    
          canvas.discardActiveObject();
          canvas.renderAll();

          return;
        }

        return;
    }

    if (canvas.isCurrentlyDrawing) {

      canvas.isCurrentlyDrawing = false;

      const { id, width, color, type } = canvas.freeDrawingBrush;
      options.currentTarget.id = id;

      if (!type) return;

      if (type === 'line') {    
        const paths = options.currentTarget.path
        const len = paths.length - 1;

        const startPoint = [
          [paths[0][0], paths[0][1], paths[0][2]],
          ["L", paths[0][1], paths[0][2]]
        ];

        const endPoint = [
          ["M", paths[len][1], paths[len][2]],
          [paths[len][0], paths[len][1], paths[len][2]],
        ];

        const newLinePoints = drawLine(startPoint, endPoint)
        const newLinePath = combinePaths(newLinePoints, color, width)
        newLinePath.id = id;
        
        canvas.remove(options.currentTarget)
        canvas.add(newLinePath)
        syncedMap.set(id, {
          type: 'newLine', 
          action: 'newLine', 
          color, width, 
          startPoint, endPoint
        });

        syncedMap.delete('newDrawing')
        syncedMap.delete('drawing')

        return;
      }

      if (type === 'draw') {
        const {path, top, left} = options.currentTarget

        syncedMap.delete('drawing');
        syncedMap.delete('newDrawing');

        const offsetX = left / canvas.width;
        const offsetY = top / canvas.height;
        
        const offsetPath = path.map(pathCommand => {
          return [pathCommand[0], pathCommand[1] / canvas.width, pathCommand[2] / canvas.height]  
        });
 
        syncedMap.set(id, {
          type: 'finishDrawing',
          action: "finishDrawing", 
          color, width, 
          pathStr: path.toString(),
          offsetPath,
          offsetX, offsetY,
        })
      }

      delete canvas.freeDrawingBrush.id;
    }
  })

  canvas.on('object:rotating', function(options) {
    const { id, angle, left, top } = options.target
    const multiSelect = options.target._objects;


    if (!angle) return;

    // disable multi select - functinality too time consuming to get right for little payofff
    if (multiSelect) {
      const {left: oldLeft, top: oldTop} = options.transform.original

      // disable multi select - functinality too time consuming to get right for little payofff
      options.target.angle = 0;
      options.target.left = oldLeft;
      options.target.top = oldTop;

      canvas.renderAll();
      return;
    }

    // const { transform, target } = options
    if (!multiSelect) {
      const offsetX = left / canvas.width
      const offsetY = top / canvas.height
  
      const otherVals = syncedMap.get(id);

      syncedMap.set(id, {
        ...otherVals,
        action: "newPosition", 
        angle, offsetX, offsetY
      })
      return;
    }
  })

  canvas.on('object:scaling', function(options) {
    const { 
      id, 
      left, top, 
      scaleX, scaleY,
      flipX, flipY,
    } = options.target

    const multiSelect = options.target._objects;
    const {left: oldLeft, top: oldTop} = options.transform.original
    const { action, corner, } = options.transform;

    // disable multi select - functinality too time consuming to get right for little payofff
    if (multiSelect) {
      options.target.scaleX = 1;
      options.target.scaleY = 1;
      options.target.left = oldLeft;
      options.target.top = oldTop;
      options.target.flipX = false;
      options.target.flipY = false;

      canvas.renderAll();
      return;
    }

    if (action === "scaleX") {
      const cornerPos = corner === "ml" || flipX ? left : oldLeft;
      const offsetX = cornerPos / canvas.width;
      const offsetY =  (top/ canvas.height);

      if (!multiSelect) {
        const otherVals = syncedMap.get(id);

        syncedMap.set(id, {
          ...otherVals,
          action: "newPosition", 
          scaleX, offsetX, offsetY,
          flipX, 
        })
        return;
      }

      return;
    }

    if (action === "scaleY") {
      const cornerPos = corner === "mt" || flipY ? top : oldTop;
      const offsetY = cornerPos / canvas.height;
      const offsetX = left / canvas.width;

      if (!multiSelect) {
        const otherVals = syncedMap.get(id);

        syncedMap.set(id, {
          ...otherVals,
          action: "newPosition", 
          scaleY, offsetX, offsetY,
          flipY, 
        })        
      return;
      }

      // syncedMap.set("newGroupScaleY", {corner, groupId: canvas.multiSelectId, scaleY, offsetY, flipY, height: height / canvas.height})
      // return;
    } 

    if (action === "scale") {
      const xCorner = corner === "tl" || corner === "bl" || flipX ? left : oldLeft;
      const offsetX = xCorner / canvas.width;

      const yCorner = corner === "tl" || corner === "tr" || flipY ? top : oldTop;
      const offsetY = yCorner / canvas.height;

      if (!multiSelect) {
        const otherVals = syncedMap.get(id);

        syncedMap.set(id, {
          ...otherVals,
          action: 'newPosition', 
          scaleY, scaleX, 
          offsetY, offsetX, 
          flipX, flipY
        })
        return;
      }  
    }
  })
}

export default canvasListeners