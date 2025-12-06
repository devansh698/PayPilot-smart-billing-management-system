import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'reactstrap';
import payment from './assets/payment.png';
import invoice from './assets/invoice.png';
import dashboard from './assets/dashboard.png';

const content = [
    {
        heading: "Invoicing",
        paragraph: "Reduce unpaid invoices, keep tabs on your income, and get paid faster.",
        image: invoice
    },
    {
        heading: "Payments",
        paragraph: "Convenience is everything. Give your customers the option of paying with one click using a credit card, bank transfer, or Apple Pay.",
        image: payment
    },
    {
        heading: "Accounting",
        paragraph: "Monitor your cash flow, stay organized, and stop sweating tax season. Say #sorry to the stress of tax time with our easy-to-use accounting tools.",
        image: dashboard
    }
];

const Section4 = () => {
    const [activeIndex, setActiveIndex] = useState(0);

    const handleNext = () => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % content.length);
    };

    const handlePrev = () => {
        setActiveIndex((prevIndex) => (prevIndex - 1 + content.length) % content.length);
    };

    return (
        <div className="section4" style={{ padding: '50px 20px', backgroundColor: '#fff', textAlign: 'center' }}>
            <h1>Our Services</h1>
            <Container>
                <Row>
                    <Col md={6}>
                        <img src={content[activeIndex].image} alt={content[activeIndex].heading} style={{ width: '100%' }} />
                    </Col>
                    <Col md={6}>
                        <h2>{content[activeIndex].heading}</h2>
                        <p>{content[activeIndex].paragraph}</p>
                        <Button color="primary" onClick={handlePrev}>Previous</Button>
                        <Button color="primary" onClick={handleNext}>Next</Button>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Section4;