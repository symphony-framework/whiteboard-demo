import React, { useRef, useEffect, useState} from 'react'
import { fabric } from 'fabric';
import Toolbar from './Toolbar';
import { useReducer } from 'react';

import canvasReducer from "../reducer/reducer"
import Header from "./Header"
import Cursor from './PresenceCursor';
import { setupSubscriptions, room } from '../utils/symphony';
import setupCanvasListeners from '../utils/canvasListeners';

import { 
  DEFAULT_CURSOR_COLOR,
  DEFAULT_BRUSH_WIDTH,
  customCursorUrl 
} from '../utils/constants';

import { randName } from '../utils/canvasHelpers';

const initialState = {
  canvas: null,
  color: "#f3f3f3",
  brushWidth: DEFAULT_BRUSH_WIDTH,
}

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
    setupSubscriptions(canvas, dispatch)

    dispatch({type: "init", canvas,})
    return () => {
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    room.subscribe('others', () => {
      const users = room.getOthers();
      const others = [...users].filter(item => {
        return item[1].user?.name !== name 
      });

      if (!others.length) return;
  
      const offsetCursors = others.map((user) => {
        const {name, color} = user[1].user;

        const x = user[1].user.offsetX * window.innerWidth;
        const y = user[1].user.offsetY * window.innerHeight;
        return {name, color, x, y}
      });
  
     setOthers(offsetCursors) 
    })
  }, [name]);
  
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
    });
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
    });
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
};

export default Canvas;