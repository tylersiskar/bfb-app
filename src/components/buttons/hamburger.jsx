import Icon from "@mdi/react";
import { mdiMenu, mdiClose } from "@mdi/js";
import "./button.scss";

const HamburgerMenu = ({ open, onClick }) => {
  const _onClick = () => {
    onClick && onClick(!open);
  };
  return (
    <button
      className="menu"
      style={{
        cursor: "pointer",
        height: 32,
        display: "flex",
        alignItems: "center",
      }}
      onClick={_onClick}
    >
      <Icon
        path={open ? mdiClose : mdiMenu}
        title="Menu"
        size={1}
        color="white"
      />
    </button>
  );
};

export default HamburgerMenu;
