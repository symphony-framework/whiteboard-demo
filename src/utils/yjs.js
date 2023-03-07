import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { IndexeddbPersistence } from 'y-indexeddb'

import { fabric } from 'fabric';
import { findCanvasObject } from './canvasHelpers'
import { drawLine, combinePaths } from "../shared/paths"

const ydoc = new Y.Doc()

const websocketProvider = new WebsocketProvider(
  'ws://localhost:1234', 'test', ydoc
)

export const ymap = ydoc.getMap()

const indexeddbProvider = new IndexeddbPersistence('count-demo', ydoc)
indexeddbProvider.whenSynced.then(() => {
  // do something with indexDB
})

export const awareness = websocketProvider.awareness;

export default (canvas, dispatch) => {
  ymap.observe(event => {
    if (event.transaction.local) return;

    // if (event.transaction.local) return;
    event.keysChanged.forEach(key => {
      if (key === 'newShape') {
        const newShape = ymap.get('newShape')
        const {shape, color, id} = newShape
        if (!shape || !color || !id) return;
  
        dispatch({type: "shape", color, shape, id,})
      }

      if (key === "newText") {
        const newText = ymap.get('newText');
        const {color, id} = newText;

        if (!color || !id) return;
        dispatch({type: "text", color, id})
      }

      if (key === "newPosition") {
        const {id, offsetX, offsetY} = ymap.get("newPosition")
        if (!id || !offsetX || !offsetY ) return;
        
        const movedObj = findCanvasObject(canvas, id)
        if (!movedObj) return;

        movedObj.set("left", canvas.width * offsetX);
        movedObj.set("top", canvas.height * offsetY);
        canvas.renderAll()
        return;
      }

      if (key === 'newGroupSelection') {
        const {groupId, group, originalOffsetX, originalOffsetY} = ymap.get(key);
        // get og objects, cache original 
        // console.log({groupId, group, originalOffsetX, originalOffsetY})
        if (!group || !groupId || !originalOffsetX || !originalOffsetY) return;

        const groupPosition = {originalOffsetX, originalOffsetY, objects: []};

        group.forEach(objId => {
          const targetObj = findCanvasObject(canvas, objId);
          if (!targetObj) return;

          const { left, top } = targetObj
          
          const objOffsetX = left / canvas.width;
          const objOffsetY = top / canvas.height;

          const cacheObjData = {id: objId, objOffsetX, objOffsetY }
          groupPosition.objects.push(cacheObjData);
        });


        canvas.groupsInAction[groupId] = groupPosition;
        // cache original object offsets, including group offset
        return;
      }

      if (key === 'clearGroupSelection') {
        const {groupId} = ymap.get(key);
        if (!groupId) return;
        console.log("CLEARING GROUP SELECTION YJS")
        delete canvas.groupsInAction[groupId];
      }

      if (key === "newGroupMovement") {
        const {group, groupId, offsetX, offsetY} = ymap.get("newGroupMovement")

        if (!group || !groupId || !offsetX || !offsetY) return;
        const groupObject = canvas.groupsInAction[groupId];

        if (!groupObject) return;
        

        const { originalOffsetX, originalOffsetY, objects } = groupObject
        const xChange = offsetX - originalOffsetX;
        const yChange = offsetY - originalOffsetY
            
        groupObject.objects.forEach(obj => {
          const { id, objOffsetX, objOffsetY } = obj;
          
          if (objOffsetX < 0 || objOffsetY < 0) {
            return;
          }

          const newOffsetX = objOffsetX + xChange;
          const newOffsetY = objOffsetY + yChange;

          const targetObject = findCanvasObject(canvas, id);

          const newLeft = newOffsetX * canvas.width;
          const newTop = newOffsetY * canvas.height;

          targetObject.set('left', newLeft);
          targetObject.set('top', newTop);
          targetObject.setCoords();            
        })

        canvas.renderAll();
        return;
      }

      if (key === "scaleX") {
        const {id, offsetX, scaleX, flipX} = ymap.get("scaleX")

        if (!id || !scaleX || !offsetX) return;

        const targetObj = findCanvasObject(canvas, id)

        if (!targetObj) return; 

        targetObj.set('scaleX', scaleX);
        targetObj.set("left", canvas.width * offsetX); 
        targetObj.set("flipX", flipX)
        targetObj.setCoords()

        canvas.renderAll();
        return;
      }

      if (key === "scaleY") {
        const {id, offsetY, scaleY, flipY} = ymap.get("scaleY")

        if (!id || !scaleY || !offsetY) return;

        const targetObj = findCanvasObject(canvas, id)
        if (!targetObj) return; 
        
        targetObj.set('scaleY', scaleY);
        targetObj.set("top", canvas.height * offsetY); 
        targetObj.set('flipY', flipY)
        targetObj.setCoords()

        canvas.renderAll();
        return;
      }

      if (key === "scale") {
        const {id, scaleY, scaleX, offsetY, offsetX, flipX, flipY} = ymap.get("scale")
        
        if (!id || !scaleX || !offsetX || !scaleY || !offsetY) return;

        const targetObj = findCanvasObject(canvas, id)

        if (!targetObj) return;

        targetObj.set('scaleY', scaleY);
        targetObj.set("top", canvas.height * offsetY); 
        targetObj.set('flipY', flipY)

        targetObj.set('scaleX', scaleX);
        targetObj.set("left", canvas.width * offsetX); 
        targetObj.set("flipX", flipX)

        targetObj.setCoords()
        
        canvas.renderAll()
        return;
      } 

      if (key === 'newGroupScaleX') { 
  
        const {corner, groupId, scaleX, offsetX, flipX, width} = ymap.get(key);
        
        const groupObject = canvas.groupsInAction[groupId];
        if (!groupObject) return;

        const { originalOffsetX } = groupObject
        const xChange = (offsetX - originalOffsetX);
        const groupWidth = width * scaleX;

        groupObject.objects.forEach(obj => {
          const { id, objOffsetX, objOffsetY } = obj;

          if (objOffsetX < 0 || objOffsetY < 0) {
            console.log("invalid offset", {objOffsetX, objOffsetY})
            return;
          }
          
          const targetObject = findCanvasObject(canvas, id);
          if (!targetObject) return;

          const objWidth = targetObject.width * scaleX;

          const objectOffsetXInGroup = (objOffsetX - originalOffsetX) * scaleX;

          let newOffsetX = originalOffsetX + objectOffsetXInGroup + xChange;
          let left;

          if (!flipX) {
            left = newOffsetX * canvas.width;
          }

          if (flipX && corner === 'ml') {
            const objWidthPercent = objWidth / canvas.width;
            
            let rightOffset = groupWidth - (objWidthPercent + objectOffsetXInGroup);
            if (rightOffset < 0) rightOffset = 0;
            newOffsetX = offsetX + rightOffset;
            left = newOffsetX * canvas.width;
          }
        
          if (flipX && corner === "mr") {       
            left = (originalOffsetX - objectOffsetXInGroup) * canvas.width;
            left -= objWidth;
          }

          targetObject.set('scaleX', scaleX);
          targetObject.set("left", left); 
          targetObject.set("flipX", flipX)
          targetObject.setCoords()

          return;
        });
        canvas.renderAll()
        return;
      }

      if (key === 'newGroupScaleY') {
        const {corner, groupId, scaleY, offsetY, flipY, height} = ymap.get(key);
        
        const groupObject = canvas.groupsInAction[groupId];
        if (!groupObject) return;

        const { originalOffsetY } = groupObject
        const yChange = (offsetY - originalOffsetY);
        const groupHeight = height * scaleY;
        

        groupObject.objects.forEach(obj => {
          const { id, objOffsetX, objOffsetY } = obj;

          if (objOffsetX < 0 || objOffsetY < 0) {
            console.log("invalid offset", {objOffsetX, objOffsetY})
            return;
          }
          
          const targetObject = findCanvasObject(canvas, id);

          if (!targetObject) return;

          const objHeight = targetObject.height * scaleY;

          const objectOffsetYInGroup = (objOffsetY - originalOffsetY) * scaleY;

          let newOffsetY = originalOffsetY + objectOffsetYInGroup + yChange;
          let top;

          if (!flipY) {
            top = newOffsetY * canvas.height;
          }

          if (flipY && corner === 'mt') {
            const objHeightPercent = objHeight / canvas.height;              

            let bottomOffset = groupHeight - (objHeightPercent + objectOffsetYInGroup);
            if (bottomOffset < 0) bottomOffset = 0;
            newOffsetY = offsetY + bottomOffset;
            top = newOffsetY * canvas.height;
          }
        
          if (flipY && corner === "mb") {       
            top = (originalOffsetY - objectOffsetYInGroup) * canvas.height;
            top -= objHeight;
          }

          targetObject.set('scaleY', scaleY);
          targetObject.set("top", top); 
          targetObject.set("flipY", flipY)
          targetObject.setCoords()

          return;
        });
        canvas.renderAll()
        return;
      }

      if (key === 'newGroupScale') {
        const {
          corner, groupId, 
          scaleY, scaleX, offsetY, offsetX, flipX, flipY, 
          width, height
        } = ymap.get("newGroupScale")

        if (!scaleY || !scaleX || !groupId || !offsetX || !offsetY) return;
        const groupObject = canvas.groupsInAction[groupId];


        if (!groupObject) return;

        const { originalOffsetX, originalOffsetY } = groupObject
        
        const xChange = (offsetX - originalOffsetX);
        const yChange = (offsetY - originalOffsetY);
        const groupWidth = width * scaleX;
        const groupHeight = height * scaleY

        groupObject.objects.forEach(obj => {
          const { id, objOffsetX, objOffsetY } = obj;

          if (objOffsetX < 0 || objOffsetY < 0) {
            console.log("invalid offset", {objOffsetX, objOffsetY})
            return;
          }

          const targetObject = findCanvasObject(canvas, id);
          if (!targetObject) return;
          

          const objWidth = targetObject.width * scaleX
          const objHeight = targetObject.height * scaleY

          const objectOffsetXInGroup = (objOffsetX - originalOffsetX) * scaleX;
          const objectOffsetYInGroup = (objOffsetY - originalOffsetY) * scaleY;

          let newOffsetX = originalOffsetX + objectOffsetXInGroup + xChange;
          let newOffsetY = originalOffsetY + objectOffsetYInGroup + yChange;

          let left = newOffsetX * canvas.width;
          let top = newOffsetY * canvas.height;

          if (flipX) {
            const objWidthPercent = objWidth / canvas.width;
            
            let rightOffset = groupWidth - (objWidthPercent + objectOffsetXInGroup);
            if (rightOffset < 0) rightOffset = 0;
            newOffsetX = offsetX + rightOffset;

            left = newOffsetX * canvas.width;    
          }

          if (flipY) {
            const objHeightPercent = objHeight / canvas.height;              
            let bottomOffset = groupHeight - (objHeightPercent + objectOffsetYInGroup);
            if (bottomOffset < 0) bottomOffset = 0;
            newOffsetY = offsetY + bottomOffset;

            top = newOffsetY * canvas.height;  
          }

          // if (!flipX && !flipY) {
          //   left = newOffsetX * canvas.width;
          //   top = newOffsetY * canvas.height;
          // }

          // scaling from top left corner
          // if (flipX && flipY) {
          //   const objHeightPercent = objHeight / canvas.height;              

          //   let bottomOffset = groupHeight - (objHeightPercent + objectOffsetYInGroup);
          //   if (bottomOffset < 0) bottomOffset = 0;
          //   newOffsetY = offsetY + bottomOffset;
          //   top = newOffsetY * canvas.height;

          //   const objWidthPercent = objWidth / canvas.width;
            
          //   let rightOffset = groupWidth - (objWidthPercent + objectOffsetXInGroup);
          //   if (rightOffset < 0) rightOffset = 0;
          //   newOffsetX = offsetX + rightOffset;
          //   left = newOffsetX * canvas.width;
          // }

          // if (flipX && !flipY) {
          //   const objWidthPercent = objWidth / canvas.width;
            
          //   let rightOffset = groupWidth - (objWidthPercent + objectOffsetXInGroup);
          //   if (rightOffset < 0) rightOffset = 0;
          //   newOffsetX = offsetX + rightOffset;
          //   left = newOffsetX * canvas.width;    
          //   top = newOffsetY * canvas.height;      
          // }

          // if (flipY && !flipX) {
          //   const objHeightPercent = objHeight / canvas.height;              

          //   let bottomOffset = groupHeight - (objHeightPercent + objectOffsetYInGroup);
          //   if (bottomOffset < 0) bottomOffset = 0;
          //   newOffsetY = offsetY + bottomOffset;
          //   top = newOffsetY * canvas.height;  
          //   left = newOffsetX * canvas.width;
          // }

          // if (flipY) newOffsetY = offsetY + objectOffsetYInGroup;
          // console.log({h: targetObject.height})
    

          // console.log('new obj offsets', {left, top, targetObject, scaleY, flipY, objOffsetY, originalOffsetY, offsetY})

          // if (flipY) console.log("flipped", {originalOffsetY, offsetY})

          // const xCorner = corner === "tl" || corner === "bl" || flipX ? left : oldLeft;
          
          // const yCorner = corner === "tl" || corner === "tr" || flipY ? top : oldTop;
          
          // console.log({targetObject, left, top, newOffsetX, newOffsetY})

          // if (!targetObject.flipXSet) {
          //   targetObject.lastFlipX = targetObject.flipX;
          //   targetObject.flipXSet = true;
          // }

          // if (!targetObject.flipYSet) {
          //   targetObject.lastFlipX = targetObject.flipX;
          //   targetObject.flipYSet = true;
          // }

          // if (flipY && flipX) {
          //   // targetObject.set('flipY', targetObject.flipY);
          //   // targetObject.set('flipX', targetObject.flipX);
            
          //   targetObject.set('angle', 180);
          // }

          // if (flipX && !flipY) {
          //   targetObject.set('flipY', !targetObject.lastFlipY);
          //   targetObject.set('angle', 180)
          // }

          // if (flipY && !flipX) {
          //   targetObject.set('flipY', !targetObject.lastFlipY);
          // }

          targetObject.set('scaleY', scaleY);
          targetObject.set('top', top);

          targetObject.set('flipY', flipY)
          
          targetObject.set('scaleX', scaleX);
          targetObject.set('left', left);
          targetObject.set('flipX', flipX)

          targetObject.setCoords();
          // console.log('reset', {targetObject})
          // targetObject.setCoords();            
        })

        canvas.renderAll();
        return;
      }

      if (key === 'updateGroupPositionsCache') {
        const {groupId, group, originalOffsetX, originalOffsetY} = ymap.get(key);
        console.log("GROUP YJS UPDATE", {groupId, group, originalOffsetX, originalOffsetY})
        // get og objects, cache original 
        // console.log({groupId, group, originalOffsetX, originalOffsetY})
        if (!group || !groupId || !originalOffsetX || !originalOffsetY) return;


        const cachedGroup = canvas.groupsInAction[groupId];

        console.log({cachedGroup})
        if (!cachedGroup) return;

        console.log("group yjs update", {group})
        cachedGroup.originalOffsetX = originalOffsetX;
        cachedGroup.originalOffsetY = originalOffsetY;
        cachedGroup.objects = group

        group.forEach(obj => {
          const { id } = obj;

          if (!id) return;
          const targetObject = findCanvasObject(canvas, id)

          console.log({targetObject}, "REDRAWING MANUALLY A FLIPPED ITEM")
          const { objOffsetX, objOffsetY } = obj;
          console.log("remote obj offsets", {targetObject, objOffsetX, objOffsetY})

         if (targetObject.flipX) {

         }

         if (targetObject.flipY) {

         }
        })

        console.log("group yjs cache update2", {cachedGroup, canvas})
        return;     
      }

      if (key === "rotate") {
        const { id, angle, offsetX, offsetY } = ymap.get('rotate');
        const object = findCanvasObject(canvas, id)
        if (!object) return;

        object.set('angle', angle)
        object.set('left',  canvas.width * offsetX)
        object.set('top', canvas.height * offsetY)
        canvas.renderAll();
      }

      if (key === "removeObject") {
        const { id } = ymap.get("removeObject")
        if (!id) return; 

        const object = findCanvasObject(canvas, id)

        if (!object) return;

        canvas.remove(object);
        // canvas.renderAll();
        return;
      }

      if (key === "newDrawing") {
        const {id, points, color, width} = ymap.get("newDrawing")

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
        path.id = id;

        canvas.add(path)
      }

      if (key === "drawing") {
        const {id, points, color, width} = ymap.get("drawing");
        
        const offsetPoints = points.map(point => {
          return {
            x: canvas.width * point.offsetX,
            y: canvas.height * point.offsetY,
          }
        });
        
        console.log("drawing yjs", {offsetPoints})

        const pencil = new fabric.PencilBrush(canvas);
        const drawing = pencil.convertPointsToSVGPath(offsetPoints);

        const path = pencil.createPath(drawing.toString());
        path.set("strokeWidth", width)
        path.set("stroke", color)
        path.id = id;
        path.drawingMode = true;

        console.log("ADD PATH", {path})
        canvas.add(path)

    
    /* for LOAD TESTING */
        
        // if (false) {
        //   const coords = oldPath.getCoords()
        //   const {top, left, stroke, strokeWidth} = oldPath;

        //   canvas.remove(oldPath);

        //   console.log({coords, id})
        //   return;
        //   const pencil = new fabric.PencilBrush(canvas);
        //   const drawing = pencil.convertPointsToSVGPath(coords);

        //   const path = pencil.createPath(drawing.toString());
        //   path.set("strokeWidth", width)
        //   path.set("stroke", color)
        //   path.id = id;

        //   console.log("ADD PATH", {path})
        //   canvas.add(path)

        //   // console.log({coords, path, top, left, stroke, strokeWidth})
        //   return;

        //   // console.log({path, offsetPoint})
        //   path.set('pathOffset', offsetPoint);
        //   path.set('width', width)
        //   path.set('stroke', color)

        //   path.setCoords();
        //   canvas.requestRenderAll();
        //   // const lastPoint = path.path[path.path.length]

        //  //  const firstNewPoint = points.find(point => point.x > lastPathPoint.x || point.y > lastPathPoint.y)
        //   // const newPoints = 
        //   console.log({pathOffset: path.pathOffset, path})
        //   console.log("drawing extended")
        // }



    /* FOR LOAD TESTING */

       // const pointsArr = points.flatMap(point => [point.x, point.y])
        
        // const coordinates = [
        //   {x : 0.2, y: 0.2},
        //   {x : 0.88156813, y: 0.67090207},
        //   {x: 0.86200052, y: 0.67090207},
        //   {x: 0.83264917, y: 0.67908657},
        //   {x: 0.81308156,  y: 0.67908657},
        //   {x: 0.77883828,  y: 0.68727112},
        //   {x: 0.75437874,  y: 0.68727112},
        //   {x: 0.72013545,  y: 0.68727112},
        //   {x: 0.69567597,  y: 0.68727112},
        //   {x: 0.67121649,  y: 0.69545561},
        //   {x: 0.65164888,  y: 0.69545561},
        //   {x: 0.63208127,  y: 0.70364016},
        //   {x: 0.61251366,  y: 0.70364016},
        //   {x: 0.59294611,  y: 0.72000921},
        //   {x: 0.58316231,  y: 0.7281937},
        //   {x: 0.58316231,  y: 0.73637825}
        // ];

        // const oldPath = findCanvasObject(canvas, id);
        // console.log({oldPath})
        // const coordinates = oldPath.path.map(point => {
        //   return {
        //     x: point[1],
        //     y: point[2]
        //   }
        // })

        // console.log({coordinates})

        // if (oldPath) canvas.remove(oldPath)
//           const points = [];


        // for(let i =0; i < coordinates.length; i++) {
        //   points.push({
        //   x : (canvas.width * coordinates[i].x),
        //   y : (canvas.height * coordinates[i].y)
        //   });
        // }

        // console.log({coords})
        // offsetPoints.forEach(point => points.push(point));
      /* FOR LOAD TESTING LINE DRAW */

      //drow curved line plane
      // const points = coordinates.concat(offsetPoints.pop())
      // for(let i =0; i < points.length - 1; i++)
      // {

      // //alert(points[i].x);
      //     canvas.add(new fabric.Line([points[i].x, points[i].y, points[i+1].x, points[i+1].y], {
      //           stroke: color,
      //           strokeWidth: width,
      //       }));
      // }



      /* FOR LOAD TESTING path*/  
        // for(let i =0; i < offsetPoints.length - 1; i++) {
        // //alert(points[i].x);
          
        //   const points = offsetPoints[i];
        //   const nextPoints = offsetPoints[i + 1]

        //   const pointsPair = [points, nextPoints]

        //   const pencil = new fabric.PencilBrush(canvas);
        //   const drawing = pencil.convertPointsToSVGPath(pointsPair);

        //   const path = pencil.createPath(drawing.toString());
        //   path.set("strokeWidth", width)
        //   path.set("stroke", color)
        //   path.id = id;

        //   console.log("ADD PATH", {path})
        //   canvas.add(path)
        // }
      }

      if (key === "finishDrawing") {
        const {id, width, color } = ymap.get("finishDrawing");

        if (!id || !width || !color) return;
        const getPaths = () => {
          let allPaths = [];
          canvas.getObjects().forEach(obj => {
            if (obj.id !== id) return;

            obj.path.forEach(pathArr => {
              pathArr.forEach(coord => allPaths.push(coord))
            })

            canvas.remove(obj)
          })

          return allPaths
        }

        const allPaths = getPaths();
        const pencil = new fabric.PencilBrush(canvas);

        const path = pencil.createPath(allPaths.toString());
        path.set("strokeWidth", width)
        path.set("stroke", color)
        path.id = id;


        canvas.add(path)
      }

      if (key === 'finishLine') {
        const { id, width, color } = ymap.get("finishLine");

        if (!id || !width || !color) return;

        const getPathEnds = () => {
          const paths = canvas.getObjects().filter(obj => {
            if (obj.id !== id) return;
            canvas.remove(obj)
            return true;
          })

          if (!paths || !paths.length) return;
          return {start: paths[0].path, end: paths[paths.length - 1].path};
        }

        const endPoints = getPathEnds();
        if (!endPoints) return;

        const {start, end} = endPoints;
        if (!start || !end) return;
        
        const linePath = drawLine(start, end)
        const onePath = combinePaths(linePath, color, width)
        onePath.id = id;

        canvas.add(onePath)

        return;
      }
      
    // if (key === 'newErase') {
      //   const {id, points} = ymap.get("newDrawing")

      //   if (!id || !points) return;

      //   const offsetPoints = points.map(point => {
      //     return {
      //       x: canvas.width * point.offsetX,
      //       y: canvas.height * point.offsetY,
      //     }
      //   });

      //   const pencil = new fabric.PencilBrush(canvas);
      //   const drawing = pencil.convertPointsToSVGPath(offsetPoints);

      //   const path = pencil.createPath(drawing.toString());
      //   path.set("strokeWidth", DEFAULT_ERASER_WIDTH)
      //   path.set("stroke", state.color)
      //   path.id = id;

      //   canvas.add(path)
      // }

      // if (key === 'erasing') {
      //   const {id, points, color} = ymap.get("newDrawing")

      //   if (!id || !points) return;

      //   const offsetPoints = points.map(point => {
      //     return {
      //       x: canvas.width * point.offsetX,
      //       y: canvas.height * point.offsetY,
      //     }
      //   });
        
      //   const pencil = new fabric.PencilBrush(canvas);
      //   const drawing = pencil.convertPointsToSVGPath(offsetPoints);

      //   const path = pencil.createPath(drawing.toString());
      //   path.set("strokeWidth", width)
      //   path.set("stroke", color)
      //   path.id = id;
      //   path.drawingMode = true;

      //   canvas.add(path)
    // }
      
      if (key === 'image/upload') {
        const { imageUrl, id } = ymap.get('image/upload');

        fabric.Image.fromURL(imageUrl, image => {
          dispatch({type: "image/upload", image, id, creator: false})
        }, {crossOrigin: 'anonymous'})
      }
    })

    return;
  })

}