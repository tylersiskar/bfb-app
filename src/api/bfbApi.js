import { createSelector } from "@reduxjs/toolkit";
import { createApi } from "@reduxjs/toolkit/query/react";
import { customBfbBaseQuery } from "./customBaseQuery";
import find from "lodash/find";
import filter from "lodash/filter";
import sortBy from "lodash/sortBy";

export const bfbApi = createApi({
  reducerPath: "bfbApi",
  baseQuery: customBfbBaseQuery,
  tagTypes: ["playersAll"],
  refetchOnMountOrArgChange: true,
  endpoints: (builder) => ({
    getStats: builder.query({
      query: (params) => ({
        url: `stats/${params.year}`,
        params: params && params.pos ? { pos: params.pos } : null,
      }),
    }),
    getPlayersAll: builder.query({
      query: (params) => ({
        url: `playersAll/${params.year}`,
        params: params.position || params.mock
          ? {
              ...(params.position && { position: params.position }),
              ...(params.mock && { mock: params.mock }),
            }
          : null,
      }),
      providesTags: ["playersAll"],
    }),
    getPlayers: builder.query({
      query: (params) => ({
        url: `/players`,
        params: params,
      }),
    }),
    getPlayerById: builder.query({
      query: (params) => ({
        url: `/players/${params.id}`,
        params: { year: params.year },
      }),
    }),
    getSearch: builder.query({
      query: (params) => ({
        url: `/search`,
        params: params,
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
    getPlayerValue: builder.mutation({
      query: (year) => ({
        url: `/updatePlayerRankings/${year}`,
        method: "POST",
        body: {},
      }),
      invalidatesTags: ["playersAll"],
    }),
    getLeagueRosters: builder.query({
      query: () => ({
        url: `/league/{LEAGUE_ID}/rosters`,
      }),
    }),
    getLeagueDraftPicks: builder.query({
      query: () => ({
        url: `/league/{LEAGUE_ID}/draft-picks`,
      }),
    }),
    calculateTrade: builder.mutation({
      query: ({ year, ...body }) => ({
        url: `/trade/calculate${year ? `?year=${year}` : ""}`,
        method: "POST",
        body,
        headers: { "Content-Type": "application/json" },
      }),
    }),
    findDeals: builder.mutation({
      query: ({ year, ...body }) => ({
        url: `/trade/find-deals${year ? `?year=${year}` : ""}`,
        method: "POST",
        body,
        headers: { "Content-Type": "application/json" },
      }),
    }),
    getRecommendedTrades: builder.mutation({
      query: ({ year, ...body }) => ({
        url: `/trade/recommended${year ? `?year=${year}` : ""}`,
        method: "POST",
        body,
        headers: { "Content-Type": "application/json" },
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
  },
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
  },
);

// Returns the effective keeper set for each roster:
// - uses actual Sleeper keepers if set for that roster
// - falls back to projecting top-8 players by bfbValue when not set
const _getEffectiveKeeperIds = (rosters, players, leagueType) => {
  let key = leagueType === 2 ? "players" : "keepers";
  return rosters.flatMap((roster) => {
    let setKeepers = roster[key] ?? [];
    if (setKeepers.length > 0) return setKeepers;
    // No keepers set in Sleeper — project top 8 by bfbValue
    return (roster.players ?? [])
      .map((pId) => find(players, { id: pId }))
      .filter((p) => p?.full_name)
      .sort((a, b) => (b.bfbValue ?? 0) - (a.bfbValue ?? 0))
      .slice(0, 8)
      .map((p) => p.id);
  });
};

export const selectEffectiveKeepers = createSelector(
  (state, rawData) => rawData,
  (rawData) => {
    let { rosters, players, leagueType } = rawData;
    if (!rosters || !players || players.length === 0 || rosters.length === 0)
      return [];
    let keeperIds = _getEffectiveKeeperIds(rosters, players, leagueType);
    return players.filter((p) => keeperIds.includes(p.id));
  },
);

export const selectEffectiveNonKeepers = createSelector(
  (state, rawData) => rawData,
  (rawData) => {
    let { rosters, players, leagueType } = rawData;
    if (!rosters || !players || players.length === 0 || rosters.length === 0)
      return [];
    let keeperIds = new Set(_getEffectiveKeeperIds(rosters, players, leagueType));
    return players.filter((p) => !keeperIds.has(p.id));
  },
);

export const selectPlayersProjectedKeepers = createSelector(
  (state, rawData) => rawData,
  (data) => {
    const { playersAll, rosters, users } = data;
    let newRosters = rosters?.map((r) => {
      let sortedPlayers = sortBy(
        r.players
          .map((pId) => {
            let currentPlayer = find(playersAll, { id: pId });
            return {
              ...currentPlayer,
              name: currentPlayer?.full_name,
              pos: currentPlayer?.position,
              bfbValue: currentPlayer?.bfbValue,
            };
          })
          .filter((o) => !!o.name),
        "bfbValue",
      ).reverse();
      let projectedKeepers = [];
      sortedPlayers.forEach((player, idx) => {
        // if keepers arent full yet keep going
        if (projectedKeepers.length < 8) {
          // if (player.pos === "QB") {
          //   // if player is a QB, user does not have a qb yet, and that qb is truly valuable, add player
          //   if (!find(projectedKeepers, { pos: "QB" }) && player.value > 5000) {
          //     projectedKeepers.push(player);
          //   }
          // } else projectedKeepers.push(player);
          projectedKeepers.push(player);
        }
      });
      return {
        ...r,
        team_name: find(users, { user_id: r.owner_id })?.display_name,
        players: sortedPlayers,
        projectedKeepers,
        lowestKeeperValue: projectedKeepers[7]?.bfbValue,
      };
    });

    let newArray = newRosters?.map((team) => {
      return {
        ...team,
        players: team.players.map((p, i) => {
          let ownerIds = filter(newRosters, (o) => {
            let currentTeamsQb = find(o.projectedKeepers, { pos: "QB" });

            // if (p.pos === "QB") {
            //   if (currentTeamsQb && currentTeamsQb.name) {
            //     if (currentTeamsQb.value < p.value) return true;
            //     else return false;
            //   } else return p.value - o.lowestKeeperValue > 1500;
            // } else return p.value > o.lowestKeeperValue;
            return p.bfbValue > o.lowestKeeperValue;
          }).map((t) => t.owner_id);
          return {
            ...p,
            status: p.bfbValue > 0 ? "KW" : "N/A",
            tradeCandidateTeams: ownerIds,
          };
        }),
      };
    });
    return newArray;
  },
);

export const {
  useGetPlayersQuery,
  useGetPlayerByIdQuery,
  useGetMocksQuery,
  usePostMockMutation,
  useGetMockQuery,
  useGetPlayersAllQuery,
  useGetStatsQuery,
  useGetPlayerValueMutation,
  useGetSearchQuery,
  useGetLeagueRostersQuery,
  useGetLeagueDraftPicksQuery,
  useCalculateTradeMutation,
  useFindDealsMutation,
  useGetRecommendedTradesMutation,
} = bfbApi;
