import { useState } from "react";
import { Outlet } from "react-router-dom";
import Body from "./components/layout/body";
import Header from "./components/layout/header";
import "./App.scss";
import SideNavigation from "./components/layout/sidenav";

function App({ children }) {
  const [openMenu, setOpenMenu] = useState(false);
  return (
    <div>
      <Header onMenuClick={setOpenMenu} />
      <Body>
        <div className="flex w-100">
          <Outlet />
          {openMenu && <SideNavigation />}
        </div>
      </Body>
    </div>
  );
}

export default App;
