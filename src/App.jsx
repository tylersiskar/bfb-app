import { Outlet } from "react-router-dom";
import Body from "./components/layout/body";
import Header from "./components/layout/header";
import "./App.scss";
import { useSelector } from "react-redux";
import { selectNavIsOpen } from "./api/navSlice";
import { SideNavigation } from "./components/layout";

function App() {
  const isOpen = useSelector(selectNavIsOpen);

  return (
    <div>
      <Header open={isOpen} />
      <Body>
        <div className={`content-wrapper ${isOpen ? "nav-open" : ""}`}>
          <Outlet />
          <SideNavigation />
        </div>
      </Body>
    </div>
  );
}

export default App;
