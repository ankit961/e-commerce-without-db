import app
from app import orders, discount_codes, NTH_ORDER

def test_generate_discount_eligibility(client):
    # Create NTH_ORDER - 1 orders
    for i in range(NTH_ORDER - 1):
        orders.append({
            "user_id": f"user{i}",
            "items": [],
            "subtotal": 100,
            "discount": 0,
            "total": 100
        })

    # Should not be eligible yet
    res = client.post('/admin/generate-discount')
    assert "message" in res.get_json()

    # Add final N-th order
    orders.append({
        "user_id": "nth-user",
        "items": [],
        "subtotal": 100,
        "discount": 0,
        "total": 100
    })

    # Now eligible
    res = client.post('/admin/generate-discount')
    data = res.get_json()
    assert "code" in data
    assert data["code"] in discount_codes


def test_admin_stats(client):
    app.item_stats["item1"] = 3
    app.total_sales = 150
    app.total_discount_amount = 15

    res = client.get('/admin/stats')
    data = res.get_json()
    
    assert data["items_purchased"]["item1"] == 3
    assert data["total_sales"] == 150
    assert data["total_discount_amount"] == 15

import app

def test_discount_generated_on_exact_nth_order(client):
    # Simulate orders just before NTH_ORDER
    for i in range(app.NTH_ORDER - 1):
        app.orders.append({
            "user_id": f"mockuser{i}",
            "items": [],
            "subtotal": 50,
            "discount": 0,
            "total": 50
        })

    # Not eligible yet
    res = client.post('/admin/generate-discount')
    assert "message" in res.get_json()
    assert "code" not in res.get_json()

    # Add the N-th order
    app.orders.append({
        "user_id": "mock-nth-user",
        "items": [],
        "subtotal": 50,
        "discount": 0,
        "total": 50
    })

    # Now eligible
    res = client.post('/admin/generate-discount')
    data = res.get_json()
    assert "code" in data
    assert data["code"] in app.discount_codes


