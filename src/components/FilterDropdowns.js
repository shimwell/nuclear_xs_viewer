import React from "react";
import Select from "react-select";
import { Col, Row } from "reactstrap";

const FilterDropdowns = ({ filter_data, event_handler }) => (
  <div>
    {filter_data.map((x, i) => {
      const meta_data_dropdown_dict = [];
      const list_of_dropdown_values = x["distinct_values"];
      const field_values = x["field"][0];

      for (var j = 0; j < list_of_dropdown_values.length; j++) {
        meta_data_dropdown_dict.push({
          value: {
            field: field_values,
            value: list_of_dropdown_values[j]
          },
          label: list_of_dropdown_values[j]
        });
      }

      return (
        <Row key={i} className="mb-1">
          <Col md="6" lg="6">
            <label htmlFor={"dropdown_" + field_values.replace(" ", "_")}>
              {field_values}
            </label>
          </Col>
          <Col md="6" lg="6">
            <div className="haha">
              <Select
                isClearable
                id={"dropdown_" + field_values.replace(" ", "_")}
                key={i}
                options={meta_data_dropdown_dict}
                placeholder="Select or type ..."
                name={field_values}
                onChange={event_handler}
                className="meta_data_dropdown"
              />
            </div>
          </Col>
        </Row>
      );
    })}
  </div>
);

export default FilterDropdowns;
