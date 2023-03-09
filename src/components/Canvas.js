import React, { useRef, useEffect, useState} from 'react'
import { fabric } from 'fabric';
import Toolbar from './Toolbar';
import { useReducer } from 'react';

import canvasReducer from "../reducer/reducer"
import Header from "./Header"
import Cursor from './PresenceCursor';

import setupYjsObservers, { room } from '../utils/symphony.config';
import setupCanvasListeners from '../utils/canvasListeners';

import { 
  INITIAL_STATE,
  DEFAULT_CURSOR_COLOR,
  customCursorUrl 
} from '../utils/constants';

import { randName } from '../utils/canvasHelpers';

const Canvas = () => {
  const [state, dispatch] = useReducer(canvasReducer, INITIAL_STATE)

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
    console.log("presence")
    room.subscribe('others', () => {
      const users = room.getOthers().values();
      console.log({users})
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

  // useEffect(() => {
  //   window.addEventListener('keydown', handleUndoRedo);
    
  // }, [])
  
  const handleCursorTracking = (e) => {
    const { clientX: x, clientY: y} = e
    
    const offsetX = x / window.innerWidth;
    const offsetY = y / window.innerHeight;

    room.updatePresence({
      user: {
        name,
        color: cursorColor,
        offsetX,
        offsetY,
      }
    })
  }

  const handleUserSettingsChange = (newVals) => {
    console.log("handling user settings change", {newVals})

    const {color, name} = newVals
    if (!color || !name) return;

    setName(name);
    setCursorColor(color)
    room.updatePresence({
      user: {
        name,
        color,
      }
  })
    
  }

  // const handleUndoRedo = (e) => {
  //   const { ctrlKey, key } = e;

  //   if (!key || !ctrlKey) return;

  //   if (/z/.test(key)) {
  //     undoManager.undo()
  //   }

  //   if (/y/.test(key)) {
  //     undoManager.redo();
  //   }
  // }

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