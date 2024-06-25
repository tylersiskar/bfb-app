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
      <Link className="list-item" to="/transactions">
        <h5>Transactions</h5>
      </Link>
      <Link className="list-item" to="/mocks">
        <h5>Mock Draft Center</h5>
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
