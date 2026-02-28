import axios from "axios";

const API_URL = "http://localhost:8080/api/auth/";

const register = (username, email, password, role) => {
    return axios.post(API_URL + "signup", {
        username,
        email,
        password,
        role
    });
};

const login = (username, password) => {
    return axios
        .post(API_URL + "signin", {
            username,
            password,
        })
        .then((response) => {
            if (response.data.token) {
                localStorage.setItem("user", JSON.stringify(response.data));
            }

            return response.data;
        });
};

const logout = () => {
    localStorage.removeItem("user");
};

const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem("user"));
};

const authHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
        return { Authorization: 'Bearer ' + user.token };
    } else {
        return {};
    }
};

const AuthService = {
    register,
    login,
    logout,
    getCurrentUser,
    authHeader,
};

export default AuthService;
