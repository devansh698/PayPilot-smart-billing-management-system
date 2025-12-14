import React from 'react';
import { CreditCard, DollarSign, ListOrdered, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

const AdminRazorpayDashboard = () => {
  // Placeholder data for demonstration
  const stats = [
    { title: "Total Payments", value: "₹45,231.00", icon: DollarSign, color: "text-green-600", bg: "bg-green-100" },
    { title: "Razorpay Payments", value: "85%", icon: CreditCard, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "Successful Orders", value: "450", icon: ListOrdered, color: "text-purple-600", bg: "bg-purple-100" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Razorpay Integration</h1>
        <Button variant="outline" onClick={() => console.log('Navigate to settings')}>
          <Settings size={16} className="mr-2" /> Gateway Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">Data synchronized from payment records.</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Integrated Payment Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-muted-foreground">
            Razorpay payments are processed via the <code>/payment/razorpay-order</code> and <code>/payment/razorpay-verify</code> routes on the backend. Successful transactions are automatically recorded as payments and update the invoice status via the client-side <code>/clients/payments</code> route.
          </p>
          <h3 className="text-lg font-semibold mb-2">Key Actions:</h3>
          <ul className="list-disc list-inside space-y-1 pl-4 text-sm">
            <li>Review all recorded payments via the <Button variant="link" className="p-0 h-auto">Payment Manager</Button> page.</li>
            <li>Verify Razorpay credentials and webhook settings on the <Button variant="link" className="p-0 h-auto">Settings</Button> page.</li>
            <li>Note: New payments must be initiated by the client in their portal.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminRazorpayDashboard;