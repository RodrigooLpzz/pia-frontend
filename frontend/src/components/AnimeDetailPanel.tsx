import type { AnimeDetail } from "../types";

interface AnimeDetailPanelProps {
  anime: AnimeDetail;
  onClose: () => void;
  onAddWatchlist: () => void;
  isSaved: boolean;
}

export default function AnimeDetailPanel({
  anime,
  onClose,
  onAddWatchlist,
  isSaved,
}: AnimeDetailPanelProps) {
  return (
    <aside className="detail-panel" aria-label="Anime details">
      <div className="detail-hero">
        {anime.posterImage && (
          <img
            className="detail-cover"
            src={anime.posterImage}
            alt={anime.canonicalTitle ?? ""}
          />
        )}
        <button
          className="close-btn"
          onClick={onClose}
          aria-label="Close detail panel"
        >
          X
        </button>
      </div>

      <div className="detail-body">
        <div className="badge-row">
          {anime.showType && <span className="badge">{anime.showType}</span>}
          {anime.episodeCount !== null && (
            <span className="badge">{anime.episodeCount} episodes</span>
          )}
        </div>

        <h2 className="detail-title">{anime.canonicalTitle}</h2>

        {anime.averageRating && (
          <div className="detail-score">
            <strong>{anime.averageRating}</strong>
            <span className="muted">/ 100 community score</span>
          </div>
        )}

        <p className="detail-synopsis">
          {anime.synopsis ?? "No synopsis available."}
        </p>

        <div className="detail-actions">
          {isSaved ? (
            <span className="saved-pill">In My Collection</span>
          ) : (
            <button className="primary-btn" onClick={onAddWatchlist}>
              + Watch Later
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}