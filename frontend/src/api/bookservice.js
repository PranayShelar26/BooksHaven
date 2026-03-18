import api from "../lib/apiClient";

export const getBooks = () => {
  return api.get("/books/");
};

export const getBook = (id) => {
  return api.get(`/books/${id}/`);
};

export const borrowBook = (id) => {
  return api.post(`/books/${id}/borrow/`, {});
};

export const getMyLoans = () => {
  return api.get("/loans/my/");
};

export const ReturnLoan = (id) => {
  return api.post(`/loans/${id}/return/`, {});
};