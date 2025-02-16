// standingsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { find } from "lodash";

const { VITE_SLEEPER_API } = import.meta.env;
export const fetchStandings = createAsyncThunk(
  "standings/fetchStandings",
  async ({ seasons, users, year }, thunkAPI) => {
    let activeLeague = find(seasons, { season: year.toString() });
    let LEAGUE_ID = activeLeague?.league_id;
    try {
      const playoffBracketResponse = await fetch(
        `${VITE_SLEEPER_API}/league/${LEAGUE_ID}/winners_bracket`
      );
      const playoffBracket = await playoffBracketResponse.json();
      const rostersResponse = await fetch(
        `${VITE_SLEEPER_API}/league/${LEAGUE_ID}/rosters`
      );
      const rosters = await rostersResponse.json();
      let standingsSlot = {};
      playoffBracket.forEach((match) => {
        const isConsolationMatch =
          (match.t1_from && match.t1_from.l) ||
          (match.t2_from && match.t2_from.l);

        if (match.w && !isConsolationMatch) {
          if (match.r === 3) {
            const winnerRosterId = match.w;
            const losingRosterId = match.l;
            standingsSlot[winnerRosterId] = 1;
            standingsSlot[losingRosterId] = 2;
          } else if (match.r === 2) {
            standingsSlot[match.l] = 3;
          } else if (match.r === 1) {
            standingsSlot[match.l] = 4;
          }
        }
      });

      const sortedRosters = rosters.sort((a, b) => {
        return (
          (standingsSlot[a.roster_id] || Infinity) -
            (standingsSlot[b.roster_id] || Infinity) ||
          b.settings.wins - a.settings.wins ||
          b.settings.fpts - a.settings.fpts
        );
      });

      let final = [];
      sortedRosters.forEach((roster) => {
        final.push({
          owner: find(users, { user_id: roster.owner_id }).display_name,
          roster_id: roster.roster_id,
          playoff_position: standingsSlot[roster.roster_id] || "N/A",
          wins: roster.settings.wins,
          points_for: roster.settings.fpts,
          ...find(users, { user_id: roster.owner_id }),
        });
      });
      return final; // Ensure this is the data you expect
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const standingsSlice = createSlice({
  name: "standings",
  initialState: { standings: [], status: "idle" },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchStandings.fulfilled, (state, action) => {
      state.standings = action.payload;
      state.status = "succeeded";
    });
  },
});

export default standingsSlice.reducer;

export const selectStandings = (state) => {
  return state.standings.standings;
};
