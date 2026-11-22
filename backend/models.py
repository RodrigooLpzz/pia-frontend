from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(unique=True)
    password_hash: Mapped[str]

class Anime(Base):
    __tablename__ = "anime"

    kitsu_id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str | None] 
    image_url: Mapped[str | None]

class UserAnime(Base):
    __tablename__ = "user_anime"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    anime_kitsu_id: Mapped[int] = mapped_column(ForeignKey("anime.kitsu_id"))
    status: Mapped[str]
    rating: Mapped[int | None]
    review: Mapped[str | None]

    __table_args__ = (UniqueConstraint("user_id", "anime_kitsu_id"),)



