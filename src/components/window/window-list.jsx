import { useSelector } from "react-redux";
import sortBy from "lodash";
import { selectExpandedWindow } from "../../api/playerDetailsSlice";
import Window from "./window";

const WindowList = ({ windows = [] }) => {
  const expandedWindow = useSelector(selectExpandedWindow);
  let sorted = windows;
  if (expandedWindow) {
    let selected = sorted.filter((s) => s.title === expandedWindow);
    let unselected = sorted.filter((s) => s.title !== expandedWindow);
    sorted = [...selected, ...unselected];
  }
  return (
    <div className={`card-stack ${!!expandedWindow ? "h-100" : ""}`}>
      {sorted.map((window, index) => {
        return (
          <Window
            {...window}
            key={window.title}
            isLast={index === windows.length - 1}
            // onClick={() =>
            //   setCollapsdWindows((prev) => {
            //     if (prev.includes(index)) {
            //       return prev.filter((n) => n !== index);
            //     } else return [...prev, index];
            //   })
            // }
            // collapsed={collapsedWindows.includes(index)}
          />
        );
      })}
    </div>
  );
};

export default WindowList;
