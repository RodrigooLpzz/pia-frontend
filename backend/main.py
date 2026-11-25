from fastapi import FastAPI, Depends, HTTPException
import httpx
from sqlalchemy import text, select
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db, engine, Base, AsyncSessionLocal
from contextlib import asynccontextmanager
from models import User, UserAnime, Anime
from schemas import UserAnimeCreate, UserAnimeUpdate
from typing import Literal
from fastapi.middleware.cors import CORSMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        user = await session.get(User, 1)
        if user is None:
            user = User(id=1, username="nakama_tester", password_hash="dev")
            session.add(user)
            await session.commit()
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(CORSMiddleware, allow_origins=
                   ["http://localhost:5173"], allow_methods=["*"], allow_headers=["*"])

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.get("/health/db")
async def health_db_check(session: AsyncSession = Depends(get_db)):
    await session.execute(text("SELECT 1"))
    return {"db": "connected"}

def format_anime_data(data) -> list[dict]:
    cleaned = []
    for anime in data:
        anime_id = anime.get("id") 
        attrs = anime.get("attributes") or {} 

        title = attrs.get("canonicalTitle")
        rating = attrs.get("averageRating")
        poster = (attrs.get("posterImage") or {}).get("medium")

        cleaned.append({"id": anime_id, "canonicalTitle": title, "averageRating": rating, "posterImage": poster})
        
    return cleaned

@app.get("/anime/search")
async def get_anime(q: str):
    async with httpx.AsyncClient() as client:
        response = await client.get("https://kitsu.io/api/edge/anime", params={"filter[text]": q, "page[limit]": 5})
        data = response.json()["data"]

        return format_anime_data(data)

        

@app.get("/anime/top")
async def get_top_animes():
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://kitsu.io/api/edge/anime",
            params={"sort": "popularityRank", "page[limit]": 20},
        )
        data = response.json()["data"]
        
        return format_anime_data(data)
                

@app.get("/anime/upcoming")
async def get_upcoming_animes():
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://kitsu.io/api/edge/anime",
            params={
                "filter[status]": "upcoming",
                "sort": "-userCount",
                "page[limit]": 12,
            },
        )
        data = response.json()["data"]

        return format_anime_data(data)


@app.get("/anime/{kitsu_id}")
async def get_anime_information(kitsu_id: int):
    async with httpx.AsyncClient() as client:
            response = await client.get(f"https://kitsu.io/api/edge/anime/{kitsu_id}")
            if response.status_code != 200: 
                raise HTTPException(status_code=404, detail= "Not found")
            
            data = response.json()["data"]

            anime_id = data.get("id") 
            attrs = data.get("attributes") or {} 
            
            synopsis = attrs.get("synopsis")
            title = attrs.get("canonicalTitle")
            rating = attrs.get("averageRating")
            episode_count = attrs.get("episodeCount")
            show_type = attrs.get("showType")
            poster = (attrs.get("posterImage") or {}).get("medium")

            return {"id": anime_id, "canonicalTitle": title, "averageRating": rating, "posterImage": poster,
                    "synopsis": synopsis, "episodeCount": episode_count, "showType": show_type}

@app.post("/watchlist")
async def save_anime_watchlist(anime_data: UserAnimeCreate, session: AsyncSession = Depends(get_db)):
    anime = await session.get(Anime, anime_data.kitsu_id)

    if anime is None:
        new_anime = Anime(kitsu_id= anime_data.kitsu_id, title= anime_data.title, image_url= anime_data.image_url)
        session.add(new_anime)
        await session.flush()


    statement = select(UserAnime).where(
        UserAnime.anime_kitsu_id == anime_data.kitsu_id,
        UserAnime.user_id == 1
    )

    result = await session.execute(statement)
    existing = result.scalar_one_or_none()

    if existing:
        raise HTTPException(status_code=409, detail="Already in watchlist")

    user_anime = UserAnime(user_id=1, anime_kitsu_id=anime_data.kitsu_id, status=anime_data.status, 
                           rating=anime_data.rating, review=anime_data.review,)

    session.add(user_anime) 
    await session.commit() 

    return {"message": "Saved to watchlist"}

@app.get("/watchlist")
async def read_watchlist(session: AsyncSession = Depends(get_db), status: Literal["watch_later", "completed"] | None = None):
    statement = (
        select(UserAnime, Anime)
        .join(Anime, UserAnime.anime_kitsu_id == Anime.kitsu_id)
        .where(UserAnime.user_id == 1)
    )

    if status is not None:
        statement = statement.where(UserAnime.status == status)

    result = await session.execute(statement)
    rows = result.all()

    clean = []
    for user_anime, anime in rows:
        clean.append({"kitsu_id": anime.kitsu_id, "title": anime.title, "image_url": anime.image_url,
                      "status": user_anime.status, "rating": user_anime.rating, "review": user_anime.review})

    return clean


@app.patch("/watchlist/{kitsu_id}")
async def update_watchlist(kitsu_id: int, update_data: UserAnimeUpdate, session: AsyncSession = Depends(get_db)):
    statement = select(UserAnime).where(
        UserAnime.anime_kitsu_id == kitsu_id,
        UserAnime.user_id == 1
    )

    result = await session.execute(statement)
    existing = result.scalar_one_or_none()

    if existing is None:
        raise HTTPException(status_code=404, detail="Anime not in watchlist")


    if update_data.status is not None:
        existing.status = update_data.status

    if update_data.rating is not None:
        existing.rating = update_data.rating

    if update_data.review is not None:
        existing.review = update_data.review
    
    await session.commit()

    return {"message": "Watchlist updated"}


@app.delete("/watchlist/{kitsu_id}")
async def delete_anime_watchlist(kitsu_id: int, session: AsyncSession = Depends(get_db)):
    statement = select(UserAnime).where(
            UserAnime.anime_kitsu_id == kitsu_id,
            UserAnime.user_id == 1
        )
    
    result = await session.execute(statement)
    existing = result.scalar_one_or_none()

    if existing is None:
        raise HTTPException(status_code=404, detail="Anime not in watchlist")

    await session.delete(existing)

    await session.commit()

    return {"message": "Anime on watchlist deleted"}


