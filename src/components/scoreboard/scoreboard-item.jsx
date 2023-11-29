import { Avatar } from "../images";
import "./scoreboard.scss";

const ScoreboardItem = ({ item }) => {
  return (
    <div className="scoreboard-item">
      <div className="flex align-center justify-start">
        <Avatar size="sm" avatarId={item.avatar} />{" "}
        <p
          className="flex justify-end"
          style={{ color: "white", paddingLeft: 4 }}
        >
          <b>{item.display_name.slice(0, 3).toUpperCase()}</b>
        </p>
      </div>
      <p className="flex justify-end" style={{ color: "white" }}>
        {item.points.toFixed(2)}
      </p>
    </div>
  );
};

export default ScoreboardItem;
