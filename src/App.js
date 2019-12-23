import React, { Component } from "react"
import "./App.css"
import { Container, Row, Col, Button } from "reactstrap"
import { REACT_APP_ENDPOINT } from "./config"
import PlotlyGraph from "./components/PlotlyGraph"
import AxisScaleRadioButton from "./components/AxisScaleRadioButton"
import FilterDropdowns from "./components/FilterDropdowns"
import PlottedResulltsTable from "./components/PlottedResulltsTable"
import QueryResulltsTable from "./components/QueryResulltsTable"
import ScaleSlider from "./components/ScaleSlider"
import filterData from "./filterData"
import Logo from "./logo.png";


document.title = "XSPlot"


class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      filter_data: filterData,
      response_filter_data: [],
      axis_data: [{ "cross section": "cross section", energy: "energy" }],
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
      y_axis_mutliplier: 0,
    }
    this.handle_xaxis_units_change = this.handle_xaxis_units_change.bind(this)
    this.downloadContent = this.downloadContent.bind(this)
    this.downloadCSVContent = this.downloadCSVContent.bind(this)
  }

  handle_xaxis_units_change(value) {
    console.log("value", value)
    this.setState({
      x_axis_mutliplier: value,
    })
  }

  make_clear_button() {
    if (Object.keys(this.state.selected).length === 0 || Object.keys(this.state.plotted_data).length === 0) {
      return ""
    } else {
      return <Button onClick={this.handle_clearplot_button_press}>Clear plot</Button>
    }
  }
  
  make_download_local_json_button(){
    if (Object.keys(this.state.selected).length === 0 || Object.keys(this.state.plotted_data).length === 0) {
      return ""
    } else {
      return <Button onClick={this.downloadContent}>Download json data</Button>
    }
  }

  make_download_local_csv_button(){
    if (Object.keys(this.state.selected).length === 0 || Object.keys(this.state.plotted_data).length === 0) {
      return ""
    } else {
      return <Button onClick={this.downloadCSVContent}>Download csv data</Button>
    }
  }

  downloadCSVContent(){
    var lines = [];
    lines.push(' Cross section downloaded from xsplot.com')

    for (var key in this.state.plotted_data) {
      
      lines.push(' ')
      lines.push('Mass number , '.concat(this.state.plotted_data[key]['Mass number']))
      lines.push('Proton number / element , '.concat(this.state.plotted_data[key]["Proton number / element"]))
      lines.push('Neutron number , '.concat(this.state.plotted_data[key]["Neutron number"]))
      lines.push('MT number / reaction products , '.concat(this.state.plotted_data[key]["MT number / reaction products"]))
      lines.push('Library , '.concat(this.state.plotted_data[key]["Library"]))
      
      var [mt_number, products] = this.state.plotted_data[key]["MT number / reaction products"].split(" ");

      if (mt_number === "MT301") {
        lines.push('Energy (eV) , Heating (eV/reaction)')
      }
      
      if (mt_number === "MT444") {
        lines.push('Energy (eV) , Damage (eV-barns)')
      }
      
      if (mt_number !== "MT444" && mt_number !== "MT301") {
        lines.push('Energy (eV) , Cross sections (barns)')
      }
      
      var energy_array = this.state.plotted_data[key]["energy"]
      var cross_section_array = this.state.plotted_data[key]["cross section"]

      for(let i = 0; i < energy_array.length; i++){

        // console.log(energy_array[i], cross_section_array[i]);
        lines.push(energy_array[i].toString().concat(' , ').concat(cross_section_array[i].toString()))
      }
    
    }
    // let contents_of_file = JSON.stringify(this.state.plotted_data)
    console.log(lines)
    var atag = document.createElement("a");
    var file = new Blob([lines.join('\n')], {type: 'text/plain'});
    atag.href = URL.createObjectURL(file);
    atag.download = "xsplot.csv";
    atag.click();
  }


  downloadContent(){
    var lines = ['['];
    for (var key in this.state.plotted_data) {
      lines.push(JSON.stringify(this.state.plotted_data[key]).concat(','))
    }
    var string_for_last_entry = lines[lines.length - 1];
    lines[lines.length - 1] = string_for_last_entry.substring(0, string_for_last_entry.length - 1);
    lines.push(']');
    var atag = document.createElement("a");
    var file = new Blob([lines.join('')], {type: 'text/plain'});
    atag.href = URL.createObjectURL(file);
    atag.download = "xsplot.json";
    atag.click();
  }

  handle_clearplot_button_press = event =>
    this.setState({
      plotted_data: {},
      selected: {},
    })

  handle_axis_change = (prop, event) =>
    this.setState({
      [prop]: event.target.value,
    })

  handle_meta_data_dropdown_change_function = (optionSelected, { action, name }) => {
    const { query } = this.state
    this.setState({ loading: true })
    if (action === "clear") {
      delete query[name]
      this.setState({ query }, () => {
        Object.keys(query).length > 0
          ? this.issueQuery()
          : this.setState({
              query_result: [],
              loading: false,
              response_filter_data: []
            })
      })
    } else {
      this.setState({ query: { ...query, [name]: optionSelected.value["value"] } }, this.issueQuery)
    }
  }

  issueQuery = () => {
    const { query } = this.state
    fetch(REACT_APP_ENDPOINT + "/get_matching_entrys_and_distinct_values_for_fields?query=" + JSON.stringify(query))
      .then(result => {
        if (result.ok) {
          return result.json()
        }
      })
      .then(data => {
        // Order of Dropdown
        const order = [
          "Proton number / element",
          "Mass number",
          "Neutron number",
          "MT number / reaction products",
          "Library"
        ];
        // Data to be added
        const newData = new Array(order.length);
        
        data.dropdown_options.map((key, idx) => {
          if (key["available_options"] && key["field"]) {
            const index = order.indexOf(key["field"]);
            const value = {
              field: [key["field"]],
              distinct_values: key["available_options"]
            };
            if (index === -1) {
              newData.push(value);
            } else {
              newData[index] = value;
            }
          }
          return true;
        });

        this.setState({
          query_result: data.search_results,
          loading: false,
          response_filter_data: newData
        });
      })
      .catch(err =>
        console.log(
          "Cannot connect to server " +
            REACT_APP_ENDPOINT +
            "get_matching_entrys_and_distinct_values_for_fields?query=" +
            JSON.stringify(query),
        ),
      )
  }

  ReturnColumns = check_box_class => {
    const columns = [
      {
        id: "checkbox",
        Header:"select",
        accessor: "",
        Cell: ({ original }) => {
          return (
            <input
              type="checkbox"
              title="Add / remove from the plot"
              className={check_box_class}
              checked={this.state.selected[original.id] === true}
              onChange={() => this.toggleRow(original.id)}
            />
          )
        },
        width: 70,
      },
    ]

    this.state.filter_data.map((x, i) =>
      columns.push({
        Header: x["field"][0],
        accessor: x["field"][0],
      }),
    )

    return columns
  }

  toggleRow(filename) {
    this.setState({ loading: true, loading_graph: false })

    const newSelected = Object.assign({}, this.state.selected)

    newSelected[filename] = !this.state.selected[filename]

    this.setState({ selected: newSelected })

    let plotted_dataCopy = JSON.parse(JSON.stringify(this.state.plotted_data))
    if (newSelected[filename] === true) {
      fetch(REACT_APP_ENDPOINT + '/get_matching_entry?query={"id":"' + filename + '"}')
        .then(result => {
          if (result.ok) {
            return result.json()
          }
        })
        .then(data => {
          plotted_dataCopy[filename] = data
          this.setState({
            plotted_data: plotted_dataCopy,
            loading_graph: false,
            loading: false,
          })
        })
        .catch(err => {
          console.log(
            "Cannot connect to server " + REACT_APP_ENDPOINT + '/get_matching_entry?query={"id":"' + filename + '"}',
          )
        })
    } else {
      delete plotted_dataCopy[filename]
      this.setState({ loading: false })
    }

    this.setState({ plotted_data: plotted_dataCopy }, () => {})
  }


  
  

  render() {
    const selected = this.state.selected

    var check_box_class

    if (
      Object.keys(selected).length === 0 ||
      Object.keys(selected).every(function(k) {
        return selected[k] === false
      })
    ) {
      check_box_class = "checkbox_highlighted"
    } else {
      check_box_class = "checkbox"
    }

    const columns = this.ReturnColumns(check_box_class)

    return (
      <Container className="App">
        <Row>
          <Col md="1" lg="1">
          <img src={Logo}></img>
          </Col>
          <Col md="11" lg="11">
            <h1 className="heading">XSPlot the nuclear cross section plotter</h1>
            <p>
              Search 121,749 cross sections processed with
              <a href="https://openmc.readthedocs.io"> OpenMC</a>.
            </p>
            <p>
              Contribute, raise an issue or request a feature via
              <a href="https://github.com/Shimwell/nuclear_xs_compose" title='Contribute, raise an issue or request a feature'> Github</a> or
              <a href="mailto:drshimwell@gmail.com?Subject=xsplot" target="_top" title="email me"> email me. </a>
              Site{" "}
              <a href="https://github.com/Shimwell/nuclear_xs_compose/blob/master/LICENSE"> license </a>
            </p>
          </Col>
        </Row>
        <Row>
          <Col md="4" lg="4">
            <FilterDropdowns
              filter_data={
                this.state.response_filter_data.length === 0
                  ? this.state.filter_data
                  : this.state.response_filter_data
              }
              event_handler={this.handle_meta_data_dropdown_change_function}
            />

            <br />
            <br />

            {this.make_download_local_json_button()}
            <br />
            <br />
            {this.make_download_local_csv_button ()}

            <br />
            <br />
            {this.make_clear_button()}
          </Col>
          <Col md="8" lg="8">
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
    )
  }
}

export default App
