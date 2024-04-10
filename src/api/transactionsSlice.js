// matchupsSlice.js
import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from "@reduxjs/toolkit";

export const fetchTransactionsForWeek = createAsyncThunk(
  "matchups/fetchTransactionsForWeek",
  async (week, thunkAPI) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SLEEPER_API}/league/${
          import.meta.env.VITE_LEAGUE_ID
        }/transactions/${week}`
      );
      const data = await response.json();
      return { data, week };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const transactionsSlice = createSlice({
  name: "transactions",
  initialState: { data: {} },
  reducers: {
    startFetching(state) {
      return {
        ...state,
        isLoading: true,
      };
    },
    resetState(state, action) {
      return { data: {}, isLoading: false };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchTransactionsForWeek.fulfilled, (state, action) => {
      const { data, week } = action.payload;
      state.data[week] = data;
    });
  },
});

const { actions } = transactionsSlice;

export const { resetState, startFetching } = actions;
export default transactionsSlice.reducer;

export const selectTransactions = (state) => state.transactions.data;

export const selectWaiverPickups = createSelector(
  [selectTransactions],
  (transactions) => {
    let waiverObj = {};
    if (transactions) {
      Object.keys(transactions).forEach((week) => {
        waiverObj[week] = transactions[week].filter(
          (obj) => obj.type === "waiver"
        );
      });
    }
    return waiverObj;
  }
);

export const selectTrades = createSelector(
  [selectTransactions],
  (transactions) => {
    let tradeObj = {};
    if (transactions) {
      Object.keys(transactions).forEach((week) => {
        tradeObj[week] = transactions[week].filter(
          (obj) => obj.type === "trade"
        );
      });
    }
    return tradeObj;
  }
);
