import { useState } from "react";
import { Modal, Button, Form } from 'react-bootstrap';

import upArrow from "../assets/imgs/icons/up-arrow.png"
import { ColorPicker, useColor } from "react-color-palette";

export default ({userCount, onUserSettingsChange, currentName, currentColor}) => {
  const [display, setDisplay] = useState(true)
  const [msg, setMsg] = useState("")

  const [changingName, setChangingName] = useState(false)
  const [name, setName] = useState(currentName || "")

  const [colorShow, setColorShow] = useState(false);
  const [color, setColor] = useColor("hex", currentColor);

  if (!display) return null;

  const handleDisplayToggle = () => {
    setDisplay(!display)
  }  

  const showChangeNameInput = (e) => {
    e.preventDefault();
    setChangingName(true)
  }


  const handleNameFormClose = () => {
    setChangingName(false);
  }

  const handleFormSubmit = () => {
    console.log('about to submit')
    if (!name || !color) return;

    onUserSettingsChange({color: color.hex, name});
    setChangingName(false)
  }

  return (
    <header>
      {/* {msg ? <Notification /> : ""} */}

      <h1>Whiteboard</h1>
      <p>{userCount} user{userCount > 1 ? "s" : ""} in room</p>
      <span onClick={handleDisplayToggle}>
        🔼
      </span>
      { changingName ? "" : 
      (
      <>
        <Button variant="primary" onClick={showChangeNameInput}>
          User Apperance
        </Button>
        {/* <Button variant="secondary" onClick={showColorChangeModal}>
          Change Cursor Color
        </Button> */}
      </>
      ) 
      }


      <Modal show={changingName} fullscreen={"md-down"} onHide={handleNameFormClose}>
        <Modal.Header closeButton>h
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
            <Button variant="secondary" onClick={handleNameFormClose}>
              Close
            </Button>
            <Button style={{margin: '10px'}}variant="primary" onClick={handleFormSubmit}>
              Save Changes
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </header>
  )
}