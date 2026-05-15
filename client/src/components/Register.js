import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        
        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }

        setLoading(true);
        try {
            const res = await api.post('/auth/register', {
                name: formData.name,
                email: formData.email,
                password: formData.password
            });
            // Login directly after successful registration
            login(res.data);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader fullPage />;

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Create Account</h2>
                <p className="auth-subtitle">
                    Join MediStock to start requesting medicines
                </p>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleRegister} className="form">
                    <div className="form-group">
                        <label>Full Name</label>
                        <input 
                            type="text" 
                            name="name"
                            value={formData.name} 
                            onChange={handleChange} 
                            required 
                            placeholder="John Doe"
                        />
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input 
                            type="email" 
                            name="email"
                            value={formData.email} 
                            onChange={handleChange} 
                            required 
                            placeholder="john@example.com"
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            name="password"
                            value={formData.password} 
                            onChange={handleChange} 
                            required 
                            placeholder="••••••••"
                            minLength="6"
                        />
                    </div>
                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input 
                            type="password" 
                            name="confirmPassword"
                            value={formData.confirmPassword} 
                            onChange={handleChange} 
                            required 
                            placeholder="••••••••"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>

                <div className="auth-footer">
                    <span>Already have an account? </span>
                    <Link to="/login">Sign In</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
