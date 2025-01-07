const searchButton = document.querySelector(".search__btn");
const searchInput = document.querySelector(".search__input");
const popup = document.querySelector(".popup");

function main() {
  searchButton.addEventListener("click", saveKeyword);
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      saveKeyword();
    }
  });
}

main();

function saveKeyword() {
  const keyword = searchInput.value.trim();
  if (!searchInput.checkValidity()) {
    popup.style.display = "block";
    searchInput.classList.add("error");
  } else {
    popup.style.display = "none";
    searchInput.classList.remove("error");
    localStorage.setItem("keyword", keyword);
    window.location.href = `${window.location.origin}/Spotify-search/src/songs.html`;
  }
}
