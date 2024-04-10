import Icon from "@mdi/react";
import "./button.scss";

const IconButton = ({
  onClick,
  icon,
  iconColor = "white",
  iconSize = 1,
  title = "Arrow",
}) => {
  return (
    <button className="icon-button" onClick={onClick}>
      <Icon path={icon} title={title} color={iconColor} size={iconSize} />
    </button>
  );
};

export default IconButton;
