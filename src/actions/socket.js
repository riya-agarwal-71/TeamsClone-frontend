import {
  START_SOCKET,
  SOCKET_FAILED,
  SOCKET_SUCCESS,
  CLEAR_SOCKET_STATE,
} from "./actionTypes";
import { server_url } from "../helper/urls";
import { io } from "socket.io-client";

export function startSocketConnection() {
  return {
    type: START_SOCKET,
  };
}

export function socketSuccessfull(socket, socketID) {
  return {
    type: SOCKET_SUCCESS,
    socket,
    socketID,
  };
}

export function socketFailed() {
  return {
    type: SOCKET_FAILED,
  };
}

export function clearSocketState() {
  return {
    type: CLEAR_SOCKET_STATE,
  };
}

export function connectToSocket() {
  return (dispatch) => {
    try {
      const socket = io(server_url);
      var socketID;
      socket.on("connect", () => {
        socketID = socket.id;
      });
      dispatch(socketSuccessfull(socket, socketID));
      return;
    } catch (err) {
      dispatch(socketFailed());
      console.log(error);
    }
  };
}
