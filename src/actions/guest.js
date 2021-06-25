import { GUEST_LOGIN } from "./actionTypes";

export function guestLogin(username) {
  return {
    type: GUEST_LOGIN,
    username,
  };
}
