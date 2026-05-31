"""JusticeVerse comprehensive backend regression tests."""
import os
import uuid
import time
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://legal-tech-hub-9.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@justiceverse.in"
ADMIN_PASSWORD = "JusticeVerse@2026"

TEST_USER_EMAIL = f"test_user_{uuid.uuid4().hex[:8]}@example.com"
TEST_USER_PASSWORD = "TestPass@123"
TEST_USER_NAME = "Test User"


# ---------- fixtures ----------
@pytest.fixture(scope="session")
def admin_session():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=20)
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    return s


@pytest.fixture(scope="session")
def user_session():
    s = requests.Session()
    r = s.post(f"{API}/auth/register", json={
        "name": TEST_USER_NAME, "email": TEST_USER_EMAIL, "password": TEST_USER_PASSWORD,
    }, timeout=20)
    assert r.status_code == 200, f"Register failed: {r.status_code} {r.text}"
    return s


# ---------- Health ----------
class TestHealth:
    def test_root(self):
        r = requests.get(f"{API}/", timeout=10)
        assert r.status_code == 200
        assert r.json().get("status") == "ok"


# ---------- Auth ----------
class TestAuth:
    def test_register_and_me(self, user_session):
        r = user_session.get(f"{API}/auth/me", timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert data["email"] == TEST_USER_EMAIL
        assert data["role"] == "user"
        assert "password_hash" not in data

    def test_register_duplicate(self):
        r = requests.post(f"{API}/auth/register", json={
            "name": "x", "email": TEST_USER_EMAIL, "password": "x",
        }, timeout=10)
        assert r.status_code == 400

    def test_admin_login_role(self, admin_session):
        r = admin_session.get(f"{API}/auth/me", timeout=10)
        assert r.status_code == 200
        assert r.json()["role"] == "admin"

    def test_me_unauthenticated(self):
        r = requests.get(f"{API}/auth/me", timeout=10)
        assert r.status_code == 401

    def test_logout(self):
        s = requests.Session()
        s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=10)
        r = s.post(f"{API}/auth/logout", timeout=10)
        assert r.status_code == 200

    def test_brute_force_lockout(self):
        email = f"lockout_{uuid.uuid4().hex[:6]}@example.com"
        # Use unique email so we don't lock other tests
        last_code = None
        for _ in range(6):
            r = requests.post(f"{API}/auth/login", json={"email": email, "password": "wrong"}, timeout=10)
            last_code = r.status_code
        # After 5 failed attempts, the 6th should return 429
        assert last_code == 429, f"Expected 429 after 5 failed attempts, got {last_code}"


# ---------- JusticeBot AI ----------
class TestChat:
    def test_visitor_chat(self):
        r = requests.post(f"{API}/chat", json={"message": "What is Section 65B?", "language": "en"}, timeout=60)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "reply" in data and "disclaimer" in data
        assert "legal advice" in data["disclaimer"].lower()

    def test_visitor_limit(self):
        sid = f"sess_{uuid.uuid4().hex[:12]}"
        last_code = None
        for i in range(7):
            r = requests.post(f"{API}/chat", json={"message": f"q{i}", "session_id": sid, "language": "en"}, timeout=60)
            last_code = r.status_code
            if last_code == 402:
                break
        assert last_code == 402, f"Expected 402 visitor limit, got {last_code}"

    def test_authenticated_chat(self, user_session):
        r = user_session.post(f"{API}/chat", json={"message": "Explain bail under BNSS", "language": "en"}, timeout=60)
        assert r.status_code == 200, r.text
        assert "reply" in r.json()


# ---------- Legal Database ----------
class TestLegal:
    def test_list_legal(self):
        r = requests.get(f"{API}/legal", timeout=10)
        assert r.status_code == 200
        docs = r.json()
        assert isinstance(docs, list) and len(docs) > 0
        assert "id" in docs[0]

    def test_search(self):
        r = requests.get(f"{API}/legal", params={"q": "65B"}, timeout=10)
        assert r.status_code == 200
        assert len(r.json()) >= 1

    def test_filter_category(self):
        r = requests.get(f"{API}/legal", params={"category": "Statutes"}, timeout=10)
        assert r.status_code == 200
        for d in r.json():
            assert d["category"] == "Statutes"

    def test_get_legal_by_id(self):
        docs = requests.get(f"{API}/legal", timeout=10).json()
        doc_id = docs[0]["id"]
        r = requests.get(f"{API}/legal/{doc_id}", timeout=10)
        assert r.status_code == 200
        assert r.json()["id"] == doc_id

    def test_get_legal_404(self):
        r = requests.get(f"{API}/legal/nonexistent", timeout=10)
        assert r.status_code == 404


# ---------- Knowledge Hub ----------
class TestHub:
    def test_articles(self):
        r = requests.get(f"{API}/articles", timeout=10)
        assert r.status_code == 200
        arts = r.json()
        assert len(arts) > 0
        return arts

    def test_article_detail(self):
        arts = requests.get(f"{API}/articles", timeout=10).json()
        r = requests.get(f"{API}/articles/{arts[0]['id']}", timeout=10)
        assert r.status_code == 200

    def test_news(self):
        r = requests.get(f"{API}/news", timeout=10)
        assert r.status_code == 200
        assert len(r.json()) > 0

    def test_news_filter(self):
        r = requests.get(f"{API}/news", params={"category": "Supreme Court"}, timeout=10)
        assert r.status_code == 200
        for n in r.json():
            assert n["category"] == "Supreme Court"


