import React from "react";
import ReactTable from "react-table";

const QueryResulltsTable = ({ query_Results, data, columns, loading }) => {
  if (query_Results.length === 0) {
    return <p>No matching results</p>;
  }

  let table_key = [];

￼  for (var j = 0; j < query_Results.length; j++) {
￼
￼    table_key.push(query_Results[j]["id"]);
￼  }

  return (
    <ReactTable
      key={table_key}
      data={data}
      columns={[{ Header: "Query results (limited to 30)", columns: columns }]}
      showPagination={false}
      defaultPageSize={Math.max(3, query_Results.length)}
      loading={loading}
    />
  );
};

export default QueryResulltsTable;