import { applyMiddleware, createStore } from "redux";
import thunk from "redux-thunk";
import logger from "redux-logger";
import reducer from "../reducers";

export function configureStore() {
  let store;
  if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
    // store = createStore(reducer, applyMiddleware(thunk, logger));
    store = createStore(reducer, applyMiddleware(thunk, logger));
  } else {
    store = createStore(reducer, applyMiddleware(thunk));
  }
  return store;
}
