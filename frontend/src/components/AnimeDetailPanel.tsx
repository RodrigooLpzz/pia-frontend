import type { AnimeDetail } from "../types";

interface AnimeDetailPanelProps { anime: AnimeDetail; onClose: () => void; }

export default function AnimeDetailPanel({ anime, onClose }: AnimeDetailPanelProps) { 
  return (
    <div>
      <h2>{anime.canonicalTitle}</h2>
      {anime.posterImage && <img src={anime.posterImage} alt={anime.canonicalTitle ?? ""} />}
      <p>{anime.synopsis}</p>
      <p>{anime.episodeCount}</p>
      <p>{anime.showType}</p>
      <button onClick={onClose}>Close</button>
    </div>
  )
}