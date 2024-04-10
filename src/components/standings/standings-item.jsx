import "./standings.scss";

const StandingsItem = ({ team, isFirst, index }) => {
  if (index < 3)
    return (
      <div className={`standings-item ${isFirst ? "is-first" : ""}`}>
        {isFirst ? (
          <span role="img" aria-label="trophy" className="trophy">
            🏆
          </span>
        ) : (
          <span role="img" aria-label="medal" className="medal">
            {index === 1 ? "🥈" : "🥉"}
          </span>
        )}
        <div className="name-col">
          <h6 className={`team-name ${isFirst ? "is-first" : ""}`}>
            {team.metadata.team_name}
          </h6>
          <p className={`user-name ${isFirst ? "is-first" : ""}`}>
            {team.owner}
          </p>
        </div>
      </div>
    );
};

export default StandingsItem;
