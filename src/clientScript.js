const clientId = "817f9ed92b564d15a42ab7ab774282c5";
const clientSecret = "f4634d4fa5dd4c5397741135a72aea65";
const keyword = localStorage.getItem("keyword");

async function getAccessToken() {
  const tokenUrl = "https://accounts.spotify.com/api/token";
  const credentials = btoa(`${clientId}:${clientSecret}`);

  try {
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch token: ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (e) {
    console.error("Error fetching access token:", e.message);
    throw e;
  }
}

(async () => {
  try {
    const token = await getAccessToken();
    sessionStorage.setItem("access_token", token);
    console.log(`Access token: ${token}`);
  } catch (e) {
    console.error("Failed to fetch and store token:", e.message);
  }
})();
