// import React, { useRef, useEffect, useState} from 'react'
// import { fabric } from 'fabric';
// import Toolbar from './Toolbar';
// import { useReducer } from 'react';
// // import { useParams } from 'react-router-dom';

// import canvasReducer from "../reducer/reducer"
// import Header from "./Header"
// import Cursor from './PresenceCursor';

// import setupSyncedMapListeners from "../utils/syncedMapListeners";
// import setupCanvasListeners from '../utils/canvasListeners';



// import { 
//   INITIAL_STATE,
//   DEFAULT_CURSOR_COLOR,
//   customCursorUrl 
// } from '../utils/constants';
// import { Dropdown } from 'react-bootstrap';
// import { Modal, Button, Form } from "react-bootstrap";
import { useState } from "react";

import Canvas from "./Canvas";
import { useNavigate } from "react-router-dom";


const SplitCanvas = ({client}) => {
  const [room1Name, setRoom1Name] = useState("")
  const [room2Name, setRoom2Name] = useState("")

  const [canvas1Selected, setCanvas1Selected] = useState(false)
  const [canvas2Selected, setCanvas2Selected] = useState(false)

  const nav = useNavigate();

  const leftStyle = {
    display: 'inline-block',
    left: '0',
    top: '0',
    width: '50%',
    height: '100%',
  }

  const rightStyle = {
    display: 'inline-block',
    top: '0',
    right: '0',
    width: '50%',
    height: '100%',
  }


  const handleSplitModeLeave = (e) => {
    e.preventDefault();
    nav('/')
  }

  const handleRoom1Selection = (e) => {
    e.preventDefault();
    e.stopPropagation()

    if (canvas2Selected && room1Name === room2Name) {
      return;
    }

    setCanvas1Selected(true)
  }

  const handleRoom2Selection = (e) => {
    e.preventDefault();
    e.stopPropagation()

    if (canvas1Selected && room1Name === room2Name) {
      return;
    }

    setCanvas2Selected(true)
  }


  return (
    <> 
    <div style={leftStyle}>
      { canvas1Selected ? 
        (<Canvas client={client} roomName={room1Name} split={true} side={1} />) :
        <div className="split-mode-select">
        <form>
          <input type="text" id="canvas-1-name" name="canvas-1-name" value={room1Name} onChange={e => setRoom1Name(e.target.value)} />
          <button onClick={handleRoom1Selection}>Join New Room </button>
          <button onClick={handleSplitModeLeave}>Leave Split Mode</button>
        </form>
      </div>
      }
    </div>

    <div style={rightStyle}>
      { canvas2Selected ? 
        (<Canvas client={client} roomName={room2Name} split={true} side={2} />) :
        
        <div className="split-mode-select">
        <form>
          <input type="text" id="canvas-2-name" name="canvas-2-name" value={room2Name} onChange={e => setRoom2Name(e.target.value)} />
          <button onClick={handleRoom2Selection}>Join New Room </button>
          <button onClick={handleSplitModeLeave}>Leave Split Mode</button>
        </form>
      </div>
      }
    </div>
    </>
  )

}

// const SplitSelectModal = (onRoomJoin, onSplitModeLeave, canvasNum) => {
//   const [roomName, setRoomName] = useState("")


//   return (
//     <div className="split-mode-select">
//       <form>
//         <input type="text" id={`canvas-${canvasNum}`} name={`canvas-${canvasNum}`} value={roomName} onChange={e => setRoomName(e.target.value)} />
//         <button onClick={() => onRoomJoin(canvasNum, roomName)}>Join New Room </button>
//         <button onClick={onSplitModeLeave}>Leave Split Mode</button>
//       </form>
//     </div>
//   )
// }
// const DropDownButton = ({items}) => {
//   return (
//   <Dropdown>
//     <Dropdown.Toggle variant="purple" id="dropdown-basic">
//       <img src={HamburgerIcon} height={35} width={35} />
//     </Dropdown.Toggle>

//     <Dropdown.Menu style={{textAlign: "center"}}>
//       {
//           items.map(item => (
//               <Dropdown.Item 
//                   key={item.name} 
//                   onClick={item.onSelect}
//                   >
//                   {item.name}
//               </Dropdown.Item>

//           ))
//       }
//     </Dropdown.Menu>
//   </Dropdown>
//   )
// }


export default SplitCanvas