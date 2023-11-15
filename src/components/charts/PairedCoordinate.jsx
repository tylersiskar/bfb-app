import React from "react";
import { Line } from "react-chartjs-2";

const PairedCoordinateGraph = ({ data }) => {
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

  return <Line data={data} options={options} />;
};

export default PairedCoordinateGraph;
