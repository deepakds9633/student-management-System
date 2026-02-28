import axios from 'axios';
import AuthService from './AuthService';

const REST_API_BASE_URL = "http://localhost:8080/api/students";

// Add a request interceptor
axios.interceptors.request.use(
    config => {
        const user = AuthService.getCurrentUser();
        if (user && user.token) {
            config.headers['Authorization'] = 'Bearer ' + user.token;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

export const listStudents = () => axios.get(REST_API_BASE_URL);

export const createStudent = (student) => axios.post(REST_API_BASE_URL, student);

export const getStudent = (studentId) => axios.get(REST_API_BASE_URL + '/' + studentId);

export const updateStudent = (studentId, student) => axios.put(REST_API_BASE_URL + '/' + studentId, student);

export const deleteStudent = (studentId) => axios.delete(REST_API_BASE_URL + '/' + studentId);
