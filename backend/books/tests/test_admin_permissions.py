from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient

from books.models import Book

API_PREFIX = "/api/"


class AdminPermissionTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Normal user (should be forbidden for admin endpoints)
        self.student = User.objects.create_user(
            username="student2",
            email="student2@example.com",
            password="pass12345",
        )

        # Admin user: admin_required checks user.is_staff
        self.admin = User.objects.create_user(
            username="admin1",
            email="admin1@example.com",
            password="pass12345",
        )
        self.admin.is_staff = True
        self.admin.save()

        # Sample book used for admin book update tests
        self.book = Book.objects.create(
            title="Admin Test Book",
            author="Admin Tester",
            isbn="ISBN-ADMIN-0001",
            total_copies=1,
            available_copies=1,
        )

    def login_as(self, username, password="pass12345"):
        """Session-based login: once successful, the client keeps the session cookie automatically."""
        resp = self.client.post(
            f"{API_PREFIX}auth/login/",
            {"username": username, "password": password},
            format="json",
        )
        self.assertEqual(resp.status_code, 200, resp.content.decode("utf-8"))

    def test_admin_books_requires_admin(self):
        # Student should be denied (403)
        self.login_as("student2")
        resp = self.client.get(f"{API_PREFIX}admin/books/")
        self.assertEqual(resp.status_code, 403, resp.content.decode("utf-8"))

        # Admin should be allowed (200)
        self.login_as("admin1")
        resp2 = self.client.get(f"{API_PREFIX}admin/books/")
        self.assertEqual(resp2.status_code, 200, resp2.content.decode("utf-8"))

    def test_admin_book_detail_requires_admin(self):
        # Student PUT should be denied (403)
        self.login_as("student2")
        resp = self.client.put(
            f"{API_PREFIX}admin/books/{self.book.id}/",
            {"title": "Updated Title"},
            format="json",
        )
        self.assertEqual(resp.status_code, 403, resp.content.decode("utf-8"))

        # Admin PUT should be allowed (200)
        self.login_as("admin1")
        resp2 = self.client.put(
            f"{API_PREFIX}admin/books/{self.book.id}/",
            {"title": "Updated Title"},
            format="json",
        )
        self.assertEqual(resp2.status_code, 200, resp2.content.decode("utf-8"))

    def test_admin_users_list_requires_admin(self):
        # Student GET should be denied (403)
        self.login_as("student2")
        resp = self.client.get(f"{API_PREFIX}admin/users/")
        self.assertEqual(resp.status_code, 403, resp.content.decode("utf-8"))

        # Admin GET should be allowed (200)
        self.login_as("admin1")
        resp2 = self.client.get(f"{API_PREFIX}admin/users/")
        self.assertEqual(resp2.status_code, 200, resp2.content.decode("utf-8"))

    def test_admin_can_create_user(self):
        # Admin can create a new user
        self.login_as("admin1")

        resp = self.client.post(
            f"{API_PREFIX}admin/users/create/",
            {"username": "newuser1", "email": "newuser1@example.com", "password": "pass12345", "is_admin": False},
            format="json",
        )
        self.assertEqual(resp.status_code, 200, resp.content.decode("utf-8"))
        self.assertTrue(User.objects.filter(username="newuser1").exists())