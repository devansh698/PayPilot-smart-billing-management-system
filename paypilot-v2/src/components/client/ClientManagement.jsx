import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Alert } from 'reactstrap';
import api from '../api';

const ClientManagement = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await api.get('/clients/');
                const data = await response.json();
                setClients(data);
                setLoading(false);
            } catch (error) {
                setError('Failed to fetch clients');
                setLoading(false);
            }
        };
        fetchClients();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this client?')) {
            try {
                await api.delete(`/clients/${id}`, { method: 'DELETE' });
                setClients(clients.filter(client => client._id !== id));
            } catch (error) {
                setError('Failed to delete client');
            }
        }
    };

    return (
        <Container className="mt-5">
            <h1>Client Management</h1>
            {loading && <p>Loading clients...</p>}
            {error && <Alert color="danger">{error}</Alert>}
            <Table className="table table-striped">
                <thead>
                    <tr>
                        <th>Client Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {clients.map((client) => (
                        <tr key={client._id}>
                            <td>{client.firstName} {client.lastName}</td>
                            <td>{client.email}</td>
                            <td>{client.phone}</td>
                            <td>
                                <Button color="danger" onClick={() => handleDelete(client._id)}>Delete</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
};

export default ClientManagement;