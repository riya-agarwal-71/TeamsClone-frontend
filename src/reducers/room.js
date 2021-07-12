// import all the action types
import {
  ROOM_FAILED,
  ROOM_SUCCESSFULL,
  START_ROOM,
  CLEAR_ROOM,
} from "../actions/actionTypes";

// define the initial state
const initialState = {
  success: false,
  error: null,
  inProgress: false,
  url: "",
};

// the reducer function to change the room state
export default function room(state = initialState, action) {
  switch (action.type) {
    case START_ROOM:
      return {
        ...state,
        inProgress: true,
      };
    case ROOM_FAILED:
      return {
        ...state,
        success: false,
        error: action.error,
        inProgress: false,
      };
    case ROOM_SUCCESSFULL:
      return {
        ...state,
        success: true,
        url: action.url,
        inProgress: false,
        error: null,
      };
    case CLEAR_ROOM:
      return {
        ...state,
        success: false,
        inProgress: false,
        url: "",
        error: null,
      };
    default:
      return state;
  }
}
