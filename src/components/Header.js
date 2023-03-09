import {  useState } from "react";
import { Modal, Button, Form, Dropdown} from 'react-bootstrap';
import { useNavigate } from "react-router-dom";

// import upArrow from "../assets/imgs/icons/up-arrow.png"
import { ColorPicker, useColor } from "react-color-palette";
import HamburgerIcon from "../assets/imgs/icons/HamburgerIcon.png"

const Header = ({userCount, onUserSettingsChange, currentName, currentColor, roomId, others}) => {
  const [viewMode, setViewMode] = useState('');
  // const [display, setDisplay] = useState(true)
  // const [msg, setMsg] = useState("")
  // const [selecting, setSelecting] = useState(false)
  // const [changingName, setChangingName] = useState(false)
  const [name, setName] = useState(currentName || "")
  const [roomName, setRoomName] = useState(roomId);
  const [color, setColor] = useColor("hex", currentColor);

  const nav = useNavigate();

  const handleDisplayToggle = () => {
    // setDisplay(!display)
    setViewMode('')
  }  

  // const showChangeNameInput = (e) => {
  //   e.preventDefault();
  //   setChangingName(true)
  // }


  // const handleUserApperanceFormClose = () => {
  //   setViewMode("");
  // }

  const handleFormSubmit = () => {
    console.log('about to submit')
    if (!name || !color) return;

    onUserSettingsChange({color: color.hex, name});
    setViewMode("")
  }

  const handleSelectViewMode = (viewMode) => {
    console.log("setting view", {viewMode})
    setViewMode(viewMode)
  }

  const handleJoinNewRoom = () => {
    nav(`/${roomName}`)
  }

  const handleLeaveRoom = (e) => {
    console.log("leaving", {e})
    e.preventDefault();
    nav('/');
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
          console.log({user})
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
      {/* {msg ? <Notification /> : ""} */}

      {viewMode === 'user-cards' ? UserCardsView : ""}
      
      <Modal show={viewMode === 'user-settings'} fullscreen={"md-down"} onHide={handleDisplayToggle}>
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

export default Header