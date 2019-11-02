import React from "react";
import ReactTable from "react-table";

const PlottedResulltsTable = ({ query_Results, data, columns, loading }) => {
  if (Object.keys(query_Results).length === 0) {
    return null;
  }

  let dataColection = [];

  Object.keys(data).forEach(key => dataColection.push(data[key]));

  return (
    <ReactTable
      data={dataColection}
      columns={[{ Header: "Plotted data", columns: columns }]}
      showPagination={false}
      defaultPageSize={dataColection.length}
      loading={loading}
    />
  );
};

export default PlottedResulltsTable;