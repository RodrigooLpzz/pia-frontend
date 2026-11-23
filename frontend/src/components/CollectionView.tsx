import { useState, type SyntheticEvent } from "react";
import type { WatchlistItem } from "../types";

interface CollectionViewProps {
  watchlist: WatchlistItem[];
  onDelete: (kitsuId: number) => void;
  onUpdate: (
    kitsuId: number,
    updates: {
      status: "watch_later" | "completed";
      rating: number | null;
      review: string | null;
    }
  ) => void;
}

export default function CollectionView({
  watchlist,
  onDelete,
  onUpdate,
}: CollectionViewProps) {
  const [filter, setFilter] = useState<"all" | "watch_later" | "completed">("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [status, setStatus] = useState<"watch_later" | "completed">("completed");
  const [rating, setRating] = useState("");
  const [review, setReview] = useState("");

  const filtered =
    filter === "all"
      ? watchlist
      : watchlist.filter((item) => item.status === filter);

  function startEditing(item: WatchlistItem) {
    setEditingId(item.kitsu_id);
    setStatus(item.status);
    setRating(item.rating !== null ? String(item.rating) : "");
    setReview(item.review ?? "");
  }

  function handleSave(e: SyntheticEvent, kitsuId: number) {
    e.preventDefault();
    onUpdate(kitsuId, {
      status,
      rating: rating.trim() === "" ? null : Number(rating),
      review: review.trim() === "" ? null : review.trim(),
    });
    setEditingId(null);
  }

  if (watchlist.length === 0) {
    return (
      <p className="empty-state">
        Your collection is empty. Browse the Catalog to add anime!
      </p>
    );
  }

  return (
    <div>
      <div className="toolbar">
        <div className="filter-pills">
          <button
            className={`pill-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All ({watchlist.length})
          </button>
          <button
            className={`pill-btn ${filter === "watch_later" ? "active" : ""}`}
            onClick={() => setFilter("watch_later")}
          >
            Watch Later ({watchlist.filter((i) => i.status === "watch_later").length})
          </button>
          <button
            className={`pill-btn ${filter === "completed" ? "active" : ""}`}
            onClick={() => setFilter("completed")}
          >
            Seen ({watchlist.filter((i) => i.status === "completed").length})
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="empty-state">No anime in this section yet.</p>
      ) : (
        <section className="card-grid" aria-label="My anime collection">
          {filtered.map((watchlist_anime) => (
        <article className="anime-card" key={watchlist_anime.kitsu_id}>
          <div className="card-image-wrap">
            {watchlist_anime.image_url && (
              <img
                src={watchlist_anime.image_url}
                alt={watchlist_anime.title ?? ""}
              />
            )}
            <span className="card-badge">
              {watchlist_anime.status === "completed" ? "COMPLETED" : "WATCH LATER"}
            </span>
          </div>

          <div className="card-body">
            <h3 className="card-title">{watchlist_anime.title}</h3>

            {editingId === watchlist_anime.kitsu_id ? (
              <form
                className="edit-form"
                onSubmit={(e) => handleSave(e, watchlist_anime.kitsu_id)}
              >
                <label>
                  Status
                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as "watch_later" | "completed")
                    }
                    required
                  >
                    <option value="watch_later">Watch Later</option>
                    <option value="completed">Completed</option>
                  </select>
                </label>

                <label>
                  Rating (1–10)
                  <input
                    type="number"
                    min={1}
                    max={10}
                    step={1}
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    placeholder="1-10"
                  />
                </label>

                <label>
                  Review
                  <textarea
                    rows={2}
                    maxLength={500}
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Write a review..."
                  />
                </label>

                <div className="card-actions">
                  <button className="primary-btn small" type="submit">
                    Save
                  </button>
                  <button
                    className="ghost-btn small"
                    type="button"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="card-meta">
                  {watchlist_anime.rating !== null ? (
                    <span>Rating: {watchlist_anime.rating}/10</span>
                  ) : (
                    <span className="muted">Not rated yet</span>
                  )}
                </div>
                {watchlist_anime.review && (
                  <p className="card-review">"{watchlist_anime.review}"</p>
                )}
                <div className="card-actions">
                  <button
                    className="ghost-btn small"
                    onClick={() => startEditing(watchlist_anime)}
                  >
                    Rate / Edit
                  </button>
                  <button
                    className="danger-btn small"
                    onClick={() => onDelete(watchlist_anime.kitsu_id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        </article>
      ))}
        </section>
      )}
    </div>
  );
}
