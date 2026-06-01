import os
from dotenv import load_dotenv
# Load .env file FIRST
load_dotenv()

from flask import Flask, jsonify
from config import config
from models import db
from routes.movies import movies_bp
from routes.reviews import reviews_bp
from routes.users import users_bp

# 🚀 PROMETHEUS METRICS IMPORT
from prometheus_flask_exporter import PrometheusMetrics  

def create_app(config_name='development'):
    """Application factory"""
    app = Flask(__name__)
    
    # 🚀 INITIALIZE METRICS PATH AT /metrics
    metrics = PrometheusMetrics(app, path='/metrics')  

    # Load configuration
    app.config.from_object(config[config_name])

    # Initialize database
    db.init_app(app)

    # Register blueprints
    app.register_blueprint(movies_bp)
    app.register_blueprint(reviews_bp)
    app.register_blueprint(users_bp)

    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'success': False,
            'error': 'Endpoint not found'
        }), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({
            'success': False,
            'error': 'Method not allowed'
        }), 405

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'message': 'Movie Review API is running'
        }), 200

    return app

if __name__ == '__main__':
    app = create_app(os.getenv('FLASK_ENV', 'development'))
    print("🚀 Starting Flask app...")
    print("📍 API running at: http://localhost:5001")
    app.run(debug=True, host='0.0.0.0', port=5001)

