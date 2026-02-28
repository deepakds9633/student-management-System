import axios from 'axios';
import AuthService from './AuthService';

const API_URL = 'http://localhost:8080/api/notifications';

const getAuthHeaders = () => {
    const user = AuthService.getCurrentUser();
    return { Authorization: `Bearer ${user?.token}` };
};

const getAll = (role, type) => {
    const params = { role };
    if (type) params.type = type;
    return axios.get(API_URL, { headers: getAuthHeaders(), params });
};

const getById = (id) => {
    return axios.get(`${API_URL}/${id}`, { headers: getAuthHeaders() });
};

const create = (formData) => {
    return axios.post(`${API_URL}/with-file`, formData, {
        headers: getAuthHeaders()
    });
};

const update = (id, formData) => {
    return axios.put(`${API_URL}/${id}`, formData, {
        headers: getAuthHeaders()
    });
};

const remove = (id) => {
    return axios.delete(`${API_URL}/${id}`, { headers: getAuthHeaders() });
};

const getCount = (since, role) => {
    const params = { since };
    if (role) params.role = role;
    return axios.get(`${API_URL}/count`, { headers: getAuthHeaders(), params });
};

const AnnouncementService = {
    getAll,
    getById,
    create,
    update,
    remove,
    getCount,
};

export default AnnouncementService;
