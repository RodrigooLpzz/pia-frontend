import { useEffect, useState } from "react";
import { type AnimeDetail, type Anime, type WatchlistItem } from "./types"
import type { SyntheticEvent } from "react";
import AnimeDetailPanel from "./components/AnimeDetailPanel";

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



  return (
    <>
    <header>
      <button onClick={() => setActiveTab("catalog")}>Catalog</button>
      <button onClick={() => setActiveTab("collection")}>My Collection</button>
    </header>
    {activeTab === "catalog" && (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
        />
        <button type="submit">Search</button>
      </form>

      {animes.map((anime) => (
            <div key={anime.id} onClick={() => handleSelectAnime(anime.id)}>
              <h3>{anime.canonicalTitle}</h3>
              {anime.posterImage && <img src={anime.posterImage} alt={anime.canonicalTitle ?? ""} />}
            </div>
        ))
      }

      {selectedAnime && <AnimeDetailPanel anime={selectedAnime} onClose={() => setSelectedAnime(null)} />}
      
    </div>
    )}
    {activeTab === "collection" && (
      watchlist.map((watchlist_anime) => (
          <div>
              <h3>{watchlist_anime.title}</h3>
              {watchlist_anime.image_url && <img src={watchlist_anime.image_url} alt={watchlist_anime.title ?? ""} />}
              <p>{watchlist_anime.status}</p>
              <p>{watchlist_anime.rating}</p>
              <p>{watchlist_anime.review}</p>
          </div>
      ))
    )}
    </>
  );

}