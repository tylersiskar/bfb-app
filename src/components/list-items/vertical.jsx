import { Avatar } from "../images";
import "./list-items.scss";

const VerticalListItem = (props) => {
  return (
    <div className="vertical">
      <Avatar />
      <div className="text">
        <h5>{props.team ?? "Best Franchise Builder"}</h5>
        <p style={{ margin: 0, color: "white" }}>
          {props.name ?? "tylersiskar"}
        </p>
      </div>
    </div>
  );
};

export default VerticalListItem;
