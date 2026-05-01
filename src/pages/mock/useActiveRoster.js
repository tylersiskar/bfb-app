import find from "lodash/find";
import { useSelector } from "react-redux";
import { useGetRostersQuery } from "../../api/api";
import { useGetPlayersQuery, useGetPlayersAllQuery } from "../../api/bfbApi";
import { selectActiveSlot, selectDraftedPlayers } from "../../api/draftSlice";
import {
  selectLeagueId,
  selectLeagues,
  selectLeagueYear,
} from "../../api/selectors/leagueSelectors";

const useActiveRoster = () => {
  const year = useSelector(selectLeagueYear);
  const leagueId = useSelector(selectLeagueId);
  const seasons = useSelector(selectLeagues);
  let current = find(seasons, { league_id: leagueId });
  const activeSlot = useSelector(selectActiveSlot);
  const draftedPlayers = useSelector(selectDraftedPlayers);
  const { data: playerIdsData, isFetching: isRosterFetching } =
    useGetRostersQuery();
  let keeperKey = current?.settings?.type === 2 ? "players" : "keepers";
  let activeRosterData = find(playerIdsData, {
    roster_id: activeSlot.roster_id,
  });
  let playerIds = activeRosterData?.[keeperKey];

  // Fetch playersAll only when needed to project keepers (no Sleeper keepers set)
  const hasSleeperKeepers = !!(playerIds && playerIds.length);
  const { data: playersAll } = useGetPlayersAllQuery(
    { year, mock: true },
    { skip: hasSleeperKeepers || isRosterFetching || !activeRosterData }
  );

  // When no keepers are set in Sleeper, project top 8 by bfbValue
  let effectivePlayerIds = playerIds;
  if (!hasSleeperKeepers && playersAll && activeRosterData?.players) {
    effectivePlayerIds = activeRosterData.players
      .map((pId) => find(playersAll, { id: pId }))
      .filter((p) => p?.full_name)
      .sort((a, b) => (b.bfbValue ?? 0) - (a.bfbValue ?? 0))
      .slice(0, 8)
      .map((p) => p.id);
  }

  const { data, isFetching: isPlayerFetching } = useGetPlayersQuery(
    { id: JSON.stringify(effectivePlayerIds), year: year - 1 },
    { skip: !effectivePlayerIds || !effectivePlayerIds.length || isRosterFetching }
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
