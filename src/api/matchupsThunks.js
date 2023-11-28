// matchupsThunks.js
import { fetchMatchupsForWeek } from "./matchupsSlice";

export const fetchMatchupsForMultipleWeeks = (weeks) => async (dispatch) => {
  for (const week of weeks) {
    await dispatch(fetchMatchupsForWeek(week));
  }
};
