import { mdiChevronDown } from "@mdi/js";
import Icon from "@mdi/react";
import { useDispatch, useSelector } from "react-redux";
import {
  expandWindow,
  selectExpandedWindow,
} from "../../api/playerDetailsSlice";
import "./window.scss";

const Window = ({
  icon,
  title = "",
  subtitle = "",
  bodyFn = () => {},
  color = "",
  onClick,
  isLast,
}) => {
  const expandedWindow = useSelector(selectExpandedWindow);
  const dispatch = useDispatch();
  let isExpanded = expandedWindow === title;
  let siblingToExpanded = !!expandedWindow && expandedWindow !== title;
  return (
    <div
      className={`window ${isExpanded ? "window-expanded" : ""} ${
        siblingToExpanded ? "expanded-sibling" : ""
      }`}
      onClick={() => {
        if (isExpanded) {
          dispatch(expandWindow(null));
        } else dispatch(expandWindow(title));
      }}
    >
      <div
        className={`flex align-center pb-3 ${
          isLast ? "border-bottom-lighter" : ""
        } w-100`}
      >
        <Icon path={icon} title={title} size={1.5} color={color} />
        <p style={{ color, marginLeft: 12 }} className="lg bold">
          {title}
        </p>
      </div>
      {isExpanded && bodyFn()}
      {isLast && (
        <div className="flex align-end h-100">
          <Icon path={mdiChevronDown} size={1} color={"white"} />
        </div>
      )}
    </div>
  );
};

export default Window;
