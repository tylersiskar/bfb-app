// rootReducer.js
import { combineReducers } from "@reduxjs/toolkit";
import { api } from "./api";
import matchupsReducer from "./matchupsSlice";
import transactionsSlice from "./transactionsSlice";
import standingsSlice from "./standingsSlice";
import draftSlice from "./draftSlice";
import { bfbApi } from "./bfbApi";
import navReducer from "./navSlice";

const rootReducer = combineReducers({
  matchups: matchupsReducer,
  transactions: transactionsSlice,
  standings: standingsSlice,
  draft: draftSlice,
  nav: navReducer,
  [api.reducerPath]: api.reducer,
  [bfbApi.reducerPath]: bfbApi.reducer,
});

export default rootReducer;
