import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Body from "./components/layout/body";
import Header from "./components/layout/header";
import "./App.scss";
import SideNavigation from "./components/layout/sidenav";

function App() {
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(false);
  useEffect(() => setOpenMenu(false), [location]);
  return (
    <div>
      <Header onMenuClick={setOpenMenu} open={openMenu} />
      <Body>
        <div className={`content-wrapper ${openMenu ? "nav-open" : ""}`}>
          <Outlet />
          <SideNavigation />
        </div>
      </Body>
    </div>
  );
}

export default App;
