// matchupsSlice.js
import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from "@reduxjs/toolkit";

export const fetchMatchupsForWeek = createAsyncThunk(
  "matchups/fetchMatchupsForWeek",
  async (week, thunkAPI) => {
    try {
      const leagueId =
        localStorage.getItem("league_id") ?? import.meta.env.VITE_LEAGUE_ID;
      const response = await fetch(
        `${
          import.meta.env.VITE_SLEEPER_API
        }/league/${leagueId}/matchups/${week}`
      );
      const data = await response.json();
      let dataObj = {};
      data.forEach((matchupData) => {
        let { roster_id, matchup_id, points } = matchupData;
        let ptsAgainst = data.filter(
          (obj) => obj.matchup_id === matchup_id && obj.roster_id !== roster_id
        )[0].points;
        if (dataObj[matchupData.roster_id]) {
          dataObj[matchupData.roster_id] = {
            ...dataObj[roster_id],
            points: (dataObj[roster_id].points += points),
            pointsAgainst: (dataObj[roster_id].points += ptsAgainst),
          };
        } else {
          dataObj[matchupData.roster_id] = {
            points,
            matchup_id,
            pointsAgainst: ptsAgainst,
          };
        }
      });
      return { data: dataObj, week };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const matchupsSlice = createSlice({
  name: "matchups",
  initialState: { trendingWeeks: [], points: {} },
  reducers: {
    startFetching(state) {
      return {
        isLoading: true,
        trendingWeeks: state.trendingWeeks,
        points: {},
      };
    },
    resetState(state, action) {
      return { trendingWeeks: state.trendingWeeks, points: {} };
    },
    updateTrendingWeeks: (state, { payload }) => {
      state.trendingWeeks = payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchMatchupsForWeek.fulfilled, (state, action) => {
      const { week, data } = action.payload;
      state.points[week] = data;
      state.isLoading = false;
    });
  },
});

const { actions } = matchupsSlice;

export const { updateTrendingWeeks, resetState, startFetching } = actions;
export default matchupsSlice.reducer;

export const selectMatchupData = (state) => state.matchups;
export const selectTrendingWeeks = (state) => state.matchups.trendingWeeks;
export const selectMatchupIsLoading = (state) => state.matchups.isLoading;
export const selectTrendingPoints = createSelector(
  (state) => state.matchups,
  (matchups) => {
    let { points: pointsByWeek } = matchups;
    let pointsByRoster = {};
    Object.keys(pointsByWeek).forEach((week) => {
      Object.keys(pointsByWeek[week]).forEach((rosterId) => {
        if (pointsByRoster[rosterId]) {
          pointsByRoster[rosterId] = {
            pf: (pointsByRoster[rosterId].pf +=
              pointsByWeek[week][rosterId].points),
            pa: (pointsByRoster[rosterId].pa +=
              pointsByWeek[week][rosterId].pointsAgainst),
          };
        } else {
          pointsByRoster[rosterId] = {
            pf: pointsByWeek[week][rosterId].points,
            pa: pointsByWeek[week][rosterId].pointsAgainst,
          };
        }
      });
    });
    return pointsByRoster;
  }
);
