import React, { useState } from "react";
import axios from "axios";
import { Container, Button, Table, Row, Col, Card, CardBody, Alert } from "reactstrap";
import { FaChartBar, FaCalendarAlt } from "react-icons/fa";

const ReportGenerator = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [salesReports, setSalesReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSalesReports = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/sales-reports?startDate=${startDate}&endDate=${endDate}`);
      setSalesReports(response.data);
    } catch (err) {
      setError("Failed to generate report. Please check date range.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const grandTotalSales = salesReports.reduce((acc, curr) => acc + curr.totalSales, 0);
  const grandTotalOrders = salesReports.reduce((acc, curr) => acc + curr.totalOrders, 0);

  return (
    <Container fluid>
      <h2 className="mb-4"><FaChartBar className="me-2"/> Sales Report</h2>
      
      <Card className="mb-4 shadow-sm">
        <CardBody>
          <form onSubmit={fetchSalesReports}>
            <Row className="align-items-end">
                <Col md={4}>
                    <label>Start Date</label>
                    <div className="input-group">
                        <span className="input-group-text"><FaCalendarAlt/></span>
                        <input type="date" className="form-control" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                    </div>
                </Col>
                <Col md={4}>
                    <label>End Date</label>
                    <div className="input-group">
                        <span className="input-group-text"><FaCalendarAlt/></span>
                        <input type="date" className="form-control" value={endDate} onChange={e => setEndDate(e.target.value)} required />
                    </div>
                </Col>
                <Col md={4}>
                    <Button color="primary" type="submit" disabled={loading} block>
                        {loading ? "Generating..." : "Generate Report"}
                    </Button>
                </Col>
            </Row>
          </form>
        </CardBody>
      </Card>

      {error && <Alert color="danger">{error}</Alert>}

      {salesReports.length > 0 && (
          <Card className="shadow-sm border-0">
            <CardBody>
                <Table striped bordered responsive className="text-center">
                    <thead className="table-dark">
                        <tr>
                            <th>Date</th>
                            <th>Total Sales</th>
                            <th>Orders Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        {salesReports.map((report, idx) => (
                            <tr key={idx}>
                                <td>{report.date}</td>
                                <td>Rs. {report.totalSales.toLocaleString()}</td>
                                <td>{report.totalOrders}</td>
                            </tr>
                        ))}
                        <tr className="table-active fw-bold">
                            <td>TOTAL</td>
                            <td>Rs. {grandTotalSales.toLocaleString()}</td>
                            <td>{grandTotalOrders}</td>
                        </tr>
                    </tbody>
                </Table>
            </CardBody>
          </Card>
      )}
    </Container>
  );
};

export default ReportGenerator;