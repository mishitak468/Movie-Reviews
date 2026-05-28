import pytest
from app import create_app
from models import db, Movie, Review, User

@pytest.fixture
def app():
    """Create and configure test app"""
    app = create_app('testing')
    
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    """Test client"""
    return app.test_client()

@pytest.fixture
def sample_data(app):
    """Create sample users and movies"""
    with app.app_context():
        users = [
            User(username='user1', email='user1@example.com'),
            User(username='user2', email='user2@example.com'),
        ]
        movies = [
            Movie(title='Movie 1', release_year=2020, genre='Action'),
            Movie(title='Movie 2', release_year=2021, genre='Drama'),
        ]
        db.session.add_all(users + movies)
        db.session.commit()
        return {
            'user_ids': [u.id for u in users],
            'movie_ids': [m.id for m in movies]
        }

class TestReviewEndpoints:
    """Test review CRUD endpoints"""
    
    def test_create_review(self, client, sample_data):
        """Test POST /api/reviews"""
        review_data = {
            'user_id': sample_data['user_ids'][0],
            'movie_id': sample_data['movie_ids'][0],
            'rating': 5,
            'comment': 'Great movie!'
        }
        response = client.post('/api/reviews', json=review_data)
        assert response.status_code == 201
        assert response.json['data']['rating'] == 5
    
    def test_create_duplicate_review(self, client, sample_data, app):
        """Test duplicate review prevention"""
        user_id = sample_data['user_ids'][0]
        movie_id = sample_data['movie_ids'][0]
        
        review_data = {
            'user_id': user_id,
            'movie_id': movie_id,
            'rating': 5,
            'comment': 'First review'
        }
        
        # First review should succeed
        response1 = client.post('/api/reviews', json=review_data)
        assert response1.status_code == 201
        
        # Second review should fail
        response2 = client.post('/api/reviews', json=review_data)
        assert response2.status_code == 409
        assert 'already reviewed' in response2.json['errors'][0]
    
    def test_create_review_invalid_rating(self, client, sample_data):
        """Test review with invalid rating"""
        review_data = {
            'user_id': sample_data['user_ids'][0],
            'movie_id': sample_data['movie_ids'][0],
            'rating': 10,  # Invalid
            'comment': 'Bad rating'
        }
        response = client.post('/api/reviews', json=review_data)
        assert response.status_code == 400
    
    def test_get_review_by_id(self, client, sample_data, app):
        """Test GET /api/reviews/<id>"""
        with app.app_context():
            review = Review(
                user_id=sample_data['user_ids'][0],
                movie_id=sample_data['movie_ids'][0],
                rating=4,
                comment='Good movie'
            )
            db.session.add(review)
            db.session.commit()
            review_id = review.id
        
        response = client.get(f'/api/reviews/{review_id}')
        assert response.status_code == 200
        assert response.json['data']['rating'] == 4
    
    def test_update_review(self, client, sample_data, app):
        """Test PUT /api/reviews/<id>"""
        with app.app_context():
            review = Review(
                user_id=sample_data['user_ids'][0],
                movie_id=sample_data['movie_ids'][0],
                rating=3,
                comment='Original'
            )
            db.session.add(review)
            db.session.commit()
            review_id = review.id
        
        update_data = {
            'rating': 5,
            'comment': 'Updated comment'
        }
        response = client.put(f'/api/reviews/{review_id}', json=update_data)
        assert response.status_code == 200
        assert response.json['data']['rating'] == 5
        assert response.json['data']['comment'] == 'Updated comment'
    
    def test_delete_review(self, client, sample_data, app):
        """Test DELETE /api/reviews/<id>"""
        with app.app_context():
            review = Review(
                user_id=sample_data['user_ids'][0],
                movie_id=sample_data['movie_ids'][0],
                rating=4,
                comment='Test'
            )
            db.session.add(review)
            db.session.commit()
            review_id = review.id
        
        response = client.delete(f'/api/reviews/{review_id}')
        assert response.status_code == 200
        
        # Verify deletion
        get_response = client.get(f'/api/reviews/{review_id}')
        assert get_response.status_code == 404

class TestReviewModel:
    """Test Review model"""
    
    def test_review_to_dict(self, app, sample_data):
        """Test review to_dict method"""
        with app.app_context():
            review = Review(
                user_id=sample_data['user_ids'][0],
                movie_id=sample_data['movie_ids'][0],
                rating=4,
                comment='Good'
            )
            db.session.add(review)
            db.session.commit()
            
            review_dict = review.to_dict()
            assert review_dict['rating'] == 4
            assert review_dict['comment'] == 'Good'