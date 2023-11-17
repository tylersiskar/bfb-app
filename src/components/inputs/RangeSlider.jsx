import React, { useState } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

const RangeSlider = ({ range, onRangeUpdate, activeWeek }) => {
  const min = 1;
  const max = activeWeek;
  const step = 1;
  let marks = {};
  for (let i = activeWeek; i > 0; i--) {
    marks[i] = i.toString();
  }

  const handleChange = (arr) => {
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
  return (
    <Slider
      range
      min={min}
      max={max}
      step={step}
      value={[range[0], range[range.length - 1]]}
      onChange={handleChange}
      marks={marks}
    />
  );
};

export default RangeSlider;
