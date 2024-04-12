import "./button.scss";

const Button = (props) => {
  return (
    <button
      className={
        (props.secondary
          ? props.active
            ? "secondary-active"
            : "secondary"
          : props.active
          ? "primary-active"
          : "primary") +
        (props.disabled ? " button-disabled" : "") +
        " " +
        props.className
      }
      style={props.style}
      onClick={props.onClick}
      id={props.id}
      disabled={props.disabled}
    >
      {props.children}
    </button>
  );
};

export default Button;
