const Cursor = ({ x, y, color, name }) => {
  if (!x || !y) return;
  const cursorStyle = {
    position: "absolute",  
    transform: `translate(${x}px, ${y}px)`, 
    zIndex: "2", 
    border: `2px ${color} solid`,
    fontSize: 10,
    pointerEvents: 'none',
  }

  return (
    <span style={cursorStyle}>
      <svg color={color} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 39.989 39.988">
        <path id="Path_343" data-name="Path 343" d="M22.783,22.784,18.4,38.851a1.538,1.538,0,0,1-2.9.188L.12,2.131A1.538,1.538,0,0,1,2.131.12L39.039,15.5a1.538,1.538,0,0,1-.188,2.9Zm-6.17,10.934,3.434-12.592a1.539,1.539,0,0,1,1.08-1.08l12.592-3.434L4.4,4.395Z" transform="translate(0.003 0.003)"/>
      </svg>
      {" " + name}
    </span>
  );
}

export default Cursor