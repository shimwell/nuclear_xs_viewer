import React from "react";
import Slider, { createSliderWithTooltip } from "rc-slider";

const marks = {
  "-3": "micro",
  0: "",
  3: "kilo",
  6: "Mega",
  9: "Giga"
};

const SliderWithTooltip = createSliderWithTooltip(Slider);

const ScaleSlider = ({ plotted_data, selected, onChange }) => {
  if (
    Object.keys(plotted_data).length === 0 ||
    Object.keys(selected).length === 0
  ) {
    return null;
  }

  return (
    <span style={{ "white-space": "nowrap" }}>
      X axis units
      <label style={{ width: 200, margin: 20 }}>
        <SliderWithTooltip
          dots
          min={-3}
          max={9}
          marks={marks}
          step={1}
          tipFormatter={v => `${v}`}
          onChange={onChange}
          defaultValue={0}
        />
      </label>
    </span>
  );
};

export default ScaleSlider;
