// configure the store
import { applyMiddleware, createStore } from "redux";
import thunk from "redux-thunk";
import logger from "redux-logger";
import reducer from "../reducers";

export function configureStore() {
  let store;
  // apply middleware thunk to deal with async actions and logger in development mode to see the state changes
  if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
    store = createStore(reducer, applyMiddleware(thunk, logger));
  } else {
    store = createStore(reducer, applyMiddleware(thunk));
  }
  return store;
}
