import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Table, Button, Modal, ModalHeader, ModalBody, Form, FormGroup, Label, Input, Alert, Card, CardBody } from 'reactstrap';
import { FaUserPlus, FaTrash, FaUserTie } from 'react-icons/fa';
import { toast } from 'react-toastify';

const EmployeePage = () => {
  const [employees, setEmployees] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', role: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get('/api/user/');
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Simple password generator
  const generatePassword = () => Math.random().toString(36).slice(-8) + "Aa1!";

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      username: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: generatePassword(),
      role: formData.role
    };

    try {
      // Register User
      await axios.post('/api/user/register', payload);
      
      // Try sending email (fail silently if email server not configured)
      try {
        await axios.post('/api/user/send-email', {
            to: payload.email,
            subject: 'Welcome to PayPilot',
            text: `Welcome! Your login: ${payload.username} / ${payload.password}`
        });
        toast.success("Employee added & Email sent!");
      } catch (emailErr) {
        toast.warning("Employee added, but email failed.");
      }

      setModalOpen(false);
      setFormData({ name: '', email: '', phone: '', role: '' });
      fetchEmployees();

    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add employee");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this employee?')) {
      try {
        await axios.delete(`/api/user/${id}`);
        setEmployees(employees.filter(e => e._id !== id));
        toast.success("Deleted successfully");
      } catch (err) {
        toast.error("Delete failed");
      }
    }
  };

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2><FaUserTie className="me-2"/> Employee Manager</h2>
        <Button color="primary" onClick={() => setModalOpen(true)}>
          <FaUserPlus className="me-2"/> Add Employee
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardBody>
          <Table hover responsive>
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp._id}>
                  <td>{emp.username}</td>
                  <td>{emp.email}</td>
                  <td><span className="badge bg-info text-dark">{emp.role}</span></td>
                  <td>{emp.phone}</td>
                  <td>
                    <Button size="sm" outline color="danger" onClick={() => handleDelete(emp._id)}>
                        <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardBody>
      </Card>

      <Modal isOpen={modalOpen} toggle={() => setModalOpen(false)}>
        <ModalHeader toggle={() => setModalOpen(false)}>Add New Employee</ModalHeader>
        <ModalBody>
          <Form onSubmit={handleAddEmployee}>
            <FormGroup>
              <Label>Name</Label>
              <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </FormGroup>
            <FormGroup>
              <Label>Email</Label>
              <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
            </FormGroup>
            <FormGroup>
              <Label>Phone</Label>
              <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
            </FormGroup>
            <FormGroup>
              <Label>Role</Label>
              <Input type="select" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} required>
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="Client Manager">Client Manager</option>
                <option value="Product Manager">Product Manager</option>
                <option value="Invoice Manager">Invoice Manager</option>
              </Input>
            </FormGroup>
            <Button color="success" block type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Employee"}
            </Button>
          </Form>
        </ModalBody>
      </Modal>
    </Container>
  );
};

export default EmployeePage;