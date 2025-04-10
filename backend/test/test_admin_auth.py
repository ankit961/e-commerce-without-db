import base64

def create_auth_header(username, password):
    auth_str = f"{username}:{password}"
    auth_bytes = auth_str.encode('utf-8')
    return {
        "Authorization": "Basic " + base64.b64encode(auth_bytes).decode('utf-8')
    }

def test_admin_access_with_valid_credentials(client):
    headers = create_auth_header("admin", "secret123")
    res = client.get("/admin", headers=headers)
    assert res.status_code in [200, 404]  

def test_admin_access_with_invalid_credentials(client):
    headers = create_auth_header("admin", "wrongpass")
    res = client.get("/admin", headers=headers)
    assert res.status_code == 401

def test_admin_access_without_credentials(client):
    res = client.get("/admin")
    assert res.status_code == 401
