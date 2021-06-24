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
};

export const server_url = `${url}/`;
