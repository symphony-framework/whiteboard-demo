import { useState } from "react"    

const DEFAULT = 2;
const MIN_WIDTH_PERCENT = 0.5
const MAX_WIDTH_PERCENT = 5

const Slider = ({onWidthChange, currentVal}) => {
  const [value, setValue] = useState(currentVal || DEFAULT);

  const handleSliderMove = (e) => {
    setValue(Number(e.target.value))
  }

  const handleSliderRelease = () => {
    if (value === currentVal) return;
    const width = value / 100;
    onWidthChange(width)
  }

  return (
    <span className="customSlider">

      <input 
        type="range" min={MIN_WIDTH_PERCENT} max={MAX_WIDTH_PERCENT} 
        value={value} className="slider"
        onChange={handleSliderMove}
        onMouseUp={handleSliderRelease}
      >
      </input>   
    </span>
  )
};

export default Slider;
