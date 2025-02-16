import { HamburgerMenu } from "../buttons";
import "./layout.scss";
import packageJson from "../../../package.json";
import { Link } from "react-router-dom";
import { selectNavIsOpen, doNavClose, doNavOpen } from "../../api/navSlice";
import { useDispatch, useSelector } from "react-redux";
import { useGetPlayersAllQuery } from "../../api/bfbApi";
import { selectLeagueYear } from "../../api/selectors/leagueSelectors";

const Header = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector(selectNavIsOpen);
  const leagueYear = useSelector(selectLeagueYear);
  const { data: playersAll } = useGetPlayersAllQuery(leagueYear);

  const lastUpdatedDate =
    playersAll && playersAll.length > 0 && playersAll[0].last_updated;
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
      {/* {lastUpdatedDate && (
          <p className="subtitle">
            <small>
              Last Updated: {new Date(lastUpdatedDate).toLocaleString()}
            </small>
          </p>
        )} */}
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
