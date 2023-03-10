
const UserNotification = ({msg, onMessage, success}) => {
  if (!msg) return null;

  const style = {
      background: "transparent",
      position: 'absolute',
      zIndex: 10,
      // border: "5px solid rgb(153, 139, 235)",
      borderRadius: "5px",
      width: "100%",
      fontSize: "20px",
      textAlign: "center",
      padding: 10,
      color: "white",
      backgroundColor: success ? "lightgreen" : "red",
  }

  if (onMessage) {
    setTimeout(() => {
      onMessage("")
    }, 5000)
  }

  return (
    <div style={style}>
      <p>{msg}</p>
    </div>
  );
};

export default UserNotification;