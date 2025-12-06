import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Alert } from 'reactstrap';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/users/');
                const data = await response.json();
                setUsers(data);
                setLoading(false);
            } catch (error) {
                setError('Failed to fetch users');
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await fetch(`/api/users/${id}`, { method: 'DELETE' });
                setUsers(users.filter(user => user._id !== id));
            } catch (error) {
                setError('Failed to delete user');
            }
        }
    };

    return (
        <Container className="mt-5">
            <h1>User Management</h1>
            {loading && <p>Loading users...</p>}
            {error && <Alert color="danger">{error}</Alert>}
            <Table className="table table-striped">
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user._id}>
                            <td>{user.username}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>
                                <Button color="danger" onClick={() => handleDelete(user._id)}>Delete</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
};

export default UserManagement;