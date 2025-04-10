import app

def test_checkout_with_discount_code(client):
    # Setup a valid coupon
    app.discount_codes["UNIQUE10"] = True

    # Add item to cart
    app.users_cart["discuser"].append({
        "item_id": "item2",
        "quantity": 1
    })

    # Checkout with discount
    res = client.post('/checkout', json={
        "user_id": "discuser",
        "discount_code": "UNIQUE10"
    })

    data = res.get_json()
    assert res.status_code == 200
    assert data["discount"] > 0
    assert data["total"] < data["subtotal"]
    assert "UNIQUE10" in app.used_discount_codes

def test_checkout_reuse_discount_code(client):
    # Set used manually
    app.discount_codes["REUSE10"] = True
    app.used_discount_codes.add("REUSE10")

    app.users_cart["reuseuser"].append({
        "item_id": "item3",
        "quantity": 1
    })

    res = client.post('/checkout', json={
        "user_id": "reuseuser",
        "discount_code": "REUSE10"
    })

    assert res.status_code == 400
    assert "error" in res.get_json()

def test_checkout_with_invalid_item_id(client):
    res = client.post('/checkout', json={
        "user_id": "brokenuser",
        "cart": [{"id": 999, "quantity": 1}]
    })
    assert res.status_code == 400 or res.get_json()["subtotal"] == 0
