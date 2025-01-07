const searchName = document.querySelector(".search__name");
let keyword = localStorage.getItem("keyword");
const searchButton = document.querySelector(".search__btn");
const searchInput = document.querySelector(".search__input");
const popup = document.querySelector(".popup");
const songsList = document.querySelector(".songs__list");
const filter = document.getElementById("filter");
const filterType = document.getElementById("filterType");
const fromDatePicker = document.getElementById("from-date");
const toDatePicker = document.getElementById("to-date");
let searchResult = search(keyword);
let currentResult = searchResult;
let currentFilter = "ALL";
let currentSort = "SORT";

function main() {
  if (keyword) {
    searchName.innerHTML = `for "${keyword}"`;
  }
  setCurrentDate();
  renderSearch(keyword, searchResult);
}

main();

function setCurrentDate() {
  let currentDate = new Date().toJSON().slice(0, 7);
  console.log(currentDate);
  fromDatePicker.value = "";
  toDatePicker.value = currentDate;
}

function storeTrackId(trackId) {
  const timestamp = new Date().toISOString();
  const data = {
    id: trackId,
    timestamp: timestamp,
  };
  localStorage.setItem("trackId", JSON.stringify(data));
}
function storeAlbumId(albumId) {
  const timestamp = new Date().toISOString();
  const data = {
    id: albumId,
    timestamp: timestamp,
  };
  localStorage.setItem("albumId", JSON.stringify(data));
}

function trackHTML(track) {
  return `<div class="song">
            <div class="song-card">
              <a href="./tracks.html" class="song-card__img--link" data-track="${
                track.id
              }">
                <figure class="song-card__img">
                  <img src="${track.album.images[0].url}" alt="" />
                </figure>
              </a>
              <div class="song__info">
                <h3 class="song__title">
                  ${track.name} ${isExplicit(track)}
                </h3>
                <h4 class="song__artist">${hasFeature(track)}</h4>
                <p class="song__duration">${duration(track)}</p>
              </div>
            </div>
          </div>`;
}

function isAlbumSingle(album) {
  if (album.album_type === "single") {
    return "Single";
  } else {
    return `${album.total_tracks} Tracks`;
  }
}

function albumHTML(album) {
  return `<div class="song">
            <div class="song-card">
              <a href="./tracks.html" class="song-card__img--link" data-album="${
                album.id
              }">
                <figure class="song-card__img">
                  <img src="${album.images[0].url}" alt="" />
                </figure>
              </a>
              <div class="song__info">
                <h3 class="song__title">
                  ${album.name}
                </h3>
                <h4 class="song__artist">${album.artists[0].name}</h4>
                <p class="song__duration">${isAlbumSingle(album)}</p>
              </div>
            </div>
          </div>`;
}

function duration(track) {
  let mm = Math.floor(track.duration_ms / 60000);
  let ss = Math.floor((track.duration_ms / 1000) % 60)
    .toString()
    .padStart(2, "0");
  return mm + ":" + ss;
}

function isExplicit(track) {
  if (track.explicit) {
    return `<span class="explicit">E</span>`;
  } else {
    return "";
  }
}

async function isAlbumExplicit(album) {
  const albumObj = await getAlbum(album.id);
  const tracks = albumObj.tracks.items;

  return tracks.some((track) => track.explicit);
}

async function albumPopularity(album) {
  const albumObj = await getAlbum(album.id);

  return albumObj.popularity;
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

async function getAccessToken() {
  console.log(sessionStorage.getItem("access_token"));
  return sessionStorage.getItem("access_token");
}

function resetFilter() {
  const firstOptionValue = filter.options[0].value;
  const firstOptionValueType = filterType.options[0].value;
  filter.value = firstOptionValue;
  filterType.value = firstOptionValueType;
  setCurrentDate();
}

function onSearchChange() {
  const newKeyword = searchInput.value.trim();
  if (!searchInput.checkValidity()) {
    popup.style.display = "block";
    searchInput.classList.add("error");
  } else {
    popup.style.display = "none";
    searchInput.classList.remove("error");
    localStorage.setItem("keyword", newKeyword);
    keyword = localStorage.getItem("keyword");
    searchResult = search(newKeyword);
    currentResult = searchResult;
    renderSearch(newKeyword, currentResult);
    console.log(keyword);
  }
}

async function renderSearch(keyword, searchResult) {
  searchName.innerHTML = `for "${keyword}"`;
  console.log(localStorage.getItem("keyword"));

  songsList.classList.add("songs__loading");
  console.log("Loader added");

  const result = await searchResult;

  songsList.classList.remove("songs__loading");
  console.log("Loader removed");

  console.log(result);
  currentResult = result;
  console.log(currentResult);

  if (!searchResult || searchResult.length === 0) {
    console.log("No results found");
    songsList.innerHTML = `<div class="no-results">No results found</div>`;
    return;
  }

  console.log(songsList);

  // Clear previous results
  songsList.innerHTML = "";

  songsList.innerHTML = result
    .map((item) => {
      if (item.type === "track") return trackHTML(item);
      if (item.type === "album") return albumHTML(item);
    })
    .join("");

  console.log(result);
}

async function search(keyword) {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    console.error("Please authenticate");
    return;
  }
  const encodedQuery = encodeURIComponent(keyword);
  const url = `https://api.spotify.com/v1/search?q=${encodedQuery}&type=album,track`;

  console.log("Request URL:", url);
  console.log("Access Token:", accessToken);

  try {
    const trackResponse = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const albumResponse = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const trackData = await trackResponse.json();
    const albumData = await albumResponse.json();

    const combinedResults = [
      ...trackData.tracks.items.map((item) => ({ ...item, type: "track" })),
      ...albumData.albums.items.map((item) => ({ ...item, type: "album" })),
    ];

    const groupedResults = groupByArtistOrAlbum(combinedResults);

    resetFilter();

    return combinedResults;
  } catch (e) {
    console.error("Reconnect to Spotify", e);
    alert("Lost connection to Spotify. Reconnect from the home page");
  }
}

