const Button = (props) => {
  return (
    <button
      style={{
        backgroundColor: props.active ? "#35a7ff" : "#1f2126",
        borderRadius: 4,
        height: 36,
        padding: 8,
        width: "100%",
        border: "none",
        color: props.active ? "#1f2126" : "white",
        cursor: "pointer",
        ...props.style,
      }}
      onClick={props.onClick}
      id={props.id}
    >
      {props.children}
    </button>
  );
};

export default Button;
