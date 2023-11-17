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
import { Line } from "react-chartjs-2";
import usersObj from "../../sleeper/users.json";
import { find } from "lodash";
import RangeSlider from "../../components/inputs/RangeSlider";
import { Content } from "../../components/layout";

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
  const [nflWeek, setNflWeek] = useState(1);
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
    setNflWeek(activeWeek);
    if (activeWeek > 3) {
      setActiveWeeks([activeWeek - 3, activeWeek - 2, activeWeek - 1]);
    }
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
    });
    setTrendingData(dataObj);
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

  const options = {
    maintainAspectRatio: window.innerWidth > 767,
    plugins: {
      legend: {
        display: false, // Set to false to hide the legend
      },
      tooltip: {
        callbacks: {
          label: (context) =>
            `${context.raw.label}\n PPG: ${context.raw.y.toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        type: "category", // Specify that the x-axis is a category axis
        title: {
          display: true,
          text: "Team",
        },
        border: {
          width: 2,
          color: "black",
        },
        gridLines: {
          display: false,
        },
      },
      y: {
        type: "linear",
        position: "left",
        reverse: false,
        beginAtZero: false,
        title: {
          display: true,
          text: "PPG",
        },
        min: 50,
      },
    },
  };
  if (nflWeek < 4)
    return (
      <Content dark>
        <h3 style={{ margin: 16 }}>
          Trending Data is not available until Week 4, please check back then!
        </h3>
      </Content>
    );
  return (
    <Content>
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
            activeWeek={nflWeek}
            range={activeWeeks}
          />
        </div>
      </div>
      <Line data={{ datasets: dataset }} options={options} />
    </Content>
  );
};

export default TrendsPage;
