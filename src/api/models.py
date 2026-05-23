from flask_sqlalchemy import SQLAlchemy # type: ignore
from sqlalchemy import String, Boolean, DateTime, Date, Text, Enum, ForeignKey, JSON, ARRAY, select, func, Integer # type: ignore
from sqlalchemy.orm import Mapped, mapped_column, relationship  # type: ignore
from datetime import datetime, timezone, date
from typing import List, Optional

imgurl = "https://images.unsplash.com/vector-1738312097380-45562da00459?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"

db = SQLAlchemy()

def utcnow(): 
    return datetime.now(timezone.utc)

class User(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(60), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)
    is_admin: Mapped[bool] = mapped_column(Boolean(), default=False, nullable=False)

    # Relaciones
    profile: Mapped["Profile"] = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    surveys: Mapped[List["UserSurvey"]] = relationship("UserSurvey", back_populates="user", cascade="all, delete-orphan")
    game_lists: Mapped[List["UserGameList"]] = relationship("UserGameList", back_populates="user", cascade="all, delete-orphan")
    comments: Mapped[List["Comment"]] = relationship("Comment", back_populates="user", cascade="all, delete-orphan", passive_deletes=True)
    bans_given: Mapped[List["Ban"]] = relationship("Ban", foreign_keys="Ban.admin_id", back_populates="admin")  # ← este NO(por que quieres ver los bans que ha hecho un admin borrado/baneado)
    bans_received: Mapped[List["Ban"]] = relationship("Ban", foreign_keys="Ban.user_id", back_populates="user", cascade="all, delete-orphan")
    add_games: Mapped[List["AddGame"]] = relationship("AddGame", back_populates="user", cascade="all, delete-orphan")
    user_game_tiers: Mapped[List["UserGameTier"]] = relationship("UserGameTier", back_populates="user", cascade="all, delete-orphan")
    reports_made: Mapped[List["Report"]] = relationship("Report", foreign_keys="Report.reporter_id", back_populates="reporter", cascade="all, delete-orphan" )
    reports_received: Mapped[List["Report"]] = relationship("Report", foreign_keys="Report.reported_user_id", back_populates="reported_user", cascade="all, delete-orphan" )

# Serialize 
    def serialize(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "is_active": self.is_active,
            "is_admin": self.is_admin,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "profile": self.profile.serialize() if self.profile else None,
            "game_lists": [game_list.serialize() for game_list in self.game_lists],  # ← Mejorado
        
            # do not serialize the password, its a security breach
        }
     
class Game(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(250), unique=True, nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    release_date: Mapped[Optional[Date]] = mapped_column(Date, nullable=True)
    developer: Mapped[str] = mapped_column(String(150), nullable=False)
    publisher: Mapped[str] = mapped_column(String(150), nullable=False)
    cover_img_url: Mapped[str] = mapped_column(String(255), nullable=False)
    genres: Mapped[List[str]] = mapped_column(ARRAY(String(60)), nullable=False)
    platforms: Mapped[List[str]] = mapped_column(ARRAY(String(60)), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)

    # Relaciones
    user_glgs: Mapped[List["UserGLG"]] = relationship("UserGLG", back_populates="game")
    comments: Mapped[List["Comment"]] = relationship("Comment", back_populates="game")
    game_tier: Mapped["GameTier"] = relationship("GameTier", back_populates="game", uselist=False, cascade="all, delete-orphan")
    add_games: Mapped[List["AddGame"]] = relationship("AddGame", back_populates="game")

    def get_favorites(self):
        game_id=self.id
        
        favorites = db.session.execute(
            select(func.count()).where(
            UserGLG.game_id == game_id, 
            UserGLG.is_favorite == True
        )).scalar()
        
        return favorites or 0

    #Serialize
    def serialize(self):
        return {
            "id": self.id,
            "slug": self.slug,
            "title": self.title,
            "description": self.description or "Sin descripción disponible.",
            "release_date": self.release_date.isoformat() if self.release_date else None,
            "developer": self.developer,
            "publisher": self.publisher,
            "cover_img_url": self.cover_img_url,
            "genres": self.genres,
            "platforms": self.platforms,
            "created_at": self.created_at.isoformat(),
            "game_tier": self.game_tier.serialize() if self.game_tier else None,
            "comment_count": len(self.comments),
            "favorite_count": self.get_favorites(),
        }

class Profile(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('user.id'), unique=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, default="No description", nullable=False)
    redes: Mapped[Optional[dict]] = mapped_column(JSON)
    avatar_url: Mapped[str] = mapped_column(String(255), default=imgurl, nullable=False)

    # Relaciones
    user: Mapped["User"] = relationship("User", back_populates="profile")

    # Serialize
    def serialize(self):
        return {
            "id": self.id,
            "description": self.description,
            "redes": self.redes,
            "avatar_url": self.avatar_url,
        }
# si se añade mas requistos se tiene que poner aqui mas tambien
class UserSurvey(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('user.id'), nullable=False)
    genres: Mapped[List[str]] = mapped_column(ARRAY(String(60)), nullable=False)
    platforms: Mapped[List[str]] = mapped_column(ARRAY(String(40)), nullable=False)
    play_style: Mapped[str] = mapped_column(String(20), nullable=False)
    favorite_themes: Mapped[List[str]] = mapped_column(ARRAY(String(50)), nullable=False)
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    # Relaciones
    user: Mapped["User"] = relationship("User", back_populates="surveys")
    
    #Serialize
    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "genres": self.genres,
            "platforms": self.platforms,
            "play_style": self.play_style,
            "favorite_themes": self.favorite_themes,
            "completed_at": self.completed_at.isoformat(),
        }

