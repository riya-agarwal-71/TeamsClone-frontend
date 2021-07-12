// the main entry point of the react application
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
// get the AppWrapper component
import AppWrapper from "./components/AppWrapper";
import { configureStore } from "./store";

// get the store
const store = configureStore();

// render the AppWrapper component in the index.js file in public in the div with id root
ReactDOM.render(
  // give the acces of store using provider to all the elements within AppWrapper
  <Provider store={store}>
    <AppWrapper />
  </Provider>,
  document.getElementById("root")
);
