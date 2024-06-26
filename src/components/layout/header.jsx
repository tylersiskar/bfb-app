import HamburgerMenu from "../buttons/hamburger";
import "./layout.scss";
import packageJson from "../../../package.json";
import { Link } from "react-router-dom";
import { selectNavIsOpen, doNavClose, doNavOpen } from "../../api/navSlice";
import { useDispatch, useSelector } from "react-redux";

const Header = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector(selectNavIsOpen);
  const handleOpenNav = () => {
    dispatch(doNavOpen("DEFAULT"));
  };

  const handleCloseNav = () => {
    dispatch(doNavClose());
  };
  return (
    <div className="header" id="header">
      <Link style={{ textDecoration: "none" }} to="/">
        <div className="flex align-center">
          <h1 style={{ marginRight: 8 }}>Bad Franchise Builders</h1>
          <h3>{packageJson.version}</h3>
        </div>
      </Link>
      <HamburgerMenu
        onClick={() => {
          isOpen ? handleCloseNav() : handleOpenNav();
        }}
        open={isOpen}
      />
    </div>
  );
};

export default Header;
