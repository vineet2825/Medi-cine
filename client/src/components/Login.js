import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('login'); // login, verify
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/auth/login', { email, password });
            
            if (res.data.step === 'verify') {
                setStep('verify');
                if (res.data.otp) {
                    console.log(`[DEV MODE] Verification OTP: ${res.data.otp}`);
                }
                return;
            }

            login(res.data);
            navigate(res.data.role === 'admin' ? '/admin' : '/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/auth/verify-otp', { email, otp });
            login(res.data);
            navigate(res.data.role === 'admin' ? '/admin' : '/');
        } catch (err) {
            setError(err.response?.data?.message || 'OTP verification failed');
        } finally {
            setLoading(false);
        }
    };

    if (loading && step === 'login') return <Loader fullPage />;

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>{step === 'login' ? 'Welcome Back' : 'Verify Account'}</h2>
                <p className="auth-subtitle">
                    {step === 'login' ? 'Sign in to manage your medicine requests' : `Please verify your email to continue`}
                </p>

                {error && <div className="alert alert-error">{error}</div>}

                {step === 'login' ? (
                    <form onSubmit={handleLogin} className="form">
                        <div className="form-group">
                            <label>Email Address</label>
                            <input 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                                placeholder="name@example.com"
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input 
                                type="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                                placeholder="••••••••"
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="form">
                        <div className="form-group">
                            <label>Enter 6-digit OTP</label>
                            <input 
                                type="text" 
                                value={otp} 
                                onChange={(e) => setOtp(e.target.value)} 
                                required 
                                maxLength="6"
                                placeholder="000000"
                                className="otp-input-field"
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify & Login'}
                        </button>
                        <button type="button" className="btn-secondary-link" onClick={() => setStep('login')}>
                            Back to Login
                        </button>
                    </form>
                )}

                <div className="auth-footer">
                    <span>Don't have an account? </span>
                    <Link to="/register">Create one now</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
