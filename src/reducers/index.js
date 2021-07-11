import { combineReducers } from "redux";
import auth from "./auth";
import guest from "./guest";
import room from "./room";
import group from "./group";
import message from "./message";
import socket from "./socket";

export default combineReducers({
  auth,
  guest,
  room,
  group,
  message,
  socket,
});
