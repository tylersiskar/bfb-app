import { createSelector } from "reselect";
import find from "lodash/find";

export const selectLeague = (state) => state.league;

export const selectLeagueStage = (state) => {
  let leagues = state.league.leagues;
  let current = find(leagues, { season: state.league.year });
  return current?.status;
};

export const selectLeagues = (state) => state.league.leagues;

export const selectLeagueId = createSelector(
  selectLeague,
  (league) => league.league_id
);
export const selectLeagueYear = createSelector(
  selectLeague,
  (league) => league.year
);

export const selectPreviousYear = createSelector(
  selectLeagueYear,
  (year) => parseInt(year) - 1
);
