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
  onToggle,
  isChecked,
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
        className={`flex align-center justify-between pb-3 ${
          isLast ? "border-bottom-lighter" : ""
        } w-100`}
      >
        <div className="flex align-center">
          <Icon path={icon} title={title} size={1.5} color={color} />
          <p style={{ color, marginLeft: 12 }} className="lg bold">
            {title}
          </p>
        </div>

        {onToggle && isExpanded && (
          <label
            className="flex align-center"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="light bold sm pr-2">
              {isChecked ? "All" : "Rostered"}
            </p>
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              style={{ display: "none" }}
            />
            <span
              style={{
                display: "inline-block",
                width: "40px",
                height: "20px",
                backgroundColor: isChecked ? "steelblue" : "#ccc",
                borderRadius: "9999px",
                position: "relative",
                transition: "background-color 0.2s",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: "2px",
                  left: isChecked ? "22px" : "2px",
                  width: "16px",
                  height: "16px",
                  backgroundColor: "white",
                  borderRadius: "50%",
                  transition: "left 0.2s",
                }}
              />
            </span>
          </label>
        )}
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
