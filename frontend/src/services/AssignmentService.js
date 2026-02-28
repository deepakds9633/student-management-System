import axios from 'axios';
import AuthService from './AuthService';

const API_URL = 'http://localhost:8080/api/assignments';

const getHeaders = () => {
    const user = AuthService.getCurrentUser();
    return { Authorization: `Bearer ${user?.token}` };
};

const AssignmentService = {
    // Tasks (Staff created)
    createTask: (task) => axios.post(`${API_URL}/tasks`, task, { headers: getHeaders() }),
    getAllTasks: () => axios.get(`${API_URL}/tasks`, { headers: getHeaders() }),
    getTaskById: (id) => axios.get(`${API_URL}/${id}`, { headers: getHeaders() }),

    // Submissions (Student work)
    submitAssignment: (formData) => axios.post(`${API_URL}/submit`, formData, {
        headers: { ...getHeaders(), 'Content-Type': 'multipart/form-data' }
    }),
    getStudentSubmissions: (studentId) => axios.get(`${API_URL}/student/${studentId}`, { headers: getHeaders() }),
    getSubmissionsByTask: (taskId) => axios.get(`${API_URL}/submissions/task/${taskId}`, { headers: getHeaders() }),
    getAllSubmissions: () => axios.get(`${API_URL}`, { headers: getHeaders() }),

    // Grading
    gradeAssignment: (id, data) => axios.put(`${API_URL}/${id}/grade`, data, { headers: getHeaders() }),

    // Reports
    getAnalytics: () => axios.get(`${API_URL}/analytics`, { headers: getHeaders() })
};

export default AssignmentService;
