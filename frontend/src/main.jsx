import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import App from './App.jsx'
import axios from 'axios'

// Intercept all Axios requests
axios.interceptors.request.use((config) => {
  // If we are in production, replace localhost:8080 with the live backend URL
  const prodUrl = import.meta.env.VITE_API_BASE_URL;
  if (prodUrl && config.url.includes("http://localhost:8080")) {
    config.url = config.url.replace("http://localhost:8080", prodUrl);
  }
  return config;
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
