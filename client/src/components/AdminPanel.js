import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Loader from './Loader';

const AdminPanel = () => {
    // Requests State
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchUser, setSearchUser] = useState('');

    // Medicine Inventory State
    const [medicines, setMedicines] = useState([]);
    const [newMedicine, setNewMedicine] = useState({ name: '', company: '' });

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const res = await api.get('/request');
                setRequests(res.data);
                setLoading(false);
            } catch (err) {
                setError('Error fetching requests');
                setLoading(false);
            }
        };

        const fetchMedicines = async () => {
            try {
                const res = await api.get('/medicine');
                setMedicines(res.data);
            } catch (err) {
                console.error('Error fetching inventory');
            }
        };

        fetchRequests();
        fetchMedicines();
    }, []);

    // Requests Handlers
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this request?')) return;
        try {
            await api.delete(`/request/${id}`);
            setRequests(requests.filter(req => req._id !== id));
        } catch (err) {
            alert('Error deleting request');
        }
    };

    const handleStatusUpdate = async (id, currentStatus) => {
        const newStatus = currentStatus === 'Pending' ? 'Approved' : 'Pending';
        try {
            const res = await api.put(`/request/${id}`, { status: newStatus });
            setRequests(requests.map(req => req._id === id ? res.data : req));
        } catch (err) {
            alert('Error updating status');
        }
    };

    // Inventory Handlers
    const handleAddMedicine = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/medicine', newMedicine);
            setMedicines([...medicines, res.data]);
            setNewMedicine({ name: '', company: '' });
        } catch (err) {
            alert(err.response?.data?.message || 'Error adding medicine');
        }
    };

    const handleStockToggle = async (id) => {
        try {
            const res = await api.put(`/medicine/${id}`);
            setMedicines(medicines.map(med => med._id === id ? res.data : med));
        } catch (err) {
            alert('Error updating stock status');
        }
    };

    const handleDeleteMedicine = async (id) => {
        if (!window.confirm('Delete this tablet from the entire catalog?')) return;
        try {
            await api.delete(`/medicine/${id}`);
            setMedicines(medicines.filter(med => med._id !== id));
        } catch (err) {
            alert('Error deleting medicine');
        }
    };

    if (loading) return <Loader />;
    if (error) return <div className="alert alert-error">{error}</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Inventory Management Section */}
            <div className="admin-container">
                <h2>📦 Medicine Catalog Management</h2>
                
                <form onSubmit={handleAddMedicine} className="form admin-add-form">
                    <div className="form-group" style={{ flex: 2 }}>
                        <label>Tablet Name</label>
                        <input type="text" value={newMedicine.name} onChange={e => setNewMedicine({...newMedicine, name: e.target.value})} required placeholder="e.g. Paracetamol" />
                    </div>
                    <div className="form-group" style={{ flex: 2 }}>
                        <label>Company / Manufacturer</label>
                        <input type="text" value={newMedicine.company} onChange={e => setNewMedicine({...newMedicine, company: e.target.value})} required placeholder="e.g. GlaxoSmithKline" />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: 'auto', alignSelf: 'flex-end', marginBottom: '1.2rem' }}>
                        <span>➕ Add to Catalog</span>
                    </button>
                </form>

                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Company</th>
                                <th>Stock Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {medicines.length === 0 ? (
                                <tr><td colSpan="4" className="text-center">No catalog available.</td></tr>
                            ) : medicines.map(med => (
                                <tr key={med._id}>
                                    <td><strong>{med.name}</strong></td>
                                    <td>{med.company}</td>
                                    <td>
                                        <span className={`badge ${med.inStock ? 'approved' : 'rejected'}`}> {/* Reusing CSS classes */}
                                            {med.inStock ? 'In Stock' : 'Out of Stock'}
                                        </span>
                                    </td>
                                    <td className="actions">
                                        <button className="btn btn-sm btn-outline" onClick={() => handleStockToggle(med._id)}>
                                            Toggle Stock
                                        </button>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleDeleteMedicine(med._id)}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Requests Management Section */}
            <div className="admin-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0 }}>User Requests & History</h2>
                    <input 
                        type="text" 
                        placeholder="Search by User Name..." 
                        value={searchUser}
                        onChange={e => setSearchUser(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Medicine</th>
                                <th>Company</th>
                                <th>Qty</th>
                                <th>Required Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.filter(req => req.userName.toLowerCase().includes(searchUser.toLowerCase())).length === 0 ? (
                                <tr><td colSpan="7" className="text-center">No requests found.</td></tr>
                            ) : requests.filter(req => req.userName.toLowerCase().includes(searchUser.toLowerCase())).map(req => (
                                <tr key={req._id}>
                                    <td><strong>{req.userName}</strong></td>
                                    <td>{req.medicineName}</td>
                                    <td>{req.companyName}</td>
                                    <td>{req.quantity}</td>
                                    <td>{new Date(req.requiredDate).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`badge ${req.status.toLowerCase()}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="actions">
                                        <button className="btn btn-sm btn-outline" onClick={() => handleStatusUpdate(req._id, req.status)}>
                                            Toggle Status
                                        </button>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(req._id)}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
