import React from "react";
import Plot from "react-plotly.js";

const PlotlyGraph = props => {
  const list_of_data_dictionaries = [];
  if (
    Object.keys(props.plotted_data).length === 0 ||
    Object.keys(props.selected).length === 0
  ) {
    return null;
  } else {
    var y_axis_title = "";

    for (var key in props.plotted_data) {
      var multiplied_x_axis = props.plotted_data[key][props.x_axis_label].map(
        function(entry) {
          return entry * Math.pow(10, -1 * props.x_axis_mutliplier);
        }
      );

      var multiplied_y_axis = props.plotted_data[key][props.y_axis_label].map(
        function(entry) {
          return entry * Math.pow(10, -1 * props.y_axis_mutliplier);
        }
      );

      var [element_symbol] = props.plotted_data[key][
        "Proton number / element"
      ].split(" ");
      var library = props.plotted_data[key]["Library"];
      var [mt_number, products] = props.plotted_data[key][
        "MT number / reaction products"
      ].split(" ");
      var mass_number = props.plotted_data[key]["Mass number"];
      var incident_particle = "n";
      var legend_name =
        element_symbol +
        mass_number +
        " (" +
        incident_particle +
        "," +
        products +
        ") " +
        library;

      if (mt_number === "301") {
        if (y_axis_title.indexOf("heating") === -1) {
          y_axis_title = y_axis_title + "  heating (eV/reaction)";
        }
      }
      if (mt_number === "444") {
        if (y_axis_title.indexOf("damage") === -1) {
          y_axis_title = y_axis_title + "  damage (eV-barns)";
        }
      }
      if (mt_number !== "444" && mt_number !== "301") {
        if (y_axis_title.indexOf("cross section") === -1) {
          y_axis_title = y_axis_title + "  cross section (barns)";
        }
      }

      list_of_data_dictionaries.push({
        x: multiplied_x_axis,
        y: multiplied_y_axis,
        type: "scatter",
        mode: "lines+points",
        name: legend_name
      });
    }
  }

  const base_units = "eV";
  var units = "(" + base_units + ")";
  if (props.x_axis_mutliplier === -3) {
    units = " (m" + base_units + ")";
  }
  if (
    props.x_axis_mutliplier === -2 ||
    props.x_axis_mutliplier === -1 ||
    props.x_axis_mutliplier === 1 ||
    props.x_axis_mutliplier === 2 ||
    props.x_axis_mutliplier === 4 ||
    props.x_axis_mutliplier === 5 ||
    props.x_axis_mutliplier === 7 ||
    props.x_axis_mutliplier === 8
  ) {
    units =
      " (10 <sup>" + props.x_axis_mutliplier + "</sup> " + base_units + ")";
  }
  if (props.x_axis_mutliplier === 3) {
    units = " (k" + base_units + ")";
  }
  if (props.x_axis_mutliplier === 6) {
    units = " (M" + base_units + ")";
  }
  if (props.x_axis_mutliplier === 9) {
    units = " (G" + base_units + ")";
  }

  const x_axis_title = props.x_axis_label + " " + units;

  return (
    <Plot
      data={list_of_data_dictionaries}
      layout={{
        xaxis: {
          title: x_axis_title,
          type: props.x_axis_scale,
          exponentformat: "power"
        },
        yaxis: {
          title: y_axis_title,
          type: props.y_axis_scale
        },
        margin: {
          r: 0,
          t: 1,
          pad: 1
        },
        showlegend: true,
        legend: {
          x: 0.7,
          y: 0.9
        }
      }}
    />
  );
};

export default PlotlyGraph;