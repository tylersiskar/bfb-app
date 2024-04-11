// store.js
import { configureStore } from "@reduxjs/toolkit";
import { api } from "./api/api";
import thunk from "redux-thunk";
import rootReducer from "./api/rootReducer";
import { composeWithDevTools } from "redux-devtools-extension";
import { bfbApi } from "./api/bfbApi";

export const store = configureStore(
  {
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(api.middleware, bfbApi.middleware, thunk),
  },
  {},
  composeWithDevTools()
);
