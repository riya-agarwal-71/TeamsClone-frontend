import {
  START_ROOM,
  ROOM_SUCCESSFULL,
  ROOM_FAILED,
  CLEAR_ROOM,
} from "./actionTypes";
import { APIUrls } from "../helper/urls";
import { getFormBody } from "../helper/utils";

export function startRoom() {
  return {
    type: START_ROOM,
  };
}

export function roomSuccessfull(url) {
  return {
    type: ROOM_SUCCESSFULL,
    url,
  };
}

export function roomFailed(error) {
  return {
    type: ROOM_FAILED,
    error,
  };
}

export function clearRoom() {
  return {
    type: CLEAR_ROOM,
  };
}

export function createRoom(roomUrl) {
  return (dispatch, done) => {
    const url = APIUrls.createRoom();
    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: getFormBody({ roomUrl }),
    })
      .then((response) => response.json())
      .then(({ data }) => {
        if (data.success === true) {
          dispatch(roomSuccessfull(data.data.roomUrl));
        } else {
          dispatch(roomFailed(data.message));
        }
      });
  };
}

export function checkExistingRoom(roomUrl) {
  return (dispatch) => {
    const url = APIUrls.checkRoom();
    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: getFormBody({ roomUrl }),
    })
      .then((response) => response.json())
      .then(({ data }) => {
        if (data.success === true) {
          dispatch(roomSuccessfull(data.data.roomUrl));
        } else {
          dispatch(roomFailed(data.message));
        }
      });
  };
}