class UserGameList(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('user.id'), nullable=False)
    __table_args__ = (db.UniqueConstraint('user_id'),)

    # Relaciones
    user: Mapped["User"] = relationship("User", back_populates= "game_lists")
    user_glg: Mapped[List["UserGLG"]] = relationship("UserGLG", back_populates= "ugl", cascade="all, delete-orphan")

    #Serialize
    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "games": [game.serialize() for game in self.user_glg]
        }
    
#Tabla intermedia de UserGameList y Game
class UserGLG(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    game_id: Mapped[int] = mapped_column(ForeignKey('game.id'), nullable=False)
    ugl_id: Mapped[int] =mapped_column(ForeignKey('user_game_list.id'), nullable=False)
    status: Mapped[str] = mapped_column(Enum('want_to_play', 'playing', 'completed', 'dropped', name='status_enum'), nullable=False)
    rating: Mapped[int] = mapped_column(default=0, nullable=False)
    review: Mapped[str] = mapped_column(Text, default="no review", nullable=False)
    added_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    is_favorite: Mapped[bool] = mapped_column(Boolean(), default=False, nullable=False)
    __table_args__ = (db.UniqueConstraint('ugl_id', 'game_id'),)  # ← añadir esto(no se puede tener dos juegos igual en la misma lista de un user)

    #Relaciones
    game: Mapped["Game"] = relationship("Game", back_populates="user_glgs")
    ugl: Mapped["UserGameList"] = relationship("UserGameList", back_populates="user_glg")
    
     #Serialize
    def serialize(self):
        return {
            "id": self.id,
            "ugl_id": self.ugl_id,
            "game_id": self.game_id,
            "status": self.status,
            "rating": self.rating,
            "review": self.review,
            "is_favorite": self.is_favorite,
            "added_at": self.added_at.isoformat(),
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "game": self.game.serialize() if self.game else None
        }
    
class Comment(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('user.id', ondelete="CASCADE"), nullable=False)
    game_id: Mapped[int] = mapped_column(ForeignKey('game.id'), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    parent_id: Mapped[Optional[int]] = mapped_column(ForeignKey('comment.id'), nullable=True)  # Cambié nombre a parent_id

    # Relaciones
    user: Mapped["User"] = relationship("User", back_populates="comments")
    game: Mapped["Game"] = relationship("Game", back_populates="comments")
    replies: Mapped[List["Comment"]] = relationship("Comment",back_populates="parent",cascade="all, delete-orphan")
    parent: Mapped[Optional["Comment"]] = relationship("Comment",back_populates="replies",remote_side=[id])
    reports: Mapped[List["Report"]] = relationship( "Report", back_populates="comment", cascade="all, delete-orphan" )
    
    #Serialize
    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "username": self.user.username if self.user else None,
            "game_id": self.game_id,
            "content": self.content,
            "created_at": self.created_at.isoformat(),
            "parent_id": self.parent_id,          # Cambiado de reply_id
            "reply_count": len(self.replies),
            "report_count": len(self.reports),
        }

class GameTier(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    game_id: Mapped[int] = mapped_column(ForeignKey('game.id'), unique=True, nullable=False)
    average_rating: Mapped[float] = mapped_column(default=0.0, nullable=False)
    tier: Mapped[str] = mapped_column(Enum('S', 'A', 'B', 'C', 'D', 'F', 'Undefined', name='tier_enum'), default='Undefined', nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    # Relaciones
    game: Mapped["Game"] = relationship("Game", back_populates="game_tier")
    user_game_tiers: Mapped[List["UserGameTier"]] = relationship("UserGameTier", back_populates="game_tier")

    #Serialize
    def serialize(self):
        return {
            "id": self.id,
            "game_id": self.game_id,
            "average_rating": round(self.average_rating, 2),
            "tier": self.tier,
            "updated_at": self.updated_at.isoformat(),
            "vote_count": len(self.user_game_tiers),
        }

class UserGameTier(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    game_tier_id: Mapped[int] = mapped_column(ForeignKey('game_tier.id'), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey('user.id'), nullable=False)
    rating: Mapped[int] = mapped_column(Integer,nullable=False)
    __table_args__ = (db.UniqueConstraint('game_tier_id', 'user_id'),)

    # Relaciones
    game_tier: Mapped["GameTier"] = relationship("GameTier", back_populates="user_game_tiers")
    user: Mapped["User"] = relationship("User", back_populates="user_game_tiers")

    def serialize(self):
        return {
            "id": self.id,
            "game_tier_id": self.game_tier_id,
            "user_id": self.user_id,
            "username": self.user.username if self.user else None,
        }


class Ban(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('user.id', ondelete="CASCADE"), nullable=False)
    admin_id: Mapped[int] = mapped_column(ForeignKey('user.id'), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    ends: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relaciones
    user: Mapped["User"] = relationship("User", foreign_keys=[user_id], back_populates="bans_received")
    admin: Mapped["User"] = relationship("User", foreign_keys=[admin_id], back_populates="bans_given")

    #Serialize
    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "username": self.user.username if self.user else None,
            "admin_id": self.admin_id,
            "admin_username": self.admin.username if self.admin else None,
            "reason": self.reason,
            "created_at": self.created_at.isoformat(),
            "ends": self.ends.isoformat() if self.ends else "Permanent",
        }

class AddGame(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('user.id'), nullable=False)
    game_id: Mapped[Optional[int]] = mapped_column(ForeignKey('game.id'), nullable=True)
    creator: Mapped[bool] = mapped_column(Boolean(), default=False, nullable=False)
    update: Mapped[bool] = mapped_column(Boolean(), default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)
    body: Mapped[dict] = mapped_column(JSON, nullable=False)
    status: Mapped[str] = mapped_column(Enum('approved', 'rejected', 'pending', name='addgame_status_enum'), default='pending', nullable=False)

    # Relaciones
    user: Mapped["User"] = relationship("User", back_populates="add_games")
    game: Mapped["Game"] = relationship("Game", back_populates="add_games")

    #Serialize
    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "username": self.user.username if self.user else None,
            "game_id": self.game_id,
            "creator": self.creator,
            "update": self.update,
            "status": self.status,
            "body": self.body,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }

class Report(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
 
    # Quién reporta
    reporter_id: Mapped[int] = mapped_column(ForeignKey('user.id', ondelete="CASCADE"), nullable=False)
 
    # Qué se reporta — uno de los dos tendrá valor, el otro None
    reported_comment_id: Mapped[Optional[int]] = mapped_column(ForeignKey('comment.id', ondelete="CASCADE"), nullable=True)
    reported_user_id: Mapped[Optional[int]] = mapped_column(ForeignKey('user.id', ondelete="CASCADE"), nullable=True)
 
    reason: Mapped[str] = mapped_column(String(300), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    resolved: Mapped[bool] = mapped_column(Boolean(), default=False, nullable=False)
 
    # Relaciones
    reporter: Mapped["User"] = relationship("User", foreign_keys=[reporter_id], back_populates="reports_made")
    reported_user: Mapped[Optional["User"]] = relationship("User", foreign_keys=[reported_user_id], back_populates="reports_received")
    comment: Mapped[Optional["Comment"]] = relationship("Comment", back_populates="reports")
 
 #Serialize
    def serialize(self):
        return {
            "id": self.id,
            "reporter_id": self.reporter_id,
            "reporter_username": self.reporter.username if self.reporter else None,
            "reported_comment_id": self.reported_comment_id,
            "comment_content": self.comment.content if self.comment else None,
            "comment_game_id": self.comment.game_id if self.comment else None,
            "reported_user_id": self.reported_user_id,
            "reported_username": self.reported_user.username if self.reported_user else None,
            "reason": self.reason,
            "resolved": self.resolved,
            "created_at": self.created_at.isoformat(),
        }