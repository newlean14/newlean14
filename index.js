const BASE_URL = "https://webdev.alphacamp.io";
const API_URL = `${BASE_URL}/api/movies`;
const POSTER_URL = `${BASE_URL}/posters`;
const MOVIES_PER_PAGE = 12;
const movies = [];
const icons = document.querySelector(".icons");
const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#serach-input");
const paginator = document.querySelector("#paginator");
const DisplayMode = {
  Block: "Block",
  List: "List",
};
let currentMovies = [];
let currentPage = 1;
let displayMode = DisplayMode.Block;

function getMoviesByPage(movies, page) {
  const start = MOVIES_PER_PAGE * (page - 1);
  return movies.slice(start, start + MOVIES_PER_PAGE);
}

function renderMovies(movies) {
  dataPanel.innerHTML = "";
  let parent;
  if (displayMode === DisplayMode.Block) {
    parent = dataPanel;
  } else {
    parent = document.createElement("ul");
    parent.classList.add("list-group", "col-sm-12", "mb-2");
    dataPanel.appendChild(parent);
  }
  movies.forEach((movie) => {
    renderMovie(parent, movie);
  });
}

function renderMovie(parent, data) {
  let src = `${POSTER_URL}/${data.image}`;
  let child;
  if (displayMode === DisplayMode.Block) {
    child = document.createElement("div");
    child.classList.add("col-sm-3");
    child.innerHTML = `<div class="mb-2">
      <div class="card">
        <img src="${src}" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
          <h5 class="card-title">${data.title}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${data.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${data.id}">+</button>
        </div>
      </div>
    </div>`;
  } else {
    child = document.createElement("li");
    child.classList.add("list-group-item", "d-flex", "justify-content-between");
    child.innerHTML = `<h5 class="card-title">${data.title}</h5>
                    <div>
                        <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${data.id}">More</button>
                        <button class="btn btn-info btn-add-favorite" data-id="${data.id}">+</button>
                    </div>`;
  }
  parent.appendChild(child);
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

function addToFavorite(id) {
  const favorites = JSON.parse(localStorage.getItem("favorite-movies")) ?? [];
  const movie = movies.find((m) => m.id === id);
  if (favorites.some((m) => m.id === id)) {
    alert(`電影 '${movie.title}' 已收藏`);
  } else {
    favorites.push(movie);
    localStorage.setItem("favorite-movies", JSON.stringify(favorites));
  }
}

function setPaginator(amount) {
  let len = Math.ceil(amount / MOVIES_PER_PAGE);
  let pages = "";
  for (let i = 1; i <= len; i++) {
    pages += `<li class="page-item"><a class="page-link" href="#">${i}</a></li>`;
  }
  paginator.innerHTML = pages;
}

function init() {
  // 監聽 data panel
  dataPanel.addEventListener("click", function onPanelClicked(event) {
    if (event.target.matches(".btn-show-movie")) {
      showMovieModal((id = Number(event.target.dataset.id)));
    } else if (event.target.matches(".btn-add-favorite")) {
      addToFavorite(Number(event.target.dataset.id));
    }
  });

  searchForm.addEventListener("submit", function onSearch(event) {
    // 避免表單提交後的預設行為(重整頁面)
    event.preventDefault();
    let input = searchInput.value.trim().toLowerCase();
    currentMovies = movies.filter((movie) => {
      return movie.title.toLowerCase().includes(input);
    });

    currentMovies = currentMovies.length === 0 ? movies : currentMovies;
    setPaginator(currentMovies.length);
    currentPage = 1;
    renderMovies(getMoviesByPage(currentMovies, currentPage));
  });

  paginator.addEventListener("click", function onPageSelected(event) {
    event.preventDefault();
    let target = event.target;

    if (target.matches(".page-item")) {
      let a = target.children[0];
      currentPage = Number(a.innerHTML);
      renderMovies(getMoviesByPage(currentMovies, currentPage));
    } else if (target.matches(".page-link")) {
      currentPage = Number(target.innerHTML);
      renderMovies(getMoviesByPage(currentMovies, currentPage));
    }
  });

  icons.addEventListener("click", function onIconClicked(event) {
    let target = event.target;
    let needRender = false;
    if (target.matches(".fa-bars") && displayMode !== DisplayMode.List) {
      needRender = true;
      displayMode = DisplayMode.List;
    } else if (target.matches(".fa-th") && displayMode !== DisplayMode.Block) {
      needRender = true;
      displayMode = DisplayMode.Block;
    }
    if (needRender) {
      renderMovies(getMoviesByPage(currentMovies, currentPage));
    }
  });

  axios
    .get(API_URL)
    .then((response) => {
      let results = response.data.results;
      movies.push(...results);
      currentMovies = movies;
      setPaginator(movies.length);
      currentPage = 1;
      renderMovies(getMoviesByPage(movies, currentPage));
    })
    .catch((error) => {
      console.log(error);
    });
}

init();
