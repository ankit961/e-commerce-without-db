import app
def test_add_to_cart_valid(client):
    res = client.post('/add-to-cart', json={
        "user_id": "testuser",
        "item_id": "item1",
        "quantity": 2
    })
    assert res.status_code == 200
    assert res.get_json()["message"] == "Item added to cart"

def test_add_to_cart_invalid_item(client):
    res = client.post('/add-to-cart', json={
        "user_id": "testuser",
        "item_id": "item999",
        "quantity": 2
    })
    assert res.status_code == 400

def test_checkout_backend_cart(client):
    # Pre-load cart
    client.post('/add-to-cart', json={
        "user_id": "u1",
        "item_id": "item1",
        "quantity": 2
    })
    res = client.post('/checkout', json={"user_id": "u1"})
    assert res.status_code == 200
    data = res.get_json()
    assert "subtotal" in data
    assert "total" in data
    assert data["total"] <= data["subtotal"]

def test_checkout_frontend_cart(client):
    # Pass cart via frontend
    res = client.post('/checkout', json={
        "user_id": "u2",
        "cart": [{"id": 1, "quantity": 1}]
    })
    assert res.status_code == 200
    data = res.get_json()
    assert data["subtotal"] > 0

def test_multi_user_isolation(client):
    # User A adds item
    client.post('/add-to-cart', json={
        "user_id": "userA",
        "item_id": "item1",
        "quantity": 1
    })

    # User B adds item
    client.post('/add-to-cart', json={
        "user_id": "userB",
        "item_id": "item2",
        "quantity": 1
    })

    assert len(app.users_cart["userA"]) == 1
    assert len(app.users_cart["userB"]) == 1
    assert app.users_cart["userA"][0]["item_id"] != app.users_cart["userB"][0]["item_id"]

