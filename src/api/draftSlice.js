import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { draftsObject, leaguesObject } from "../sleeper/constants";

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
      state.drafted = action.payload;
    },

    setFullDraft: (state, action) => {
      state.drafted = action.payload;
    },
    clearDraftedPlayers: (state, action) => {
      state.drafted = [];
    },
    setActiveSlot: (state, action) => {
      state.activeSlot = action.payload;
    },
  },
});

export const selectActiveSlot = (state) => state.draft.activeSlot;
export const selectDraftedPlayers = (state) => state.draft.drafted;
export const {
  updateDraftedPlayers,
  setActiveSlot,
  clearDraftedPlayers,
  setFullDraft,
} = draftSlice.actions;
export default draftSlice.reducer;
