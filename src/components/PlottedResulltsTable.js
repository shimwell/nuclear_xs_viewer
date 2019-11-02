import React from "react";
import ReactTable from "react-table";

const PlottedResulltsTable = ({ query_Results, data, columns, loading }) => {
  if (Object.keys(query_Results).length === 0) {
    return null;
  }

  let dataColection = [];
  let table_key = [];

  Object.keys(data).forEach(function(key) {
    
    dataColection.push(data[key]);
    
    table_key.push(data[key]["id"]);
  });

  return (
    <ReactTable
      key={table_key}
      data={dataColection}
      columns={[{ Header: "Plotted data", columns: columns }]}
      showPagination={false}
      defaultPageSize={dataColection.length}
      loading={loading}
    />
  );
};

export default PlottedResulltsTable;