// get all the necessary action types
import {
  MESSAGE_FAILED,
  MESSAGE_SUCCESS,
  START_MESSAGE,
  CLEAR_MESSAGE_STATE,
} from "../actions/actionTypes";

// define the initial state
const initialState = {
  inProgress: false,
  error: null,
  success: null,
  msg: null,
};

// the reducer function to change the message state
export default function message(state = initialState, action) {
  switch (action.type) {
    case START_MESSAGE:
      return {
        ...state,
        inProgress: true,
        error: null,
        success: null,
        msg: null,
      };
    case MESSAGE_SUCCESS:
      return {
        ...state,
        inProgress: false,
        error: null,
        success: action.successMsg,
        msg: action.message,
      };
    case MESSAGE_FAILED:
      return {
        ...state,
        inProgress: false,
        error: action.error,
        success: null,
        msg: null,
      };
    case CLEAR_MESSAGE_STATE:
      return {
        ...state,
        inProgress: false,
        error: null,
        success: null,
        msg: null,
      };
    default:
      return state;
  }
}
