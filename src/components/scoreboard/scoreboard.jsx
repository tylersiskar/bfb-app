import ScoreboardItem from "./scoreboard-item";
import "./scoreboard.scss";

const Scoreboard = ({ matchups }) => {
  return (
    <div className="scoreboard flex align-center">
      {matchups.map((item, i) => {
        return (
          <div className="scoreboard-row" key={i}>
            <ScoreboardItem item={item[0]} />
            <ScoreboardItem item={item[1]} />
          </div>
        );
      })}
    </div>
  );
};

export default Scoreboard;
