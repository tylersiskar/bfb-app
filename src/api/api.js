// api.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

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
  }),
});

export const { useGetRostersQuery, useGetStatsQuery, useGetNflStateQuery } =
  api;
