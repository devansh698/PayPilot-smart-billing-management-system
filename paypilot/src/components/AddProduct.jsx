import React, { useState } from 'react';
import { Container, Form, FormGroup, Label, Input, Button, Alert } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

const AddProduct = () => {
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);

  const apiUrl = '/api/product';

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('name', productName);
      formData.append('price', price);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('brand', brand);

      const response = await fetch(`${apiUrl}/`, {
        method: 'POST',
        body: formData,
      });
      const product = await response.json();
      if (!response.ok) throw new Error(product.message);
      alert('Product added successfully!');
      setProductName('');
      setPrice(0);
      setDescription('');
      setCategory('');
      setBrand('');
      setImage(null);
    } catch (error) {
      setError(error.message);
    }
  };

  // Price validation
  const isValidPrice = (price) => price > 0;

  return (
    <Container className="mt-5">
      <h2 className="text-center mb-4"><FontAwesomeIcon icon={faPlus} /> Add Product</h2>
      <div className="card p-4">
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label for="productName">Product Name</Label>
            <Input
              type="text"
              id="productName"
              placeholder="Enter product name"
              value={productName}
              onChange={(event) => setProductName(event.target.value)}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label for="price">Price</Label>
            <Input
              type="number"
              id="price"
              placeholder="Enter price"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              required
              invalid={!isValidPrice(price) && price > 0} // Real-time validation
            />
          </FormGroup>
          <FormGroup>
            <Label for="description">Description</Label>
            <Input
              type="textarea"
              id="description"
              placeholder="Enter product description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label for="category">Category</Label>
            <Input
              type="select"
              id="category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              required
            >
              <option value="">Select category</option>
              <option value="Electronics">Electronics</option>
              <option value="Fashion">Fashion</option>
              <option value="Home">Home</option>
            </Input>
          </FormGroup>
          <FormGroup>
            <Label for="brand">Brand</Label>
            <Input
              type="text"
              id="brand"
              placeholder="Enter brand name"
              value={brand}
              onChange={(event) => setBrand(event.target.value)}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label for="image">Image</Label>
            <Input
              type="file"
              id="image"
              onChange={(event) => setImage(event.target.files[0])}
              required
            />
          </FormGroup>
          {error && <Alert color="danger">{error}</Alert>}
          <Button type="submit" color="primary">Add Product</Button>
        </Form>
      </div>
    </Container>
  );
};

export default AddProduct;
