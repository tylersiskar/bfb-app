import { Link } from "react-router-dom";
import "./button.scss";

const Button = (props) => {
  let Element = props.href ? Link : "button";
  return (
    <Element
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
      disabled={props.disabled || !props.onClick}
      to={props.href}
    >
      {props.children}
    </Element>
  );
};

export default Button;
