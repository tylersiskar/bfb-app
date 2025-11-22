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
import find from "lodash/find";
import { useDispatch, useSelector } from "react-redux";
import { RangeSlider } from "../../components/inputs";
import { Content } from "../../components/layout";
import {
  selectMatchupIsLoading,
  selectTrendingPoints,
  selectTrendingWeeks,
  updateTrendingWeeks,
} from "../../api/matchupsSlice";
import {
  useGetNflStateQuery,
  useGetRostersQuery,
  useGetUsersQuery,
} from "../../api/api";
import { fetchMatchupsForMultipleWeeks } from "../../api/matchupsThunks";
import Button from "../../components/buttons/button";

ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  CategoryScale
);

const TrendsPage = () => {
  const dispatch = useDispatch();
  const [dataset, setDataset] = useState([]);
  const [active, setActive] = useState("fpts");
  const { data: nflState } = useGetNflStateQuery();
  const trendingWeeks = useSelector(selectTrendingWeeks);
  const trendingData = useSelector(selectTrendingPoints);
  const matchupIsLoading = useSelector(selectMatchupIsLoading);
  const { data: rostersObj } = useGetRostersQuery();
  const { data: usersObj } = useGetUsersQuery();

  const _setChartData = async () => {
    let data = rostersObj
      ? rostersObj.map((roster) => {
          let name = find(usersObj, { user_id: roster.owner_id }).display_name;
          let trendingAverage =
            trendingData[roster.roster_id][active === "fpts" ? "pf" : "pa"] /
            trendingWeeks.length;
          let seasonAverage =
            (roster.settings[active] +
              roster.settings[`${active}_decimal`] / 100) /
            (roster.settings.wins + roster.settings.losses);
          return {
            backgroundColor: "#ffffff",
            pointRadius: 6,
            label: name,
            data: [
              {
                x: name,
                y: seasonAverage,
                label: "Season Average",
              },
              {
                x: name,
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
        })
      : [];
    setDataset(data);
  };

  const getNflState = async () => {
    let activeWeek = nflState && nflState.week;
    if (activeWeek && activeWeek > 3) {
      dispatch(
        updateTrendingWeeks([activeWeek - 3, activeWeek - 2, activeWeek - 1])
      );
    }
  };

  useEffect(() => {
    if (!matchupIsLoading) _setChartData();
  }, [trendingData, trendingWeeks, matchupIsLoading, active]);

  useEffect(() => {
    dispatch(fetchMatchupsForMultipleWeeks(trendingWeeks));
  }, [trendingWeeks]);

  const _onRangeUpdate = (arr) => {
    dispatch(updateTrendingWeeks(arr));
  };

  useEffect(() => {
    getNflState();
  }, [nflState, rostersObj]);

  const options = {
    maintainAspectRatio: window.innerWidth > 767,
    plugins: {
      datalabels: { display: false },
      legend: {
        display: false,
        labels: {
          color: "#ffffff",
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        bodyColor: "#ffffff",
        titleColor: "#ffffff",
        callbacks: {
          label: (context) =>
            `${context.raw.label}\n PPG ${
              active === "fpts" ? "For" : "Against"
            } : ${context.raw.y.toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        type: "category",
        title: {
          display: true,
          text: "Team",
          color: "#ffffff",
        },
        ticks: {
          color: "#ffffff",
        },
        border: {
          width: 2,
          color: "rgba(255, 255, 255, 0.6)",
        },
        grid: {
          display: false, // keep x-grid off
        },
      },
      y: {
        type: "linear",
        position: "left",
        reverse: false,
        beginAtZero: false,
        title: {
          display: true,
          text: "PPG " + (active === "fpts" ? "For" : "Against"),
          color: "#ffffff",
        },
        ticks: {
          color: "#ffffff",
        },
        min: 60,
        grid: {
          color: "rgba(255, 255, 255, 0.15)", // lighter grid lines
          drawBorder: false,
        },
      },
    },
  };

  if (nflState && nflState.week < 4)
    return (
      <Content dark>
        <h3 style={{ margin: 16, color: "#ffffff" }}>
          Trending Data is not available until Week 4, please check back then!
        </h3>
      </Content>
    );

  return (
    <Content dark>
      <div
        className="flex flex-column align-center justify-center"
        style={{
          paddingTop: 12,
          paddingBottom: 12,
          paddingLeft: 20,
          paddingRight: 20,
          maxWidth: 500,
          margin: "auto",
        }}
      >
        <h2 style={{ margin: 0, color: "#ffffff" }}>Team PPG Trending Data</h2>
        <h4
          className="subtitle"
          style={{ margin: "12px 0", textAlign: "center", color: "#ffffff" }}
        >
          Select Range to compare to Season Average
        </h4>
        <p
          className="subtitle"
          style={{ margin: 0, color: "rgba(255, 255, 255, 0.8)" }}
        >
          <small>Triangle represents Trending Average</small>
        </p>
        <div className="flex p-2">
          <div className="flex w-100 mr-1">
            <Button
              inverted
              active={active === "fpts"}
              onClick={() => setActive("fpts")}
            >
              PF
            </Button>
          </div>
          <div className="flex w-100 ml-1">
            <Button
              inverted
              active={active === "fpts_against"}
              onClick={() => setActive("fpts_against")}
            >
              PA
            </Button>
          </div>
        </div>
        <div style={{ padding: "12px 0", width: "100%" }}>
          <RangeSlider
            onRangeUpdate={_onRangeUpdate}
            activeWeek={nflState && nflState.week}
            range={trendingWeeks}
          />
        </div>
      </div>
      <div
        className="h-100"
        style={{ paddingBottom: 64, maxHeight: "calc(100vh - 275px)" }}
      >
        <Line data={{ datasets: dataset }} options={options} />
      </div>
    </Content>
  );
};

export default TrendsPage;
