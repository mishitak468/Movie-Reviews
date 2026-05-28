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
def sample_movies(app):
    """Create sample movies for testing"""
    with app.app_context():
        movies = [
            Movie(title='Test Movie 1', release_year=2020, genre='Action'),
            Movie(title='Test Movie 2', release_year=2021, genre='Drama'),
            Movie(title='Test Movie 3', release_year=2022, genre='Comedy'),
        ]
        db.session.add_all(movies)
        db.session.commit()
        return [m.id for m in movies]

class TestMovieEndpoints:
    """Test movie CRUD endpoints"""
    
    def test_get_all_movies(self, client, sample_movies):
        """Test GET /api/movies"""
        response = client.get('/api/movies')
        assert response.status_code == 200
        assert response.json['success'] is True
        assert len(response.json['data']['movies']) == 3
    
    def test_get_all_movies_pagination(self, client, sample_movies):
        """Test pagination on GET /api/movies"""
        response = client.get('/api/movies?page=1&per_page=2')
        assert response.status_code == 200
        assert len(response.json['data']['movies']) == 2
        assert response.json['data']['pagination']['total'] == 3
    
    def test_get_movie_by_id(self, client, sample_movies):
        """Test GET /api/movies/<id>"""
        movie_id = sample_movies[0]
        response = client.get(f'/api/movies/{movie_id}')
        assert response.status_code == 200
        assert response.json['data']['title'] == 'Test Movie 1'
    
    def test_get_movie_not_found(self, client):
        """Test GET /api/movies/<id> with invalid ID"""
        response = client.get('/api/movies/99999')
        assert response.status_code == 404
        assert response.json['success'] is False
    
    def test_create_movie(self, client):
        """Test POST /api/movies"""
        movie_data = {
            'title': 'New Movie',
            'release_year': 2023,
            'genre': 'Thriller'
        }
        response = client.post('/api/movies', json=movie_data)
        assert response.status_code == 201
        assert response.json['data']['title'] == 'New Movie'
    
    def test_create_movie_missing_fields(self, client):
        """Test POST /api/movies with missing required fields"""
        movie_data = {'title': 'Incomplete Movie'}
        response = client.post('/api/movies', json=movie_data)
        assert response.status_code == 400
        assert response.json['success'] is False
    
    def test_update_movie(self, client, sample_movies):
        """Test PUT /api/movies/<id>"""
        movie_id = sample_movies[0]
        update_data = {
            'title': 'Updated Title',
            'release_year': 2020,
            'genre': 'Updated Genre'
        }
        response = client.put(f'/api/movies/{movie_id}', json=update_data)
        assert response.status_code == 200
        assert response.json['data']['title'] == 'Updated Title'
    
    def test_delete_movie(self, client, sample_movies):
        """Test DELETE /api/movies/<id>"""
        movie_id = sample_movies[0]
        response = client.delete(f'/api/movies/{movie_id}')
        assert response.status_code == 200
        assert response.json['data']['deleted_movie_id'] == movie_id
        
        # Verify deletion
        get_response = client.get(f'/api/movies/{movie_id}')
        assert get_response.status_code == 404
    
    def test_get_top_rated_movies(self, app, client):
        """Test GET /api/movies/top-rated"""
        with app.app_context():
            # Create movies and reviews
            movies = [
                Movie(title='Bad Movie', release_year=2020, genre='Action'),
                Movie(title='Good Movie', release_year=2021, genre='Drama'),
            ]
            user = User(username='testuser', email='test@example.com')
            db.session.add_all(movies)
            db.session.add(user)
            db.session.commit()
            
            # Add reviews
            reviews = [
                Review(user_id=user.id, movie_id=movies[0].id, rating=2),
                Review(user_id=user.id, movie_id=movies[1].id, rating=5),
            ]
            db.session.add_all(reviews)
            db.session.commit()
        
        response = client.get('/api/movies/top-rated?limit=10')
        assert response.status_code == 200
        top_movies = response.json['data']['top_rated_movies']
        assert top_movies[0]['title'] == 'Good Movie'
        assert top_movies[0]['average_rating'] == 5.0

class TestMovieModel:
    """Test Movie model methods"""
    
    def test_movie_average_rating(self, app):
        """Test get_average_rating method"""
        with app.app_context():
            user = User(username='testuser', email='test@example.com')
            movie = Movie(title='Test Movie', release_year=2020)
            db.session.add(user)
            db.session.add(movie)
            db.session.commit()
            
            reviews = [
                Review(user_id=user.id, movie_id=movie.id, rating=3),
                Review(user_id=user.id, movie_id=movie.id, rating=5),
            ]
            
            avg = movie.get_average_rating()
            assert avg == 0.0  # No reviews yet
    
    def test_movie_to_dict(self, app):
        """Test to_dict method"""
        with app.app_context():
            movie = Movie(title='Test', release_year=2020, genre='Drama')
            db.session.add(movie)
            db.session.commit()
            
            movie_dict = movie.to_dict()
            assert movie_dict['title'] == 'Test'
            assert movie_dict['release_year'] == 2020
            assert movie_dict['genre'] == 'Drama'