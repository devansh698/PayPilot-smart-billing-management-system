import React from 'react';
import { Container, Button } from 'reactstrap';
import img from "./assets/hero.png"
const Hero =
() => {
    return (
        <div className="hero" style={{ backgroundImage: `url(${img})`, height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <Container className="text-center">
                <h1>Welcome to PayPilot</h1>
                <p>Your ultimate solution for managing finances effortlessly.</p>
                <Button color="primary">Get Started</Button>
            </Container>
        </div>
    );
};

export default Hero;