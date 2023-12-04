// rootReducer.js
import { combineReducers } from "@reduxjs/toolkit";
import { api } from "./api";
import matchupsReducer from "./matchupsSlice";
import transactionsSlice from "./transactionsSlice";

const rootReducer = combineReducers({
  matchups: matchupsReducer,
  transactions: transactionsSlice,
  [api.reducerPath]: api.reducer,
  // Add other reducers here as needed
});

export default rootReducer;
