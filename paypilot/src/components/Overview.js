import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faChartBar,faChartLine,faChartPie} from "@fortawesome/free-solid-svg-icons";
import {LineChart,Line,XAxis,YAxis,CartesianGrid,Tooltip,Legend,PieChart,Pie,BarChart,Bar,} from "recharts";
import "./Overview.css";

const formatValue = (value) => {
  if (typeof value === "undefined" || value === null) {
    return "N/A";
  }
  return value.toLocaleString();
};

const Overview = () => {
  const [data, setData] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/chartsdata/all-data")
      .then((response) => response.json())
      .then((data) => {
        console.log("Received data:", data);
        setData(data);
      })

      .catch((error) => {
        setError(error.message);
        console.error(error);
      });
  }, []);

  if (!data) {
    return <div>No data available</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }
  const colorlist = ["blue", "green", "red", "orange", "gray","yellow", "pink", "purple", "brown"];

  return (
    <div className="overview-container">
      <h1 className="overview-title">Overview</h1>
      <div className="metrics-grid">
        <div className="metric">
          <FontAwesomeIcon icon={faChartBar} />
          <span>Total Billed Amount:</span>
          <span>{formatValue(data.totalBilledAmount)}</span>
        </div>
        <div className="metric">
          <FontAwesomeIcon icon={faChartLine} />
          <span>Number of Invoices:</span>
          <span>{formatValue(data.numberOfInvoices)}</span>
        </div>
        <div className="metric">
          <FontAwesomeIcon icon={faChartPie} />
          <span>Average Invoice Value:</span>
          <span>{formatValue(data.averageInvoiceValue)}</span>
        </div>
        <div className="metric">
          <FontAwesomeIcon icon={faChartBar} />
          <span>Total Paid Amount:</span>
          <span>{formatValue(data.totalPaymentRecived)}</span>
        </div>
        <div className="metric">
          <FontAwesomeIcon icon={faChartLine} />
          <span>Number of Payments:</span>
          <span>{formatValue(data.totalNumberOfPayments)}</span>
        </div>
        <div className="metric">
          <FontAwesomeIcon icon={faChartPie} />
          <span>Average Payment Value:</span>
          <span>{formatValue(data.averagePaymentAmount)}</span>
        </div>
        <div className="metric">
          <FontAwesomeIcon icon={faChartBar} />
          <span>Total Outstanding Amount:</span>
          <span>{formatValue(data.totalUnbilledPayment)}</span>
        </div>
        <div className="metric">
          <FontAwesomeIcon icon={faChartLine} />
          <span>Number of Overdue Invoices:</span>
          <span>{formatValue(data.noofoverdueInvoices)}</span>
        </div>
      </div>
      <div
        className="chart-container"
        style={{
          display: "flex",
          width: "100%",
        }}
      >
        {data.dailySalesReport && Array.isArray(data.dailySalesReport) && (
          <div className="chart-col">
            <h2>Daily Sales Report</h2>
            <LineChart
              width={250}
              height={200}
              data={data.dailySalesReport.map((item) => ({
                date: item._id,
                sales: item.totalAmount,
              }))}
            >
              <Line type="monotone" dataKey="sales" stroke="#8884d8" />
              <XAxis dataKey="date" />
              <YAxis />
              <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
              <Tooltip />
              <Legend />
            </LineChart>
          </div>
        )}
        {data.salesReport && Array.isArray(data.salesReport) && (
          <div className="chart-col">
            <h2>Sales Report</h2>
            <LineChart
              width={250}
              height={200}
              data={data.salesReport.map((item) => ({
                id: item._id,
                sales: item.totalAmount,
              }))}
            >
              <Line type="monotone" dataKey="sales" stroke="#8884d8" />
              <XAxis dataKey="id" />
              <YAxis />
              <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
              <Tooltip />
              <Legend />
            </LineChart>
          </div>
        )}
        {data.dailyPaymentReport && Array.isArray(data.dailyPaymentReport) && (
          <div className="chart-col">
            <h2>Daily Payment Report</h2>
            <LineChart
              width={250}
              height={200}
              data={data.dailyPaymentReport.map((item) => ({
                date: item._id,
                payments: item.totalPaid,
              }))}
            >
              <Line type="monotone" dataKey="payments" stroke="#8884d8" />
              <XAxis dataKey="date" />
              <YAxis />
              <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
              <Tooltip />
              <Legend />
            </LineChart>
          </div>
        )}
      </div>
      <div
        className="chart-container"
        style={{
          display: "flex",
          width: "100%",
        }}
      >
        {data.productinventory && Array.isArray(data.productinventory) && (
          <div className="chart-col">
            <h2>Product Inventory</h2>
            <BarChart
              width={300}
              height={250}
              data={data.productinventory.map((item) => ({
                name: item.name,
                quantity: item.quantity,
              }))}
            >
              <Bar dataKey="quantity" fill="#8884d8" />
              <XAxis dataKey="name" />
              <YAxis />
              <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
              <Tooltip />
              <Legend />
            </BarChart>
          </div>
        )}
        {data.topClients && (
          <div className="chart-col">
            <h2>Top Clients</h2>
            <PieChart width={350} height={250}>
              <Pie
                data={data.topClients.map((item, index) => ({
                  name: item.firstName,
                  value: item.totalbought,
                  fill: colorlist[index % 5],
                }))}
                cx={120}
                cy={100}
                outerRadius={80}
              />
              <Tooltip />
              <Legend />
            </PieChart>
          </div>
        )}
      </div>
    </div>
  );
};

export default Overview;