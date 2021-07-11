export function getFormBody(params) {
  let formBody = [];

  for (let property in params) {
    let encodedKey = encodeURIComponent(property);
    let encodedValue = encodeURIComponent(params[property]);

    formBody.push(encodedKey + "=" + encodedValue);
  }

  return formBody.join("&");
}

export function getAuthTokenFromLocalStorage() {
  return localStorage.getItem("token");
}

export function convertStrToHTMLDom(str) {
  var parser = new DOMParser();
  var doc = parser.parseFromString(str, "text/html");
  console.log(doc.querySelector("body").innerHTML);
  return doc.all[0].textContent;
}
