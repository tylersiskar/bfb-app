import { useState } from "react";
import "./App.scss";
import Scatter from "./components/charts";

const App = () => {
  return (
    <div className="app">
      <div className="header">
        <h1>Bad Franchise Builders</h1>
      </div>
      <div className="body">
        {/* <div className="sidenav">
          <div className="list-item">
            <p>Eventually stuff will be over here.</p>
          </div>
          <div className="list-item">
            <p>Just play with the graph for now...</p>
          </div>
          <div className="list-item">
            <p>Transactions</p>
          </div>
          <div className="list-item">
            <p>Dynasty Rankings</p>
          </div>
        </div> */}
        <div style={{ paddingTop: 64, width: "100%" }}>
          <Scatter />
        </div>
      </div>
    </div>
  );
};

export default App;
