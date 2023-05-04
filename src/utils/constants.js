import StraightBrushIcon from '../assets/imgs/icons/StraightBrush.png';
import WavyBrushIcon from '../assets/imgs/icons/WavyBrush.png';

import SquareIcon from '../assets/imgs/icons/Square.png'
import TriangleIcon from '../assets/imgs/icons/Triangle.png'
import CircleIcon from '../assets/imgs/icons/Circle.png'

// replace with compatible websocket server: auto-deploy `Symphony-Infrastructure` or locally run `y-websocket`
export const WS_URL = "";

export const DEFAULT_CANVAS_BACKGROUND = "#f3f3f3"

export const DEFAULT_IMAGE_WIDTH = 480;
export const DEFAULT_IMAGE_SCALE = 0.1;

export const DEFAULT_BRUSH_WIDTH = 0.005;

export const DEFAULT_CANVAS_WIDTH = 1000;

export const INITIAL_STATE = {
  room: null,
  syncedMap: null,
  canvas: null,
  color: "#f3f3f3",
  brushWidth: DEFAULT_BRUSH_WIDTH,
}

export const brandColors = [
  '#29ea8a',
  '#7cfcb9',
  '#41c9f9',
  '#3e86fa',
  '#15376e'
];

export const shapeOptions = [
  {name: 'square', icon: SquareIcon},
  {name: 'triangle', icon: TriangleIcon},
  {name: 'circle', icon: CircleIcon}
]

export const brushOptions = [
  {name: 'line', icon: StraightBrushIcon},
  {name: 'draw', icon: WavyBrushIcon},    
]

export const OFFSETPERCENT = .2;

export const offsetTop = (height) => {
  return height * OFFSETPERCENT;
};

export const offsetLeft = (width) => {
  return width * OFFSETPERCENT;
};

export const customCursorUrl = "https://ossrs.net/wiki/images/figma-cursor.png";
