const BASE_URL = "https://webdev.alphacamp.io";
const API_URL = `${BASE_URL}/api/movies`;
const POSTER_URL = `${BASE_URL}/posters`;
const MOVIES_PER_PAGE = 12;
const movies = JSON.parse(localStorage.getItem("favorite-movies")) ?? [];
const dataPanel = document.querySelector("#data-panel");

function renderMovie(data) {
  let src = `${POSTER_URL}/${data.image}`;
  let div = document.createElement("div");
  div.classList.add("col-sm-3");
  div.innerHTML = `<div class="mb-2">
      <div class="card">
        <img src="${src}" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
          <h5 class="card-title">${data.title}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${data.id}">More</button>
          <button class="btn btn-danger btn-remove-favorite" data-id="${data.id}">X</button>
        </div>
      </div>
    </div>`;
  dataPanel.appendChild(div);
}

function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");
  axios.get(`${API_URL}/${id}`).then((response) => {
    const data = response.data.results;
    modalTitle.innerText = data.title;
    modalDate.innerText = "Release date: " + data.release_date;
    modalDescription.innerText = data.description;
    modalImage.innerHTML = `<img src="${POSTER_URL}/${data.image}" alt="movie-poster" class="img-fluid">`;
  });
}

function removeFromFavorite(id) {
  let index = movies.findIndex((m) => m.id === id);
  movies.splice(index, 1);
  localStorage.setItem("favorite-movies", JSON.stringify(movies));
  dataPanel.innerHTML = "";
  movies.forEach((movie) => {
    renderMovie(movie);
  });
}

function init() {
  // 監聽 data panel
  dataPanel.addEventListener("click", function onPanelClicked(event) {
    if (event.target.matches(".btn-show-movie")) {
      showMovieModal((id = Number(event.target.dataset.id)));
    } else if (event.target.matches(".btn-remove-favorite")) {
      removeFromFavorite(Number(event.target.dataset.id));
    }
  });

  movies.forEach((movie) => {
    renderMovie(movie);
  });
}

init();
