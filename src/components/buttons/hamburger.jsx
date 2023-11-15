import Icon from "@mdi/react";
import { mdiMenu, mdiClose } from "@mdi/js";
import "./button.scss";
import { useState } from "react";

const HamburgerMenu = (props) => {
  const [open, setOpen] = useState(false);
  const _onClick = () => {
    props.onClick && props.onClick(!open);
    setOpen(!open);
  };
  return (
    <button className="menu" style={{ cursor: "pointer" }} onClick={_onClick}>
      {open ? (
        <Icon path={mdiClose} title="Menu" size={1} color="white" />
      ) : (
        <Icon path={mdiMenu} title="Menu" size={1} color="white" />
      )}
    </button>
  );
};

export default HamburgerMenu;
