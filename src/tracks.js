const trackId = localStorage.getItem("trackId");
const albumId = localStorage.getItem("albumId");
const trackPageAndImg = document.querySelector(".track-page");
const trackList = document.querySelector(".track-list");

function main() {
  renderTrack();
}

main();

function isExplicit(track) {
  if (track.explicit) {
    return `<span class="explicit track-page__explicit">E</span>`;
  } else {
    return "";
  }
}

function hasFeature(track) {
  let features = [];
  let names = "";
  if (track.artists.length > 1) {
    for (let i = 0; i < track.artists.length; i++) {
      features.push(track.artists[i].name);
    }
  } else {
    return track.artists[0].name;
  }
  return (names = features.join(", "));
}

function duration(track) {
  let mm = Math.floor(track.duration_ms / 60000);
  let ss = Math.floor((track.duration_ms / 1000) % 60)
    .toString()
    .padStart(2, "0");
  return mm + ":" + ss;
}

async function getAccessToken() {
  return sessionStorage.getItem("access_token");
}

async function getMostRecentId(trackId, albumId) {
  const trackItem = JSON.parse(trackId);
  const albumItem = JSON.parse(albumId);

  if (!trackItem || !albumItem) {
    console.log("Neither id is in localStorage");
    return;
  }

  console.log(trackId);
  console.log(albumId);

  const timestamp1 = new Date(trackItem.timestamp);
  console.log(timestamp1);
  const timestamp2 = new Date(albumItem.timestamp);
  console.log(timestamp2);

  if (timestamp1 > timestamp2) {
    console.log(trackItem.id);
    console.log(await getTrack(trackItem.id));
    return await getTrack(trackItem.id);
  }
  if (timestamp2 > timestamp1) {
    console.log(albumItem.id);
    console.log(await getTrack(albumItem.id));
    return await getAlbum(albumItem.id);
  }
}

async function getAlbum(albumId) {
  const accessToken = await getAccessToken();

  const url = `https://api.spotify.com/v1/albums/${albumId}`;

  // console.log("Request URL:", url);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error(
        "Failed to fetch album:",
        response.status,
        response.statusText
      );
      return []; // Return an empty array on failure
    }

    const data = await response.json();
    return data || [];
  } catch (e) {
    console.error("Error fetching album:", e);
    return [];
  }
}

async function getTrack(trackId) {
  const accessToken = await getAccessToken();

  const url = `https://api.spotify.com/v1/tracks/${trackId}`;

  // console.log("Request URL:", url);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error(
        "Failed to fetch track:",
        response.status,
        response.statusText
      );
      return []; // Return an empty array on failure
    }

    const data = await response.json();
    console.log(data);
    return data || [];
  } catch (e) {
    console.error("Error fetchiing track:", e);
    return [];
  }
}

async function renderTrack() {
  const item = await getMostRecentId(trackId, albumId);
  console.log(item);
  trackPageAndImg.innerHTML = titleHTML(item);
  trackList.innerHTML =
    item.type === "track"
      ? trackHTML(item)
      : item.type === "album"
      ? item.tracks.items.map((track) => albumHTML(track)).join("")
      : console.log(item);

  console.log((trackPageAndImg.innerHTML += trackList.innerHTML));
}

function titleHTML(item) {
  let imageURL = "";
  item.type === "track"
    ? (imageURL = item.album.images[0].url)
    : item.type === "album"
    ? (imageURL = item.images[0].url)
    : console.log(imageURL);
  return `<div class="track-page__back">
              <a href="./songs.html">
                <button class="back-btn">
                  <i class="fa-solid fa-arrow-left-long"></i>
                </button>
              </a>
              <h1 class="album__name">${item.name}</h1>
            </div>
            <div class="track">
              <div class="track-card">
                <figure class="track-card__img">
                  <img src="${imageURL}" alt="" />
                </figure>`;
}

function trackHTML(track) {
  return `<div class="track__info">
                    <button class="track__play-pause">
                      <i class="fa-solid fa-play"></i>
                    </button>
                    <div class="track__info--text">
                      <h3 class="track__title">${track.name} ${isExplicit(
    track
  )}</h3>
                      <h4 class="track__artist">${hasFeature(track)}</h4>
                      <p class="track__duration">${duration(track)}</p>
                    </div>
                  </div>`;
}

function albumHTML(track) {
  return `<div class="track__info">
                    <button class="track__play-pause">
                      <i class="fa-solid fa-play"></i>
                    </button>
                    <div class="track__info--text">
                      <h3 class="track__title">${track.name} ${isExplicit(
    track
  )}</h3>
                      <h4 class="track__artist">${hasFeature(track)}</h4>
                      <p class="track__duration">${duration(track)}</p>
                    </div>
                  </div>`;
}
