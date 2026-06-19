import pytest


VITE_ORIGIN = "http://localhost:5173"


def test_cors_header_present_on_login_response(client):
    """Responses to cross-origin requests must include CORS headers."""
    response = client.post(
        "/login",
        json={"username": "nobody", "password": "wrong"},
        headers={"Origin": VITE_ORIGIN},
    )
    assert "access-control-allow-origin" in response.headers, (
        "CORS middleware is missing — frontend cannot reach the API"
    )


def test_cors_preflight_allowed(client):
    """OPTIONS preflight for /login must succeed with CORS headers."""
    response = client.options(
        "/login",
        headers={
            "Origin": VITE_ORIGIN,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type",
        },
    )
    assert response.status_code == 200
    assert "access-control-allow-origin" in response.headers


def test_login_bad_credentials_returns_401(client):
    """Invalid credentials must return 401, not 500."""
    response = client.post("/login", json={"username": "nobody", "password": "wrong"})
    assert response.status_code == 401


def test_login_success(client):
    """A seeded user can log in and receives a bearer token."""
    import users
    from auth import hash_password
    from tests.conftest import TestingSessionLocal

    db = TestingSessionLocal()
    db.add(users.User(username="admin", hashed_password=hash_password("testpass")))
    db.commit()
    db.close()

    response = client.post("/login", json={"username": "admin", "password": "testpass"})
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"
