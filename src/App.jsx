   
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { SpeedInsights } from "@vercel/speed-insights/react";
import './App.css';
import Header from './components/layout/Header';
import AdminPage from './pages/AdminPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
    return (
        <BrowserRouter>
            <SpeedInsights />
            <Header />
            <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