function groupByArtistOrAlbum(results) {
  const grouped = results.reduce((acc, item) => {
    const groupKey = item.type === "track" ? item.artists[0].name : item.name;
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(item);
    return acc;
  }, {});

  return Object.values(grouped).flat();
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

async function updateDisplayedResults() {
  let filteredResults = await searchResult;

  filteredResults = applyDateFilter(filteredResults);
  filteredResults = await trackAlbumFilter(currentFilter, filteredResults);
  filteredResults = await sortFilters(currentSort, filteredResults);

  renderSearch(keyword, filteredResults);

  currentResult = filteredResults;
}

async function trackAlbumFilter(currentFilter, results) {
  let allResults = await results;

  console.log(results);

  console.log(allResults);

  console.log(currentFilter);

  let filteredResults;
  if (currentFilter === "ALL") {
    filteredResults = await currentResult;
  }
  if (currentFilter === "TRACKS") {
    filteredResults = allResults.filter((item) => item.type === "track");
  }
  if (currentFilter === "ALBUMS") {
    filteredResults = allResults.filter((item) => item.type === "album");
  }

  console.log(filteredResults);

  return filteredResults;
}

async function sortFilters(currentSort, results) {
  let filteredResults = await results;

  console.log(filteredResults);

  if (currentSort === "POPULARITY") {
    filteredResults.sort((a, b) => b.popularity - a.popularity);
  }
  if (currentSort === "DURATION") {
    filteredResults.sort(
      (a, b) =>
        (b.duration_ms || b.total_tracks) - (a.duration_ms || a.total_tracks)
    );
  }
  if (currentSort === "RECENT") {
    filteredResults.sort((a, b) => {
      if (a.type === "album" && b.type === "album") {
        const dateA = new Date(a.release_date);
        const dateB = new Date(b.release_date);
        return dateB - dateA;
      }
      if (a.type === "track" && b.type === "track") {
        const dateA = new Date(a.album.release_date);
        const dateB = new Date(b.album.release_date);
        return dateB - dateA;
      }
    });
  }
  // if (currentSort === "EXPLICIT_TRUE") {
  //   const filterPromises = filteredResults.map((item) => {
  //     if (item.type === "track") {
  //       return Promise.resolve(item.explicit); // Tracks are checked synchronously
  //     } else {
  //       return isAlbumExplicit(item); // Albums are checked asynchronously
  //     }
  //   });

  //   // Resolve all promises and filter results
  //   filteredResults = await Promise.all(filterPromises).then((results) =>
  //     filteredResults.filter((_, index) => results[index] === true)
  //   );
  // }
  // if (currentSort === "EXPLICIT_FALSE") {
  //   const filterPromises = filteredResults.map((item) => {
  //     if (item.type === "track") {
  //       return Promise.resolve(!item.explicit); // Tracks are checked synchronously
  //     } else {
  //       return isAlbumExplicit(item).then((explicit) => !explicit); // Albums are checked asynchronously
  //     }
  //   });

  //   // Resolve all promises and filter results
  //   filteredResults = await Promise.all(filterPromises).then((results) =>
  //     filteredResults.filter((_, index) => results[index] == true)
  //   );
  // }

  console.log(filteredResults);

  return filteredResults;
}

async function applyDateFilter(data) {
  const startDate = fromDatePicker.value
    ? new Date(
        fromDatePicker.value.slice(0, 4),
        fromDatePicker.value.slice(5, 7) - 1
      )
    : new Date("1700-01");
  const endDate = toDatePicker.value
    ? new Date(
        toDatePicker.value.slice(0, 4),
        toDatePicker.value.slice(5, 7),
        toDatePicker.value.slice(8, 10)
      )
    : new Date();

  console.log(startDate);
  console.log(endDate);

  let filterData = data.filter((item) => {
    if (item.type === "album") {
      const itemDate = new Date(item.release_date);
      return itemDate >= startDate && itemDate <= endDate;
    }
    if (item.type === "track") {
      const itemDate = new Date(item.album.release_date);
      return itemDate >= startDate && itemDate <= endDate;
    }
    return false;
  });

  console.log(filterData);

  renderSearch(keyword, filterData);
  return filterData;
}

async function handleSelectChangeType(event) {
  currentFilter = event.target.value;
  updateDisplayedResults();
}

async function handleSelectChange(event) {
  currentSort = event.target.value;
  updateDisplayedResults();
}

// EVENT LISTENERS

searchButton.addEventListener("click", onSearchChange);
searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    onSearchChange();
  }
});
songsList.addEventListener("click", (event) => {
  const target = event.target.closest(".song-card__img--link");
  if (target) {
    if (target.getAttribute("data-track")) {
      const dataId = target.getAttribute("data-track");
      storeTrackId(dataId);
    }
    if (target.getAttribute("data-album")) {
      const dataId = target.getAttribute("data-album");
      storeAlbumId(dataId);
    }
  }
});

fromDatePicker.addEventListener("change", updateDisplayedResults);
toDatePicker.addEventListener("change", updateDisplayedResults);

filterType.addEventListener("change", (event) => {
  currentFilter = event.target.value;
  updateDisplayedResults();
});
filter.addEventListener("change", (event) => {
  currentSort = event.target.value;
  updateDisplayedResults();
});
