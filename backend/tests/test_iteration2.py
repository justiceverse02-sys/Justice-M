"""JusticeVerse Iteration 2 regression tests.
Focus:
  - POST /api/draft auth gating + admin success (en + hi)
  - POST /api/chat visitor 4-query limit (5th -> 402)
  - GET /api/plans free feature text 'Limited Verse AI (4 queries)'
"""
import os
import uuid
import requests
import pytest

BASE_URL = (os.environ.get("REACT_APP_BACKEND_URL")
            or "https://legal-tech-hub-9.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@justiceverse.in"
ADMIN_PASSWORD = "JusticeVerse@2026"


# ---------- fixtures ----------
@pytest.fixture(scope="module")
def admin_session():
    s = requests.Session()
    r = s.post(f"{API}/auth/login",
               json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
               timeout=20)
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    return s


# ---------- Plans (free feature text changed to 4 queries) ----------
class TestPlansFreeText:
    def test_free_plan_lists_4_queries(self):
        r = requests.get(f"{API}/plans", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert "plans" in data
        free = data["plans"].get("free")
        assert free is not None, "free plan missing"
        features = free.get("features", [])
        # Required exact phrase
        target = "Limited Verse AI (4 queries)"
        assert target in features, f"Free plan features missing '{target}'. Got: {features}"


# ---------- Visitor chat 4-query limit ----------
class TestVisitorLimit4:
    def test_visitor_5th_returns_402(self):
        sid = f"sess_{uuid.uuid4().hex[:12]}"
        codes = []
        # 4 should succeed; 5th should be 402
        for i in range(5):
            r = requests.post(
                f"{API}/chat",
                json={"message": f"q{i} - what is bail?", "session_id": sid, "language": "en"},
                timeout=90,
            )
            codes.append(r.status_code)
            if r.status_code == 402:
                break
        # First four must be 200, the fifth attempt must be 402
        assert codes[:4] == [200, 200, 200, 200], f"Expected first 4 = 200; got {codes}"
        assert codes[-1] == 402, f"Expected 5th = 402; got codes={codes}"


# ---------- /api/draft auth gating ----------
class TestDraftAuth:
    def test_draft_unauth_returns_401(self):
        r = requests.post(
            f"{API}/draft",
            json={"draft_type": "Bail Application", "details": "client arrested under section 420 IPC", "language": "en"},
            timeout=15,
        )
        assert r.status_code == 401, f"Expected 401, got {r.status_code} {r.text}"

    def test_draft_admin_en(self, admin_session):
        r = admin_session.post(
            f"{API}/draft",
            json={
                "draft_type": "Bail Application",
                "details": "Accused arrested under Section 420 IPC; first time offender; permanent resident of Mumbai.",
                "language": "en",
            },
            timeout=90,
        )
        assert r.status_code == 200, f"draft en failed: {r.status_code} {r.text[:300]}"
        data = r.json()
        assert "draft" in data and "disclaimer" in data
        assert isinstance(data["draft"], str) and len(data["draft"]) > 100, \
            f"Draft text suspiciously short: {data['draft'][:200]}"
        assert "legal advice" in data["disclaimer"].lower()

    def test_draft_admin_hi(self, admin_session):
        r = admin_session.post(
            f"{API}/draft",
            json={
                "draft_type": "Bail Application",
                "details": "Accused arrested under Section 420 IPC; first time offender.",
                "language": "hi",
            },
            timeout=90,
        )
        assert r.status_code == 200, f"draft hi failed: {r.status_code} {r.text[:300]}"
        data = r.json()
        assert "draft" in data and len(data["draft"]) > 100
        # Soft check: response should contain Devanagari characters when hi requested
        has_devanagari = any("\u0900" <= ch <= "\u097F" for ch in data["draft"])
        assert has_devanagari, "Hindi draft contains no Devanagari characters"
