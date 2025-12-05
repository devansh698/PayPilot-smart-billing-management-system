import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Card, CardBody, Table, Button, Input, Row, Col, Badge } from "reactstrap";
import { FaEdit, FaTrash, FaSearch, FaUserPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify'; // Make sure to install this

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await axios.get("/api/client/");
      setClients(res.data);
      setFilteredClients(res.data);
    } catch (error) {
      toast.error("Failed to fetch clients");
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = clients.filter(client => 
      client.firstName.toLowerCase().includes(term) || 
      client.email.toLowerCase().includes(term)
    );
    setFilteredClients(filtered);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      try {
        await axios.delete(`/api/client/${id}`);
        toast.success("Client deleted successfully");
        fetchClients();
      } catch (error) {
        toast.error("Error deleting client");
      }
    }
  };

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Client Management</h2>
        <Button color="primary" onClick={() => navigate("/add-client")}>
          <FaUserPlus className="me-2"/> Add New Client
        </Button>
      </div>

      <Card className="shadow-sm border-0">
        <CardBody>
          <Row className="mb-3">
            <Col md={4}>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0"><FaSearch className="text-muted"/></span>
                <Input 
                  placeholder="Search by name or email..." 
                  className="border-start-0"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </Col>
          </Row>

          <Table hover responsive className="align-middle">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map(client => (
                <tr key={client._id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="bg-light rounded-circle p-2 me-2 text-primary fw-bold">
                        {client.firstName[0]}
                      </div>
                      <div>
                        <div className="fw-bold">{client.firstName} {client.lastName}</div>
                        <small className="text-muted">ID: {client._id.slice(-6)}</small>
                      </div>
                    </div>
                  </td>
                  <td>{client.email}</td>
                  <td>{client.phone}</td>
                  <td>
                    <Badge color={client.verified ? "success" : "warning"} pill>
                      {client.verified ? "Verified" : "Pending"}
                    </Badge>
                  </td>
                  <td className="text-end">
                    <Button size="sm" color="light" className="me-2 text-primary">
                      <FaEdit />
                    </Button>
                    <Button size="sm" color="light" className="text-danger" onClick={() => handleDelete(client._id)}>
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">No clients found</td>
                </tr>
              )}
            </tbody>
          </Table>
        </CardBody>
      </Card>
    </Container>
  );
};

export default ClientList;