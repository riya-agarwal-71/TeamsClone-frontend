import { getFormBody } from "../helper/utils";
import { APIUrls } from "../helper/urls";

import {
  START_MESSAGE,
  MESSAGE_FAILED,
  MESSAGE_SUCCESS,
  CLEAR_MESSAGE_STATE,
} from "./actionTypes";

export function startMessage() {
  return {
    type: START_MESSAGE,
  };
}

export function messageFailed(error) {
  return {
    type: MESSAGE_FAILED,
    error,
  };
}

export function messageSuccess(successMsg, message) {
  return {
    type: MESSAGE_SUCCESS,
    successMsg,
    message,
  };
}

export function clearMessageState() {
  return {
    type: CLEAR_MESSAGE_STATE,
  };
}

export function sendMessage(fromUser, toGrpID, message) {
  try {
    return (dispatch) => {
      const url = APIUrls.sendMessage();
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: getFormBody({ fromUser, toGrpID, message }),
      })
        .then((res) => res.json())
        .then(({ data }) => {
          if (data.success) {
            dispatch(messageSuccess(data.message, data.data.msg));
            return;
          }
          dispatch(messageFailed(data.message));
          return;
        });
    };
  } catch (error) {
    console.log(error);
  }
}

export function deleteMessage(fromUser, grpID, message) {
  try {
    return (dispatch) => {
      const url = APIUrls.deleteMessage();
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: getFormBody({ fromUser, grpID, message }),
      })
        .then((res) => res.json())
        .then(({ data }) => {
          if (data.success) {
            dispatch(messageSuccess(data.message));
            return;
          }
          dispatch(messageFailed(data.message));
          return;
        });
    };
  } catch (error) {
    console.log(error);
  }
}
