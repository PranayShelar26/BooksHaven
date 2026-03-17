from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient

from books.models import Book, Loan

API_PREFIX = "/api/"


class LoansFlowTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # 普通用户（student）
        self.user = User.objects.create_user(
            username="student1",
            email="student1@example.com",
            password="pass12345",
        )

        # 测试书籍（字段按你们 Book 模型常见字段写；如果你们 Book 必填字段更多，再补上）
        self.book = Book.objects.create(
            title="Test Book",
            author="Tester",
            isbn="ISBN-TEST-0001",
            total_copies=2,
            available_copies=2,
        )

    def login(self):
        """你们使用 Django session login，所以只要调用登录接口成功，client 会自动带 cookie。"""
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

        # 检查是否存在未归还 loan
        loan = Loan.objects.filter(user=self.user, book=self.book, return_date__isnull=True).first()
        self.assertIsNotNone(loan)

    def test_return_loan_success_increments_available_and_sets_return_date(self):
        self.login()

        # 先借
        borrow_resp = self.client.post(f"{API_PREFIX}books/{self.book.id}/borrow/", format="json")
        self.assertEqual(borrow_resp.status_code, 200, borrow_resp.content.decode("utf-8"))

        loan = Loan.objects.filter(user=self.user, book=self.book, return_date__isnull=True).first()
        self.assertIsNotNone(loan)

        before_available = Book.objects.get(id=self.book.id).available_copies

        # 再还
        ret_resp = self.client.post(f"{API_PREFIX}loans/{loan.id}/return/", format="json")
        self.assertEqual(ret_resp.status_code, 200, ret_resp.content.decode("utf-8"))

        self.book.refresh_from_db()
        loan.refresh_from_db()

        self.assertEqual(self.book.available_copies, min(self.book.total_copies, before_available + 1))
        self.assertIsNotNone(loan.return_date)

    def test_borrow_fails_when_no_available_copies(self):
        self.login()

        self.book.available_copies = 0
        self.book.save()

        resp = self.client.post(f"{API_PREFIX}books/{self.book.id}/borrow/", format="json")
        self.assertEqual(resp.status_code, 400, resp.content.decode("utf-8"))

        self.book.refresh_from_db()
        self.assertEqual(self.book.available_copies, 0)

    def test_return_fails_when_loan_already_returned(self):
        self.login()

        # 借
        self.client.post(f"{API_PREFIX}books/{self.book.id}/borrow/", format="json")
        loan = Loan.objects.filter(user=self.user, book=self.book, return_date__isnull=True).first()
        self.assertIsNotNone(loan)

        # 还第一次
        r1 = self.client.post(f"{API_PREFIX}loans/{loan.id}/return/", format="json")
        self.assertEqual(r1.status_code, 200, r1.content.decode("utf-8"))

        # 再还一次（应该 400）
        r2 = self.client.post(f"{API_PREFIX}loans/{loan.id}/return/", format="json")
        self.assertEqual(r2.status_code, 400, r2.content.decode("utf-8"))

    def test_my_loans_and_history_endpoints(self):
        self.login()

        # 先借一本
        self.client.post(f"{API_PREFIX}books/{self.book.id}/borrow/", format="json")
        loan = Loan.objects.filter(user=self.user, book=self.book, return_date__isnull=True).first()
        self.assertIsNotNone(loan)

        # current loans 应该有
        current_resp = self.client.get(f"{API_PREFIX}loans/my/")
        self.assertEqual(current_resp.status_code, 200)
        self.assertTrue(len(current_resp.json()) >= 1)

        # history loans 应该没有
        hist_resp_1 = self.client.get(f"{API_PREFIX}loans/history/")
        self.assertEqual(hist_resp_1.status_code, 200)
        self.assertEqual(len(hist_resp_1.json()), 0)

        # 还书后：current 变少，history 变多
        self.client.post(f"{API_PREFIX}loans/{loan.id}/return/", format="json")

        current_resp_2 = self.client.get(f"{API_PREFIX}loans/my/")
        self.assertEqual(current_resp_2.status_code, 200)

        hist_resp_2 = self.client.get(f"{API_PREFIX}loans/history/")
        self.assertEqual(hist_resp_2.status_code, 200)
        self.assertTrue(len(hist_resp_2.json()) >= 1)