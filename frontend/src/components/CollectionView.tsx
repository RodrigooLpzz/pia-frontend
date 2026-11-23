import { useState } from "react";
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
  const [editingId, setEditingId] = useState<number | null>(null);
  const [status, setStatus] = useState<"watch_later" | "completed">("completed");
  const [rating, setRating] = useState("");
  const [review, setReview] = useState("");

  function startEditing(item: WatchlistItem) {
    setEditingId(item.kitsu_id);
    setStatus(item.status);
    setRating(item.rating !== null ? String(item.rating) : "");
    setReview(item.review ?? "");
  }

  function handleSave(kitsuId: number) {
    onUpdate(kitsuId, {
      status,
      rating: rating.trim() === "" ? null : Number(rating),
      review: review.trim() === "" ? null : review.trim(),
    });
    setEditingId(null);
  }

  return (
    <div>
      {watchlist.map((watchlist_anime) => (
        <div key={watchlist_anime.kitsu_id}>
          <h3>{watchlist_anime.title}</h3>
          {watchlist_anime.image_url && (
            <img
              src={watchlist_anime.image_url}
              alt={watchlist_anime.title ?? ""}
            />
          )}

          {editingId === watchlist_anime.kitsu_id ? (
            <div>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as "watch_later" | "completed")
                }
              >
                <option value="watch_later">Watch Later</option>
                <option value="completed">Completed</option>
              </select>

              <input
                type="number"
                min={1}
                max={10}
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                placeholder="Rating (1-10)"
              />

              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Write a review..."
              />

              <button onClick={() => handleSave(watchlist_anime.kitsu_id)}>
                Save
              </button>
              <button onClick={() => setEditingId(null)}>Cancel</button>
            </div>
          ) : (
            <div>
              <p>{watchlist_anime.status}</p>
              <p>{watchlist_anime.rating}</p>
              <p>{watchlist_anime.review}</p>
              <button onClick={() => startEditing(watchlist_anime)}>
                Rate / Edit
              </button>
              <button onClick={() => onDelete(watchlist_anime.kitsu_id)}>
                Remove
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
