// rootReducer.js
import { combineReducers } from "@reduxjs/toolkit";
import { api } from "./api";
import matchupsReducer from "./matchupsSlice";

const rootReducer = combineReducers({
  matchups: matchupsReducer,
  [api.reducerPath]: api.reducer,
  // Add other reducers here as needed
});

export default rootReducer;
