import React, { useState } from 'react';
import { fabric } from "fabric";

import WidthSlider from "./WidthSlider";

import { ColorPicker, useColor } from "react-color-palette";
import "react-color-palette/lib/css/styles.css";

import BrushIcon from '../assets/imgs/icons/Brush.svg';

import CursorIcon from '../assets/imgs/icons/Cursor.svg';
import TextIcon from '../assets/imgs/icons/T.svg';
import ColorIcon from '../assets/imgs/icons/color.png';
import ImageIcon from '../assets/imgs/icons/Image.svg';

import ClearIcon from '../assets/imgs/icons/Clear.svg';

import ShapeIcon from '../assets/imgs/icons/Shape.svg';


import DownloadIcon from '../assets/imgs/icons/Download.svg'


import { Dropdown, Modal } from 'react-bootstrap';
import { shapeOptions, brushOptions } from '../utils/constants';

const Toolbar = ({state, dispatch}) => {
    const [color, setColor] = useColor("hex", "#121212");
    const [colorShow, setColorShow] = useState(false);
    const [selectedTool, setSelectedTool] = useState("cursor");

    // const [imagePreview, showImagePreview] = useState(false);
    const handleColorClose = () => { 
      dispatch({type: "color", color: color.hex,});
      setColorShow(false);
      return;
    }
    
    const handleColorShow = () => setColorShow(true);

    const handlePhotoUpload = (e) => {
        e.preventDefault();
        const file = e.target.files[0];
        if (file) {
          const id = Date.now();
          const objectUrl = URL.createObjectURL(file);
            
          fabric.Image.fromURL(objectUrl, image => {
            if (!image) return;
            // showImagePreview(image);
            
            dispatch(({type:"image/upload", image, id, creator: true}))
          }, { crossOrigin: 'anonymous' });
        }
    };

    const buttons = [
        {
            name: "cursor",
            icon: CursorIcon,
            type: "button",
            onClick: () => {
                setSelectedTool("cursor")
                dispatch({type: "cursor"})
                // handle cursor button click
            }
        },
        {
            name: "shape",
            icon: ShapeIcon,
            type: "dropdown",
            items: shapeOptions,
            onClick: (shape) => {
                setSelectedTool("shape");
                const id = Date.now();
                dispatch({type: "shape", color: color.hex, shape, id, creator: true})
            }
        },
        {
            name: "brush",
            icon: BrushIcon,
            type: "dropdown",
            items: brushOptions,
            width: state.brushWidth,
            onClick: (brush) => { 
                const id = Date.now();
                dispatch({type: "brush", brush, color: color.hex, id, creator: true})
                setSelectedTool('brush') 
            }
        },
        {
            name: "color",
            icon: ColorIcon,
            type: "button",
            onClick: () => {
                setSelectedTool('color')
                handleColorShow();
            }
        },

        {
            name: "text",
            icon: TextIcon,
            type: "button",
            
            onClick: () => { 
                const id = Date.now();
                setSelectedTool('text') 
                dispatch({type: "text", color: color.hex, id, creator: true}) 
            }
        },
        {
            name: "clear",
            icon: ClearIcon,
            type: "button",
            onClick: () => { 
                setSelectedTool('clear')
                dispatch({type: "clear", creator: true} ); 
            },
        },
        {
            name: "image",
            icon: ImageIcon,
            type: "button",
            onClick: () => { 
                setSelectedTool('image') 
            }
        },  
        {
            name: "download",
            icon: DownloadIcon,
            type: "button",
            onClick: () => dispatch({type: 'download'})
        },  
    ]

    return (
        <div className="toolbar shadow px-2 py-4 rounded">
            {buttons.map(button => {
                if (button.type === "dropdown")     return <DropDownButton key={button.name} {...button} selected={selectedTool} dispatch={dispatch}/>

                if (button.type === "colorselect")  return null;

                if (button.type === "button")       return <ToolButton key={button.name} {...button} selected={selectedTool} onPhotoUpload={handlePhotoUpload} />
                
                return null;
            })}

            <Modal show={colorShow} fullscreen={"md-down"} onHide={handleColorClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Color Selection</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="text-center">
                        <ColorPicker width={460} height={100} color={color} 
                        onChange={setColor} 
                        hideHSV dark /> 
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    )
}

const ToolButton = ({name, icon, onClick, selected, onPhotoUpload}) => {
    
    const style = selected === name ? { boxShadow: "inset 0px 3px 6px #00000029" } : {}

    return (
        <div className="text-center py-2" key={name}>
            <label>
            <div 
                className="toolbar-button cursor-pointer p-2" 
                onClick={onClick} 
                style={style}
            >

                <img alt={`${name}-icon}`} src={icon} className="icon"/>
            </div>
             { name === 'image' ? <input type="file" className="d-none" onChange={onPhotoUpload} /> : null}
            </label>
        </div>   
    )
}

export const DropDownButton = ({name, items, icon, onClick, selected, width, dispatch}) => {
    const style= {
        backgroundColor:'transparent', 
        border: "none", 
        boxShadow: selected === name ? "inset 0px 3px 6px #00000029" : ""
    }

    return (
        <Dropdown>
            <Dropdown.Toggle 
                variant="success" 
                id="dropdown-basic"
                style={style}
            >
                <img alt={`${name}-icon}`}  src={icon} className="icon"/>
            </Dropdown.Toggle>
            <Dropdown.Menu style={{textAlign: "center"}}>
                {
                    items.map(item => (
                        <Dropdown.Item 
                            key={item.name} 
                            onClick={() => onClick(item.name)}
                            >
                            <img alt={`${name}-icon}`} src={item.icon} className="icon"/>
                        </Dropdown.Item>

                    ))
                }
            
            {
                name === 'brush' ? (
                    < WidthSlider 
                        currentVal={width}
                        onWidthChange={(newWidth) => dispatch({type: 'brushWidth', width: newWidth})}
                    /> 
                ) : null
            }

            </Dropdown.Menu>
        </Dropdown>
    )
}

export default Toolbar;
