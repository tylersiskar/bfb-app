import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { keyBy, find, minBy, maxBy } from "lodash";
import { Link } from "react-router-dom";
import { VerticalListItem } from "../../../components/list-items";
import "./cards.scss";
import { fetchMatchupsForMultipleWeeks } from "../../../api/matchupsThunks";
import {
  useGetNflStateQuery,
  useGetRostersQuery,
  useGetUsersQuery,
} from "../../../api/api";
import { selectTrendingPoints } from "../../../api/matchupsSlice";

const TrendsCard = ({ title, subtitle, href }) => {
  const dispatch = useDispatch();
  const { data: nflState } = useGetNflStateQuery();
  const trendingPointsByRoster = useSelector(selectTrendingPoints);
  const { data: rostersData } = useGetRostersQuery();
  const { data: usersObj } = useGetUsersQuery();

  useEffect(() => {
    let activeWeek = nflState ? nflState.week : 0;
    if (activeWeek > 3) {
      let weeksToFetch = [activeWeek - 3, activeWeek - 2, activeWeek - 1];
      dispatch(fetchMatchupsForMultipleWeeks(weeksToFetch));
    }
    return () => (activeWeek = 0);
  }, [nflState]);

  /**
   * need to create an object of {team_name, avatar, trendingPoints}
   */
  if (!usersObj) return null;
  let rostersById = keyBy(rostersData, "roster_id");
  let team = Object.keys(rostersById).map((roster) => {
    let currentRoster = rostersById[roster];
    let user = find(usersObj, (obj) => obj.user_id === currentRoster.owner_id);

    let seasonAverage =
      currentRoster.settings.fpts /
      (currentRoster.settings.wins + currentRoster.settings.losses);

    let trendingAverage = trendingPointsByRoster[roster].pf / 3;
    return {
      teamName: user.metadata.team_name
        ? user.metadata.team_name.trim(" ")
        : user.metadata.display_name,
      avatar: user.avatar,
      trendingPts: seasonAverage - trendingAverage,
    };
  });

  let trendingDownTeam = minBy(team, "trendingPts");
  let trendingUpTeam = maxBy(team, "trendingPts");
  return (
    <div className="summary">
      <Link
        className="flex flex-column justify-between w-100 h-100"
        style={{
          textDecoration: "none",
          alignItems: "center",
        }}
        to={href}
      >
        <h3 className="w-100 lime" style={{ marginBottom: 12 }}>
          {title}
        </h3>
        {trendingDownTeam && trendingUpTeam ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              height: "100%",
            }}
          >
            <VerticalListItem item={trendingDownTeam} />
            <VerticalListItem arrowUp item={trendingUpTeam} />
          </div>
        ) : (
          <div className="flex w-100 h-100 align-center justify-center">
            <p style={{ color: "white" }}> No Trends Until Week 4!</p>
          </div>
        )}
      </Link>
    </div>
  );
};

export default TrendsCard;
