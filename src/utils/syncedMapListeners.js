import { fabric } from 'fabric';
import { findCanvasObject } from './canvasHelpers'
import { drawLine, combinePaths } from "../shared/paths"

import { newSquare, newCircle, newTriangle, newText } from '../shared/draw';

const newShape  = {
  'square': newSquare,
  'circle': newCircle,
  'triangle': newTriangle,
} 

const syncedMapListeners = (syncedMap, canvas, dispatch) => {
  syncedMap.observe(event => {
    
    if (event.transaction.local) return;

    event.keysChanged.forEach(id => {
      const update = syncedMap.get(id)
      console.log({id, update})

      if (!update) {
        return;
      }

      const {action} = update;
      
      if (!action) return;

      if (action === "newPosition") {
        const {
          offsetX, offsetY, 
          type, 
          scaleX, scaleY, 
          flipY, flipX,
          angle
        } = update;

        if (!id || !offsetX || !offsetY ) return;
        
        const movedObj = findCanvasObject(canvas, id)

        console.log("new pos", {update, movedObj})

        if (movedObj instanceof fabric.Image) {
          if (scaleX) {
            const newScaleX = scaleX / 1;
            movedObj.set({
              scaleX: newScaleX,
            });
          }

          if (scaleY) {
            const newScaleY = scaleY / 1;
            movedObj.set({
              scaleY: newScaleY,
            });
          }

          if (angle) {
            movedObj.set("angle", angle)
          }


          movedObj.set("left", canvas.width * offsetX);
          movedObj.set("top", canvas.height * offsetY);

          movedObj.setCoords();
          canvas.renderAll();
          return;
        }

        if (movedObj) {
          if (scaleX) {
            movedObj.set("scaleX", scaleX);
            movedObj.set("flipX", flipX);
          }

          if (scaleY) {
            movedObj.set("scaleY", scaleY);
            movedObj.set("flipY", flipY);
          }

          if (angle) {
            movedObj.set("angle", angle)
          }

          movedObj.set("left", canvas.width * offsetX);
          movedObj.set("top", canvas.height * offsetY);

          movedObj.setCoords();

          canvas.renderAll();
          return;
        }

        if (!type) return;

        let newObj;

        if (type === 'shape') {
          const {color, shape } = update;
      
          newObj = newShape[shape](color, id, canvas);
        }


        if (type === 'text') {
          const {color} = update;

          if (!color) return;
          
          newObj = newText(color, id, canvas);
        }

        if (type === 'newLine') {
          const { width, color, startPoint, endPoint } = update;
          if (!id || !width || !color || !startPoint || !endPoint) return;

          const getPathEnds = () => {
            const paths = canvas.getObjects().filter(obj => {
              if (obj.id !== +id) return false;
      
              canvas.remove(obj)
              return true;
            })
      
            if (!paths || !paths.length) return;
            return {start: paths[0].path, end: paths[paths.length - 1].path};
          }
          
          const endPoints = getPathEnds();

          if (!endPoints) {
            const newLinePoints = drawLine(startPoint, endPoint)
            newObj = combinePaths(newLinePoints, color, width);
          }
      
          if (endPoints) {
            const {start, end} = endPoints;
            if (!start || !end) return;
            
            const linePath = drawLine(start, end)
            newObj = combinePaths(linePath, color, width)
          }
        }

        if (type === 'finishDrawing') {
          const {width, color, pathStr } = update;

          if (!id || !width || !color || !pathStr) return;
  
          const clearOldPath = () => {
            canvas.getObjects().forEach(obj => {
              if (+obj.id !== +id) return;
              canvas.remove(obj)
            })      
          }
      
          clearOldPath()
      
          const pencil = new fabric.PencilBrush(canvas);
          const path = pencil.createPath(pathStr);
      
          path.set("strokeWidth", width)
          path.set("stroke", color)
      
          newObj = path;
        }

        if (type === 'image/upload') {
          const { imageUrl, offsetX, offsetY, scaleX, scaleY } = update;
          
          console.log({update});

          fabric.Image.fromURL(imageUrl, image => {
            
            // Calculate new scale factor based on received values
            if (scaleX) {
              const newScaleX = scaleX / 1;
              image.set({
                scaleX: newScaleX,
              });
            }
  
            if (scaleY) {
              const newScaleY = scaleY / 1;
              image.set({
                scaleY: newScaleY,
              });
            }
  
            if (angle) {
              movedObj.set("angle", angle)
            }
  
  
            image.set("left", canvas.width * offsetX);
            image.set("top", canvas.height * offsetY);
            
            image.id = id;

            image.setCoords();

            canvas.add(image);
          }, {crossOrigin: 'anonymous'})
        }
        
        if (scaleX) {
          newObj.set("scaleX", scaleX);
          newObj.set("flipX", flipX);
        }

        if (scaleY) {
          newObj.set("scaleY", scaleY);
          newObj.set("flipY", flipY);
        }

        if (angle) {
          newObj.set("angle", angle)
        }

        newObj.set("left", canvas.width * offsetX);
        newObj.set("top", canvas.height * offsetY);
        newObj.setCoords();

        newObj.id = id;

        canvas.add(newObj)
        canvas.renderAll()
      }

      if (action === 'textChange') {
        if (!update.hasOwnProperty("text") || !update.hasOwnProperty("color")) return;
        const {color, text} = update;

        const textObj = findCanvasObject(canvas, id);

        if (textObj) {
          textObj.text = text;
          canvas.renderAll();
        }

        if (!textObj) {
          const newTextObj = newText(color, id, canvas);
          newTextObj.text = text;
          canvas.add(newTextObj)
        }        

        return;
      }

      if (action === 'clear') {
        const object = findCanvasObject(canvas, id);

        if (!object) return;
        canvas.remove(object)
      }

      if (action === 'newShape') {
        const { shape, color } = update;
        if (!shape || !color) return;

        dispatch({type: "shape", color, shape, id,})
      }

      if (action === 'newText') {
        const {color, type} = update;

        if (!color || !type) return;

        dispatch({type, color, id})
      }

      if (action === 'newDrawing') {
        const {id, points, color, width} = update

        const offsetPoints = points.map(point => {
          return {
            x: canvas.width * point.offsetX,
            y: canvas.height * point.offsetY,
          }
        });

        const pencil = new fabric.PencilBrush(canvas);
        const drawing = pencil.convertPointsToSVGPath(offsetPoints);

        const path = pencil.createPath(drawing.toString());
        path.set("strokeWidth", width)
        path.set("stroke", color)

        path.drawingMode = true;
        path.id = id;

        canvas.add(path)     
      }

      if (action === 'drawing') {
        const { id, points, color, width } = update;

        const offsetPoints = points.map(point => {
          return {
            x: canvas.width * point.offsetX,
            y: canvas.height * point.offsetY,
          }
        });

        const pencil = new fabric.PencilBrush(canvas);
        const drawing = pencil.convertPointsToSVGPath(offsetPoints);

        const path = pencil.createPath(drawing.toString());
        path.set("strokeWidth", width);
        path.set("stroke", color);

        path.id = id;
        path.drawingMode = true;

        canvas.add(path)
      }

      if (action === "finishDrawing") {
        const {width, color, pathStr, offsetX, offsetY, offsetPath } = update;

        if (!id || !width || !color || !pathStr || !offsetX || !offsetY) return;
        
        dispatch({type: "finishDrawing", id, width, color, pathStr, offsetX, offsetY, offsetPath});
      }

      if (action === 'newLine') {
        const { width, color, startPoint, endPoint } = update;

        if (!id || !width || !color || !startPoint || !endPoint) return;

        dispatch({id, type: "newLine", startPoint, endPoint, color, width});
      }

      if (action === 'image/upload') {
        const { imageUrl } = update;

        if (!imageUrl) return;

        fabric.Image.fromURL(imageUrl, image => {
          console.log("image upload", {image, action, type: update.type, imageUrl});
          dispatch({type: action, image, id, creator: false})
        }, {crossOrigin: 'anonymous'})
      }      
    })

    return;
  })
}

export default syncedMapListeners;