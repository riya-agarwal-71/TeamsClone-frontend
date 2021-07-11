import {
  GROUP_START,
  GROUP_FAILED,
  GROUP_SUCCESS,
  CLEAR_GROUP_STATE,
} from "../actions/actionTypes";

const initialState = {
  inProgress: false,
  success: null,
  error: null,
  id: null,
  messages: null,
  admin: null,
};

export default function group(state = initialState, action) {
  switch (action.type) {
    case GROUP_START:
      return {
        ...state,
        success: null,
        error: null,
        inProgress: true,
      };
    case GROUP_SUCCESS:
      return {
        ...state,
        success: action.msg,
        error: null,
        inProgress: false,
        id: action.id,
        messages: action.messages,
        admin: action.admin,
      };
    case GROUP_FAILED:
      return {
        ...state,
        success: null,
        error: action.error,
        inProgress: false,
        id: null,
      };
    case CLEAR_GROUP_STATE:
      return {
        ...state,
        success: null,
        error: null,
        inProgress: false,
        id: null,
        messages: null,
        admin: null,
      };
    default:
      return state;
  }
}
