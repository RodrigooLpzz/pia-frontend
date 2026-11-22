from fastapi import FastAPI, Depends
import httpx
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db, engine, Base
from contextlib import asynccontextmanager
import models

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(lifespan=lifespan)

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.get("/health/db")
async def health_db_check(session: AsyncSession = Depends(get_db)):
    await session.execute(text("SELECT 1"))
    return {"db": "connected"}


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

    