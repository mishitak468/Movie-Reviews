from functools import wraps

from flask import jsonify

from models import Movie, Review, User


def get_success_response(data, message=None, status_code=200):
    response = {"success": True, "data": data}
    if message:
        response["message"] = message
    return jsonify(response), status_code


def get_error_response(errors, status_code=400):
    if isinstance(errors, str):
        errors = [errors]
    return jsonify({"success": False, "errors": errors}), status_code


def handle_errors(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except ValueError as e:
            # same shape as get_error_response so the api never mixes error formats
            return get_error_response(str(e), 400)

    return wrapper


def validate_movie_input(data) -> list[str]:
    errors = []

    if not data.get("title"):
        errors.append("Movie title is required")
    elif len(data["title"]) > 255:
        errors.append("Movie title must be less than 255 characters")

    if "release_year" not in data:
        errors.append("Release year is required")
    else:
        try:
            year = int(data["release_year"])
            if year < 1800 or year > 2100:
                errors.append("Release year must be between 1800 and 2100")
        except (ValueError, TypeError):
            errors.append("Release year must be an integer")

    if data.get("genre") and len(data["genre"]) > 100:
        errors.append("Genre must be less than 100 characters")

    return errors


def validate_review_input(data) -> list[str]:
    errors = []

    if "user_id" not in data:
        errors.append("User ID is required")
    else:
        try:
            if not User.query.get(int(data["user_id"])):
                errors.append(f"User with ID {data['user_id']} does not exist")
        except (ValueError, TypeError):
            errors.append("User ID must be an integer")

    if "movie_id" not in data:
        errors.append("Movie ID is required")
    else:
        try:
            if not Movie.query.get(int(data["movie_id"])):
                errors.append(f"Movie with ID {data['movie_id']} does not exist")
        except (ValueError, TypeError):
            errors.append("Movie ID must be an integer")

    if "rating" not in data:
        errors.append("Rating is required")
    else:
        try:
            rating = int(data["rating"])
            if rating < 1 or rating > 5:
                errors.append("Rating must be between 1 and 5")
        except (ValueError, TypeError):
            errors.append("Rating must be an integer")

    if data.get("comment") and len(data["comment"]) > 5000:
        errors.append("Comment must be less than 5000 characters")

    return errors


def check_duplicate_review(user_id: int, movie_id: int) -> bool:
    return Review.query.filter_by(user_id=user_id, movie_id=movie_id).first() is not None
