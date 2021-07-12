// the page 404 component
import React from "react";

// displayed if the url is incorrect
function Page404() {
  return (
    <h1
      style={{
        display: "flex",
        width: "100%",
        justifyContent: "center",
      }}
    >
      Sorry Page not found !
    </h1>
  );
}

export default Page404;
