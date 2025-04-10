import pytest
import app
from app import app, users_cart, orders, discount_codes, used_discount_codes, item_stats

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        # Reset global state before each test
        users_cart.clear()
        orders.clear()
        discount_codes.clear()
        used_discount_codes.clear()
        item_stats.clear()
        yield client
