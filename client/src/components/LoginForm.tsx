import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import "./LoginForm.css"

const LoginForm: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(username, password);
            navigate('/dashboard');
        } catch (error) {
            setError('Failed to login. Please check your credentials.');
            console.error('Login error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className= "d-flex  flex-column flex-md-row min-vh-100 p-0 min-vw-100" >
            <Container className="d-flex bg-pulse g-0 w-md-50 align-items-center">
                <div className="animated-word">
                    <span>W</span>
                    <span>U</span>
                    <span>X</span>
                    <span>I</span>
                    <span>A</span>
                </div>

            </Container>
            <Container className="d-flex align-items-center justify-content-center w-100 w-md-50 p-4">
                {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit} className="w-100" style={{ maxWidth: '400px' }}>
                <h2 className="fw-bold mb-4">Login</h2>
                <Form.Group className="mb-3" controlId="username" >
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        autoComplete="username"
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="password">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                    />
                </Form.Group>

                <Button variant="primary" type="submit" disabled={loading} className="w-100">
                    {loading ? 'Logging in...' : 'Login'}
                </Button>
            </Form>
        </Container>
        </Container>
    );
};

export default LoginForm;