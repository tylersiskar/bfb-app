import { mdiFootball } from "@mdi/js";
import Icon from "@mdi/react";
import "./layout.scss";
const Content = ({ children, dark, home, isLoading }) => {
  return (
    <div
      className={dark ? "bg-dark w-100" : "w-100"}
      style={{ padding: 4, boxSizing: "border-box" }}
    >
      <div
        className={
          isLoading || home
            ? "w-100 subcontent subcontent-home h-100"
            : "w-100 subcontent"
        }
      >
        {isLoading ? (
          <div className="w-100 h-100 flex align-center justify-center">
            <Icon
              path={mdiFootball}
              title="Loading"
              size={3}
              color={"white"}
              spin={3}
            />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default Content;
