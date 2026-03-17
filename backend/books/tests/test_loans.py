from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient

from books.models import Book, Loan

API_PREFIX = "/api/"


class LoansFlowTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create a normal (non-admin) user for loan-related tests
        self.user = User.objects.create_user(
            username="student1",
            email="student1@example.com",
            password="pass12345",
        )

        # Create a sample book with initial inventory for borrowing/returning flows
        self.book = Book.objects.create(
            title="Test Book",
            author="Tester",
            isbn="ISBN-TEST-0001",
            total_copies=2,
            available_copies=2,
        )

    def login(self):
        """Session-based login: once successful, the client keeps the session cookie automatically."""
        resp = self.client.post(
            f"{API_PREFIX}auth/login/",
            {"username": "student1", "password": "pass12345"},
            format="json",
        )
        self.assertEqual(resp.status_code, 200, getattr(resp, "content", b"").decode("utf-8"))

    def test_borrow_book_success_decrements_available_and_creates_loan(self):
        self.login()

        before_available = Book.objects.get(id=self.book.id).available_copies
        before_loans = Loan.objects.count()

        resp = self.client.post(f"{API_PREFIX}books/{self.book.id}/borrow/", format="json")
        self.assertEqual(resp.status_code, 200, resp.content.decode("utf-8"))

        self.book.refresh_from_db()
        self.assertEqual(self.book.available_copies, before_available - 1)
        self.assertEqual(Loan.objects.count(), before_loans + 1)

        # Ensure an active (not yet returned) loan record exists for this user/book
        loan = Loan.objects.filter(user=self.user, book=self.book, return_date__isnull=True).first()
        self.assertIsNotNone(loan)

    def test_return_loan_success_increments_available_and_sets_return_date(self):
        self.login()

        # Borrow first
        borrow_resp = self.client.post(f"{API_PREFIX}books/{self.book.id}/borrow/", format="json")
        self.assertEqual(borrow_resp.status_code, 200, borrow_resp.content.decode("utf-8"))

        loan = Loan.objects.filter(user=self.user, book=self.book, return_date__isnull=True).first()
        self.assertIsNotNone(loan)

        before_available = Book.objects.get(id=self.book.id).available_copies

        # Return the loan
        ret_resp = self.client.post(f"{API_PREFIX}loans/{loan.id}/return/", format="json")
        self.assertEqual(ret_resp.status_code, 200, ret_resp.content.decode("utf-8"))

        self.book.refresh_from_db()
        loan.refresh_from_db()

        # Inventory increases (capped at total_copies), and return_date should be set
        self.assertEqual(self.book.available_copies, min(self.book.total_copies, before_available + 1))
        self.assertIsNotNone(loan.return_date)

    def test_borrow_fails_when_no_available_copies(self):
        self.login()

        # Force out-of-stock
        self.book.available_copies = 0
        self.book.save()

        resp = self.client.post(f"{API_PREFIX}books/{self.book.id}/borrow/", format="json")
        self.assertEqual(resp.status_code, 400, resp.content.decode("utf-8"))

        self.book.refresh_from_db()
        self.assertEqual(self.book.available_copies, 0)

    def test_return_fails_when_loan_already_returned(self):
        self.login()

        # Borrow
        self.client.post(f"{API_PREFIX}books/{self.book.id}/borrow/", format="json")
        loan = Loan.objects.filter(user=self.user, book=self.book, return_date__isnull=True).first()
        self.assertIsNotNone(loan)

        # Return once (OK)
        r1 = self.client.post(f"{API_PREFIX}loans/{loan.id}/return/", format="json")
        self.assertEqual(r1.status_code, 200, r1.content.decode("utf-8"))

        # Return again (should fail with 400)
        r2 = self.client.post(f"{API_PREFIX}loans/{loan.id}/return/", format="json")
        self.assertEqual(r2.status_code, 400, r2.content.decode("utf-8"))

    def test_my_loans_and_history_endpoints(self):
        self.login()

        # Borrow a book to create an active loan
        self.client.post(f"{API_PREFIX}books/{self.book.id}/borrow/", format="json")
        loan = Loan.objects.filter(user=self.user, book=self.book, return_date__isnull=True).first()
        self.assertIsNotNone(loan)

        # Current loans should include at least one item
        current_resp = self.client.get(f"{API_PREFIX}loans/my/")
        self.assertEqual(current_resp.status_code, 200)
        self.assertTrue(len(current_resp.json()) >= 1)

        # History should be empty before returning
        hist_resp_1 = self.client.get(f"{API_PREFIX}loans/history/")
        self.assertEqual(hist_resp_1.status_code, 200)
        self.assertEqual(len(hist_resp_1.json()), 0)

        # After returning: current decreases and history increases
        self.client.post(f"{API_PREFIX}loans/{loan.id}/return/", format="json")

        current_resp_2 = self.client.get(f"{API_PREFIX}loans/my/")
        self.assertEqual(current_resp_2.status_code, 200)

        hist_resp_2 = self.client.get(f"{API_PREFIX}loans/history/")
        self.assertEqual(hist_resp_2.status_code, 200)
        self.assertTrue(len(hist_resp_2.json()) >= 1)