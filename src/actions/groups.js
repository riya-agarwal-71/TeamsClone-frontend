import { APIUrls } from "../helper/urls";
import { getFormBody } from "../helper/utils";
import {
  GROUP_FAILED,
  GROUP_START,
  GROUP_SUCCESS,
  CLEAR_GROUP_STATE,
} from "./actionTypes";

export function groupStart() {
  return {
    type: GROUP_START,
  };
}

export function groupSuccessful(msg, id, messages = null, admin = null) {
  return {
    type: GROUP_SUCCESS,
    msg,
    id,
    messages,
    admin,
  };
}

export function groupFailed(error) {
  return {
    type: GROUP_FAILED,
    error,
  };
}

export function clearGroupState() {
  return {
    type: CLEAR_GROUP_STATE,
  };
}

export function createGroup(fromUser, name, particpantsStr = "") {
  return (dispatch) => {
    const url = APIUrls.createGroup();
    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: getFormBody({ name, particpantsStr, fromUser }),
    })
      .then((res) => res.json())
      .then(({ data }) => {
        if (data.success) {
          dispatch(groupSuccessful(data.message, data.data.id));
          return;
        }
        dispatch(groupFailed(data.message));
        return;
      });
  };
}

export function getParticipants(grpID) {
  return (dispatch) => {
    const url = APIUrls.getParticipants();
    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: getFormBody({ grpID }),
    })
      .then((data) => data.json())
      .then(({ data }) => {
        if (data.success) {
          dispatch(
            groupSuccessful(
              data.message,
              data.data.id,
              data.data.participants,
              data.data.admin
            )
          );
          return;
        }
        dispatch(groupFailed(data.message));
        return;
      });
  };
}

export function addMember(byUser, newUser, grpID) {
  return (dispatch) => {
    const url = APIUrls.addMember();
    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: getFormBody({ byUser, newUser, grpID }),
    })
      .then((data) => data.json())
      .then(({ data }) => {
        if (data.success) {
          dispatch(groupSuccessful(data.message, data.data.id));
          return;
        }
        dispatch(groupFailed(data.message));
        return;
      });
  };
}

export function removeMember(from, toRemove, grpID) {
  return (dispatch) => {
    const url = APIUrls.removeMember();
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: getFormBody({ from, toRemove, grpID }),
    })
      .then((data) => data.json())
      .then(({ data }) => {
        if (data.success) {
          dispatch(groupSuccessful(data.message, data.data.id));
          return;
        }
        dispatch(groupFailed(data.message));
        return;
      });
  };
}

export function getMessages(grpID) {
  return (dispatch) => {
    const url = APIUrls.getMessages();
    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: getFormBody({ grpID }),
    })
      .then((data) => data.json())
      .then(({ data }) => {
        if (data.success) {
          dispatch(
            groupSuccessful(data.message, data.data.id, data.data.messages)
          );
          return;
        }
        dispatch(groupFailed(data.message));
        return;
      });
  };
}

export function deleteGroup(grpID, by) {
  return (dispatch) => {
    const url = APIUrls.deleteGroup();
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: getFormBody({ by, grpID }),
    })
      .then((data) => data.json())
      .then(({ data }) => {
        if (data.success) {
          dispatch(groupSuccessful(data.message, data.data.id));
          return;
        }
        dispatch(groupFailed(data.message));
        return;
      });
  };
}
