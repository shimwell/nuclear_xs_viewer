import React from "react";
import { Button } from "reactstrap";
import { REST_API_EXAMPLE_URL } from "../config";

const DownloadButton = ({ plotted_data, endpoint, title }) => {
  if (Object.keys(plotted_data).length === 0) {
    return null;
  }

  let list_of_ids = [];

  Object.keys(plotted_data).map(key =>
    list_of_ids.push(plotted_data[key]["id"])
  );

  return (
    <a
      href={REST_API_EXAMPLE_URL + endpoint + "?ids=" + list_of_ids.join(",")}
      download="my_cross_sections.txt"
    >
      <Button>{title}</Button>
    </a>
  );
};

export default DownloadButton;