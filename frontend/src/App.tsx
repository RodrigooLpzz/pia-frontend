import { useEffect, useState } from "react";
import { type AnimeDetail, type Anime, type WatchlistItem } from "./types"
import type { SyntheticEvent } from "react";
import AnimeDetailPanel from "./components/AnimeDetailPanel";
import CollectionView from "./components/CollectionView";
import "./App.css";

export default function App() {
  const [animes, setAnimes] = useState<Anime[]>([])
  const [query, setQuery] = useState("")
  const [selectedAnime, setSelectedAnime] = useState<AnimeDetail | null>(null);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [activeTab, setActiveTab] = useState<"catalog" | "collection">("catalog")

  async function loadWatchlist() {
    const res = await fetch(`http://localhost:8000/watchlist`)
    const data = await res.json();
    setWatchlist(data)
  }

  useEffect(() => {
    async function loadTopAnimes() {
      const res = await fetch("http://localhost:8000/anime/top")
      const data = await res.json();
      setAnimes(data)
    }
    async function initWatchlist() {
      loadWatchlist()
    }
    
    loadTopAnimes();
    initWatchlist();

  }, []);

  async function handleSubmit(e: SyntheticEvent) {
    e.preventDefault();
    const res = await fetch(`http://localhost:8000/anime/search?q=${encodeURIComponent(query)}`)
    const data = await res.json()
    setAnimes(data)
  }

  async function handleSelectAnime(id: string) {
    const res = await fetch(`http://localhost:8000/anime/${id}`)
    const data = await res.json();
    setSelectedAnime(data)
  }

  async function handleAddToWatchlist(anime: Anime) {
    const res = await fetch("http://localhost:8000/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kitsu_id: anime.id, title: anime.canonicalTitle ?? "Unknown", image_url: anime.posterImage, status: "watch_later"})
    });


    if (res.ok) {
      await loadWatchlist();
    } else if (res.status === 409) {
      alert("Already saved!");
    }
  }

  const isSaved = selectedAnime ? watchlist.some((item) => item.kitsu_id === Number(selectedAnime.id)) : false;

  async function handleDeleteWatchlist(kitsuId: number) {
    const res = await fetch(`http://localhost:8000/watchlist/${kitsuId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      await loadWatchlist();
    } 
  }

  async function handleUpdateWatchlist(kitsuId: number, updates: { status: "watch_later" | "completed"; rating: number | null; review: string | null }) {
    const res = await fetch(`http://localhost:8000/watchlist/${kitsuId}`, {
      method: "PATCH", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    });

    if (res.ok) {
      await loadWatchlist();
    } 
  }

  return (
    <div className="app-shell">
      <header className="navbar">
        <div className="brand">
          <span className="brand-icon">⛩</span>
          <span>NakamaLog</span>
        </div>

        <nav className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === "catalog" ? "active" : ""}`}
            onClick={() => setActiveTab("catalog")}
          >
            Catalog
          </button>
          <button
            className={`nav-tab ${activeTab === "collection" ? "active" : ""}`}
            onClick={() => setActiveTab("collection")}
          >
            My Collection <span className="count-pill">{watchlist.length}</span>
          </button>
        </nav>
      </header>

      <main className="main-content">
        {activeTab === "catalog" && (
          <>
            <div className="toolbar">
              <form className="search-form" onSubmit={handleSubmit}>
                <input
                  className="search-input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search anime by title..."
                  aria-label="Search anime by title"
                  required
                  minLength={2}
                />
                <button className="primary-btn" type="submit">
                  Search
                </button>
              </form>
              <span className="muted">{animes.length} results</span>
            </div>

            <section
              className={`catalog-layout ${selectedAnime ? "with-detail" : ""}`}
              aria-label="Anime catalog"
            >
              <div className="card-grid">
                {animes.map((anime) => (
                  <article
                    key={anime.id}
                    className={`anime-card clickable ${
                      selectedAnime?.id === anime.id ? "selected" : ""
                    }`}
                    onClick={() => handleSelectAnime(anime.id)}
                  >
                    <div className="card-image-wrap">
                      {anime.posterImage && (
                        <img
                          src={anime.posterImage}
                          alt={anime.canonicalTitle ?? ""}
                        />
                      )}
                    </div>
                    <div className="card-body">
                      <h3 className="card-title">{anime.canonicalTitle}</h3>
                      <div className="card-meta">
                        {anime.averageRating ? (
                          <span>
                            <span className="star">★</span> {anime.averageRating}
                          </span>
                        ) : (
                          <span className="muted">No rating</span>
                        )}
                        <span className="view-link">View ›</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {selectedAnime && (
                <AnimeDetailPanel
                  anime={selectedAnime}
                  onClose={() => setSelectedAnime(null)}
                  onAddWatchlist={() => handleAddToWatchlist(selectedAnime)}
                  isSaved={isSaved}
                />
              )}
            </section>
          </>
        )}

        {activeTab === "collection" && (
          <CollectionView
            watchlist={watchlist}
            onDelete={handleDeleteWatchlist}
            onUpdate={handleUpdateWatchlist}
          />
        )}
      </main>

      <footer className="footer">
        <p>NakamaLog — Anime Watchlist &amp; Ratings</p>
      </footer>
    </div>
  );

}