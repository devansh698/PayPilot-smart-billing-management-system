import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Container, Row, Col, Table, Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, Card, CardBody, Badge 
} from "reactstrap";
import { FaBoxes, FaPlusCircle } from "react-icons/fa";
import { toast } from 'react-toastify';
import Lottie from 'lottie-react'; 
import animationData from './animation/Animation - inventory.json';

const InventoryManager = () => {
  const [products, setProducts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [addQuantity, setAddQuantity] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("/api/product/");
      setProducts(res.data);
    } catch (err) {
      toast.error("Failed to load inventory");
    }
  };

  const handleUpdateStock = async () => {
    if (!selectedProduct || addQuantity <= 0) {
      toast.warn("Select a product and valid quantity");
      return;
    }

    setLoading(true);
    const product = products.find(p => p._id === selectedProduct);
    const newQuantity = (product.quantity || 0) + parseInt(addQuantity);

    try {
      await axios.put(`/api/product/${selectedProduct}`, {
        quantity: newQuantity,
        lastupdatedat: Date.now()
      });
      
      toast.success("Stock updated successfully!");
      setModalOpen(false);
      setAddQuantity(0);
      setSelectedProduct("");
      fetchProducts();
    } catch (err) {
      toast.error("Failed to update stock");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid>
      <h2 className="mb-4"><FaBoxes className="me-2"/> Inventory Management</h2>

      <Row>
        <Col md={8}>
          <Card className="shadow-sm border-0 h-100">
            <CardBody>
              <div className="d-flex justify-content-between mb-3">
                  <h5 className="text-muted">Current Stock Levels</h5>
                  <Button color="primary" onClick={() => setModalOpen(true)}>
                      <FaPlusCircle className="me-2"/> Add Stock
                  </Button>
              </div>
              
              <Table hover responsive>
                <thead className="table-light">
                  <tr>
                    <th>Product Name</th>
                    <th>Price</th>
                    <th>Current Stock</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p._id}>
                      <td>{p.name}</td>
                      <td>${p.price}</td>
                      <td className="fw-bold">{p.quantity || 0}</td>
                      <td>
                        {(p.quantity || 0) < 10 ? 
                            <Badge color="danger">Low Stock</Badge> : 
                            <Badge color="success">In Stock</Badge>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </CardBody>
          </Card>
        </Col>

        <Col md={4}>
           {/* Animation / Stats Side Panel */}
           <Card className="shadow-sm border-0 h-100 text-center p-3">
               <CardBody>
                   <h5 className="mb-4">Live Inventory Tracking</h5>
                   <div style={{ maxWidth: '300px', margin: '0 auto' }}>
                       <Lottie animationData={animationData} loop={true} />
                   </div>
                   <div className="mt-4 text-start">
                       <p><strong>Total Items:</strong> {products.length}</p>
                       <p><strong>Low Stock Alerts:</strong> {products.filter(p => (p.quantity || 0) < 10).length}</p>
                   </div>
               </CardBody>
           </Card>
        </Col>
      </Row>

      <Modal isOpen={modalOpen} toggle={() => setModalOpen(false)}>
        <ModalHeader toggle={() => setModalOpen(false)}>Add Stock to Inventory</ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label>Select Product</Label>
              <Input type="select" value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>
                <option value="">-- Select Product --</option>
                {products.map(p => (
                  <option key={p._id} value={p._id}>{p.name} (Curr: {p.quantity || 0})</option>
                ))}
              </Input>
            </FormGroup>
            <FormGroup>
              <Label>Quantity to Add</Label>
              <Input type="number" value={addQuantity} onChange={e => setAddQuantity(e.target.value)} min="1" />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button color="success" onClick={handleUpdateStock} disabled={loading}>
            {loading ? "Updating..." : "Update Stock"}
          </Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
};

export default InventoryManager;