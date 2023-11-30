// api.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { createSelector } from "reselect";
import usersObj from "../sleeper/users.json";
import { find } from "lodash";

const { VITE_LEAGUE_ID: LEAGUE_ID, VITE_SLEEPER_API } = import.meta.env;

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: VITE_SLEEPER_API,
  }),
  endpoints: (builder) => ({
    getRosters: builder.query({
      query: () => `league/${LEAGUE_ID}/rosters`,
    }),
    getStats: builder.query({
      query: (year) => ({ url: `stats/nfl/regular/${year}` }),
    }),
    getNflState: builder.query({
      query: () => "state/nfl",
    }),
    getCurrentMatchups: builder.query({
      query: (week) => `league/${LEAGUE_ID}/matchups/${week}`,
    }),
  }),
});
export const selectCustomMatchupData = createSelector(
  (state, rawData) => rawData, // Pass the raw data as an argument
  (rawData) => {
    let { matchups, rosters } = rawData;
    let trueMatchups = {};
    matchups &&
      rosters &&
      matchups.forEach((m) => {
        let currentRoster = find(rosters, { roster_id: m.roster_id });
        let currentUser = find(usersObj, {
          user_id: currentRoster.owner_id,
        });
        if (trueMatchups[m.matchup_id])
          trueMatchups[m.matchup_id] = [
            ...trueMatchups[m.matchup_id],
            {
              points: m.points,
              avatar: currentUser.avatar,
              display_name: currentUser.display_name,
            },
          ];
        else
          trueMatchups[m.matchup_id] = [
            {
              points: m.points,
              avatar: currentUser.avatar,
              display_name: currentUser.display_name,
            },
          ];
      });
    return trueMatchups;
  }
);

export const {
  useGetRostersQuery,
  useGetStatsQuery,
  useGetNflStateQuery,
  useGetCurrentMatchupsQuery,
} = api;
