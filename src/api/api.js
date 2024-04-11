// api.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { createSelector } from "reselect";
import usersObj from "../sleeper/users.json";
import { find, reverse } from "lodash";
import { draftsObject, leaguesObject } from "../sleeper/constants";

const { VITE_SLEEPER_API } = import.meta.env;
let LEAGUE_ID = leaguesObject["2024"];

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
    getDraftDetails: builder.query({
      query: (season) => `draft/${draftsObject[season]}/picks`,
    }),
    getTradedPicks: builder.query({
      query: (season) => `league/${leaguesObject[season]}/traded_picks`,
    }),
  }),
});

export const selectDraftOrder = createSelector(
  (state, rawData) => rawData, // Pass the raw data as an argument
  (rawData) => {
    let { standings, tradedPicks, rosters } = rawData;
    if (!standings || !standings.length) return [];
    let ROUNDS = 8;
    let copyStandings = [...standings];
    let reverseStandings = reverse(copyStandings);
    let draftOrder = []; // array of objects { round, pick, team }
    for (let i = 1; i <= ROUNDS; i++) {
      draftOrder.push(
        reverseStandings.map((teamSlot, pick) => {
          // if this pick has been traded , set draft slot to owner of pick, else set to current team
          let tradedPick = find(tradedPicks, {
            roster_id: teamSlot.roster_id,
            round: i,
          });
          //need to get owner name of
          return !!tradedPick
            ? {
                team: find(standings, { roster_id: tradedPick.owner_id }).owner,
                roster_id: find(standings, { roster_id: tradedPick.owner_id })
                  .roster_id,
                round: i,
                pick: pick + 1,
              }
            : {
                team: teamSlot.owner,
                roster_id: teamSlot.roster_id,
                round: i,
                pick: pick + 1,
              };
        })
      );
    }
    return draftOrder;
  }
);

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
  useGetDraftDetailsQuery,
  useGetTradedPicksQuery,
} = api;
