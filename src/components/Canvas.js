import React, { useRef, useEffect, useState} from 'react'
import { fabric } from 'fabric';
import Toolbar from './Toolbar';
import { useReducer } from 'react';

import canvasReducer from "../reducer/reducer"
// import { drawLine, combinePaths } from "../shared/paths"
import Header from "./Header"
import Cursor from './PresenceCursor';

// import * as Y from 'yjs'
// import { WebsocketProvider } from 'y-websocket'
// import { IndexeddbPersistence } from 'y-indexeddb'

// const DEFAULT_IMAGE_WIDTH = 480;
// const DEFAULT_IMAGE_SCALE = 0.15;
// const DEFAULT_BRUSH_WIDTH = 0.02;
// const DEFAULT_ERASER_WIDTH = 0.1;

const initialState = {
  canvas: null,
  color: "#f3f3f3",
  brushWidth: DEFAULT_BRUSH_WIDTH,
}

import setupYjsObservers, { awareness, ymap } from '../utils/yjs';
import setupCanvasListeners from '../utils/canvasListeners';
import { 
  DEFAULT_CURSOR_COLOR,
  DEFAULT_BRUSH_WIDTH, 
  DEFAULT_IMAGE_WIDTH, 
  DEFAULT_ERASER_WIDTH, 
  DEFAULT_IMAGE_SCALE, 
  customCursorUrl 
} from '../utils/constants';

import { randName } from '../utils/canvasHelpers';
// const ydoc = new Y.Doc()

// const websocketProvider = new WebsocketProvider(
//   'ws://localhost:1234', 'test', ydoc
// )

// export const ymap = ydoc.getMap()

// const indexeddbProvider = new IndexeddbPersistence('count-demo', ydoc)
// indexeddbProvider.whenSynced.then(() => {
//   // do something with indexDB
// })

// const findCanvasObject = (canvas, id) => {
//   return canvas.getObjects().find(shape => shape.id === id);
// }

// const randName = () => {
//   const num = Math.floor(Math.random() * 1000);
//   return `user${num}`;
// }

// const awareness = websocketProvider.awareness;

const Canvas = () => {
  const [state, dispatch] = useReducer(canvasReducer, initialState)

  const [cursorColor, setCursorColor] = useState(DEFAULT_CURSOR_COLOR)
  const [name, setName] = useState(randName())
  const [others, setOthers] = useState([])

  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = new fabric.Canvas('canvas', {skipOffscreen: true});
    function resizeCanvas() {
      canvas.setHeight(window.innerHeight);
      canvas.setWidth(window.innerWidth * 0.9);
      canvas.renderAll();
    }

    window.addEventListener('resize', resizeCanvas, false);
    canvas.defaultCursor = `url(" ${customCursorUrl} "), auto`;

    const {innerWidth: width, innerHeight: height} = window;

    canvas.setWidth(width * 0.9);
    canvas.setHeight(height);
    canvas.setBackgroundColor('#f3f3f3')
    canvas.groupsInAction = {};

    setupCanvasListeners(canvas)
    setupYjsObservers(canvas, dispatch)

    dispatch({type: "init", canvas,})
    return () => {
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    awareness.on('change', changes => {
      const users = awareness.getStates().values();
      const others = [...users].filter(user => {
        if (!user.user) return;
        return user.user.name !== name 
      });
  
      if (!others.length) return;
  
      const offsetCursors = others.map(({user}) => {
        const {name, color} = user;
  
        const x = user.offsetX * window.innerWidth;
        const y = user.offsetY * window.innerHeight;
        return {name, color, x, y}
      })
  
     setOthers(offsetCursors) 
    })
  }, [name])
  
  const handleCursorTracking = (e) => {
    const { clientX: x, clientY: y} = e
    
    const offsetX = x / window.innerWidth;
    const offsetY = y / window.innerHeight;

    awareness.setLocalStateField('user', {
      name,
      color: cursorColor,
      offsetX,
      offsetY,
    })
  }

  const handleUserSettingsChange = (newVals) => {
    console.log("handlign user settings change", {newVals})

    const {color, name} = newVals
    if (!color || !name) return;

    setName(name);
    setCursorColor(color)
    awareness.setLocalStateField('user', {
      name,
      color,
    })
  }

  return(
    <div
      onMouseMove={handleCursorTracking}
    >
      <Header 
        userCount={others.length} 
        onUserSettingsChange={handleUserSettingsChange}
        currentName={name}
        currentColor={cursorColor}
      />

      <Toolbar state={state} dispatch={dispatch}/>

      {others.map(user => {
        if (!user) return null;

        return (
          <Cursor
            key={user.name}
            {...user}
          />
        )
      })}

      <div 
        className=""
        ref={canvasRef}
      >
        <canvas
          id="canvas"
        />
      </div>

      
    </div>
  )
}


export default Canvas