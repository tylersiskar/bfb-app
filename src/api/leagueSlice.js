import {
  createAsyncThunk,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import { api } from "./api";
import { find } from "lodash";

export const fetchLeagues = createAsyncThunk(
  "league/fetchLeagues",
  async (initialId, { dispatch, getState }) => {
    let currentId = initialId ?? localStorage.getItem("league_id");
    const results = [];
    while (currentId !== "0" && currentId !== null) {
      const response = await dispatch(
        api.endpoints.getLeague.initiate(currentId)
      ).unwrap();
      results.push(response);
      currentId = response.previous_league_id;
    }
    return {
      results,
      league: {
        id: initialId,
        year: find(results, { league_id: initialId }).season,
      },
    };
  }
);
// Function to load the league_id from localStorage
const loadLeagueId = () => {
  try {
    const serializedState = localStorage.getItem("league_id");
    return serializedState;
  } catch (err) {
    console.error("Could not load league_id from localStorage", err);
    return null;
  }
};
const loadLeagueYear = () => {
  try {
    const serializedState = localStorage.getItem("year");
    return serializedState;
  } catch (err) {
    console.error("Could not load year from localStorage", err);
    return null;
  }
};

// Function to save the league_id to localStorage
const saveLeague = (obj) => {
  let { year, id } = obj;
  try {
    localStorage.setItem("year", year);
    localStorage.setItem("league_id", id);
  } catch (err) {
    console.error("Could not save year to localStorage", err);
  }
};

const leagueSlice = createSlice({
  name: "league",
  initialState: {
    league_id: loadLeagueId(),
    year: loadLeagueYear(),
    leagues: [],
  },
  reducers: {
    setLeagueId(state, action) {
      state.league_id = action.payload.id;
      state.year = action.payload.year;
      saveLeague(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeagues.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchLeagues.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.leagues = action.payload.results;

        // and set league

        state.league_id = action.payload.league.id;
        state.settings = action.payload.league.settings;
        state.year = action.payload.league.year;
        saveLeague(action.payload.league);
      })
      .addCase(fetchLeagues.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { setLeagueId } = leagueSlice.actions;

export const selectLeague = (state) => state.league;

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

export default leagueSlice.reducer;
