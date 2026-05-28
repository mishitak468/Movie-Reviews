from flask import Blueprint, request
from models import db, Movie, Review
from utils import (
    handle_errors,
    validate_movie_input,
    get_success_response,
    get_error_response
)

movies_bp = Blueprint('movies', __name__, url_prefix='/api/movies')

@movies_bp.route('', methods=['GET'])
@handle_errors
def get_all_movies():
    """
    GET /api/movies
    Fetch all movies in the catalog
    """
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # Validate pagination
        if page < 1:
            return get_error_response('Page must be greater than 0', 400)
        if per_page < 1 or per_page > 100:
            return get_error_response('Per page must be between 1 and 100', 400)
        
        paginated_movies = Movie.query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        movies_data = [movie.to_dict() for movie in paginated_movies.items]
        
        return get_success_response({
            'movies': movies_data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': paginated_movies.total,
                'pages': paginated_movies.pages
            }
        })
    except Exception as e:
        return get_error_response(f'Error fetching movies: {str(e)}', 500)

@movies_bp.route('/<int:movie_id>', methods=['GET'])
@handle_errors
def get_movie_by_id(movie_id):
    """
    GET /api/movies/<movie_id>
    Fetch specific movie with its reviews and average rating
    """
    try:
        movie = Movie.query.get(movie_id)
        
        if not movie:
            return get_error_response(f'Movie with ID {movie_id} not found', 404)
        
        movie_data = movie.to_dict(include_reviews=True)
        
        return get_success_response(movie_data)
    except Exception as e:
        return get_error_response(f'Error fetching movie: {str(e)}', 500)

@movies_bp.route('/top-rated', methods=['GET'])
@handle_errors
def get_top_rated_movies():
    """
    GET /api/movies/top-rated
    (Stretch) Return movies sorted by average rating (highest first)
    """
    try:
        limit = request.args.get('limit', 10, type=int)
        
        if limit < 1 or limit > 100:
            return get_error_response('Limit must be between 1 and 100', 400)
        
        # Get all movies with their average ratings
        all_movies = Movie.query.all()
        
        # Sort by average rating
        sorted_movies = sorted(
            all_movies,
            key=lambda m: m.get_average_rating(),
            reverse=True
        )
        
        # Apply limit
        top_movies = sorted_movies[:limit]
        
        movies_data = [
            {
                **movie.to_dict(),
                'average_rating': movie.get_average_rating(),
                'total_reviews': len(movie.reviews)
            }
            for movie in top_movies
        ]
        
        return get_success_response({
            'top_rated_movies': movies_data,
            'count': len(movies_data)
        })
    except Exception as e:
        return get_error_response(f'Error fetching top-rated movies: {str(e)}', 500)

@movies_bp.route('', methods=['POST'])
@handle_errors
def create_movie():
    """
    POST /api/movies
    Add a new movie to the system
    """
    try:
        data = request.get_json()
        
        if not data:
            return get_error_response('No data provided', 400)
        
        # Validate input
        errors = validate_movie_input(data)
        if errors:
            return get_error_response(errors, 400)
        
        # Check for duplicate title (optional - adjust as needed)
        existing_movie = Movie.query.filter_by(
            title=data['title'],
            release_year=data['release_year']
        ).first()
        
        if existing_movie:
            return get_error_response('Movie with this title and year already exists', 409)
        
        # Create new movie
        new_movie = Movie(
            title=data['title'],
            release_year=int(data['release_year']),
            genre=data.get('genre', '')
        )
        
        db.session.add(new_movie)
        db.session.commit()
        
        return get_success_response(
            new_movie.to_dict(),
            'Movie created successfully',
            201
        )
    except Exception as e:
        db.session.rollback()
        return get_error_response(f'Error creating movie: {str(e)}', 500)

@movies_bp.route('/<int:movie_id>', methods=['PUT'])
@handle_errors
def update_movie(movie_id):
    """
    PUT /api/movies/<movie_id>
    Update movie details (admin only)
    """
    try:
        movie = Movie.query.get(movie_id)
        
        if not movie:
            return get_error_response(f'Movie with ID {movie_id} not found', 404)
        
        data = request.get_json()
        
        if not data:
            return get_error_response('No data provided', 400)
        
        # Validate input
        errors = validate_movie_input(data)
        if errors:
            return get_error_response(errors, 400)
        
        # Update fields
        if 'title' in data:
            movie.title = data['title']
        if 'release_year' in data:
            movie.release_year = int(data['release_year'])
        if 'genre' in data:
            movie.genre = data['genre']
        
        db.session.commit()
        
        return get_success_response(
            movie.to_dict(),
            'Movie updated successfully'
        )
    except Exception as e:
        db.session.rollback()
        return get_error_response(f'Error updating movie: {str(e)}', 500)

@movies_bp.route('/<int:movie_id>', methods=['DELETE'])
@handle_errors
def delete_movie(movie_id):
    """
    DELETE /api/movies/<movie_id>
    Remove a movie from the platform (cascades to reviews)
    """
    try:
        movie = Movie.query.get(movie_id)
        
        if not movie:
            return get_error_response(f'Movie with ID {movie_id} not found', 404)
        
        movie_title = movie.title
        
        db.session.delete(movie)
        db.session.commit()
        
        return get_success_response(
            {'deleted_movie_id': movie_id, 'deleted_movie_title': movie_title},
            'Movie deleted successfully'
        )
    except Exception as e:
        db.session.rollback()
        return get_error_response(f'Error deleting movie: {str(e)}', 500)