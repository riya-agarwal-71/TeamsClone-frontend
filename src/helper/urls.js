var url;
if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
  url = "http://localhost:8000";
} else {
  url = "https://teams-clone-71.herokuapp.com";
}

const ROOT_API = `${url}/api`;

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
};

export const server_url = `${url}/`;
