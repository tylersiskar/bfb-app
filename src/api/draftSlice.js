import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { draftsObject, leaguesObject } from "../sleeper/constants";

// Async thunk for fetching draft details including traded picks
// export const fetchDraftDetails = createAsyncThunk(
//   "draft/fetchDraftDetails",
//   async ({ leagueId, draftId, season, standings }) => {
//     const picksResponse = await axios.get(
//       `https://api.sleeper.app/v1/draft/${draftsObject[season]}/picks`
//     );
//     const tradedPicksResponse = await axios.get(
//       `https://api.sleeper.app/v1/draft/${draftsObject[season]}/traded_picks`
//     );

//     const upcomingDraft = await axios.get(
//       `https://api.sleeper.app/v1/draft/${draftsObject[season]}`
//     );
//     const picks = picksResponse.data;
//     const tradedPicks = tradedPicksResponse.data;

//     // Process picks to account for traded picks
//     const processedPicks = picks.map((pick) => {
//       const tradedPick = tradedPicks.find(
//         (tp) =>
//           tp.round === pick.round && tp.previous_owner_id === pick.roster_id
//       );
//       if (tradedPick) {
//         return { ...pick, roster_id: tradedPick.owner_id };
//       }
//       return pick;
//     });
//     return {
//       draftId: draftsObject[season],
//       picks: processedPicks,
//     };
//   }
// );

// Initial state
const initialState = {
  draftDetails: [],
  drafted: [],
  loading: false,
  error: null,
  activeSlot: {},
};

// Slice
const draftSlice = createSlice({
  name: "draft",
  initialState,
  reducers: {
    updateDraftedPlayers: (state, action) => {
      state.drafted = [...state.drafted, action.payload];
    },
    setActiveSlot: (state, action) => {
      state.activeSlot = action.payload;
    },
  },
});

export const selectActiveSlot = (state) => state.draft.activeSlot;
export const selectDraftedPlayers = (state) => state.draft.drafted;
export const { updateDraftedPlayers, setActiveSlot } = draftSlice.actions;
export default draftSlice.reducer;
