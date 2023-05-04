import { useState } from "react"
import { useNavigate } from "react-router-dom"
import UserNotification from "./Notification";
import logo from "../assets/imgs/background/main-logo.png";

const EnterRoom = () => {
  const [notification, setNotification] = useState({});
  const [room, setRoom] = useState('')
  const nav = useNavigate();
  
  const handleEnterRoom = (e) => {
    e.preventDefault();
    if (!room) {
      const newNotificaiton = {success: false, msg: "Enter a Room ID"};
      setNotification(newNotificaiton);
      return;
    }

    nav(`/${room}`);
  }

  const handleSplitMode = (e) => {
    e.preventDefault();
    nav('/split-canvas')
  }

  const handleNotification = (msg) => {
    setNotification(msg);
  }

  return (
    <div className="main">
      <img src={logo} alt="symphony logo" className="logo"/>
      <h1>Whiteboard Demo</h1>
      
      <div 
      className="main-top"
      >
        <form >
          <UserNotification 
            msg={notification.msg} 
            onMessage={handleNotification} 
            success={notification.success} />

          <label>
            <input 
              id="room-id" 
              name="room-id" 
              type="text" 
              placeholder="Room ID"
              onChange={e => setRoom(e.target.value)} value={room} 
              className="join-room"/>
          </label>
      
          <button 
            className="join-room"   
            onClick={handleEnterRoom}
          >Join Room</button>
        </form>
      </div>

      <div 
        className="main-bottom"
      >
          <button
          className="join-room"   
          onClick={handleSplitMode}
          >          
            Split Mode
          </button>
      </div>
    </div>
  )
}

export default EnterRoom