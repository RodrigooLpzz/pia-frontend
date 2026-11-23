export interface Anime {
  id: string;
  canonicalTitle: string | null;
  averageRating: string | null;
  posterImage: string | null;
}


export interface AnimeDetail extends Anime {
  synopsis: string | null;
  episodeCount: number | null;
  showType: string | null;
}

export interface WatchlistItem {
  kitsu_id: number;
  title: string;
  image_url: string;
  status: "watch_later" | "completed";
  rating: number;
  review: string;
}