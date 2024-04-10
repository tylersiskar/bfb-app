import React from "react";
import { Link } from "react-router-dom";

const SideNavigation = (props) => {
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

export default SideNavigation;
