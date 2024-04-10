import StandingsItem from "./standings-item";
import "./standings.scss";

const StandingsList = ({ standings }) => {
  return (
    <div className="standings-list">
      {standings.map((team, index) => (
        <StandingsItem
          key={index}
          team={team}
          isFirst={index === 0}
          index={index}
        />
      ))}
    </div>
  );
};

export default StandingsList;
