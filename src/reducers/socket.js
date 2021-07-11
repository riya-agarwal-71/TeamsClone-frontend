import {
  START_SOCKET,
  SOCKET_FAILED,
  SOCKET_SUCCESS,
  CLEAR_SOCKET_STATE,
} from "../actions/actionTypes";

const initialState = {
  inProgress: false,
  socket: null,
  socketID: null,
};

export default function socket(state = initialState, action) {
  switch (action.type) {
    case START_SOCKET:
      return {
        ...state,
        inProgress: true,
        socket: null,
        socketID: null,
      };
    case SOCKET_FAILED:
      return {
        ...state,
        inProgress: false,
        socket: null,
        socketID: null,
      };
    case SOCKET_SUCCESS:
      return {
        ...state,
        inProgress: false,
        socket: action.socket,
        socketID: action.socketID,
      };
    case CLEAR_SOCKET_STATE:
      return {
        ...state,
        inProgress: false,
        socket: null,
        socketID: null,
      };
    default:
      return state;
  }
}
