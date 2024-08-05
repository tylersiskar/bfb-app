import { find } from "lodash";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useGetRostersQuery } from "../../api/api";
import { useGetPlayersQuery } from "../../api/bfbApi";
import { selectActiveSlot, selectDraftedPlayers } from "../../api/draftSlice";
import { selectLeagueYear } from "../../api/leagueSlice";

const useActiveRoster = () => {
  const [activeRoster, setActiveRoster] = useState([]);
  const year = useSelector(selectLeagueYear);
  const activeSlot = useSelector(selectActiveSlot);
  const draftedPlayers = useSelector(selectDraftedPlayers);
  const { data: playerIdsData, isFetching: isRosterFetching } =
    useGetRostersQuery({
      roster_id: activeSlot.roster_id,
    });
  let playerIds = find(playerIdsData, {
    roster_id: activeSlot.roster_id,
  })?.keepers;
  const { data, isFetching: isPlayerFetching } = useGetPlayersQuery(
    { id: JSON.stringify(playerIds), year: year - 1 },
    { skip: !playerIds || !playerIds.length || isRosterFetching }
  );

  let players = data ? data.map((p) => ({ ...p, isKeeper: true })) : [];

  let combinedPlayers = [
    ...players,
    ...draftedPlayers.filter((p) => p.roster_id === activeSlot.roster_id),
  ];
  return {
    activeRoster: combinedPlayers,
    activeId: activeSlot.roster_id,
    // updateActiveRoster,
    isFetching: isRosterFetching || isPlayerFetching,
  };
};

export default useActiveRoster;
