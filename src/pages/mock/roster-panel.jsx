import { useGetRostersQuery } from "../../api/api";
import { useGetPlayersQuery } from "../../api/bfbApi";
import { find, sortBy } from "lodash";
import { PlayerList } from "../../components/list-items";
import { Button } from "../../components/buttons";
import { selectLeagueYear } from "../../api/leagueSlice";
import { useSelector } from "react-redux";

const RosterPanel = ({
  isVisible,
  isExpanded,
  playerListExpanded,
  activeSlot = {},
  draftedPlayers,
}) => {
  const year = useSelector(selectLeagueYear);
  const { data: playerIdsData, isLoading } = useGetRostersQuery({
    roster_id: activeSlot.roster_id,
  });
  let playerIds = find(playerIdsData, {
    roster_id: activeSlot.roster_id,
  })?.keepers;
  const { data } = useGetPlayersQuery(
    { id: JSON.stringify(playerIds), year },
    { skip: !playerIds || !playerIds.length || isLoading }
  );

  let players = data ? data.map((p) => ({ ...p, isKeeper: true })) : [];

  let combinedPlayers = [
    ...players,
    ...draftedPlayers.filter((p) => p.roster_id === activeSlot.roster_id),
  ];

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
            players={sortBy(combinedPlayers, "position")}
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
