import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import BookDashboard from "./components/BookDashboard";
import MainLayout from "./components/MainLayout";
import ReaderMain from "./components/ReaderMain";

const App: React.FC = () => {
  return (
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginForm />} />
              <Route path="/book/:id" element={<ReaderMain />} />
            <Route
                path="/dashboard"
                element={
                  // <PrivateRoute>
                    <BookDashboard />
                  // </PrivateRoute>
                }
            />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Router>
      </AuthProvider>
  );
};

export default App;