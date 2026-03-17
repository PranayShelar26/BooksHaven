import axios from "axios";

const API_URL = "/api"

export const getBooks = () =>{
    return axios.get(`${API_URL}/books/`);
}

export const getBook = (id) =>{
    return axios.get(`${API_URL}/books/${id}/`);
}

export const borrowBook = (id) =>{
    return axios.get(`${API_URL}/books/${id}/borrow/`);
}

export const getMyLoans = () =>{
    return axios.get(`${API_URL}/loans/my/`);
}

export const ReturnLoan = (id) =>{
    return axios.get(`${API_URL}/loans/${id}/return/`);
}

