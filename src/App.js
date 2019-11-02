// run this app with npm start

import React, { Component } from "react";
//import { render } from "react-dom";
//import logo from './logo.svg';

import "./App.css";

import "bootstrap/dist/css/bootstrap.min.css";

import Select from "react-select";

import Plot from "react-plotly.js";

import ReactTable from "react-table";

import "react-table/react-table.css";
//import checkboxHOC from "react-table/lib/hoc/selectTable";

//import {Grid, Row, Col} from 'react-bootstrap';
import { Container, Row, Col, Button } from "reactstrap";

import Slider, { createSliderWithTooltip } from 'rc-slider';
import 'rc-slider/assets/index.css';

import ReactGA from 'react-ga';
import { REST_API_EXAMPLE_URL } from "./config";
import PlotlyGraph from "./components/PlotlyGraph";
import AxisScaleRadioButton from "./components/AxisScaleRadioButton";
import FilterDropdowns from "./components/FilterDropdowns";
import DownloadButton from "./components/DownloadButton";
import PlottedResulltsTable from "./components/PlottedResulltsTable";
import QueryResulltsTable from "./components/QueryResulltsTable";
import ScaleSlider from "./components/ScaleSlider";
import filterData from "./filterData";
ReactGA.initialize('UA-148582843-1');
ReactGA.pageview('/homepage');


// const REST_API_EXAMPLE_URL = process.env.REACT_APP_HOST_IP.slice(0, -1) +":8080"
// const REST_API_EXAMPLE_URL = "http://" + process.env.REACT_APP_HOST_IP +":8080"
// const REST_API_EXAMPLE_URL = "http://127.0.0.1:8080"

// const TerserPlugin = require('terser-webpack-plugin');

// module.exports = {
//   mode: 'production',
//   optimization: {
//     minimizer: [new TerserPlugin({ /* additional options here */ })],
//   },
// };

const style2 = {"white-space":"nowrap"}
const style = { width: 200, margin: 20 };




document.title = 'XSPlot'






function percentFormatter(v) {
  return `${v}`;
}


class App extends Component {
  html;
  constructor(props) {
    super(props);

    this.state = {
      //find_meta_data_fields_and_distinct_entries
      //find_axis_data_fields
      filter_data: filterData,
      axis_data: [{"cross section":"cross section","energy":"energy"}], 
      query: {},
      query_result: [],
      plotted_data: {},
      x_axis_scale: "log",
      y_axis_scale: "log",
      columns: [],
      data: [],
      loading: false,
      selected: {},
      loading_graph: false,
      requires_axis_selection: true,
      requires_checkbox_selection: true,
      x_axis_mutliplier:0, 
      y_axis_mutliplier:0 
    };

    this.handle_meta_data_dropdown_change_function = this.handle_meta_data_dropdown_change_function.bind(this);

    this.handle_xaxis_scale_change = this.handle_xaxis_scale_change.bind(this);

    this.handle_yaxis_scale_change = this.handle_yaxis_scale_change.bind(this);

    this.handle_xaxis_units_change = this.handle_xaxis_units_change.bind(this);

    this.handle_yaxis_units_change = this.handle_yaxis_units_change.bind(this);    

    this.toggleRow = this.toggleRow.bind(this);

    this.handle_clearplot_button_press = this.handle_clearplot_button_press.bind(this);
  }

  handle_clearplot_button_press(event) {
    // console.log("clearing plotted data");
    this.setState({
      plotted_data: {}
    });
    this.setState({
      selected: {}
    });
  }

  make_clear_button() {
    // console.log("this.state.selected", Object.keys(this.state.selected).length);
    if (Object.keys(this.state.selected).length === 0 || Object.keys(this.state.plotted_data).length === 0) {
      return "";
    } else {
      return <Button onClick={this.handle_clearplot_button_press}>Clear plot</Button>;
    }
  }

  handle_xaxis_scale_change(event) {
    // console.log("event.target.value", event.target.value);
    this.setState({
      x_axis_scale: event.target.value
    });
    // console.log("x_axis_scale", this.state.x_axis_scale);
  }

