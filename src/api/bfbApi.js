// api.js
import { createSelector } from "@reduxjs/toolkit";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const { VITE_BFB_API } = import.meta.env;

export const bfbApi = createApi({
  reducerPath: "bfbApi",
  baseQuery: fetchBaseQuery({
    baseUrl: VITE_BFB_API,
  }),
  endpoints: (builder) => ({
    getPlayersAll: builder.query({
      query: (params) => ({
        url: `/playersAll`,
      }),
    }),
    getPlayers: builder.query({
      query: (params) => ({
        url: `/players`,
        params: params, // Pass the entire params object as query parameters
      }),
    }),
    getMocks: builder.query({
      query: () => ({
        url: `/mocks`,
      }),
    }),
    getMock: builder.query({
      query: (params) => ({
        url: `/mocks/${params.id}`,
      }),
    }),
    postMock: builder.mutation({
      query: (mock) => ({
        url: `/mocks`,
        method: "POST",
        body: mock,
        serializeBody: (data) => JSON.stringify(data),
      }),
    }),
  }),
});

export const selectNonKeepers = createSelector(
  (state, rawData) => rawData, // Pass the raw data as an argument
  (rawData) => {
    let { rosters, players } = rawData;
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

export const {
  useGetPlayersQuery,
  useGetMocksQuery,
  usePostMockMutation,
  useGetMockQuery,
  useGetPlayersAllQuery,
} = bfbApi;
