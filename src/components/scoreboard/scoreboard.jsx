import ScoreboardItem from "./scoreboard-item";
import "./scoreboard.scss";

const Scoreboard = ({ matchups }) => {
  return (
    <div className="scoreboard flex align-center">
      {matchups.map((item) => {
        return (
          <div className="scoreboard-row">
            <ScoreboardItem item={item[0]} />
            <ScoreboardItem item={item[1]} />
          </div>
        );
      })}
    </div>
  );
};

export default Scoreboard;
