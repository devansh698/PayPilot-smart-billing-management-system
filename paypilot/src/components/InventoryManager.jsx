import React, { useState, useEffect } from "react";
import { Modal, Button, Table } from "react-bootstrap";
import Lottie from 'lottie-react'; // Import Lottie for animations
import animationData from './animation/Animation - inventory.json';
//import animation1 from './animation/Animation - 1.json';
import animation2 from './animation/Animation - added to inventory.json';
//import animation3 from './animation/Animation - 3.json';

import './InventoryManager.css'; // Import the new CSS file

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [addProductFormVisible, setAddProductFormVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(0);
  const [error, setError] = useState(null);
  const [successPopupVisible, setsuccessPopupVisible] = useState(false);

  useEffect(() => {
    fetch("/api/product/")
      .then((response) => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response.json();
      })
      .then((data) => {
        setProducts(data);
      })
      .catch((error) => setError(error.message));
  }, []);

  const handleAddProduct = () => {
    setAddProductFormVisible(true);
  };

  const handleQuantityChange = (event) => {
    const quantity = parseInt(event.target.value, 10);
    if (quantity >= 0) {
      setQuantity(quantity);
    }
  };

  const handleAddToInventory = () => {
    if (selectedProduct && quantity) {
      fetch(`/api/product/${selectedProduct._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity: selectedProduct.quantity + quantity, lastupdatedat: Date.now() }),
      })
        .then((response) => {
          const productIndex = products.findIndex(
            (product) => product._id === selectedProduct._id
          );

          if (productIndex !== -1) {
            const updatedProduct = {
              ...selectedProduct,
              quantity: selectedProduct.quantity + quantity,
            };

            const updatedProducts = [...products];
            updatedProducts[productIndex] = updatedProduct;
            setProducts(updatedProducts);
          }

          setAddProductFormVisible(false);
          setsuccessPopupVisible(true);
          setTimeout(() => {
            setsuccessPopupVisible(false);
            window.location.reload();
            }, 3000);

        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  const handleSelectProduct = (event) => {
    const value = event.target.value;
    const selectedProduct = products.find(product => product._id === value);
    setSelectedProduct(selectedProduct);
    setQuantity(0);
  };

  return (
    <div className="container mt-5">
      
      <h2 className="text-center mb-4" style={{ color:"black" }}>Inventory</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <div style={{display:"flex"}}>
      <Table striped bordered hover variant="light" style={{width:"50%"}}>
        <thead style={{backgroundColor:"blue"}}>
          <tr>
            <th>Product Name</th>
            <th>Price</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id}>
              <td>{product.name}</td>
              <td>{product.price}</td>
              <td>{product.quantity}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div style={{width:"40%",padding:"10%"}}>
      <Lottie
          animationData={animationData}
        />
      </div>
      </div>
      <Button variant="success" onClick={handleAddProduct}>Add Product to Inventory</Button>
      <Modal show={addProductFormVisible} onHide={() => setAddProductFormVisible(false)} style={{marginTop:"140px"}}>
        <Modal.Header closeButton>
          <Modal.Title>Add Product to Inventory</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <div className="form-group">
              <label htmlFor="product">Select Product</label>
              <select className="form-control" id="product" onChange={handleSelectProduct}>
                <option value="">Select product</option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="quantity">Quantity</label>
              <input type="number" className="form-control" id="quantity" value={quantity} onChange={handleQuantityChange} />
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setAddProductFormVisible(false)}>Close</Button>
          <Button variant="primary" onClick={handleAddToInventory} disabled={!selectedProduct || quantity <= 0}>Add to Inventory</Button>
        </Modal.Footer>
      </Modal>
      {successPopupVisible && (
        <div style={{display: "flex",justifyContent: "center",alignItems: "center",position: "fixed",top: 0,left: 0,right: 0,bottom: 0,zIndex: 1000,backgroundColor: "rgba(0, 0, 0, 0.5)"
        }}>
          <div style={{backgroundColor: "transparent", padding: "20px"
          }}>
            <Lottie animationData={animation2} style={{ width: "100%", height: "100%" }} />
            <h4>Product Added to Inventory!</h4>
          </div>
        </div>
      )}
    </div>
    
  );
};

export default Inventory;
