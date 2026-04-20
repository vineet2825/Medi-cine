import React, { useState, useEffect } from 'react';
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
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('register'); // register, otp
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(0);
    const [resendLoading, setResendLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

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
            setStep('otp');
            setTimer(60);
            if (res.data.otp) {
                console.log(`[DEV MODE] Received OTP: ${res.data.otp}`);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/auth/verify-otp', {
                email: formData.email,
                otp
            });
            login(res.data);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'OTP verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (timer > 0) return;
        
        setError('');
        setResendLoading(true);
        try {
            const res = await api.post('/auth/resend-otp', {
                email: formData.email
            });
            setTimer(60);
            if (res.data.otp) {
                console.log(`[DEV MODE] New OTP: ${res.data.otp}`);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setResendLoading(false);
        }
    };

    if (loading && step === 'register') return <Loader fullPage />;

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>{step === 'register' ? 'Create Account' : 'Verify Email'}</h2>
                <p className="auth-subtitle">
                    {step === 'register' ? 'Join MediStock to start requesting medicines' : `We've sent a code to ${formData.email}`}
                </p>

                {error && <div className="alert alert-error">{error}</div>}

                {step === 'register' ? (
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
                            {loading ? 'Sending OTP...' : 'Register'}
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
                            {loading ? 'Verifying...' : 'Verify & Complete'}
                        </button>
                        
                        <div className="resend-container">
                            {timer > 0 ? (
                                <p className="timer-text">Resend code in <span>{timer}s</span></p>
                            ) : (
                                <button 
                                    type="button" 
                                    className="btn-link" 
                                    onClick={handleResendOtp}
                                    disabled={resendLoading}
                                >
                                    {resendLoading ? 'Resending...' : 'Resend Code'}
                                </button>
                            )}
                        </div>

                        <button type="button" className="btn-secondary-link" onClick={() => setStep('register')}>
                            Back to Registration
                        </button>
                    </form>
                )}

                {step === 'register' && (
                    <div className="auth-footer">
                        <span>Already have an account? </span>
                        <Link to="/login">Sign In</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Register;
