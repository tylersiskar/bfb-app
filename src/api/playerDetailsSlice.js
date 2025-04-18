import { createSelector, createSlice } from "@reduxjs/toolkit";

const playerDetailsSlice = createSlice({
  name: "playerDetails",
  initialState: { expandedWindow: null },
  reducers: {
    expandWindow(state, action) {
      state.expandedWindow = action.payload;
    },
  },
});
export const { expandWindow } = playerDetailsSlice.actions;
export const selectExpandedWindow = (state) => {
  return state.playerDetails.expandedWindow;
};

export default playerDetailsSlice.reducer;
