import React from "react";
import { Link } from "react-router-dom";

const SideNavigation = (props) => {
  return (
    <div className="sidenav">
      <Link className="list-item" to="/teams">
        <p>Team / Players</p>
      </Link>
      <Link className="list-item" to="/drafts">
        <p>Drafts</p>
      </Link>
      <Link className="list-item" to="/trends">
        <p>Trends</p>
      </Link>
    </div>
  );
};

export default SideNavigation;