# ---------- Careers ----------
class TestCareers:
    def test_list_vacancies(self):
        r = requests.get(f"{API}/vacancies", timeout=10)
        assert r.status_code == 200
        assert len(r.json()) > 0

    def test_vacancy_filter(self):
        r = requests.get(f"{API}/vacancies", params={"type": "internship"}, timeout=10)
        assert r.status_code == 200
        for v in r.json():
            assert v["type"] == "internship"

    def test_apply_requires_auth(self):
        r = requests.post(f"{API}/applications", json={
            "vacancy_id": "x", "name": "x", "email": "x@x.com"
        }, timeout=10)
        assert r.status_code == 401

    def test_apply_and_list(self, user_session):
        vacs = requests.get(f"{API}/vacancies", timeout=10).json()
        vac_id = vacs[0]["id"]
        r = user_session.post(f"{API}/applications", json={
            "vacancy_id": vac_id, "name": TEST_USER_NAME, "email": TEST_USER_EMAIL,
            "cover_note": "I'm keen on this.",
        }, timeout=10)
        assert r.status_code == 200, r.text
        assert r.json()["status"] == "submitted"
        r2 = user_session.get(f"{API}/my/applications", timeout=10)
        assert r2.status_code == 200
        assert any(a["vacancy_id"] == vac_id for a in r2.json())


# ---------- Saved items ----------
class TestSaved:
    def test_saved_requires_auth(self):
        r = requests.get(f"{API}/saved", timeout=10)
        assert r.status_code == 401

    def test_save_get_delete(self, user_session):
        r = user_session.post(f"{API}/saved", json={
            "item_type": "article", "item_id": "art_123", "title": "TEST_Saved",
        }, timeout=10)
        assert r.status_code == 200
        item_id = r.json()["id"]
        r2 = user_session.get(f"{API}/saved", timeout=10)
        assert r2.status_code == 200 and any(s["id"] == item_id for s in r2.json())
        r3 = user_session.delete(f"{API}/saved/{item_id}", timeout=10)
        assert r3.status_code == 200


# ---------- Payments ----------
class TestPayments:
    def test_plans(self):
        r = requests.get(f"{API}/plans", timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert "plans" in data and "key_id" in data
        assert data["key_id"].startswith("rzp_")

    def test_create_order_requires_auth(self):
        r = requests.post(f"{API}/payments/create-order", json={"plan": "student"}, timeout=10)
        assert r.status_code == 401

    def test_create_order_invalid_plan(self, user_session):
        r = user_session.post(f"{API}/payments/create-order", json={"plan": "free"}, timeout=10)
        assert r.status_code == 400

    def test_create_order(self, user_session):
        r = user_session.post(f"{API}/payments/create-order", json={"plan": "student"}, timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["order_id"].startswith("order_")
        assert data["amount"] == 29900

    def test_verify_fake_signature(self, user_session):
        r = user_session.post(f"{API}/payments/verify", json={
            "razorpay_order_id": "order_fake", "razorpay_payment_id": "pay_fake",
            "razorpay_signature": "sig_fake", "plan": "student",
        }, timeout=10)
        assert r.status_code == 400


# ---------- Admin ----------
class TestAdmin:
    def test_admin_stats(self, admin_session):
        r = admin_session.get(f"{API}/admin/stats", timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert "users" in data and "articles" in data

    def test_admin_users(self, admin_session):
        r = admin_session.get(f"{API}/admin/users", timeout=10)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_non_admin_forbidden(self, user_session):
        r = user_session.get(f"{API}/admin/stats", timeout=10)
        assert r.status_code == 403

    def test_admin_article_crud(self, admin_session):
        # CREATE
        r = admin_session.post(f"{API}/admin/articles", json={
            "title": "TEST_Article", "category": "Test", "excerpt": "Test excerpt",
            "content": "Test body", "author": "tester",
        }, timeout=10)
        assert r.status_code == 200
        aid = r.json()["id"]
        # GET via public route to verify persistence
        r2 = requests.get(f"{API}/articles/{aid}", timeout=10)
        assert r2.status_code == 200
        assert r2.json()["title"] == "TEST_Article"
        # DELETE
        r3 = admin_session.delete(f"{API}/admin/articles/{aid}", timeout=10)
        assert r3.status_code == 200
        # Verify removal
        assert requests.get(f"{API}/articles/{aid}", timeout=10).status_code == 404

    def test_admin_news_crud(self, admin_session):
        r = admin_session.post(f"{API}/admin/news", json={
            "title": "TEST_News", "category": "Supreme Court", "summary": "TEST",
        }, timeout=10)
        assert r.status_code == 200
        nid = r.json()["id"]
        r2 = admin_session.delete(f"{API}/admin/news/{nid}", timeout=10)
        assert r2.status_code == 200

    def test_admin_legal_crud(self, admin_session):
        r = admin_session.post(f"{API}/admin/legal", json={
            "title": "TEST_Legal", "summary": "TEST", "category": "Supreme Court",
        }, timeout=10)
        assert r.status_code == 200
        lid = r.json()["id"]
        assert requests.get(f"{API}/legal/{lid}", timeout=10).status_code == 200
        admin_session.delete(f"{API}/admin/legal/{lid}", timeout=10)

    def test_admin_vacancy_crud(self, admin_session):
        r = admin_session.post(f"{API}/admin/vacancies", json={
            "title": "TEST_Vacancy", "organization": "Test Co", "type": "internship",
            "description": "TEST",
        }, timeout=10)
        assert r.status_code == 200
        vid = r.json()["id"]
        admin_session.delete(f"{API}/admin/vacancies/{vid}", timeout=10)

    def test_admin_applications(self, admin_session):
        r = admin_session.get(f"{API}/admin/applications", timeout=10)
        assert r.status_code == 200
        assert isinstance(r.json(), list)
