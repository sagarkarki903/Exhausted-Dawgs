import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios'; // 👈 Import axios
import './index.css';
import App from './App.jsx';
import { Toaster } from "react-hot-toast";

// ✅ Set this globally to ensure all requests include cookies
axios.defaults.withCredentials = true;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster position="top-right" />
  </StrictMode>
);
