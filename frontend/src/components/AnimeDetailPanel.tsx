import type { AnimeDetail } from "../types";

interface AnimeDetailPanelProps { anime: AnimeDetail; onClose: () => void; onAddWatchlist: () => void; isSaved: boolean}

export default function AnimeDetailPanel({ anime, onClose, onAddWatchlist, isSaved}: AnimeDetailPanelProps) { 
  return (
    <div>
      <h2>{anime.canonicalTitle}</h2>
      {anime.posterImage && <img src={anime.posterImage} alt={anime.canonicalTitle ?? ""} />}
      <p>{anime.synopsis}</p>
      <p>{anime.episodeCount}</p>
      <p>{anime.showType}</p>
      {isSaved ? <span>✓ In My Collection</span> : <button onClick={onAddWatchlist}>Watch later</button>}
      <button onClick={onClose}>Close</button>
    </div>
  )
}