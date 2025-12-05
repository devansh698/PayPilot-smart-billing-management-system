import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, ModalHeader, ModalBody, Form, FormGroup, Label, Input, Alert } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import Lottie from "lottie-react";
import animationData from './animation/Animation - loading.json';
function generatePassword() {
  const uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const specialChars = '!@#$%^&*()_+-=';
  let password = '';

  // Ensure at least one character from each category
  password += getRandomChar(uppercaseLetters);
  password += getRandomChar(lowercaseLetters);
  password += getRandomChar(numbers);
  password += getRandomChar(specialChars);

  // Fill the rest of the password with random characters
  while (password.length < 8) {
    const charType = Math.floor(Math.random() * 4);
    switch (charType) {
      case 0:
        password += getRandomChar(uppercaseLetters);
        break;
      case 1:
        password += getRandomChar(lowercaseLetters);
        break;
      case 2:
        password += getRandomChar(numbers);
        break;
      case 3:
        password += getRandomChar(specialChars);
        break;
      default:
        password += getRandomChar(uppercaseLetters);
        break;
    }
  }

  password = shuffleString(password);

  return password;
}

function getRandomChar(charSet) {
  return charSet[Math.floor(Math.random() * charSet.length)];
}

function shuffleString(str) {
  const arr = str.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
}

const EmployeePage = () => {
  const [employees, setEmployees] = useState([]);
  const [showAddEmployeeForm, setShowAddEmployeeForm] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch('/api/user/');
        const data = await response.json();
        setEmployees(data);
      } catch (error) {
        setError('Failed to fetch employees');
      }
    };
    fetchEmployees();
  }, []);

  const handleAddEmployee = async (event) => {
    event.preventDefault();
    const employeeData = {
      username: newEmployee.name,
      email: newEmployee.email,
      phone: newEmployee.phone,
      password: generatePassword(),
      role: newEmployee.role
    };

    const addEmployee = async () => {
      setLoading(true);
      const response = await fetch('/api/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employeeData),
      });
      const data = await response.json();

      if (response.ok) {
        // Send email to the new employee
        const emailResponse = await fetch('/api/user/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: employeeData.email,
            subject: 'Welcome to PayPilot',
            text: `Hello ${employeeData.username},\n\nWelcome to PayPilot!\n\nYour login credentials are:\nUsername: ${employeeData.username}\nPassword: ${employeeData.password}\n\nPlease log in using the above credentials.\n\nBest regards,\nPayPilot Team`
          }),
        });

        if (emailResponse.ok) {
          setNewEmployee({ name: '', email: '', phone: '', role: '' });
          setEmployees((prevEmployees) => [...prevEmployees, data]);
          setShowAddEmployeeForm(false);
          setSuccess('Employee added successfully');
          setLoading(false);
          window.location.reload();

        } else {
          setError('Failed to send email to the new employee');
          setLoading(false);
        }
      } else {
        setError('Failed to add the new employee');
        setLoading(false);
      }
    };

    addEmployee();
  };

  const handleDeleteEmployee = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await fetch(`/api/user/${id}`, { method: 'DELETE' });
        setEmployees(employees.filter(employee => employee._id !== id));
      } catch (error) {
        setError('Failed to delete employee');
      }
    }
  };

  return (
    <Container className="mt-5">
      <Modal isOpen={loading} style={{ marginTop: "180px", zIndex: "10000000000", backgroundColor: "rgba(0, 0, 0, 0)",border:"none" }}>
  <ModalBody className='moda-content' style={{ backgroundColor: "transparent" }}>
    <Lottie animationData={animationData} style={{ width: "100%", height: "100%" }} />
  </ModalBody>
</Modal>
      <h1>Employee Manager</h1>
      {error && <Alert color="danger">{error}</Alert>}
      <Button color="primary" onClick={() => setShowAddEmployeeForm(true)}>
        <FontAwesomeIcon icon={faPlus} /> Add Employee
      </Button>
      <Table striped bordered hover className="mt-4">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee._id}>
              <td>{employee.username}</td>
              <td>{employee.email}</td>
              <td>{employee.phone}</td>
              <td>{employee.role}</td>
              <td>
                <Button color="warning" onClick={() => {/* Navigate to edit employee */}}>
                  <FontAwesomeIcon icon={faEdit} /> Edit
                </Button>
                <Button color="danger" onClick={() => handleDeleteEmployee(employee._id)}>
                  <FontAwesomeIcon icon={faTrash} /> Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal isOpen={showAddEmployeeForm} toggle={() => setShowAddEmployeeForm(false)} style={{marginTop:"150px",backgroundColor:"white"}}>
        <ModalHeader toggle={() => setShowAddEmployeeForm(false)}>
          <h1>Add Employee</h1>
        </ModalHeader>
        <ModalBody>
          <Form onSubmit={handleAddEmployee}>
            <FormGroup>
              <Label for="name">Name</Label>
              <Input type="text" id="name" value={newEmployee.name} onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })} required />
            </FormGroup>
            <FormGroup>
              <Label for="email">Email</Label>
              <Input type="email" id="email" value={newEmployee.email} onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })} required />
            </FormGroup>
            <FormGroup>
              <Label for="phone">Phone</Label>
              <Input type="text" id="phone" value={newEmployee.phone} onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })} required />
            </FormGroup>
            <FormGroup>
              <Label for="role">Role</Label>
              <Input type="select" id="role" value={newEmployee.role} onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })} required>
                <option value="">Select Role</option>
                <option value="Client Manager">Client Manager</option>
                <option value="Invoice Manager">Invoice Manager</option>
                <option value="Payment Manager">Payment Manager</option>
                <option value="Product Manager">Product Manager</option>
              </Input>
            </FormGroup>
            <Button type="submit" color="success">Add Employee</Button>
          </Form>
        </ModalBody>
      </Modal>
    </Container>
  );
};

export default EmployeePage;
