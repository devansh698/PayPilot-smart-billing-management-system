import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'reactstrap';
import Overview from './Overview';
import Lottie from "lottie-react";
import animationData from "./animation/Animation - loading.json";
import './Dashboard.css';

const Dashboard = () => {
    const [overviewData, setOverviewData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/overview/')
            .then(response => response.json())
            .then(data => {
                setOverviewData(data);
                setLoading(false);
            });
    }, []);

    const defaultOptions = {
        loop: true,
        autoplay: true, 
        animationData: animationData.default,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    };

    return (
        <Container className="dashboard-container">
            {loading ? (
                <div className="loading-container">
                    <Lottie options={defaultOptions} height={400} width={400} />
                </div>
            ) : (
                <Row>
                    <Col>
                        <Overview data={overviewData} />
                    </Col>
                </Row>
            )}
        </Container>
    );
};

export default Dashboard;
