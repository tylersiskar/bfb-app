const Button = (props) => {
  return (
    <button
      style={{
        backgroundColor: "#1f2126",
        borderRadius: 4,
        minWidth: 100,
        height: 36,
        padding: 8,
        margin: 4,
        border: "none",
        color: props.active ? "#35a7ff" : "white",
      }}
      onClick={props.onClick}
      id={props.id}
    >
      {props.children}
    </button>
  );
};

export default Button;
