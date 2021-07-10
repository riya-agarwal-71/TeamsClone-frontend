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

export function groupSuccessful(msg, id, messages = null) {
  return {
    type: GROUP_SUCCESS,
    msg,
    id,
    messages,
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
  try {
    return (dispatch) => {
      const url = APIUrls.createGroup();
      fetch(url, {
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
          dispatch(groupUnsucessful(data.message));
          return;
        });
    };
  } catch (error) {
    console.log(error);
  }
}

export function addMember(byUser, newUser, grpID) {
  try {
    return (dispatch) => {
      const url = APIUrls.addMember();
      fetch(url, {
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
          dispatch(groupUnsucessful(data.message));
          return;
        });
    };
  } catch (error) {
    console.log(error);
  }
}

export function removeMember(from, toRemove, grpID) {
  try {
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
          dispatch(groupUnsucessful(data.message));
          return;
        });
    };
  } catch (error) {
    console.log(error);
  }
}

export function getMessages(grpID) {
  try {
    return (dispatch) => {
      const url = APIUrls.getMessages();
      fetch(url, {
        method: "GET",
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
          dispatch(groupUnsucessful(data.message));
          return;
        });
    };
  } catch (error) {
    console.log(error);
  }
}

export function deleteGroup(grpID, by) {
  try {
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
          dispatch(groupUnsucessful(data.message));
          return;
        });
    };
  } catch (error) {
    console.log(error);
  }
}
