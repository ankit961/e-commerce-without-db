def test_get_items(client):
    res = client.get('/items')
    assert res.status_code == 200
    items = res.get_json()
    assert isinstance(items, list)
    assert len(items) > 0
    assert "name" in items[0]
    assert "price" in items[0]
