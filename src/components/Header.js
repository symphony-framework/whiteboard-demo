import {  useState } from "react";
import { Modal, Button, Form, Dropdown} from 'react-bootstrap';
import { useNavigate } from "react-router-dom";

// import upArrow from "../assets/imgs/icons/up-arrow.png"
import UserNotification from "./Notification";
import { ColorPicker, useColor } from "react-color-palette";
import HamburgerIcon from "../assets/imgs/icons/HamburgerIcon.png"

const Header = ({
  userCount, onUserSettingsChange, 
  currentName, currentColor, 
  roomId, others,
}) => {
  const [viewMode, setViewMode] = useState('');

  const [name, setName] = useState(currentName || "")
  const [roomName, setRoomName] = useState(roomId);
  const [color, setColor] = useColor("hex", currentColor);

  const [msg, setMsg] = useState('');

  const nav = useNavigate();

  const handleDisplayToggle = () => {
    setViewMode('')
  }  

  const handleFormSubmit = () => {
    if (!name || !color) return;


    const nameInUse = others.find(user => user.name === name);

    if (nameInUse) {
      setMsg(`display name "${name}" already in use`);
      return;
    }

    onUserSettingsChange({color: color.hex, name});
    setMsg("")
    setViewMode("")
  }

  const handleSelectViewMode = (viewMode) => {
    setViewMode(viewMode)
  }

  const handleJoinNewRoom = () => {
    console.log("joining a new room", {roomName})
    if (!roomName) {
      setMsg("Enter a room name")
      return;
    }

    if (roomName === 'split-canvas') {
      setMsg("Reserved room name")
      return;
    }

    setMsg("")
    nav(`/${roomName}`)
  }

  const handleLeaveRoom = (e) => {
    e.preventDefault();
    nav('/');
  }

  const handleHideMsg = () => {
    setMsg("")
  }

  const items = [
    {
      name: "show other users",
      onSelect: () => {
        setViewMode("user-cards")
      }
    },
    {
      name: "change user appearance",
      onSelect: () => {
        setViewMode('user-settings')
      }
    },
    {
      name: "change room",
      onSelect: () => {
        setViewMode('change-room')
      }
    },
    {
      name: 'leave room',
      onSelect: () => {
        setViewMode('leave-room')
      }
    }
  ]


  if (!viewMode) return (

    <header className="hidden">
      <DropDownButton 
      items={items}
      onSelectViewMode={handleSelectViewMode}
      />
    </header>
  );

  const UserCardsView = (
    <>
      <h1>{roomId}</h1>
      <p className="user-count">Other users: {userCount}</p>

      <span onClick={handleDisplayToggle} style={{background: "transparent"}}>
        🔼
      </span>

      {others.map(user => 
        {
          return (        
          <div className="other-user-card"
          key={user.connectionId}
          style={{
            backgroundColor: user.color,
            color: "black",
            borderRadius: 5,
          }}
          >
            {user.name}
          </div>
          )
        }      
      )}
    </>
  );


  return (
    <header className="show">
      {viewMode === 'user-cards' ? UserCardsView : ""}
      
      <Modal show={viewMode === 'user-settings'} fullscreen={"md-down"} onHide={handleDisplayToggle}>
        < UserNotification msg={msg} onMessage={handleHideMsg}/>
        
        <Modal.Header closeButton>
            <Modal.Title>Change appearance</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="display-name">
              <Form.Label>New Display Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="any name"
                value={name}
                onChange={(e) => {
                  console.log({e, target: e.target})
                  setName(e.target.value)
                }}
                autoFocus
              />
            </Form.Group>
            <Form.Group
              className="mb-3"
              controlId="cursor-color"
            >
              <Form.Label>New Cursor color</Form.Label>
              <div className="text-center">
                  <ColorPicker width={460} height={100} color={color} 
                  onChange={setColor} 
                  hideHSV dark /> 
              </div>
            </Form.Group>
            <Button variant="secondary" onClick={handleDisplayToggle}>
              Close
            </Button>
            <Button style={{margin: '10px'}}variant="primary" onClick={handleFormSubmit}>
              Save Changes
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={viewMode === 'change-room'} fullscreen={"md-down"} onHide={handleDisplayToggle}>
        < UserNotification msg={msg} />
        
        <Modal.Header closeButton>
            <Modal.Title>New Room</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="display-name">
              <Form.Label>New Room Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="room id"
                value={roomName}
                onChange={(e) => {
                  setRoomName(e.target.value)
                }}
                autoFocus
              />
            </Form.Group>
        
            <Button variant="secondary" onClick={handleDisplayToggle}>
              Close
            </Button>
            <Button style={{margin: '10px'}}variant="primary" onClick={handleJoinNewRoom}>
              Join Room
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={viewMode === 'leave-room'} fullscreen={"md-down"} onHide={handleDisplayToggle}>
        <Modal.Header closeButton>
            <Modal.Title>Are you sure you want to leave</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
      
            <Button variant="secondary" onClick={handleDisplayToggle}>
              Return
            </Button>
            <Button style={{margin: '10px'}}variant="primary" onClick={handleLeaveRoom}>
              Leave Room
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </header>
  )
}

const DropDownButton = ({items}) => {
  return (
  <Dropdown>
    <Dropdown.Toggle variant="purple" id="dropdown-basic">
      <img src={HamburgerIcon} height={35} width={35} />
    </Dropdown.Toggle>

    <Dropdown.Menu style={{textAlign: "center"}}>
      {
          items.map(item => (
              <Dropdown.Item 
                  key={item.name} 
                  onClick={item.onSelect}
                  >
                  {item.name}
              </Dropdown.Item>

          ))
      }
    </Dropdown.Menu>
  </Dropdown>
  )
}

// const ErrorNotification = ({title, msg, onMsgClose}) => {
//   if (!msg) return null;

//     return (
//       <Notif variant="danger" onClose={onMsgClose} dismissible>
//         <Alert.Heading>{title}</Alert.Heading>
//         <p>
//           {msg}
//         </p>
//       </Alert>
//   );
// }

export default Header