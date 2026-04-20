import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Loader from './Loader';

const AdminUserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await api.get('/auth/users');
                setUsers(res.data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Error fetching user list');
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    if (loading) return <Loader />;
    if (error) return <div className="alert alert-error">{error}</div>;

    return (
        <div className="admin-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ margin: 0 }}>👥 User Management</h2>
                <div className="badge approved">{users.length} Registered Users</div>
            </div>

            <div className="table-responsive">
                <table className="table">
                    <thead>
                        <tr>
                            <th>User ID</th>
                            <th>Name</th>
                            <th>Email Address</th>
                            <th>Role</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id}>
                                <td><code style={{ fontSize: '0.8rem', color: 'var(--primary-color)' }}>{user._id}</code></td>
                                <td><strong>{user.name}</strong></td>
                                <td>{user.email}</td>
                                <td>
                                    <span style={{ 
                                        padding: '4px 8px', 
                                        borderRadius: '4px', 
                                        fontSize: '0.75rem',
                                        background: user.role === 'admin' ? '#ebf8ff' : '#f7fafc',
                                        color: user.role === 'admin' ? '#2b6cb0' : '#4a5568',
                                        fontWeight: '600'
                                    }}>
                                        {user.role.toUpperCase()}
                                    </span>
                                </td>
                                <td>
                                    <span className={`badge ${user.isVerified ? 'approved' : 'rejected'}`}>
                                        {user.isVerified ? 'Verified' : 'Unverified'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUserList;
