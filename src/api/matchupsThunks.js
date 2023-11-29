// matchupsThunks.js
import { fetchMatchupsForWeek, startFetching } from "./matchupsSlice";

export const fetchMatchupsForMultipleWeeks = (weeks) => async (dispatch) => {
  dispatch(startFetching());
  for (const week of weeks) {
    await dispatch(fetchMatchupsForWeek(week));
  }
};
