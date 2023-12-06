import HamburgerMenu from "../buttons/hamburger";
import "./layout.scss";
import packageJson from "../../../package.json";
import { Link } from "react-router-dom";

const Header = ({ onMenuClick, open }) => {
  return (
    <div className="header" id="header">
      <Link style={{ textDecoration: "none" }} to="/">
        <div className="flex align-center">
          <h1 style={{ marginRight: 8 }}>Bad Franchise Builders</h1>
          <h3>{packageJson.version}</h3>
        </div>
      </Link>
      <HamburgerMenu onClick={onMenuClick} open={open} />
    </div>
  );
};

export default Header;
