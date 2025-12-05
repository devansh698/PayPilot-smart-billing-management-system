import React, { useState, useEffect } from "react";
import { Container, Button, Table, Alert } from "reactstrap";

const SalesReport = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [salesReports, setSalesReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSalesReports = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/sales-reports?startDate=${startDate}&endDate=${endDate}`);
      const data = await response.json();
      setSalesReports(data);
    } catch (err) {
      setError("Failed to fetch sales reports");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchSalesReports();
  };

  return (
    <Container className="mt-5">
      <h4>Sales Report</h4>
      {error && <Alert color="danger">{error}</Alert>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Start Date</label>
          <input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>End Date</label>
          <input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
        </div>
        <Button type="submit" color="primary">Generate Report</Button>
      </form>
      {loading ? (
        <p>Loading reports...</p>
      ) : (
        <Table striped bordered hover className="mt-4">
          <thead>
            <tr>
              <th>Date</th>
              <th>Total Sales</th>
              <th>Total Orders</th>
            </tr>
          </thead>
          <tbody>
            {salesReports.map((report) => (
              <tr key={report.date}>
                <td>{report.date}</td>
                <td>Rs. {report.totalSales}</td>
                <td>{report.totalOrders}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default SalesReport;