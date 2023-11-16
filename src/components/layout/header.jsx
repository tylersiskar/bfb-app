import HamburgerMenu from "../buttons/hamburger";
import "./layout.scss";
import packageJson from "../../../package.json";

const Header = ({ onMenuClick }) => {
  return (
    <div className="header">
      <div className="flex align-center">
        <h1 style={{ marginRight: 8 }}>Bad Franchise Builders</h1>
        <h3>{packageJson.version}</h3>
      </div>
      <HamburgerMenu onClick={onMenuClick} />
    </div>
  );
};

export default Header;
