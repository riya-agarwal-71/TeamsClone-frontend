// get the form body from the params
export function getFormBody(params) {
  let formBody = [];

  for (let property in params) {
    let encodedKey = encodeURIComponent(property);
    let encodedValue = encodeURIComponent(params[property]);

    formBody.push(encodedKey + "=" + encodedValue);
  }

  return formBody.join("&");
}

// get the token from local storage
export function getAuthTokenFromLocalStorage() {
  return localStorage.getItem("token");
}
