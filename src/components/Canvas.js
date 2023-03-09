import React, { useRef, useEffect, useState} from 'react'
import { fabric } from 'fabric';
import Toolbar from './Toolbar';
import { useReducer } from 'react';
import { useParams } from 'react-router-dom';

import canvasReducer from "../reducer/reducer"
import Header from "./Header"
import Cursor from './PresenceCursor';

import setupSyncedMapListeners from "../utils/syncedMapListeners";
import setupCanvasListeners from '../utils/canvasListeners';

import { 
  INITIAL_STATE,
  DEFAULT_CURSOR_COLOR,
  customCursorUrl 
} from '../utils/constants';

import { randName } from '../utils/canvasHelpers';

const Canvas = ({client}) => {
  const [state, dispatch] = useReducer(canvasReducer, INITIAL_STATE)
  const [cursorColor, setCursorColor] = useState(DEFAULT_CURSOR_COLOR)
  const [name, setName] = useState(randName())
  const [others, setOthers] = useState([])

  const roomId = useParams().id  
  const canvasRef = useRef(null);

  // useEffect(() => {
  //   const room = client.enter(roomId);

  // })
  console.log({roomId})
  useEffect(() => {
    const room = client.enter(roomId);
    const newSyncedMap = room.newMap();

    const canvas = new fabric.Canvas('canvas', {skipOffscreen: true});
    function resizeCanvas() {
      canvas.setHeight(window.innerHeight);
      canvas.setWidth(window.innerWidth);
      canvas.renderAll();
    }

    window.addEventListener('resize', resizeCanvas, false);
    canvas.defaultCursor = `url(" ${customCursorUrl} "), auto`;

    const {innerWidth: width, innerHeight: height} = window;

    canvas.setWidth(width);
    canvas.setHeight(height);
    canvas.setBackgroundColor('#f3f3f3')
    canvas.groupsInAction = {};

    // setupCanvasListeners(canvas)
    // setupYjsObservers(canvas, dispatch)
    setupSyncedMapListeners(newSyncedMap, canvas, dispatch)
    setupCanvasListeners(newSyncedMap, canvas)

    dispatch({type: "init", newSyncedMap, canvas, room,})
    return () => {
      canvas.dispose();
      client.leave();
    };
  }, [roomId]);

  useEffect(() => {
    console.log("before getting others")

    if (!state.room) return;

    console.log("getting others")
    state.room.subscribe('others', () => {
      const users = state.room.getOthers();
      
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
  }, [name, state.room])

  // useEffect(() => {
  //   window.addEventListener('keydown', handleUndoRedo);
    
  // }, [])
  
  const handleCursorTracking = (e) => {
    const { clientX: x, clientY: y} = e
    
    const offsetX = x / window.innerWidth;
    const offsetY = y / window.innerHeight;
    
    if (!state.room) return;
    state.room.updatePresence({
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

    if (!state.room) return;

    state.room.updatePresence({
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

  // if (!state.room) {
  //   return <div>Loading...</div>
  // }

  return(
    <div
      onMouseMove={handleCursorTracking}
      key={roomId}
    >
      <Header 
        roomId={roomId}
        userCount={others.length} 
        onUserSettingsChange={handleUserSettingsChange}
        currentName={name}
        currentColor={cursorColor}
        others={others}
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