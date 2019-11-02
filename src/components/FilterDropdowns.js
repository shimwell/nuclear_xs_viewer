import React from "react";
import Select from "react-select";

const FilterDropdowns = ({ filter_data, event_handler }) => (
  <div>
    {filter_data.map((x, i) => {
      const meta_data_dropdown_dict = [];
      const list_of_dropdown_values = x["distinct_values"];
      const field_values = x["field"][0];

      meta_data_dropdown_dict.push({
        value: {
          field: field_values,
          value: ""
        },
        label: ""
      });

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
        <div key={i}>
          <label htmlFor={"dropdown_" + field_values.replace(" ", "_")}>
            {field_values}
            <div className="haha">
              <Select
                id={"dropdown_" + field_values.replace(" ", "_")}
                key={i}
                options={meta_data_dropdown_dict}
                placeholder="Select or type ..."
                name={field_values}
                onChange={event_handler}
                className="meta_data_dropdown"
              />
            </div>
          </label>
        </div>
      );
    })}
  </div>
);

export default FilterDropdowns;