import { useEffect, useState } from "react";

import Canvas from "./Canvas";
import { useNavigate } from "react-router-dom";


const SplitCanvas = ({client}) => {
  const [room1Name, setRoom1Name] = useState("")
  const [room2Name, setRoom2Name] = useState("")
  // const [resizing, setResizing] = useState(false)

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
  

  useEffect(() => {
    if (canvas1Selected && canvas2Selected) {
      window.addEventListener("resize", e => {
        nav("/")
      }, false) 
    }
  }, [canvas1Selected, canvas2Selected])
  

  
  return (
    <> 
      <div style={{
        textAlign: "center",
        marginTop: "15px"
      }}>
        <button onClick={handleSplitModeLeave}>
          Leave Split Mode
          </button>
      </div>

      <div style={leftStyle}>
        { canvas1Selected ? 
          (<Canvas client={client} roomName={room1Name} split={true} side={1} />) :
          <div className="split-mode-select">
          <form>
            <input type="text" id="canvas-1-name" name="canvas-1-name" value={room1Name} onChange={e => setRoom1Name(e.target.value)} />
            <button onClick={handleRoom1Selection}>Join New Room </button>
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
          </form>
        </div>
        }
      </div>
    </>
  )

}

export default SplitCanvas