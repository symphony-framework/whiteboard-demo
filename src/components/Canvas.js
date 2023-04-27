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

import background from "../assets/imgs/background/logo.png";

import { 
  DEFAULT_BRUSH_WIDTH,
  INITIAL_STATE,
  customCursorUrl 
} from '../utils/constants';

import { randColor, randName } from '../utils/canvasHelpers';

const Canvas = ({client, roomName, split, side}) => {
  const [state, dispatch] = useReducer(canvasReducer, INITIAL_STATE)
  const [cursorColor, setCursorColor] = useState(randColor())
  const [name, setName] = useState(randName())
  const [others, setOthers] = useState([])

  const id = useParams().id;
  const roomId = roomName || id
  const canvasRef = useRef(null);

  const height = window.innerHeight;
  const width = window.innerWidth;

  useEffect(() => {
    const room = client.enter(roomId);
    const newSyncedMap = room.newMap("whiteboard");
    
    const canvas = new fabric.Canvas(`canvas-${roomId}`, {skipOffscreen: true});
    function resizeCanvas() {
      if (split) return;

        canvas.setHeight(window.innerHeight || height);
        canvas.setWidth(window.innerWidth || width);
        canvas.renderAll();
    }

    window.addEventListener('resize', resizeCanvas, false);
    canvas.defaultCursor = `url(" ${customCursorUrl} "), auto`;
    canvas.freeDrawingCursor = 'url("/icons/Brush.svg") 50 0, auto'

    const {innerWidth: width, innerHeight: height} = window;

    canvas.setWidth(split ? width / 2 : width);
    canvas.setHeight(height);
    canvas.setBackgroundColor('#f3f3f3');

    const imageScale = 0.3;
    const center = canvas.getCenter();

    canvas.setBackgroundImage(background, (image) => {
      if (!image) return;

      canvas.renderAll();
    }, {
      opacity: 0.1,
      backgroundImageStretch: false,
      top: center.top,
      left: center.left,

      scaleX: imageScale,
      scaleY: imageScale,
      originX: 'center',
      originY: 'center'
    });

    canvas.brushWidth = DEFAULT_BRUSH_WIDTH;
    canvas.groupsInAction = {};
    canvas.brushesInAction = {};

    setupSyncedMapListeners(newSyncedMap, canvas, dispatch);
    setupCanvasListeners(newSyncedMap, canvas);
    
    dispatch({type: "init", newSyncedMap, canvas, room,})

    return () => {
      window.removeEventListener('resize', resizeCanvas, false);
      canvas.dispose();
      
      client.leave(roomId);
    };
  }, [roomId, client, split, height, width, roomName]);

  useEffect(() => {
    if (!state.room) return;

    state.room.subscribe('others', () => {
      const users = state.room.getOthers();

      const otherUsers = [...users].filter(item => {
        return item[1].user?.name !== name 
      });

      if (!state.canvas) return;
      
      const offsetCursors = otherUsers.flatMap((user) => {
        if (!user || !user[1] || !user[1].user) return [];

        const {name, color} = user[1].user;

        let x = user[1].user.offsetX * state.canvas.width
        const y = user[1].user.offsetY * state.canvas.height;

        return [{name, color, x, y}]
      });

      setOthers(offsetCursors) 
    })

  }, [name, state.room, roomName, state.canvas,])

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

  return (
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