def test_coupon_validation_flow(client):
    from app import discount_codes, used_discount_codes

    # Add new code
    discount_codes["TEST123"] = True

    # Validate unused code
    res = client.post('/validate-coupon', json={"code": "TEST123"})
    assert res.get_json()["valid"] is True

    # Use the code
    used_discount_codes.add("TEST123")

    # Validate again
    res = client.post('/validate-coupon', json={"code": "TEST123"})
    assert res.get_json()["valid"] is False

def test_invalid_coupon(client):
    res = client.post('/validate-coupon', json={"code": "FAKECODE"})
    assert res.get_json()["valid"] is False
