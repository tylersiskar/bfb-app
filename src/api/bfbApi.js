// api.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const { VITE_BFB_API } = import.meta.env;

export const bfbApi = createApi({
  reducerPath: "bfbApi",
  baseQuery: fetchBaseQuery({
    baseUrl: VITE_BFB_API,
  }),
  endpoints: (builder) => ({
    getPlayers: builder.query({
      query: (params) => ({
        url: `/players`,
        params: params, // Pass the entire params object as query parameters
      }),
    }),
  }),
});

export const { useGetPlayersQuery } = bfbApi;
