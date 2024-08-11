// api.js
import { createSelector } from "@reduxjs/toolkit";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { customBfbBaseQuery } from "./customBaseQuery";

const { VITE_BFB_API } = import.meta.env;

export const bfbApi = createApi({
  reducerPath: "bfbApi",
  baseQuery: customBfbBaseQuery,
  endpoints: (builder) => ({
    getStats: builder.query({
      query: (year) => `stats/${year}`,
    }),
    getPlayersAll: builder.query({
      query: (year) => `playersAll/${year}`,
    }),
    getPlayers: builder.query({
      query: (params) => ({
        url: `/players`,
        params: params, // Pass the entire params object as query parameters
      }),
    }),
    getMocks: builder.query({
      query: () => ({
        url: `/league/{LEAGUE_ID}/mocks`,
      }),
    }),
    getMock: builder.query({
      query: (params) => ({
        url: `/league/{LEAGUE_ID}/mocks/${params.id}`,
      }),
    }),
    postMock: builder.mutation({
      query: (mock) => ({
        url: `/league/{LEAGUE_ID}/mocks`,
        method: "POST",
        body: mock,
        serializeBody: (data) => JSON.stringify(data),
      }),
    }),
    getPlayerValue: builder.query({
      query: (roster) => ({
        url: `/calculate`,
        method: "POST",
        body: roster,
        serializeBody: (data) => JSON.stringify(data),
      }),
    }),
  }),
});

export const selectNonKeepers = createSelector(
  (state, rawData) => rawData, // Pass the raw data as an argument
  (rawData) => {
    let { rosters, players } = rawData;
    if (!rosters || !players || players.length === 0 || rosters.length === 0)
      return [];
    return (
      rosters &&
      players &&
      players.filter((player) => {
        let flatList = rosters.map((roster) => roster.keepers ?? []).flat(1);
        return !flatList.includes(player.id);
      })
    );
  }
);

export const selectKeepers = createSelector(
  (state, rawData) => rawData, // Pass the raw data as an argument
  (rawData) => {
    let { rosters, players, leagueType } = rawData;
    if (!rosters || !players || players.length === 0 || rosters.length === 0)
      return [];
    let key = leagueType === 2 ? "players" : "keepers";
    let allKeepers = rosters
      .map((roster) => {
        return roster[key] ?? [];
      })
      .flat(1);
    return players.filter((player) => {
      return allKeepers.includes(player.id);
    });
  }
);

export const {
  useGetPlayersQuery,
  useGetMocksQuery,
  usePostMockMutation,
  useGetMockQuery,
  useGetPlayersAllQuery,
  useGetStatsQuery,
  useGetPlayerValueQuery,
  useLazyGetPlayerValueQuery,
} = bfbApi;
