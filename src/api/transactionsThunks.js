// matchupsThunks.js

import { fetchTransactionsForWeek, startFetching } from "./transactionsSlice";

export const fetchTransactionsForYear = (activeWeek) => async (dispatch) => {
  let weeks = [...Array(activeWeek + 1).keys()];
  dispatch(startFetching());
  for (const week of weeks) {
    await dispatch(fetchTransactionsForWeek(week));
  }
};
