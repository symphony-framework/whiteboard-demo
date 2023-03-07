export const findCanvasObject = (canvas, id) => {
  return canvas.getObjects().find(shape => shape.id === id);
}

export const randName = () => {
  const num = Math.floor(Math.random() * 1000);
  return `user${num}`;
}
