import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { selectLeague } from "./leagueSlice"; // Adjust the path as necessary

const { VITE_SLEEPER_API } = import.meta.env;
const customBaseQuery = async (args, api, extraOptions) => {
  const state = api.getState();
  const league = selectLeague(state);
  let leagueId = league.league_id;
  let draftId = league.draft_id;
  // Adjust the endpoint URL with the leagueId
  if (typeof args === "string") {
    args = args.replace("{LEAGUE_ID}", leagueId);
    args = args.replace("{DRAFT_ID}", draftId);
  } else if (typeof args.url === "string") {
    args.url = args.url.replace("{LEAGUE_ID}", leagueId);
    args.url = args.url.replace("{DRAFT_ID}", draftId);
  }
  return fetchBaseQuery({ baseUrl: VITE_SLEEPER_API })(args, api, extraOptions);
};

export default customBaseQuery;
