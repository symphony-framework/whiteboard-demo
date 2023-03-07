import { ymap } from "./yjs";

export default (canvas) => {
  if (!canvas) return;

  canvas.on('object:moving', function(options) {
    const { id, left, top } = options.target
    const multiSelect = options.target._objects;
    const offsetX = left / canvas.width
    const offsetY = top / canvas.height
    
    if (!left || !top) {
      return;
    }

    // handle single object movement
    if (id && !multiSelect) {
      ymap.set("newPosition", {id, offsetX, offsetY})
      return;
    }

    // handle movement of a new group
    if (!id && canvas.multiSelectId) {
      const groupId = canvas.multiSelectId;
      const group = multiSelect.map(selection => selection.id);

      if (!groupId) {
        return;
      }

      options.target.id = groupId
      ymap.set('newGroupMovement', {group, groupId, offsetX, offsetY})
    }

    // handle additional movement of existing group
    if (id && multiSelect) {
      const group = multiSelect.map(obj => obj.id);
      ymap.set('newGroupMovement', {group, groupId: canvas.multiSelectId, offsetX, offsetY})
    }
    return;
  })
  
  // canvas.on('object:drop', function(options) {
  //   console.log("DROPPP OBJECT EVENT")
  //   const {id, left, top} = options.target;
  //   const multiSelect = options.target._objects;

  //   console.log("drop", {multiSelect})
  //   const offsetX = left /canvas.width;
  //   const offsetY = top / canvas.width;

  //   if (!id) {
  //     console.log("no id", options.target);
  //     return;
  //   }

  //   if (multiSelect) {
  //     const {target} = options;

  //     if (!target._objects || !target._objects.length) {
  //       canvas.isMultiSelectMode = false;
  //       return;
  //     }

  //     const groupId = Date.now();
  //     canvas.multiSelectId = groupId;

  //     const {_objects: objects} = target;
  //     const group = objects.map(obj => obj.id);

  //     const {top, left} = options.target;
  //     const originalOffsetX = left / canvas.width;
  //     const originalOffsetY = top / canvas.height;

  //     ymap.set('newGroupSelection', {groupId, group, originalOffsetX, originalOffsetY})
  //   }
  // })
  
  canvas.on('selection:created', function(options) {
    const {selected} = options;

    if (!selected) return;
    const groupId = Date.now();
  
    canvas.multiSelectId = groupId;
    return;
    // const group = selected.map(selection => selection.id);
    // ymap.set('newGroupSelection', {group, groupId})
  })

  canvas.on('selection:cleared', function(options) {
    console.log("clearing select", {options});

    canvas.multiSelectId = null;

    const {multiSelectId: groupId} = canvas;

    if (!groupId) return; 

    ymap.set('clearGroupSelection', {groupId});
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

      ymap.set('newGroupSelection', {groupId, group, originalOffsetX, originalOffsetY})
      return;
    }

    // if (canvas.isErasingMode) {
    //     const {freeDrawingBrush} = canvas;
    //     const {_points , width, color, } = freeDrawingBrush;

    //     const eraseId = Date.now();

    //     canvas.isCurrentlyErasing = true;
    //     canvas.freeDrawingBrush.id = eraseId
        
    //     const points = _points.map(point => {
    //       return {
    //         offsetX: point.x / canvas.width, 
    //         offsetY: point.y / canvas.height,
    //       }
    //     })

    //     ymap.set("newErase", {id: eraseId, points})
    //     return;
    // }

    if (canvas.isDrawingMode) {
      const {freeDrawingBrush, freeDrawingCursor} = canvas;
      if (freeDrawingBrush.type === 'eraser') return;

      const {_points , width, color, } = freeDrawingBrush;
      const drawId = Date.now();

      canvas.isCurrentlyDrawing = true;
      canvas.freeDrawingBrush.id = drawId
      
      const points = _points.map(point => {
        return {
          offsetX: point.x / canvas.width, 
          offsetY: point.y / canvas.height,
        }
      })
      
      ymap.set("newDrawing", {id: drawId, points, width, color})
    }
  })

  canvas.on('mouse:move', function(options) {
    // if (canvas.isCurrentlyErasing) {
    //   const {freeDrawingBrush} = canvas;

    //   const {_points, width, color, id} = freeDrawingBrush;

    //   const lastCoord = _points[_points.length - 2];
    //   const nextCoord = _points[_points.length - 1];
      
    //   // map over all points for LOAD TESTING
    //   const points = [lastCoord, nextCoord].map(point => {
    //     return {
    //       offsetX: point.x / canvas.width, 
    //       offsetY: point.y / canvas.height,
    //     }
    //   })

    //   ymap.set("erasing", {id, points, width})
    //   return
    // }

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

      ymap.set("drawing", {id, points, width, color})
      // stream update, mouse position, relative, and points? 
    }
  })

  canvas.on('mouse:up', function(options) {
    console.log("mouse up", {canvas, options, multiSelect: canvas.multiSelectId})

    if (canvas.multiSelectId) {
      const { target, transform } = options;

      if (!transform || !target) return;
      
        const { _objects: objects } = target;
        const { action } = transform;
        console.log("target")
        

        if (objects && action === 'scale') {


          // canvas.fire('selection:cleared');

          console.log("scale", {options})  
         
          // console.log("resetting remote caches with outdate offset data")
          // const {
          //   top: groupTop, left: groupLeft, 
          //   width: groupWidth, height: groupHeight, 
          //   scaleX, scaleY, flipX, flipY
          // } = target;

          // if (!flipX && !flipY) return;

          // const {
          //   top: originalGroupTop, left: originalGroupLeft, 
          // } = options.transform.original

          // const groupId = canvas.multiSelectId;
          
          // const clones = [];

          // objects.forEach(obj => {
          //   const {id, left, top, width: objWidth, height: objHeight } = obj;
          //   if (!id) return;
          //   console.log('about to remove')

          //   const cloneObj = fabric.util.object.clone(obj);

          //   const targetObject = findCanvasObject(canvas, id);
          //   if (!targetObject) return;

          //   let objectInGroupLeft = left + groupLeft + groupWidth / 2
          //   let objectInGroupTop = top + groupTop + groupHeight / 2

            // //
            // let objOffsetX = objectInGroupLeft - groupLeft;
            // let objOffsetY = objectInGroupTop - groupTop;

            // console.log({objOffsetX, objOffsetY})
        
            // const rightOffset = (groupLeft - ((objWidth * scaleX) + objOffsetX));
            // const bottomOffset = (groupTop - ((objHeight * scaleY) + objOffsetY));
            

            // console.log({cloneObj, objectInGroupLeft, objectInGroupTop, flipX, flipY})
            // cloneObj.set('left', obj.left)
            // cloneObj.set('flipX', flipX)
            
            // cloneObj.set('top', obj.top)
            // cloneObj.set('flipY', flipY)
            // cloneObj.setCoords();

            // clones.push(cloneObj);
            // canvas.remove(obj)
            // console.log("anotha one")
            // if (flipX) {
              //   cloneObj.set('top', objectInGroupTop)
            //   cloneObj.set('flipY', flipY)
            // }

            // if (flipY) {
            //   cloneObj.set('top', objectInGroupTop)
            //   cloneObj.set('flipY', flipY)

            // }

            // console.log({objectInGroupLeft, objectInGroupTop})
            // let objOffsetX = objectInGroupLeft - groupLeft;
            // let objOffsetY = objectInGroupTop - groupTop;

            // console.log({objOffsetX, objOffsetY})
        
            // const rightOffset = (groupLeft - ((objWidth * scaleX) + objOffsetX));
            // const bottomOffset = (groupTop - ((objHeight * scaleY) + objOffsetY));

            // if (flipX) {
            //   const newLeft = groupLeft + rightOffset;
            //   targetObject.set('left', newLeft);
            //   targetObject.set('flipX', flipX);
            // }

            // if (flipY) {
            //   const newTop = groupTop + bottomOffset;
            //   targetObject.set('top', newTop);
            //   targetObject.set('flipY', flipY);
            // }

          //   target.setCoords();
          // })

          // console.log({clones})
          // clones.forEach(cloneObj => {
          //   canvas.add(cloneObj);
          // });


//             const originalOffsetX = groupLeft / canvas.width;
//             const originalOffsetY = groupTop / canvas.height;

//             const group = objects.map(obj => {
//               const {id, top, left} = obj;
//               if (!id || !left || !top) return;

//               const targetObject = findCanvasObject(canvas, id);
//               if (!targetObject) return;
  
//               let objectInGroupLeft = left + groupLeft + groupWidth / 2
//               let objectInGroupTop = top + groupTop + groupHeight / 2

//               const objOffsetX = objectInGroupLeft / canvas.width;
//               const objOffsetY = objectInGroupTop / canvas.height;
// //test  
//               console.log("local obj info", {targetObject, objOffsetX, objOffsetY});

//               return {
//                 id,
//                 objOffsetX,
//                 objOffsetY,
//               }
//             });

//             console.log({group})
//             ymap.set('updateGroupPositionsCache', {groupId, group, originalOffsetX, originalOffsetY})

          canvas.discardActiveObject();
          canvas.renderAll();

          return;
        }

        return;
    }

    // if (canvas.isCurrentlyErasing) {
    //   canvas.isCurrentlyErasing = false;
    //   const {id, width, color, type} = canvas.freeDrawingBrush;

    //   if (type !== 'eraser') return;
    //   return;
    // }

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
        ymap.set('finishLine', { id, color, width});
        return;
      }

      if (type === 'draw') ymap.set("finishDrawing", {id, color, width})
    }
  })

  canvas.on('object:rotating', function(options) {
    const { id, angle, left, top } = options.target

    if (!id || !angle) return;

    const offsetX = left / canvas.width
    const offsetY = top / canvas.height

    const { transform, target } = options
    ymap.set("rotate", {id, angle, offsetX, offsetY})

    const multiSelect = options.target._objects;

    const {left: oldLeft, top: oldTop} = options.transform.original
    const { action, corner, } = options.transform;
  })

  canvas.on('object:scaling', function(options) {
    const { 
      id, 
      left, top, 
      width, height, 
      scaleX, scaleY,
      flipX, flipY,
    } = options.target

    const multiSelect = options.target._objects;

    const {left: oldLeft, top: oldTop} = options.transform.original
    const { action, corner, } = options.transform;

    if (action === "scaleX") {
      const cornerPos = corner === "ml" || flipX ? left : oldLeft;
      const offsetX = cornerPos / canvas.width;

      if (!multiSelect) {
        ymap.set(action, {id, scaleX, offsetX, flipX})
        return;
      }

      // if (flipX || flipY) {
      //   canvas.discardActiveObject();
      //   options.event.preventDefault();
      //   options.event.stopPropagation();

      //   canvas.renderAll()
      //   return;
      // }

      ymap.set("newGroupScaleX", {corner, groupId: canvas.multiSelectId, scaleX, offsetX, flipX, width: width / canvas.width})
      return;
    }

    if (action === "scaleY") {
      const cornerPos = corner === "mt" || flipY ? top : oldTop;
      const offsetY = cornerPos / canvas.height;

      if (!multiSelect) {
        ymap.set(action, {id, scaleY, offsetY, flipY});
        return;
      }

      // if (flipX) {
      //   options.event.preventDefault();
      //   options.target.set('flipX', false)
      //   options.target.setCoords
      //   // options.event.stopPropagation();
      //   return;
      // }


      ymap.set("newGroupScaleY", {corner, groupId: canvas.multiSelectId, scaleY, offsetY, flipY, height: height / canvas.height})
      return;
    } 

    if (action === "scale") {
      const xCorner = corner === "tl" || corner === "bl" || flipX ? left : oldLeft;
      const offsetX = xCorner / canvas.width;

      const yCorner = corner === "tl" || corner === "tr" || flipY ? top : oldTop;
      const offsetY = yCorner / canvas.height;

      if (!multiSelect) {
        ymap.set(action, {id, scaleY, scaleX, offsetY, offsetX, flipX, flipY})
        return;
      }  

      // if (flipX || flipY) {
      //   // canvas.discardActiveObject();
      //   canvas.discardActiveGroup()
      //   options.event.preventDefault();
      //   options.event.stopPropagation();

      //   canvas.renderAll()
      //   return;
      // }

      ymap.set("newGroupScale", {
        corner, groupId: canvas.multiSelectId, 
        scaleY, scaleX, offsetY, offsetX, flipX, flipY, 
        width: width  / canvas.width, height: height / canvas.height
      })
      return;
    }
  })
}