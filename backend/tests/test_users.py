import pytest
from app import create_app
from models import db, User, Movie, Review

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
def sample_users(app):
    """Create sample users"""
    with app.app_context():
        users = [
            User(username='alice', email='alice@example.com'),
            User(username='bob', email='bob@example.com'),
            User(username='charlie', email='charlie@example.com'),
        ]
        db.session.add_all(users)
        db.session.commit()
        return [u.id for u in users]

class TestUserEndpoints:
    """Test user endpoints"""
    
    def test_get_all_users(self, client, sample_users):
        """Test GET /api/users"""
        response = client.get('/api/users')
        assert response.status_code == 200
        assert len(response.json['data']) == 3
    
    def test_get_user_by_id(self, client, sample_users):
        """Test GET /api/users/<id>"""
        user_id = sample_users[0]
        response = client.get(f'/api/users/{user_id}')
        assert response.status_code == 200
        assert response.json['data']['username'] == 'alice'
    
    def test_get_user_not_found(self, client):
        """Test GET /api/users/<id> with invalid ID"""
        response = client.get('/api/users/99999')
        assert response.status_code == 404
    
    def test_get_user_reviews(self, client, sample_users, app):
        """Test GET /api/users/<id>/reviews"""
        with app.app_context():
            movie = Movie(title='Test Movie', release_year=2020)
            db.session.add(movie)
            db.session.commit()
            
            review = Review(
                user_id=sample_users[0],
                movie_id=movie.id,
                rating=5,
                comment='Excellent!'
            )
            db.session.add(review)
            db.session.commit()
        
        user_id = sample_users[0]
        response = client.get(f'/api/users/{user_id}/reviews')
        assert response.status_code == 200
        assert len(response.json['data']) == 1

class TestUserModel:
    """Test User model"""
    
    def test_user_to_dict(self, app, sample_users):
        """Test user to_dict method"""
        with app.app_context():
            user = User.query.get(sample_users[0])
            user_dict = user.to_dict()
            assert user_dict['username'] == 'alice'
            assert 'email' in user_dict
