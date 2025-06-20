import React from 'react';
import { Button, Container } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import FileUpload from './FileUpload';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Container className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Welcome, {user?.username}!</h2>
                <Button variant="danger" onClick={handleLogout}>
                    Logout
                </Button>
            </div>

            <FileUpload />
        </Container>
    );
};

export default Dashboard;