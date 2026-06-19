import os
import sys
import pytest


def test_raises_on_missing_secret_key(monkeypatch):
    """auth.py must refuse to load when SECRET_KEY is absent."""
    original = sys.modules.pop("auth", None)
    monkeypatch.delenv("SECRET_KEY", raising=False)

    # Prevent load_dotenv from silently restoring the key from .env
    import dotenv
    monkeypatch.setattr(dotenv, "load_dotenv", lambda *args, **kwargs: None)

    try:
        with pytest.raises(RuntimeError, match="SECRET_KEY"):
            import auth  # noqa: F401
    finally:
        sys.modules.pop("auth", None)
        if original is not None:
            sys.modules["auth"] = original


def test_create_token_returns_string():
    """create_token produces a non-empty JWT string."""
    from auth import create_token
    token = create_token("testuser")
    assert isinstance(token, str)
    assert len(token) > 0
