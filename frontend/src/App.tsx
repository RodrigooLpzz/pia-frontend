import { useEffect, useState } from "react";
import { type AnimeDetail, type Anime, type WatchlistItem } from "./types"
import type { SyntheticEvent } from "react";
import AnimeDetailPanel from "./components/AnimeDetailPanel";
import CollectionView from "./components/CollectionView";

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
      {selectedAnime && <AnimeDetailPanel anime={selectedAnime} onClose={() => setSelectedAnime(null)} onAddWatchlist={() => handleAddToWatchlist(selectedAnime)} isSaved={isSaved}/>}
      
    </div>
    )}
    {activeTab === "collection" && <CollectionView watchlist={watchlist} onDelete={handleDeleteWatchlist} onUpdate={handleUpdateWatchlist} /> }
    </>
  );

}