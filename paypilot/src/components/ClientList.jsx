import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, FormGroup, Label, Input, Alert, ModalHeader, ModalBody } from 'reactstrap';

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: {
      name: '',
      gstNumber: '',
      address: '',
    },
  });
  const [error, setError] = useState(null);
  const apiUrl = '/api/client';

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch(`${apiUrl}/`);
        const data = await response.json();
        setClients(data);
      } catch (error) {
        setError(error.message);
      }
    };
    fetchClients();
  }, []);

  const handleAddClient = async (event) => {
    event.preventDefault();
    try {
        // Ensure newClient has the correct structure
        const clientToAdd = {
            firstName: newClient.firstName,
            lastName: newClient.lastName || '', 
            username: newClient.username, 
            email: newClient.email,
            phone: newClient.phone,
            company: {
                name: newClient.company.name || '', 
                gstNumber: newClient.company.gstNumber || '',
            },
            address: newClient.address,
            code: newClient.code,
            country: newClient.country || '', 
            products: [], 
            pendingdues: 0, 
            totalbought: 0, 
            totalpaid: 0, 
            invoices: [],
            notifications: [], 
        };

        const response = await fetch(`${apiUrl}/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(clientToAdd),
        });
        const client = await response.json();
        setClients([...clients, client]);
        setModalIsOpen(false);
        setNewClient({
            firstName: '',
            lastName: '',
            username: '',
            email: '',
            phone: '',
            company: {
                name: '',
                gstNumber: '',
            },
            address: '',
            code: '',
            country: '',
        });
    } catch (error) {
        setError(error.message);
    }
};

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name.startsWith('company.')) {
      setNewClient({
        ...newClient,
        company: { ...newClient.company, [name.substring(8)]: value },
      });
    } else {
      setNewClient({ ...newClient, [name]: value });
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
      setClients(clients.filter((client) => client.id !== id));
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Container className="mt-5">
      <h2 className="text-center mb-4">Client List</h2>
      {error && <Alert color="danger">{error}</Alert>}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Client Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Company</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client._id}>
              <td>{`${client.firstName} ${client.lastName}`}</td>
              <td>{client.email}</td>
              <td>{client.phone}</td>
              <td>{client.company.name}</td>
              <td>
                <Button color="danger" onClick={() => handleDelete(client._id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Button color="primary" onClick={() => setModalIsOpen(true)}>Add Client</Button>

      <Modal isOpen={modalIsOpen} toggle={() => setModalIsOpen(false)} style={{marginTop:"140px"}}>
        <ModalHeader toggle={() => setModalIsOpen(false)}>
          <h1>Add New Client</h1>
        </ModalHeader>
        <ModalBody>
        <Form onSubmit={handleAddClient}>
    <FormGroup>
        <Label for="firstName">First Name</Label>
        <Input type="text" name="firstName" value={newClient.firstName} onChange={handleInputChange} required />
    </FormGroup>
    <FormGroup>
        <Label for="lastName">Last Name</Label>
        <Input type="text" name="lastName" value={newClient.lastName} onChange={handleInputChange} />
    </FormGroup>
    <FormGroup>
        <Label for="username">Username</Label>
        <Input type="text" name="username" value={newClient.username} onChange={handleInputChange} required />
    </FormGroup>
    <FormGroup>
        <Label for="email">Email</Label>
        <Input type="email" name="email" value={newClient.email} onChange={handleInputChange} required />
    </FormGroup>
    <FormGroup>
        <Label for="phone">Phone</Label>
        <Input type="text" name="phone" value={newClient.phone} onChange={handleInputChange} required />
    </FormGroup>
    <FormGroup>
        <Label for="address">Address</Label>
        <Input type="text" name="address" value={newClient.address} onChange={handleInputChange} required />
    </FormGroup>
    <FormGroup>
        <Label for="code">Code</Label>
        <Input type="number" name="code" value={newClient.code} onChange={handleInputChange} required />
    </FormGroup>
    <FormGroup>
        <Label for="companyName">Company Name</Label>
        <Input type="text" name="company.name" value={newClient.company.name} onChange={handleInputChange} />
    </FormGroup>
    <FormGroup>
        <Label for="gstNumber">GST Number</Label>
        <Input type="text" name="company.gstNumber" value={newClient.company.gstNumber} onChange={handleInputChange} />
    </FormGroup>
    <FormGroup>
        <Label for="country">Country</Label>
        <Input type="text" name="country" value={newClient.country} onChange={handleInputChange} />
    </FormGroup>
    <Button type="submit" color="success">Add Client</Button>
</Form>
        </ModalBody>
      </Modal>
    </Container>
  );
};

export default ClientList;