  handle_yaxis_scale_change(event) {
    // console.log("event.target.value", event.target.value);
    this.setState({
      y_axis_scale: event.target.value
    });
    // console.log("y_axis_scale", this.state.y_axis_scale);
  }

  handle_xaxis_units_change(value) {
    // console.log("value", value);
    this.setState({
      x_axis_mutliplier: value
    });

  }

  handle_yaxis_units_change(value) {
    // console.log("value", value);
    this.setState({
      y_axis_mutliplier: value
    });

  }

  handle_meta_data_dropdown_change_function(optionSelected) {
    this.setState({ loading: true });
    // console.log("new metadata field selected", optionSelected.value);

    let queryCopy = JSON.parse(JSON.stringify(this.state.query));
    // console.log(queryCopy);

    if (optionSelected.value["value"] === "") {
      delete queryCopy[optionSelected.value["field"]];
      // console.log("deleting field from query", optionSelected.value["field"]);
    } else {
      queryCopy[optionSelected.value["field"]] = optionSelected.value["value"];
    }

    this.setState({ query: queryCopy }, () => {

      fetch(
        REST_API_EXAMPLE_URL +
          "/get_matching_entrys_limited_fields?query=" +
          JSON.stringify(this.state.query)
      )
        .then(result => {
          if (result.ok) {
            return result.json();
          }
        })
        .then(data => {
          this.setState({ query_result: data });
          this.setState({ loading: false });
          //console.log("state =", this.state);
        })
        .catch(err => {
          console.log(
            "Cannot connect to server " +
              REST_API_EXAMPLE_URL +
              "get_matching_entrys_limited_fields?query=" +
              JSON.stringify(this.state.query)
          );
        });
    });

    console.log("current query", this.state.query);
  }


  ReturnColumns(check_box_class) {
    const columns = [
      {
        id: "checkbox",
        accessor: "",
        Cell: ({ original }) => {
          return (
            <input
              type="checkbox"
              className={check_box_class}
              checked={this.state.selected[original.id] === true}
              onChange={() => this.toggleRow(original.id)}
            />
          );
        },
        //sortable: false,
        width: 45
      }
    ];
    this.state.filter_data.map((x, i) => {
      columns.push({
        Header: x["field"][0],
        accessor: x["field"][0]
      });
    });

    return columns;
  }

  toggleRow(filename) {
    // console.log('row id selected ',filename)
    this.setState({ loading: true });
    this.setState({ loading_graph: false });
    const newSelected = Object.assign({}, this.state.selected);
    newSelected[filename] = !this.state.selected[filename];
    // console.log("check box clicked", filename, "state=", newSelected[filename]);
    this.setState({ selected: newSelected });

    const select_dic = this.state.selected;
    // console.log("values");
    // console.log(Object.values(select_dic));

    let plotted_dataCopy = JSON.parse(JSON.stringify(this.state.plotted_data));
    if (newSelected[filename] === true) {
      // this.setState({requires_checkbox_selection: false,});
      // console.log(REST_API_EXAMPLE_URL + '/get_matching_entry?query={"id":"' + filename + '"}');
      fetch(REST_API_EXAMPLE_URL + '/get_matching_entry?query={"id":"' + filename + '"}')
        .then(result => {
          if (result.ok) {
            return result.json();
          }
        })
        .then(data => {
          plotted_dataCopy[filename] = data;
          this.setState({ plotted_data: plotted_dataCopy });
          this.setState({ loading_graph: false });
          this.setState({ loading: false });
          // console.log("state =", this.state);
        })
        .catch(err => {
          console.log(
            "Cannot connect to server " +
              REST_API_EXAMPLE_URL +
              '/get_matching_entry?query={"id":"' + filename + '"}'
          );
        });
    } else {
      delete plotted_dataCopy[filename];
      this.setState({ loading: false });
    }

    // console.log("plotted_dataCopy", plotted_dataCopy);
    this.setState({ plotted_data: plotted_dataCopy }, () => {
      // console.log(this.state.plotted_data);
    });
  }

