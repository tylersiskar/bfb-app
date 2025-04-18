import { HamburgerMenu } from "../buttons";
import "./layout.scss";
import packageJson from "../../../package.json";
import { Link } from "react-router-dom";
import { selectNavIsOpen, doNavClose, doNavOpen } from "../../api/navSlice";
import { useDispatch, useSelector } from "react-redux";
import { useGetSearchQuery } from "../../api/bfbApi";
import { selectLeagueYear } from "../../api/selectors/leagueSelectors";
import { Search } from "../inputs";
import { useEffect, useState } from "react";

const Header = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector(selectNavIsOpen);
  const leagueYear = useSelector(selectLeagueYear);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchIsActive, setSearchActive] = useState(false);
  const { data: searchResults } = useGetSearchQuery({
    name: debouncedSearch,
    year: leagueYear,
  });

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  const handleOpenNav = () => {
    dispatch(doNavOpen("DEFAULT"));
  };

  const handleCloseNav = () => {
    dispatch(doNavClose());
  };

  const handleInputChange = (event) => {
    setSearch(event.target.value);
  };

  return (
    <div className="header" id="header">
      <Link style={{ textDecoration: "none" }} to="/">
        <div className="flex align-center">
          <h1 style={{ marginRight: 8 }}>
            {true ? "BFBs" : "Bad Franchise Builders"}
          </h1>
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
      <div className="flex justify-center align-center">
        <Search
          onSearch={handleInputChange}
          onSearchClick={() => {
            if (searchIsActive) setSearch("");
            setSearchActive((prevActive) => !prevActive);
          }}
          isActive={searchIsActive}
          searchResults={searchResults}
          inputValue={search}
          onBlur={() => setSearch("")}
        />
        <HamburgerMenu
          onClick={() => {
            isOpen ? handleCloseNav() : handleOpenNav();
          }}
          open={isOpen}
        />
      </div>
    </div>
  );
};

export default Header;
