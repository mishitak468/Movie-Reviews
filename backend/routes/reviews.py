from flask import Blueprint, request
from models import db, Review, User, Movie
from utils import (
    handle_errors,
    validate_review_input,
    check_duplicate_review,
    get_success_response,
    get_error_response
)

reviews_bp = Blueprint('reviews', __name__, url_prefix='/api/reviews')

@reviews_bp.route('', methods=['POST'])
@handle_errors
def create_review():
    """
    POST /api/reviews
    Submit a new review with duplicate check
    """
    try:
        data = request.get_json()
        
        if not data:
            return get_error_response('No data provided', 400)
        
        # Validate input
        errors = validate_review_input(data)
        if errors:
            return get_error_response(errors, 400)
        
        user_id = int(data['user_id'])
        movie_id = int(data['movie_id'])
        
        # Check for duplicate review (stretch feature)
        if check_duplicate_review(user_id, movie_id):
            return get_error_response(
                'User has already reviewed this movie. Use PUT to update your review.',
                409
            )
        
        # Create new review
        new_review = Review(
            user_id=user_id,
            movie_id=movie_id,
            rating=int(data['rating']),
            comment=data.get('comment', '')
        )
        
        db.session.add(new_review)
        db.session.commit()
        
        return get_success_response(
            new_review.to_dict(with_names=True),
            'Review created successfully',
            201
        )
    except Exception as e:
        db.session.rollback()
        return get_error_response(f'Error creating review: {str(e)}', 500)

@reviews_bp.route('/<int:review_id>', methods=['GET'])
@handle_errors
def get_review_by_id(review_id):
    """
    GET /api/reviews/<review_id>
    Fetch a specific review
    """
    try:
        review = Review.query.get(review_id)
        
        if not review:
            return get_error_response(f'Review with ID {review_id} not found', 404)
        
        return get_success_response(
            review.to_dict(with_names=True)
        )
    except Exception as e:
        return get_error_response(f'Error fetching review: {str(e)}', 500)

@reviews_bp.route('/<int:review_id>', methods=['PUT'])
@handle_errors
def update_review(review_id):
    """
    PUT /api/reviews/<review_id>
    Update a review's rating and/or comment
    """
    try:
        review = Review.query.get(review_id)
        
        if not review:
            return get_error_response(f'Review with ID {review_id} not found', 404)
        
        data = request.get_json()
        
        if not data:
            return get_error_response('No data provided', 400)
        
        # Validate rating if provided
        if 'rating' in data:
            try:
                rating = int(data['rating'])
                if rating < 1 or rating > 5:
                    return get_error_response('Rating must be between 1 and 5', 400)
                review.rating = rating
            except (ValueError, TypeError):
                return get_error_response('Rating must be an integer', 400)
        
        # Update comment if provided
        if 'comment' in data:
            if len(data['comment']) > 5000:
                return get_error_response('Comment must be less than 5000 characters', 400)
            review.comment = data['comment']
        
        db.session.commit()
        
        return get_success_response(
            review.to_dict(with_names=True),
            'Review updated successfully'
        )
    except Exception as e:
        db.session.rollback()
        return get_error_response(f'Error updating review: {str(e)}', 500)

@reviews_bp.route('/<int:review_id>', methods=['DELETE'])
@handle_errors
def delete_review(review_id):
    """
    DELETE /api/reviews/<review_id>
    Delete a review
    """
    try:
        review = Review.query.get(review_id)
        
        if not review:
            return get_error_response(f'Review with ID {review_id} not found', 404)
        
        review_data = {
            'deleted_review_id': review.id,
            'user_id': review.user_id,
            'movie_id': review.movie_id
        }
        
        db.session.delete(review)
        db.session.commit()
        
        return get_success_response(
            review_data,
            'Review deleted successfully'
        )
    except Exception as e:
        db.session.rollback()
        return get_error_response(f'Error deleting review: {str(e)}', 500)
