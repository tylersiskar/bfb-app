import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  CategoryScale,
} from "chart.js";
import usersObj from "../../components/charts/users.json";
import { find } from "lodash";
import PairedCoordinateGraph from "../../components/charts/PairedCoordinate";
import RangeSlider from "../../components/inputs/RangeSlider";

ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  CategoryScale
);

const rostersUrl =
  "https://api.sleeper.app/v1/league/934894009888088064/rosters";
const matchupsUrl =
  "https://api.sleeper.app/v1/league/934894009888088064/matchups";
const nflStateUrl = "https://api.sleeper.app/v1/state/nfl";

const TrendsPage = () => {
  const [dataset, setDataset] = useState([]);
  const [activeWeeks, setActiveWeeks] = useState([]);
  const [trendingData, setTrendingData] = useState({});

  const fetchRosters = async () => {
    let response = await fetch(rostersUrl);
    let rostersObj = await response.json();
    let data = rostersObj.map((roster) => {
      let trendingAverage = trendingData[roster.roster_id] / activeWeeks.length;
      let seasonAverage =
        roster.settings.fpts / (roster.settings.wins + roster.settings.losses);
      return {
        backgroundColor: "white",
        pointRadius: 5,
        label: find(usersObj, { user_id: roster.owner_id }).display_name,
        data: [
          {
            x: find(usersObj, { user_id: roster.owner_id }).display_name,
            y: seasonAverage,
            label: "Season Average",
          },
          {
            x: find(usersObj, { user_id: roster.owner_id }).display_name,
            y: trendingAverage,
            label: "Trending Average",
          },
        ],
        pointStyle: ["circle", "triangle"],
        borderColor:
          trendingAverage > seasonAverage
            ? "rgb(75, 192, 192)"
            : "rgb(255, 99, 132)",
      };
    });
    setDataset(data);
  };

  const getNflState = async () => {
    let response = await fetch(nflStateUrl);
    let nflState = await response.json();
    let activeWeek = nflState.week;
    setActiveWeeks([activeWeek - 3, activeWeek - 2, activeWeek - 1]);
  };

  const getMatchupData = async () => {
    let dataObj = {};
    activeWeeks.forEach(async (week) => {
      let response = await fetch(`${matchupsUrl}/${week}`);
      let allMatchupData = await response.json();
      allMatchupData.forEach((matchupData) => {
        if (dataObj[matchupData.roster_id])
          dataObj[matchupData.roster_id] += matchupData.points;
        else dataObj[matchupData.roster_id] = matchupData.points;
      });
      setTrendingData(dataObj);
    });
  };

  useEffect(() => {
    fetchRosters();
  }, [trendingData]);
  useEffect(() => {
    getMatchupData();
  }, [activeWeeks]);
  useEffect(() => {
    getNflState();
  }, []);

  return (
    <div
      className="w-100"
      style={{
        paddingTop: 12,
        maxWidth: 1200,
        maxHeight: window.innerWidth > 767 ? "100%" : "100vh",
        margin: "auto",
      }}
    >
      <div
        className="flex flex-column align-center justify-center"
        style={{
          padding: 12,
          maxWidth: 500,
          margin: "auto",
        }}
      >
        <h2 style={{ margin: 0 }}>Team PPG Trending Data</h2>
        <h4 className="subtitle" style={{ margin: "12px 0" }}>
          Select Range to compare to Season Average
        </h4>
        <p className="subtitle" style={{ margin: 0 }}>
          <small>Triangle represents Trending Average</small>
        </p>
        <div style={{ padding: "12px 0", width: "100%" }}>
          <RangeSlider
            onRangeUpdate={(arr) => setActiveWeeks(arr)}
            initialActiveWeek={activeWeeks[2]}
          />
        </div>
      </div>
      <PairedCoordinateGraph data={{ datasets: dataset }} />
    </div>
  );
};

export default TrendsPage;
