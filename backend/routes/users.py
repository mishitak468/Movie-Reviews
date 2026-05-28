from flask import Blueprint, request
from models import db, User, Review
from utils import (
    handle_errors,
    get_success_response,
    get_error_response
)

users_bp = Blueprint('users', __name__, url_prefix='/api/users')

@users_bp.route('', methods=['GET'])
@handle_errors
def get_all_users():
    """
    GET /api/users
    Fetch all users
    """
    try:
        # the frontend's user picker expects the full list; pagination is opt-in via ?page
        if request.args.get('page') is None:
            return get_success_response([user.to_dict() for user in User.query.all()])

        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        if page < 1:
            return get_error_response('Page must be greater than 0', 400)
        if per_page < 1 or per_page > 100:
            return get_error_response('Per page must be between 1 and 100', 400)
        
        paginated_users = User.query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        users_data = [user.to_dict() for user in paginated_users.items]
        
        return get_success_response({
            'users': users_data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': paginated_users.total,
                'pages': paginated_users.pages
            }
        })
    except Exception as e:
        return get_error_response(f'Error fetching users: {str(e)}', 500)

@users_bp.route('/<int:user_id>', methods=['GET'])
@handle_errors
def get_user_by_id(user_id):
    """
    GET /api/users/<user_id>
    Fetch a specific user
    """
    try:
        user = User.query.get(user_id)
        
        if not user:
            return get_error_response(f'User with ID {user_id} not found', 404)
        
        user_data = user.to_dict()
        user_data['review_count'] = len(user.reviews)
        
        return get_success_response(user_data)
    except Exception as e:
        return get_error_response(f'Error fetching user: {str(e)}', 500)

@users_bp.route('/<int:user_id>/reviews', methods=['GET'])
@handle_errors
def get_user_reviews(user_id):
    """
    GET /api/users/<user_id>/reviews
    Fetch all reviews written by a specific user
    """
    try:
        user = User.query.get(user_id)
        
        if not user:
            return get_error_response(f'User with ID {user_id} not found', 404)
        
        # the frontend expects the full list; pagination is opt-in via ?page
        if request.args.get('page') is None:
            return get_success_response(
                [review.to_dict(with_names=True) for review in user.reviews]
            )

        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        if page < 1:
            return get_error_response('Page must be greater than 0', 400)
        if per_page < 1 or per_page > 100:
            return get_error_response('Per page must be between 1 and 100', 400)
        
        paginated_reviews = Review.query.filter_by(user_id=user_id).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        reviews_data = [
            review.to_dict(with_names=True)
            for review in paginated_reviews.items
        ]
        
        return get_success_response({
            'user': user.to_dict(),
            'reviews': reviews_data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': paginated_reviews.total,
                'pages': paginated_reviews.pages
            }
        })
    except Exception as e:
        return get_error_response(f'Error fetching user reviews: {str(e)}', 500)
