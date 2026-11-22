from fastapi import FastAPI
import httpx

app = FastAPI()

@app.get("/health")
async def health_check():
    return {"status": "ok"}


@app.get("/anime/search")
async def get_anime(q: str):
    async with httpx.AsyncClient() as client:
        response = await client.get("https://kitsu.io/api/edge/anime", params={"filter[text]": q, "page[limit]": 5})
        data = response.json()["data"]

        cleaned = []
        for anime in data:
            anime_id = anime.get("id") 
            attrs = anime.get("attributes") or {} 

            title = attrs.get("canonicalTitle")
            rating = attrs.get("averageRating")
            poster = (attrs.get("posterImage") or {}).get("medium")

            cleaned.append({"id": anime_id, "canonicalTitle": title, "averageRating": rating, "posterImage": poster})
        
        return cleaned

    