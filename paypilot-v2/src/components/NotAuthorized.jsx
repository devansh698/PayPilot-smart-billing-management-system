import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Home, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

const NotAuthorized = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
            <Card className="max-w-md w-full">
                <CardContent className="pt-6">
                    <div className="bg-destructive/10 p-6 rounded-full text-destructive mb-6 inline-block">
                        <Shield size={64} />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
                    <p className="text-muted-foreground mb-6">
                        You do not have permission to access this page. Please contact your administrator if you believe this is an error.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Button onClick={() => navigate(-1)} variant="outline">
                            <ArrowLeft size={18} className="mr-2" />
                            Go Back
                        </Button>
                        <Button onClick={() => navigate('/dashboard')}>
                            <Home size={18} className="mr-2" />
                            Dashboard
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default NotAuthorized;