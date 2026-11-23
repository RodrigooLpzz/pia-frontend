from typing import Literal
from pydantic import BaseModel, Field

class UserAnimeCreate(BaseModel):
    kitsu_id: int
    title: str
    image_url: str | None = None
    status: Literal["watch_later", "completed"] = "watch_later"
    rating: int | None = Field(default=None, ge=1, le=10)
    review: str | None = None

class UserAnimeUpdate(BaseModel):
    status: Literal["watch_later", "completed"] | None = None
    rating: int | None = Field(default=None, ge=1, le=10)
    review: str | None = None