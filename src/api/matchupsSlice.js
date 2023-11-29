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
      const response = await fetch(
        `${import.meta.env.VITE_SLEEPER_API}/league/${
          import.meta.env.VITE_LEAGUE_ID
        }/matchups/${week}`
      );
      const data = await response.json();
      let dataObj = {};
      data.forEach((matchupData) => {
        if (dataObj[matchupData.roster_id]) {
          dataObj[matchupData.roster_id] += matchupData.points;
        } else {
          dataObj[matchupData.roster_id] = matchupData.points;
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
  (state) => state.matchups.points,
  (data) => {
    let pointsByRoster = {};
    Object.keys(data).forEach((week) => {
      Object.keys(data[week]).forEach((rosterId) => {
        if (pointsByRoster[rosterId]) {
          pointsByRoster[rosterId] += data[week][rosterId];
        } else {
          pointsByRoster[rosterId] = data[week][rosterId];
        }
      });
    });
    return pointsByRoster;
  }
);
