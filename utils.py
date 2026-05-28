from functools import wraps
from flask import jsonify, request
from models import User, Movie, Review, db

def handle_errors(f):
    """Decorator to handle common errors"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
        except Exception as e:
            return jsonify({'error': 'Internal server error', 'details': str(e)}), 500
    return decorated_function

def validate_movie_input(data):
    """Validate movie input data"""
    errors = []
    
    if 'title' not in data or not data['title']:
        errors.append('Movie title is required')
    elif len(data['title']) > 255:
        errors.append('Movie title must be less than 255 characters')
    
    if 'release_year' not in data:
        errors.append('Release year is required')
    else:
        try:
            year = int(data['release_year'])
            if year < 1800 or year > 2100:
                errors.append('Release year must be between 1800 and 2100')
        except (ValueError, TypeError):
            errors.append('Release year must be an integer')
    
    if 'genre' in data and data['genre']:
        if len(data['genre']) > 100:
            errors.append('Genre must be less than 100 characters')
    
    return errors

def validate_review_input(data):
    """Validate review input data"""
    errors = []
    
    if 'user_id' not in data:
        errors.append('User ID is required')
    else:
        try:
            user_id = int(data['user_id'])
            user = User.query.get(user_id)
            if not user:
                errors.append(f'User with ID {user_id} does not exist')
        except (ValueError, TypeError):
            errors.append('User ID must be an integer')
    
    if 'movie_id' not in data:
        errors.append('Movie ID is required')
    else:
        try:
            movie_id = int(data['movie_id'])
            movie = Movie.query.get(movie_id)
            if not movie:
                errors.append(f'Movie with ID {movie_id} does not exist')
        except (ValueError, TypeError):
            errors.append('Movie ID must be an integer')
    
    if 'rating' not in data:
        errors.append('Rating is required')
    else:
        try:
            rating = int(data['rating'])
            if rating < 1 or rating > 5:
                errors.append('Rating must be between 1 and 5')
        except (ValueError, TypeError):
            errors.append('Rating must be an integer')
    
    if 'comment' in data and data['comment']:
        if len(data['comment']) > 5000:
            errors.append('Comment must be less than 5000 characters')
    
    return errors

def check_duplicate_review(user_id, movie_id):
    """Check if user already reviewed this movie"""
    existing_review = Review.query.filter_by(
        user_id=user_id,
        movie_id=movie_id
    ).first()
    return existing_review is not None

def get_success_response(data, message=None, status_code=200):
    """Create a standardized success response"""
    response = {
        'success': True,
        'data': data
    }
    if message:
        response['message'] = message
    return jsonify(response), status_code

def get_error_response(errors, status_code=400):
    """Create a standardized error response"""
    if isinstance(errors, str):
        errors = [errors]
    
    return jsonify({
        'success': False,
        'errors': errors
    }), status_code