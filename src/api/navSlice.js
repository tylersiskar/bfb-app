import { createSelector, createSlice } from "@reduxjs/toolkit";

const navSlice = createSlice({
  name: "nav",
  initialState: { isOpen: false, contentType: "DEFAULT" },
  reducers: {
    doNavOpen(state, action) {
      state.isOpen = true;
      state.contentType = action.payload;
    },
    doNavClose(state) {
      state.isOpen = false;
      state.contentType = "DEFAULT";
    },
  },
});

export const { doNavOpen, doNavClose } = navSlice.actions;

export const selectNav = (state) => state.nav;

export const selectNavIsOpen = createSelector(selectNav, (nav) => nav.isOpen);

export const selectNavContent = createSelector(
  selectNav,
  (nav) => nav.contentType
);

export default navSlice.reducer;
