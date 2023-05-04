import { useEffect, useState } from "react";

import Canvas from "./Canvas";
import UserNotification from "./Notification";
import { useNavigate } from "react-router-dom";


const SplitCanvas = ({client}) => {
  const [notification, setNotification] = useState({});

  const [room1Name, setRoom1Name] = useState("")
  const [room2Name, setRoom2Name] = useState("")
  // const [resizing, setResizing] = useState(false)

  const [canvas1Selected, setCanvas1Selected] = useState(false)
  const [canvas2Selected, setCanvas2Selected] = useState(false)

  const nav = useNavigate();

  const handleNotification = (msg) => {
    setNotification(msg);
  }

  const handleSplitModeLeave = (e) => {
    e.preventDefault();
    nav('/')
  }

  const handleRoom1Selection = (e) => {
    e.preventDefault();
    e.stopPropagation()

    console.log({room1Name});
    if (!room1Name) {
      setNotification({success: false, msg: "Enter Room ID", room: 1});
      return;
    }

    if (canvas2Selected && room1Name === room2Name) {
      setNotification({success: false, msg: "Cannot enter the same room", room: 1});
      return;
    }

    setCanvas1Selected(true)
  }

  const handleRoom2Selection = (e) => {
    e.preventDefault();
    e.stopPropagation()

    if (!room2Name) {
      setNotification({success: false, msg: "Enter Room ID", room: 2});
      return;
    }

    if (canvas1Selected && room1Name === room2Name) {
      setNotification({success: false, msg: "Cannot enter the same room", room: 2});
      return;
    }

    setCanvas2Selected(true)
  }

  useEffect(() => {
    if (canvas1Selected && canvas2Selected) {
      window.addEventListener("resize", e => {
        nav("/")
      }, false) 
    }
  }, [canvas1Selected, canvas2Selected])
  

  
  return (
    <> 
      <div className="leave-split-mode">
        <button 
          className="join-room"   
          onClick={handleSplitModeLeave}
        >
          Leave Split Mode
          </button>
      </div>

      <div className="split-left">
        { canvas1Selected ? 
          (<Canvas client={client} roomName={room1Name} split={true} side={1} />) :
          <div className="split-mode-select">
          <form>
            <UserNotification 
              msg={notification.room === 1 ? notification.msg : ""} 
              onMessage={handleNotification} 
              success={notification.success} />
            <input 
              type="text" 
              id="canvas-1-name" 
              name="canvas-1-name" 
              className="join-room"
              value={room1Name} 
              onChange={e => setRoom1Name(e.target.value)} />
            <button 
              className="join-room"
              onClick={handleRoom1Selection}>
                Join New Room 
            </button>
          </form>
        </div>
        }
      </div>

      <div className="split-right">
        { canvas2Selected ? 
          (<Canvas client={client} roomName={room2Name} split={true} side={2} />) :
          
          <div className="split-mode-select">
          <form>
            <UserNotification 
              msg={notification.room === 2 ? notification.msg : ""} 
              onMessage={handleNotification} 
              success={notification.success} />
            <input 
              type="text" id="canvas-2-name" 
              name="canvas-2-name" 
              className="join-room"
              value={room2Name} 
              onChange={e => setRoom2Name(e.target.value)} />
            <button 
              className="join-room"
              onClick={handleRoom2Selection}>
                Join New Room 
            </button>          
          </form>
        </div>
        }
      </div>
    </>
  )

}

export default SplitCanvas