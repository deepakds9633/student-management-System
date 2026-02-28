import axios from 'axios';
import AuthService from './AuthService';

const API_URL = 'http://localhost:8080/api/events';

class EventService {
    getAllEvents() {
        return axios.get(API_URL, { headers: AuthService.authHeader() });
    }

    createEvent(event) {
        return axios.post(API_URL, event, { headers: AuthService.authHeader() });
    }

    updateEvent(id, event) {
        return axios.put(`${API_URL}/${id}`, event, { headers: AuthService.authHeader() });
    }

    deleteEvent(id) {
        return axios.delete(`${API_URL}/${id}`, { headers: AuthService.authHeader() });
    }
}

export default new EventService();