  render() {


    // const filter_data = this.state.filter_data;


    const selected = this.state.selected;

    var check_box_class;
    if (
      Object.keys(selected).length === 0 ||
      Object.keys(selected).every(function(k) {
        return selected[k] === false;
      })
    ) {
      check_box_class = "checkbox_highlighted";
    } else {
      check_box_class = "checkbox";
    }

    const columns = this.ReturnColumns(check_box_class);
    

    return (
      <div className="App">
        <Container>
          <Row>
            <Col>
              <h1 className="heading">XSPlot the nuclear cross section plotter</h1>
              <p>Search 121,749 cross sections processed with <a href="https://openmc.readthedocs.io">OpenMC</a>.</p>
              <p>Contribute, raise an issue or request a feature <a href="https://github.com/Shimwell/nuclear_xs_compose">here</a>. Site <a href="https://github.com/Shimwell/nuclear_xs_compose/blob/master/LICENSE"> license </a> </p>
            </Col>
          </Row>
          <Row>
            <Col md="5" lg="5">
              <FilterDropdowns
                filter_data={this.state.filter_data}
                event_handler={this.handle_meta_data_dropdown_change_function}
              />

              <br />
              <br />


              <DownloadButton plotted_data={this.state.plotted_data}
                              title="Download data (json)"
                              endpoint="/download_json"
                              />
              
              <br />
              <br />

              <DownloadButton plotted_data={this.state.plotted_data}
                              title="Download data (csv)"
                              endpoint="/download_csv"
                              />
              
              <br />
              <br />

              {this.make_clear_button()}

            </Col>
            <Col md="7" lg="7">
              <PlotlyGraph
                selected={this.state.selected}
                plotted_data={this.state.plotted_data}
                x_axis_label='energy'
                y_axis_label='cross section'
                x_axis_scale={this.state.x_axis_scale}
                y_axis_scale={this.state.y_axis_scale}
                x_axis_mutliplier={this.state.x_axis_mutliplier}
                y_axis_mutliplier={this.state.y_axis_mutliplier}
              />

              <br />

              <AxisScaleRadioButton
                plotted_data={this.state.plotted_data}
                event_handler={this.state.x_axis_scale}
                onChange={this.handle_xaxis_scale_change}
                label={"log"}
                title="X axis scale "
                x_axis_label={this.state.x_axis_label}
                y_axis_label={this.state.y_axis_label}  
                selected={this.state.selected}              
              />
              <AxisScaleRadioButton
                plotted_data={this.state.plotted_data}
                event_handler={this.state.x_axis_scale}
                onChange={this.handle_xaxis_scale_change}
                label={"lin"}
                title=""
                x_axis_label={this.state.x_axis_label}
                y_axis_label={this.state.y_axis_label} 
                selected={this.state.selected}               
              />

              <br />

              <AxisScaleRadioButton
                plotted_data={this.state.plotted_data}
                event_handler={this.state.y_axis_scale}
                onChange={this.handle_yaxis_scale_change}
                label={"log"}
                title="Y axis scale "
                x_axis_label={this.state.x_axis_label}
                y_axis_label={this.state.y_axis_label} 
                selected={this.state.selected}               
              />
              <AxisScaleRadioButton
                event_handler={this.state.y_axis_scale}
                onChange={this.handle_yaxis_scale_change}
                label={"lin"}
                title=""
                plotted_data={this.state.plotted_data}
                x_axis_label={this.state.x_axis_label}
                y_axis_label={this.state.y_axis_label}  
                selected={this.state.selected}              
              />

              <br/>

              <ScaleSlider 
                onChange={this.handle_xaxis_units_change}
                plotted_data={this.state.plotted_data}
                x_axis_label={this.state.x_axis_label}
                y_axis_label={this.state.y_axis_label}  
                selected={this.state.selected}   
                />



            </Col>
          </Row>

          <Row>
            <Col md="12" lg="12">
              <div>
                <br />

                <PlottedResulltsTable
                  query_Results={this.state.plotted_data}
                  data={this.state.plotted_data}
                  columns={columns}
                  loading={this.state.loading}
                />
                <br />
                <QueryResulltsTable
                  query_Results={this.state.query_result}
                  data={this.state.query_result}
                  columns={columns}
                  loading={this.state.loading}
                />

              </div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default App;
