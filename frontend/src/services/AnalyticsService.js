import axios from 'axios';
import AuthService from './AuthService';

const API_URL = 'http://localhost:8080/api/analytics';

class AnalyticsService {
    getDashboardStats() {
        return axios.get(`${API_URL}/dashboard-stats`, { headers: AuthService.authHeader() });
    }

    getMarksSummary() {
        return axios.get(`${API_URL}/marks-summary`, { headers: AuthService.authHeader() });
    }

    getAttendanceTrends(period) {
        return axios.get(`${API_URL}/attendance-trends`, {
            params: { period },
            headers: AuthService.authHeader()
        });
    }

    getStaffDashboardStats() {
        return axios.get(`${API_URL}/staff-dashboard-stats`, { headers: AuthService.authHeader() });
    }
}

export default new AnalyticsService();
