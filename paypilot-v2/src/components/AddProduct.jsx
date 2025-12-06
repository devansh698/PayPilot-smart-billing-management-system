import React, { useState } from 'react';
import axios from 'axios';
import { Container, Form, FormGroup, Label, Input, Button, Card, CardBody, Row, Col } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    brand: ''
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
        toast.warning("Name and Price are required.");
        return;
    }

    setLoading(true);
    const data = new FormData();
    data.append('name', formData.name);
    data.append('price', formData.price);
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('brand', formData.brand);
    if (image) data.append('image', image);

    try {
      await axios.post('/api/product/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Product added successfully!');
      navigate('/product-management'); // Redirect to list
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <Card className="shadow-sm border-0">
        <CardBody className="p-4">
            <div className="text-center mb-4">
                <h2 className="text-primary"><FontAwesomeIcon icon={faBoxOpen} /> Add New Product</h2>
                <p className="text-muted">Enter product details to add to inventory</p>
            </div>
            
            <Form onSubmit={handleSubmit}>
              <Row>
                  <Col md={6}>
                      <FormGroup>
                        <Label for="name">Product Name *</Label>
                        <Input id="name" value={formData.name} onChange={handleInputChange} required />
                      </FormGroup>
                  </Col>
                  <Col md={6}>
                      <FormGroup>
                        <Label for="price">Price *</Label>
                        <Input type="number" id="price" value={formData.price} onChange={handleInputChange} required />
                      </FormGroup>
                  </Col>
              </Row>

              <FormGroup>
                <Label for="description">Description</Label>
                <Input type="textarea" id="description" rows="3" value={formData.description} onChange={handleInputChange} />
              </FormGroup>

              <Row>
                  <Col md={6}>
                      <FormGroup>
                        <Label for="category">Category</Label>
                        <Input type="select" id="category" value={formData.category} onChange={handleInputChange}>
                          <option value="">Select Category</option>
                          <option value="Electronics">Electronics</option>
                          <option value="Fashion">Fashion</option>
                          <option value="Home & Garden">Home & Garden</option>
                          <option value="Automotive">Automotive</option>
                          <option value="Others">Others</option>
                        </Input>
                      </FormGroup>
                  </Col>
                  <Col md={6}>
                      <FormGroup>
                        <Label for="brand">Brand</Label>
                        <Input type="text" id="brand" value={formData.brand} onChange={handleInputChange} />
                      </FormGroup>
                  </Col>
              </Row>

              <FormGroup>
                <Label for="image">Product Image</Label>
                <Input type="file" id="image" onChange={handleFileChange} />
                <small className="text-muted">Supported formats: JPG, PNG</small>
              </FormGroup>

              <div className="d-flex justify-content-end mt-4">
                  <Button color="secondary" className="me-2" onClick={() => navigate('/product-management')}>Cancel</Button>
                  <Button color="primary" type="submit" disabled={loading}>
                      <FontAwesomeIcon icon={faPlus} className="me-2" /> 
                      {loading ? "Adding..." : "Add Product"}
                  </Button>
              </div>
            </Form>
        </CardBody>
      </Card>
    </Container>
  );
};

export default AddProduct;