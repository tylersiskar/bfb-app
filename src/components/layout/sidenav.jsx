import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { selectNavContent } from "../../api/navSlice";

const DefaultNavContent = () => {
  return (
    <div className="sidenav">
      <Link className="list-item" to="/teams">
        <h5>Team / Players</h5>
      </Link>
      <Link className="list-item" to="/drafts">
        <h5>Drafts</h5>
      </Link>
      <Link className="list-item" to="/trends">
        <h5>Trends</h5>
      </Link>
      <Link className="list-item" to="/mocks">
        <h5>Mock Draft Center</h5>
      </Link>
      <Link className="list-item" to="/rosters">
        <h5>Keepers</h5>
      </Link>
      <Link
        className="list-item"
        to="/"
        onClick={() => {
          localStorage.removeItem("league_id");
          localStorage.removeItem("year");
          window.location.reload();
        }}
      >
        <h5>Enter new League ID</h5>
      </Link>
    </div>
  );
};

const contentTypes = {
  DEFAULT: <DefaultNavContent />,
};

const renderNavContent = (content) => {
  switch (content) {
    case "DEFAULT":
      return contentTypes.DEFAULT;
    default:
      return contentTypes.DEFAULT;
  }
};

const SideNavigation = (props) => {
  const navContent = useSelector(selectNavContent);
  return renderNavContent(navContent);
};

export default SideNavigation;
