import React from 'react';
import { Container, Row, Col } from 'reactstrap';
import freelancer from './assets/freelancer.png';
import employed from './assets/Employed.png';
import consultant from './assets/consultant.png';
import contractor from './assets/contractor.png';

const Section3 = () => {
    return (
        <div className="section3" id='section3' style={{ padding: '50px 20px', backgroundColor: '#f9f9f9', textAlign: 'center' }}>
            <h1 className="section3-heading">For All the Small Business Owners like You</h1>
            <Container>
                <Row>
                    <Col md={3}>
                        <h2>Freelancers</h2>
                        <img src={freelancer} alt="Freelancers" style={{ width: '100%' }} />
                        <p>Create and send professional invoices in minutes.</p>
                    </Col>
                    <Col md={3}>
                        <h2>Entrepreneurs</h2>
                        <img src={employed} alt="Entrepreneurs" style={{ width: '100%' }} />
                        <p>Pay your staff (and yourself!) with confidence.</p>
                    </Col>
                    <Col md={3}>
                        <h2>Consultants</h2>
                        <img src={consultant} alt="Consultants" style={{ width: '100%' }} />
                        <p>Set up recurring invoices and payments for retainer clients.</p>
                    </Col>
                    <Col md={3}>
                        <h2>Contractors</h2>
                        <img src={contractor} alt="Contractors" style={{ width: '100%' }} />
                        <p>Track your business expenses with our free accounting tools.</p>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Section3;