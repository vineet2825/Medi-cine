import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

const AddMedicine = () => {
    const { user } = useAuth();
    const [catalog, setCatalog] = useState([]);
    const [formData, setFormData] = useState({
        medicineName: '',
        companyName: '',
        quantity: '',
        requiredDate: ''
    });
    
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // History State
    const [historySearchTerm, setHistorySearchTerm] = useState(user?.name || '');
    const [userHistory, setUserHistory] = useState(null);
    const [historyLoading, setHistoryLoading] = useState(false);

    useEffect(() => {
        const fetchCatalog = async () => {
            try {
                const res = await api.get('/medicine');
                setCatalog(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Could not fetch catalog");
                setLoading(false);
            }
        };

        const fetchMyHistory = async () => {
            if (!user?.name) return;
            setHistoryLoading(true);
            try {
                const res = await api.get(`/request/user/${user.name}`);
                setUserHistory(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setHistoryLoading(false);
            }
        };

        fetchCatalog();
        fetchMyHistory();
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSelectTablet = (name, company) => {
        setFormData({ ...formData, medicineName: name, companyName: company });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        setMessage('');
        setError('');

        try {
            await api.post('/request', {
                ...formData,
                userName: user?.name
            });
            setMessage('Medicine request submitted successfully!');
            setFormData({
                medicineName: '',
                companyName: '',
                quantity: '',
                requiredDate: ''
            });
            // Refresh history
            const res = await api.get(`/request/user/${user.name}`);
            setUserHistory(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Error submitting request');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleHistorySearch = async (e) => {
        e.preventDefault();
        if (!historySearchTerm.trim()) return;
        setHistoryLoading(true);
        try {
            const res = await api.get(`/request/user/${historySearchTerm}`);
            setUserHistory(res.data);
        } catch (err) {
            console.error(err);
            setUserHistory([]);
        } finally {
            setHistoryLoading(false);
        }
    };

    if (loading) return <Loader fullPage />;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', paddingBottom: '2rem' }}>
            
            {/* Catalog Section */}
            <div className="admin-container" style={{ maxWidth: '900px', width: '95%' }}>
                <h2 style={{ marginBottom: '1.5rem' }}>🏥 Live Tablet Availability</h2>
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Medicine Name</th>
                                <th>Manufacturer</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {catalog.length === 0 ? (
                                <tr><td colSpan="4" className="text-center">No tablets listed in the system yet.</td></tr>
                            ) : catalog.map(med => (
                                <tr key={med._id}>
                                    <td><strong>{med.name}</strong></td>
                                    <td>{med.company}</td>
                                    <td>
                                        <span className={`badge ${med.inStock ? 'approved' : 'rejected'}`}>
                                            {med.inStock ? 'Available' : 'Out of Stock'}
                                        </span>
                                    </td>
                                    <td>
                                        <button 
                                            type="button" 
                                            className="btn btn-sm btn-outline"
                                            disabled={!med.inStock}
                                            onClick={() => handleSelectTablet(med.name, med.company)}
                                        >
                                            {med.inStock ? 'Select' : 'Unavailable'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Request Form */}
            <div className="auth-card" style={{ maxWidth: '900px', width: '95%' }}>
                <h2 style={{ marginBottom: '1rem' }}>📝 Place New Request</h2>
                {message && <div className="alert alert-success">{message}</div>}
                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit} className="form">
                    <div className="grid-2">
                        <div className="form-group">
                            <label>Medicine Name</label>
                            <input 
                                type="text" 
                                name="medicineName" 
                                value={formData.medicineName} 
                                onChange={handleChange} 
                                required 
                                placeholder="Select from above or type..." 
                            />
                        </div>
                        <div className="form-group">
                            <label>Company Name</label>
                            <input 
                                type="text" 
                                name="companyName" 
                                value={formData.companyName} 
                                onChange={handleChange} 
                                required 
                                placeholder="Manufacturer" 
                            />
                        </div>
                        <div className="form-group">
                            <label>Quantity Needed</label>
                            <input 
                                type="number" 
                                name="quantity" 
                                value={formData.quantity} 
                                onChange={handleChange} 
                                required 
                                min="1" 
                                placeholder="e.g. 50" 
                            />
                        </div>
                        <div className="form-group">
                            <label>Required By Date</label>
                            <input 
                                type="date" 
                                name="requiredDate" 
                                value={formData.requiredDate} 
                                onChange={handleChange} 
                                required 
                            />
                        </div>
                    </div>
                    
                    <button type="submit" className="btn btn-primary" disabled={submitLoading} style={{ marginTop: '1.5rem' }}>
                        {submitLoading ? 'Submitting...' : 'Submit Request Securely'}
                    </button>
                </form>
            </div>

            {/* User History Section */}
            <div className="admin-container" style={{ maxWidth: '900px', width: '95%' }}>
                <h2 style={{ marginBottom: '1.5rem' }}>📜 Your Request History</h2>
                
                <form onSubmit={handleHistorySearch} className="history-search-form" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
                    <input 
                        type="text" 
                        value={historySearchTerm} 
                        onChange={e => setHistorySearchTerm(e.target.value)} 
                        placeholder="Search by User Name..." 
                        required 
                        style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)' }}
                    />
                    <button type="submit" className="btn btn-primary" style={{ width: 'auto' }} disabled={historyLoading}>
                        {historyLoading ? 'Searching...' : 'Search History'}
                    </button>
                </form>

                {userHistory !== null && (
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Medicine</th>
                                    <th>Company</th>
                                    <th>Qty</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userHistory.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center">No history found.</td></tr>
                                ) : userHistory.map(req => (
                                    <tr key={req._id}>
                                        <td><strong>{req.medicineName}</strong></td>
                                        <td>{req.companyName}</td>
                                        <td>{req.quantity}</td>
                                        <td>{new Date(req.requiredDate).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`badge ${req.status.toLowerCase()}`}>
                                                {req.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddMedicine;
