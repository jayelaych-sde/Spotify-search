const clientId = "817f9ed92b564d15a42ab7ab774282c5";
const params = new URLSearchParams(window.location.search);
const code = params.get("code");
const keyword = localStorage.getItem("keyword");
const localRedirectUri = "http://127.0.0.1:5500/";
const productionRedirectUri =
  "https://jayelaych-sde.github.io/Spotify-search/src";
const redirectUri =
  window.location.hostname === "127.0.0.1"
    ? localRedirectUri
    : productionRedirectUri;

console.log(clientId);

if (!code) {
  redirectToAuthCodeFlow(clientId);
} else {
  getAccessToken(clientId, code).then((accessToken) => {
    sessionStorage.setItem("access_token", accessToken);
    console.log("Access Token:", sessionStorage.getItem("access_token"));
  });
}

async function redirectToAuthCodeFlow(clientId) {
  const verifier = generateCodeVerifier(128);
  const challenge = await generateCodeChallenge(verifier);

  console.log(challenge);

  localStorage.setItem("verifier", verifier);

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("response_type", "code");
  params.append("redirect_uri", redirectUri);
  params.append("scope", "user-read-private user-read-email");
  params.append("code_challenge_method", "S256");
  params.append("code_challenge", challenge);

  document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

function generateCodeVerifier(length) {
  let text = "";
  let possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function generateCodeChallenge(codeVerifier) {
  const data = new TextEncoder().encode(codeVerifier);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = new Uint8Array(hashBuffer);
  const base64String = btoa(String.fromCharCode(...hashArray));
  const base64Url = base64String
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return base64Url;
}

async function getAccessToken(clientId, code) {
  const verifier = localStorage.getItem("verifier");

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", redirectUri);
  params.append("code_verifier", verifier);

  const result = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  const { access_token } = await result.json();
  return access_token;
}
