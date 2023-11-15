import React, { useState } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

const RangeSlider = ({ rangeProp, onRangeUpdate, initalActiveWeek = 11 }) => {
  const [range, setRange] = useState([
    initalActiveWeek - 3,
    initalActiveWeek - 1,
  ]);
  const min = 1;
  const max = initalActiveWeek;
  const step = 1;

  const handleChange = (arr) => {
    setRange(arr);
    const [start, end] = arr;
    if (start >= end) {
      throw new Error("Invalid range: start must be less than end.");
    }
    const expandedRange = Array.from(
      { length: end - start + 1 },
      (_, index) => start + index
    );
    onRangeUpdate(expandedRange);
  };
  let marks = {};
  for (let i = initalActiveWeek; i > 0; i--) {
    marks[i] = i.toString();
  }
  return (
    <Slider
      range
      min={min}
      max={max}
      step={step}
      value={range}
      onChange={handleChange}
      marks={marks}
    />
  );
};

export default RangeSlider;
