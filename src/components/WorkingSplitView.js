
import Canvas from "./Canvas";

const SplitCanvas = ({client}) => {

  const leftStyle = {
    display: 'inline-block',
    left: '0',
    top: '0',
    width: '50%',
    height: '100%',
    borderRight: 'solid black 2px'
  }

  const rightStyle = {
    display: 'inline-block',
    top: '0',
    right: '0',
    width: '50%',
    height: '100%',
    borderLeft: 'solid black 2px'
  }

  return (
    <> 
    <div style={leftStyle}>
      {/* <h1>test</h1> */}
      <Canvas client={client} roomName={'test'} split={true} side={1} />
    </div>
    <div style={rightStyle}>
      {/* <h1>test2</h1> */}
      <Canvas client={client} roomName={'test1'} split={true} side={2} />
    </div>
    </>
  )

}

export default SplitCanvas