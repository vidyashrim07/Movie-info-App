const apiKey = "71554961d79d0b40f199a59c373862cc";
const imgApi = "https://image.tmdb.org/t/p/w1280";
const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=`;
const form = document.getElementById("search-form");
const query = document.getElementById("search-input");
const result = document.getElementById("result");

let page = 1;
let isSearching = false;

// Fetch JSON data from url
async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Network response was not ok.");
        }
        return await response.json();
    } catch (error) {
        return null;
    }
}

// Fetch and show results based on url
async function fetchAndShowResult(url) {
    const data = await fetchData(url);
    if (data && data.results) {
        showResults(data.results);
    }
}

// Create movie card html template
function createMovieCard(movie) {
    const { poster_path, original_title, release_date, overview, id } = movie;
    const imagePath = poster_path ? imgApi + poster_path : "./img-01.jpeg";
    const truncatedTitle =
        original_title.length > 15 ? original_title.slice(0, 15) + "..." : original_title;
    const formattedDate = release_date || "No release date";
    const cardTemplate = `
        <div class="column">
            <div class="card">
                <a class="card-media" href="./img-01.jpeg">
                    <img src="${imagePath}" alt="${original_title}" width="100%" />
                </a>
                <div class="card-content">
                    <div class="card-header">
                        <div class="left-content">
                            <h3 style="font-weight: 600">${truncatedTitle}</h3>
                            <span style="color: #12efec">${formattedDate}</span>
                        </div>
                        <div class="right-content">
                            <a href="#" class="card-btn see-trailer" data-movie-id="${id}">See Trailer</a>
                        </div>
                    </div>
                    <div class="info">
                        ${overview || "No overview yet..."}
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
    return cardTemplate;
}

// Clear result element for search
function clearResults() {
    result.innerHTML = "";
}

// Show results in page
function showResults(item) {
    const newContent = item.map(createMovieCard).join("");
    result.innerHTML += newContent || "<p>No results found.</p>";
}

// Load more results
async function loadMoreResults() {
    if (isSearching) {
        return;
    }
    page++;
    const searchTerm = query.value;
    const url = searchTerm
        ? `${searchUrl}${searchTerm}&page=${page}`
        : `https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=${apiKey}&page=${page}`;
    await fetchAndShowResult(url);
}

// Detect end of page and load more results
function detectEnd() {
    const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 20) {
        loadMoreResults();
    }
}

// Event listener for "See Trailer" buttons
result.addEventListener('click', function (e) {
    if (e.target.classList.contains('see-trailer')) {
        e.preventDefault();
        const movieId = e.target.getAttribute('data-movie-id');
        openMovieTrailer(movieId);
    }
});

// Function to open the movie trailer
async function openMovieTrailer(movieId) {
    const trailerUrl = await getMovieTrailerUrl(movieId);
    if (trailerUrl) {
        // Open the trailer URL in a new tab
        window.open(trailerUrl, '_blank');
    } else {
        alert('Trailer not available for this movie.');
    }
}

// Function to fetch the movie trailer URL from TMDB API (You can customize this part)
async function getMovieTrailerUrl(movieId) {
    const tmdbTrailerApiUrl = `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${apiKey}&language=en-US`;

    try {
        const response = await fetch(tmdbTrailerApiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
        const data = await response.json();
        const trailer = data.results.find((video) => video.type === 'Trailer');
        if (trailer) {
            return `https://www.youtube.com/watch?v=${trailer.key}`;
        }
    } catch (error) {
        console.error('Error fetching trailer URL:', error);
    }

    return null;
}

// Handle search
async function handleSearch(e) {
    e.preventDefault();
    const searchTerm = query.value.trim();
    if (searchTerm) {
        isSearching = true;
        clearResults();
        const newUrl = `${searchUrl}${searchTerm}&page=${page}`;
        await fetchAndShowResult(newUrl);
        query.value = "";
    }
}

// Event listeners
form.addEventListener('submit', handleSearch);
window.addEventListener('scroll', detectEnd);
window.addEventListener('resize', detectEnd);

// Initialize the page
async function init() {
    clearResults();
    const url = `https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=${apiKey}&page=${page}`;
    isSearching = false;
    await fetchAndShowResult(url);
}

init();
