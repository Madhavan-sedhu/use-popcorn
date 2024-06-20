import "./App.css";
import { useEffect, useState } from "react";
import StarBox from "./starRating";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const key = "d5052b61";

function App() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState();
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  function handleSelectButton(id) {
    setSelectedId((selectedId) => (id === selectedId ? null : id));
  }

  function handleCloseButton() {
    setSelectedId(null);
  }

  function handAddButton(movie) {
    setWatched((watched) => [...watched, movie]);
  }

  function deleteWatchedMovie(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError("");
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${key}&s=${query}`
        );
        if (!res.ok)
          throw new Error("Something went wrong with fetching movies ");

        const data = await res.json();

        if (data.Response === "False") throw new Error("Movie not found");

        setMovies(data.Search);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    if (query.length <= 3) {
      setMovies([]);
      setError("");
      return;
    }
    fetchData();
  }, [query]);

  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResult movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {isLoading && <Loading />}
          {!isLoading && !error && (
            <ListBox movies={movies} onSelect={handleSelectButton} />
          )}
          {error && <ErrorMsg error={error} />}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetaile
              onClose={handleCloseButton}
              selectedId={selectedId}
              onAddMovie={handAddButton}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <MovieWatched watched={watched} onDelete={deleteWatchedMovie} />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function Loading() {
  return <p className="loader">Loading...</p>;
}

function ErrorMsg({ error }) {
  return (
    <p className="error">
      <span>⛔</span>
      {error}
    </p>
  );
}

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />

      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function NumResult({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function ListBox({ movies, onSelect }) {
  return (
    <ul className="list">
      {movies?.map((movie) => (
        <List movie={movie} key={movie.imdbID} onSelect={onSelect} />
      ))}
    </ul>
  );
}

function List({ movie, onSelect }) {
  return (
    <li onClick={() => onSelect(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function MovieDetaile({ onClose, selectedId, onAddMovie, watched }) {
  const [movie, setMovie] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");
  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    Plot: polt,
    Released: realeased,
    Actors: actors,
    Director: director,
    Genre: genre,
    imdbRating,
  } = movie;

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;

  function handleAdd() {
    const newMovieList = {
      title,
      poster,
      runtime: Number(runtime.split(" ").at(0)),
      imdbID: selectedId,
      imdbRating: Number(imdbRating),
      userRating,
    };
    onAddMovie(newMovieList);
    onClose();
  }

  useEffect(() => {
    async function fetchDetails() {
      setIsLoading(true);
      const res = await fetch(
        `http://www.omdbapi.com/?apikey=${key}&i=${selectedId}`
      );
      const data = await res.json();
      setMovie(data);
      setIsLoading(false);
    }
    fetchDetails();
  }, [selectedId]);

  useEffect(
    function () {
      if (!title) return;

      document.title = `Movie | ${title}`;
      return function () {
        document.title = "UsePopCorn";
      };
    },
    [title]
  );
  return (
    <div className="details">
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onClose}>
              &larr;
            </button>
            <img src={poster} alt={`The poster of ${title}`}></img>
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {realeased} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} IMBD rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarBox maxStar={10} size={24} onSetRating={setUserRating} />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      Add to list
                    </button>
                  )}
                </>
              ) : (
                <div>
                  <p>You already rated this movie {watchedUserRating}⭐</p>
                </div>
              )}
            </div>

            <p>
              <em>{polt}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function MovieWatched({ watched, onDelete }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedList movie={movie} key={movie.imdbID} onDelete={onDelete} />
      ))}
    </ul>
  );
}

function WatchedList({ movie, onDelete }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button className="btn-delete" onClick={() => onDelete(movie.imdbID)}>
          ❌
        </button>
      </div>
    </li>
  );
}

export default App;
