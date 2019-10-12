import React from "react";

const AxisScaleRadioButton = ({
  plotted_data,
  selected,
  title,
  label,
  event_handler,
  onChange
}) => {
  if (
    Object.keys(plotted_data).length === 0 ||
    Object.keys(selected).length === 0
  ) {
    return null;
  }

  return (
    <label>
      {title}
      <input
        type="radio"
        value={label}
        checked={event_handler === label}
        onChange={onChange}
      />
      {label} {"\u00A0"}
    </label>
  );
};

export default AxisScaleRadioButton;
