import { useState } from "react"
import { useNavigate } from "react-router-dom"

const EnterRoom = () => {
  const [room, setRoom] = useState('')
  const nav = useNavigate();
  
  const handleEnterRoom = (e) => {
    e.preventDefault();
    nav(`/${room}`);
  }

  const handleSplitMode = (e) => {
    e.preventDefault();
    nav('/split-canvas')
  }

  return (
    <>
      <div 
      style={{margin: 'auto', textAlign: 'center', marginTop: "250px"}}
      >
        <h1>Whiteboard</h1>
        <form >
          <label>
            <input id="room-id" name="room-id" type="text" onChange={e => setRoom(e.target.value)} value={room} />
          </label>
      
          <button 
            onClick={handleEnterRoom}
          >Enter Room</button>
        </form>
      </div>

      <div 
        className="main-bottom"
      >
          <button    
          onClick={handleSplitMode}
          >          
            Split Mode
          </button>
      </div>
    </>
  )
}

export default EnterRoom