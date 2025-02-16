import Icon from "@mdi/react";
import "./button.scss";
import { Link } from "react-router-dom";

const IconButton = ({
  onClick,
  icon,
  iconColor = "white",
  iconSize = 1,
  title = "Arrow",
  href,
  className = "",
  isLoading,
}) => {
  let Element = href ? Link : "button";
  return (
    <Element
      className={"icon-button" + " " + className}
      onClick={onClick}
      to={href}
    >
      <Icon
        path={icon}
        title={title}
        color={iconColor}
        size={iconSize}
        spin={isLoading && 3}
      />
    </Element>
  );
};

export default IconButton;
