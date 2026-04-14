import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddMedicine = () => {
    const [formData, setFormData] = useState({
        userName: '',
        medicineName: '',
        companyName: '',
        quantity: '',
        requiredDate: ''
    });
    
    const [catalog, setCatalog] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // History State
    const [historySearchTerm, setHistorySearchTerm] = useState('');
    const [userHistory, setUserHistory] = useState(null);
    const [historyLoading, setHistoryLoading] = useState(false);

    useEffect(() => {
        const fetchCatalog = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/medicine');
                setCatalog(res.data);
            } catch (err) {
                console.error("Could not fetch catalog");
            }
        };
        fetchCatalog();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSelectTablet = (name, company) => {
        setFormData({ ...formData, medicineName: name, companyName: company });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        // Block request if user requests an explicit out-of-stock item based on our catalog
        const match = catalog.find(m => m.name.toLowerCase() === formData.medicineName.toLowerCase());
        if (match && !match.inStock) {
            setError('We are sorry, but this tablet is currently Out of Stock.');
            setLoading(false);
            return;
        }

        try {
            await axios.post('http://localhost:5000/api/request', formData);
            setMessage('Medicine request submitted successfully!');
            setFormData({
                userName: formData.userName, // Remember username for convenience
                medicineName: '',
                companyName: '',
                quantity: '',
                requiredDate: ''
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Error submitting request');
        } finally {
            setLoading(false);
        }
    };

    const handleHistorySearch = async (e) => {
        e.preventDefault();
        if (!historySearchTerm.trim()) return;
        setHistoryLoading(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/request/user/${historySearchTerm}`);
            setUserHistory(res.data);
        } catch (err) {
            console.error(err);
            setUserHistory([]);
        } finally {
            setHistoryLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', paddingBottom: '2rem' }}>
            
            {/* Catalog Section */}
            <div className="card" style={{ maxWidth: '800px', width: '100%' }}>
                <h2 className="card-title">Live Tablet Availability</h2>
                <div className="table-responsive">
                    <table className="table" style={{ fontSize: '0.9rem' }}>
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

            {/* Form Section */}
            <div className="card" style={{ maxWidth: '800px', width: '100%' }}>
                <h2 className="card-title">Submit a Rapid Request</h2>
                
                {message && <div className="alert alert-success">{message}</div>}
                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit} className="form">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label>User / Pharmacist Name</label>
                            <input type="text" name="userName" value={formData.userName} onChange={handleChange} required placeholder="Your name" />
                        </div>
                        <div className="form-group">
                            <label>Requested Date</label>
                            <input type="date" name="requiredDate" value={formData.requiredDate} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Medicine Name <em>(Select from above)</em></label>
                            <input type="text" name="medicineName" value={formData.medicineName} onChange={handleChange} required placeholder="e.g. Paracetamol" />
                        </div>
                        <div className="form-group">
                            <label>Company Name</label>
                            <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} required placeholder="Manufacturer" />
                        </div>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label>Quantity Needed</label>
                            <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required min="1" placeholder="e.g. 50 boxes" />
                        </div>
                    </div>
                    
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
                        {loading ? 'Submitting...' : 'Submit Request securely'}
                    </button>
                </form>
            </div>

            {/* User History Section */}
            <div className="card" style={{ maxWidth: '800px', width: '100%', marginTop: '1rem' }}>
                <h2 className="card-title">Check Buying History</h2>
                
                <form onSubmit={handleHistorySearch} className="history-search-form">
                    <input 
                        type="text" 
                        value={historySearchTerm} 
                        onChange={e => setHistorySearchTerm(e.target.value)} 
                        placeholder="Enter your exact User Name to see your requests..." 
                        required 
                    />
                    <button type="submit" className="btn btn-primary" style={{ width: 'auto' }} disabled={historyLoading}>
                        {historyLoading ? '🔍 Searching...' : 'View My History'}
                    </button>
                </form>

                {userHistory !== null && (
                    <div className="table-responsive">
                        <table className="table" style={{ fontSize: '0.9rem' }}>
                            <thead>
                                <tr>
                                    <th>Medicine Name</th>
                                    <th>Company</th>
                                    <th>Qty</th>
                                    <th>Requested Date</th>
                                    <th>Approval Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userHistory.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center">No purchases or requests found under this name.</td></tr>
                                ) : userHistory.map(req => (
                                    <tr key={req._id}>
                                        <td><strong>{req.medicineName}</strong></td>
                                        <td>{req.companyName}</td>
                                        <td>{req.quantity}</td>
                                        <td>{new Date(req.requiredDate).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`badge ${req.status.toLowerCase()}`}>
                                                {req.status === 'Approved' ? 'Purchased / Approved' : req.status}
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
