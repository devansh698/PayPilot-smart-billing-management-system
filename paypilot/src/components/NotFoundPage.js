import React from 'react';
import { Container, Button } from 'reactstrap';
import { Link } from 'react-router-dom';
import Lottie from "lottie-react";
// You can use a specific 404 animation, or reuse 'loading' temporarily if you lack one
import animationData from './animation/Animation - loading.json'; 

const NotFoundPage = () => {
    return (
        <Container className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
            <div style={{ width: '300px', marginBottom: '20px' }}>
                <Lottie animationData={animationData} loop={true} />
            </div>
            
            <h1 className="display-4 fw-bold text-dark">404</h1>
            <h4 className="text-muted mb-4">Page Not Found</h4>
            <p className="text-center text-secondary mb-5" style={{ maxWidth: '500px' }}>
                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
            
            <Link to="/dashboard">
                <Button color="primary" size="lg" className="px-5 rounded-pill shadow">
                    Back to Dashboard
                </Button>
            </Link>
        </Container>
    );
};

export default NotFoundPage;