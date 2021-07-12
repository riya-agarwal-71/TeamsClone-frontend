// file containing all the urls
// url for backend
var url;
if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
  url = "http://localhost:8000";
} else {
  url = "https://teams-clone-71.herokuapp.com";
}

// root api url
const ROOT_API = `${url}/api`;

// url for front end
var frontUrl;
if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
  frontUrl = "http://localhost:3000";
} else {
  frontUrl = "https://teams-clone-71.netlify.app";
}

// export frontend url
export const baseUrl = frontUrl;

// export all the api urls
export const APIUrls = {
  login: () => `${ROOT_API}/users/login`,
  signup: () => `${ROOT_API}/users/signup`,
  createRoom: () => `${ROOT_API}/room/create`,
  deleteRoom: () => `${ROOT_API}/room/delete`,
  checkRoom: () => `${ROOT_API}/room/check`,
  createGroup: () => `${ROOT_API}/group/create`,
  addMember: () => `${ROOT_API}/group/add-member`,
  removeMember: () => `${ROOT_API}/group/remove-member`,
  getMessages: () => `${ROOT_API}/group/get-messages`,
  deleteGroup: () => `${ROOT_API}/group/delete`,
  sendMessage: () => `${ROOT_API}/message/send`,
  deleteMessage: () => `${ROOT_API}/messages/delete`,
  getGroups: () => `${ROOT_API}/users/groups`,
  getParticipants: () => `${ROOT_API}/group/get-participants`,
};

// export the server url for the socket connection
export const server_url = `${url}/`;
