import { mdiArrowDownThick, mdiArrowUpThick } from "@mdi/js";
import Icon from "@mdi/react";
import { Avatar } from "../images";
import "./list-items.scss";

const VerticalListItem = ({ arrowUp, item = {} }) => {
  return (
    <div className="vertical">
      {!arrowUp && (
        <div style={{ height: "100%" }}>
          <svg width={0} height={0}>
            <linearGradient id="linearColorsUp" x1={1} y1={0} x2={1} y2={1}>
              <stop offset={0} stopColor="#54d846" />
              <stop offset={1} stopColor="#0d620d" />
            </linearGradient>
          </svg>
          <Icon
            path={mdiArrowUpThick}
            title="Arrow"
            color={"url(#linearColorsUp)"}
            size={4}
          />
        </div>
      )}
      <Avatar avatarId={item.avatar} />
      <div className="text">
        <h5>{item.teamName ?? "Best Franchise Builder"}</h5>
        {arrowUp && (
          <>
            <svg width={0} height={0}>
              <linearGradient id="linearColors" x1={1} y1={0} x2={1} y2={1}>
                <stop offset={0} stopColor="rgb(86, 27 ,36)" />
                <stop offset={1} stopColor="rgb(211, 32, 60)" />
              </linearGradient>
            </svg>
            <Icon
              path={mdiArrowDownThick}
              title="Arrow"
              size={4}
              color={"url(#linearColors)"}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default VerticalListItem;
