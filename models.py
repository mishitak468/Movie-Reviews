from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    """User model"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False, unique=True)
    email = db.Column(db.String(100), nullable=False, unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    reviews = db.relationship('Review', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat()
        }
    
    def __repr__(self):
        return f'<User {self.username}>'


class Movie(db.Model):
    """Movie model"""
    __tablename__ = 'movies'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    release_year = db.Column(db.Integer, nullable=False)
    genre = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    reviews = db.relationship('Review', backref='movie', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self, include_reviews=False):
        data = {
            'id': self.id,
            'title': self.title,
            'release_year': self.release_year,
            'genre': self.genre,
            'created_at': self.created_at.isoformat()
        }
        
        if include_reviews:
            data['reviews'] = [review.to_dict() for review in self.reviews]
            data['average_rating'] = self.get_average_rating()
            data['total_reviews'] = len(self.reviews)
        
        return data
    
    def get_average_rating(self):
        """Calculate average rating for this movie"""
        if not self.reviews:
            return 0.0
        
        total_rating = sum(review.rating for review in self.reviews)
        average = total_rating / len(self.reviews)
        return round(average, 2)
    
    def __repr__(self):
        return f'<Movie {self.title}>'


class Review(db.Model):
    """Review model"""
    __tablename__ = 'reviews'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    movie_id = db.Column(db.Integer, db.ForeignKey('movies.id', ondelete='CASCADE'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Unique constraint to prevent duplicate reviews
    __table_args__ = (db.UniqueConstraint('user_id', 'movie_id', name='uq_user_movie'),)
    
    def to_dict(self, include_user=False, include_movie=False):
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'movie_id': self.movie_id,
            'rating': self.rating,
            'comment': self.comment,
            'created_at': self.created_at.isoformat()
        }
        
        if include_user:
            data['user'] = self.user.to_dict()
        
        if include_movie:
            data['movie'] = self.movie.to_dict()
        
        return data
    
    def __repr__(self):
        return f'<Review user_id={self.user_id}, movie_id={self.movie_id}>'