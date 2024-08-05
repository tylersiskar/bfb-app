import { sortBy } from "lodash";
import { PlayerList } from "../../components/list-items";
import { Button } from "../../components/buttons";

const RosterPanel = ({
  isVisible,
  isExpanded,
  playerListExpanded,
  activeRoster,
}) => {
  return (
    <div
      className={`roster-panel ${isVisible ? "visible" : ""}  ${
        isExpanded
          ? playerListExpanded
            ? "panel-expanded"
            : "panel-full-expanded"
          : ""
      }`}
    >
      {isExpanded && (
        <>
          <h6>Current Roster</h6>
          <PlayerList
            isRoster
            playerList={sortBy(activeRoster, "position")}
            scrollHeight={`calc(${!playerListExpanded ? 55 : 25}svh - 60px)`}
            hidePagination
            actionColumn={(player) => (
              <Button
                style={{
                  height: 32,
                  background: player.isKeeper && "transparent",
                  borderColor: player.isKeeper && "rgb(206, 206, 206)",
                }}
                className={player.isKeeper ? "p-1" : "bg-lime p-1"}
              >
                <p
                  className={player.isKeeper ? "sm light bold" : "sm dark bold"}
                >
                  {player.isKeeper ? "Kept" : "NEW"}
                </p>
              </Button>
            )}
          />
        </>
      )}
    </div>
  );
};

export default RosterPanel;
