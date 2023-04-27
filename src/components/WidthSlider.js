import { useState } from "react"    

const DEFAULT = 5;
const MIN_WIDTH = 1
const MAX_WIDTH = 20

const Slider = ({onWidthChange, currentVal}) => {
  const [value, setValue] = useState(DEFAULT);

  const handleSliderMove = (e) => {
    setValue(Number(e.target.value))
  }

  const handleSliderRelease = () => {
    const width  = value / 1000

    if (width === currentVal) return;
    
    onWidthChange(width);
  }

  return (
    <span className="customSlider">

      <input 
        type="range" min={MIN_WIDTH} max={MAX_WIDTH} 
        value={value} className="slider"
        onChange={handleSliderMove}
        onMouseUp={handleSliderRelease}
      >
      </input>   
    </span>
  )
};

export default Slider;
