
const UserNotification = ({msg, onMessage, success}) => {
  if (!msg) return null;

  const style = {
      background: "transparent",
      position: 'relative',
      zIndex: 10,
      // border: "5px solid rgb(153, 139, 235)",
      borderRadius: "5px",
      width: "max-content",
      fontSize: "20px",
      textAlign: "center",
      padding: '0 10px',
      margin: 'auto',
      color: "white",
      backgroundColor: success ? "lightgreen" : "red",
  }

  if (onMessage) {
    setTimeout(() => {
      onMessage("")
    }, 6000)
  }

  return (
    <div style={style}>
      <p>{msg}</p>
    </div>
  );
};

export default UserNotification;