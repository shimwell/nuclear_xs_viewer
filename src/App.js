import React, { Component } from "react";
import "./App.css";
import Select from "react-select";
import Plot from "react-plotly.js";
import ReactTable from "react-table";
import Slider, { createSliderWithTooltip } from 'rc-slider';
import { Container, Row, Col, Button } from "reactstrap";
import ReactGA from "react-ga";
import { REST_API_EXAMPLE_URL } from "./config";
import PlotlyGraph from "./components/PlotlyGraph";
import AxisScaleRadioButton from "./components/AxisScaleRadioButton";
import FilterDropdowns from "./components/FilterDropdowns";
import DownloadButton from "./components/DownloadButton";
import PlottedResulltsTable from "./components/PlottedResulltsTable";
import QueryResulltsTable from "./components/QueryResulltsTable";
import ScaleSlider from "./components/ScaleSlider";
import filterData from "./filterData";
ReactGA.initialize("UA-148582843-1");
ReactGA.pageview("/homepage");

document.title = 'XSPlot'

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      filter_data: filterData,
      axis_data: [{ "cross section": "cross section", "energy": "energy" }],
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
      x_axis_mutliplier: 0,
      y_axis_mutliplier: 0
    };
    this.handle_xaxis_units_change = this.handle_xaxis_units_change.bind(this);
  }

  
  handle_xaxis_units_change(value) {
    console.log("value", value);
    this.setState({
      x_axis_mutliplier: value
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

  handle_clearplot_button_press = event =>
    this.setState({
      plotted_data: {},
      selected: {}
    });

  handle_axis_change = (prop, event) =>
    this.setState({
      [prop]: event.target.value
    });

  handle_meta_data_dropdown_change_function = optionSelected => {
    this.setState({ loading: true });
    let queryCopy = JSON.parse(JSON.stringify(this.state.query));
    if (optionSelected.value["value"] === "") {
      delete queryCopy[optionSelected.value["field"]];
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
        .then(data => this.setState({ query_result: data, loading: false }))
        .catch(err =>
          console.log(
            "Cannot connect to server " +
              REST_API_EXAMPLE_URL +
              "get_matching_entrys_limited_fields?query=" +
              JSON.stringify(this.state.query)
          )
        );
    });

    console.log("current query", this.state.query);
  };



  ReturnColumns = check_box_class => {
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
        width: 45
      }
    ];

    this.state.filter_data.map((x, i) =>
      columns.push({
        Header: x["field"][0],
        accessor: x["field"][0]
      })
    );

    return columns;
  };

  toggleRow(filename) {
    this.setState({ loading: true, loading_graph: false });

    const newSelected = Object.assign({}, this.state.selected);

    newSelected[filename] = !this.state.selected[filename];

    this.setState({ selected: newSelected });

    let plotted_dataCopy = JSON.parse(JSON.stringify(this.state.plotted_data));
    if (newSelected[filename] === true) {
      fetch(REST_API_EXAMPLE_URL + '/get_matching_entry?query={"id":"' + filename + '"}')
        .then(result => {
          if (result.ok) {
            return result.json();
          }
        })
        .then(data => {
          plotted_dataCopy[filename] = data;
          this.setState({
            plotted_data: plotted_dataCopy,
            loading_graph: false,
            loading: false
          });
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

    this.setState({ plotted_data: plotted_dataCopy }, () => {});
  }

  render() {
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
      <Container className="App">
        <Row>
          <Col>
            <h1 className="heading">
              XSPlot the nuclear cross section plotter
            </h1>
            <p>
              Search 121,749 cross sections processed with 
              <a href="https://openmc.readthedocs.io">OpenMC</a>.
            </p>
            <p>
              Contribute, raise an issue or request a feature 
              <a href="https://github.com/Shimwell/nuclear_xs_compose">here</a>. 
              Site <a href="https://github.com/Shimwell/nuclear_xs_compose/blob/master/LICENSE"> license </a>
            </p>
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

            <DownloadButton
              plotted_data={this.state.plotted_data}
              title="Download data (json)"
              endpoint="/download_json"
            />

            <br />
            <br />

            <DownloadButton
              plotted_data={this.state.plotted_data}
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
              x_axis_label="energy"
              y_axis_label="cross section"
              x_axis_scale={this.state.x_axis_scale}
              y_axis_scale={this.state.y_axis_scale}
              x_axis_mutliplier={this.state.x_axis_mutliplier}
              y_axis_mutliplier={this.state.y_axis_mutliplier}
            />

            <br />

            <AxisScaleRadioButton
              plotted_data={this.state.plotted_data}
              event_handler={this.state.x_axis_scale}
              onChange={event => this.handle_axis_change("x_axis_scale", event)}
              label={"log"}
              title="X axis scale "
              x_axis_label={this.state.x_axis_label}
              y_axis_label={this.state.y_axis_label}
              selected={this.state.selected}
            />
            <AxisScaleRadioButton
              plotted_data={this.state.plotted_data}
              event_handler={this.state.x_axis_scale}
              onChange={event => this.handle_axis_change("x_axis_scale", event)}
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
              onChange={event => this.handle_axis_change("y_axis_scale", event)}
              label={"log"}
              title="Y axis scale "
              x_axis_label={this.state.x_axis_label}
              y_axis_label={this.state.y_axis_label}
              selected={this.state.selected}
            />
            <AxisScaleRadioButton
              event_handler={this.state.y_axis_scale}
              onChange={event => this.handle_axis_change("y_axis_scale", event)}
              label={"lin"}
              title=""
              plotted_data={this.state.plotted_data}
              x_axis_label={this.state.x_axis_label}
              y_axis_label={this.state.y_axis_label}
              selected={this.state.selected}
            />

            <br />

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
    );
  }
}

export default App;
