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

const Canvas = ({client, roomName, split, side}) => {
  const [state, dispatch] = useReducer(canvasReducer, INITIAL_STATE)
  const [cursorColor, setCursorColor] = useState(DEFAULT_CURSOR_COLOR)
  const [name, setName] = useState(randName())
  const [others, setOthers] = useState([])

  const roomId = roomName || useParams().id  
  const canvasRef = useRef(null);

  // useEffect(() => {
  //   const room = client.enter(roomId);

  // })
  useEffect(() => {
    const room = client.enter(roomId);
    const newSyncedMap = room.newMap();

    const canvas = new fabric.Canvas(`canvas-${roomId}`, {skipOffscreen: true});
    function resizeCanvas() {
      canvas.setHeight(window.innerHeight);
      canvas.setWidth(split ? window.innerWidth / 2 : window.innerWidth);
      canvas.renderAll();
    }

    window.addEventListener('resize', resizeCanvas, false);
    canvas.defaultCursor = `url(" ${customCursorUrl} "), auto`;

    const {innerWidth: width, innerHeight: height} = window;

    canvas.setWidth(split ? width / 2 : width);
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

    if (!state.room) return;

    state.room.subscribe('others', () => {
      const users = state.room.getOthers();
      
      const otherUsers = [...users].filter(item => {
        return item[1].user?.name !== name 
      });

      // let userLeft, userJoined
      // if (otherUsers.length < others.length) {
      //   others.forEach(user => {

      //     const inRoom = otherUsers.find(otherUser => 
      //       otherUser[1].name === user.name
      //     )

      //     if (inRoom) return;
      //     userLeft = user;
      //   })
        
      //   // console.log({newOthers, userLeft})
      // }

      if (!otherUsers.length || !state.canvas) return;
      
      const offsetCursors = otherUsers.flatMap((user) => {
        const {name, color} = user[1].user;

        // const width = state.canvas.width;
        // WINDOW.INNER

        if (!user[1] || !user[1].user) return [];

        let x = user[1].user.offsetX * state.canvas.width
        const y = user[1].user.offsetY * state.canvas.height;

        // if (split) {
        //   x += state.cavnas.width
        // }
        return [{name, color, x, y}]
      });
  
      // if (otherUsers.length > others.length) {
      //   otherUsers.forEach(user => {
      //     const { name } = user[1].user

      //     if (!name) return;
      //     const inRoom = others.find(user => user.name === name);

      //     if (!inRoom) {
      //       userJoined = user[1].user;
      //     }
      //   })
        
      // }

     setOthers(offsetCursors) 
    })
  }, [name, state.room])

  // useEffect(() => {
  //   window.addEventListener('keydown', handleUndoRedo);
    
  // }, [])
  
  const handleCursorTracking = (e) => {
    const { clientX: x, clientY: y} = e
    
    if (!state.canvas) return;

    let offsetX = x / state.canvas.width;
    const offsetY = y / state.canvas.height;
    
    if (split && side === 2) {
      offsetX -= 1;
    }

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
      className="canvas-container"
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
          id={`canvas-${roomId}`}
        />
      </div>      
    </div>
  )
}


export default Canvas