import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, FormGroup, Label, Input, Button, Alert } from 'reactstrap';

const SettingsPage = () => {
    const [settings, setSettings] = useState({ theme: '', notifications: false });
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/settings/');
                const data = await response.json();
                setSettings(data);
            } catch (error) {
                setError('Failed to fetch settings');
            }
        };
        fetchSettings();
    }, []);

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        try {
            await api.put('/settings/', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });
            alert('Settings saved successfully!');
        } catch (error) {
            setError('Failed to save settings');
        }
    };

    return (
        <Container className="mt-5">
            <Row>
                <Col md={6}>
                    <h2>Settings</h2>
                    {error && <Alert color="danger">{error}</Alert>}
                    <Form onSubmit={handleSaveSettings}>
                        <FormGroup>
                            <Label>Theme</Label>
                            <Input type="select" value={settings.theme} onChange={(e) => setSettings({ ...settings, theme: e.target.value })}>
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                            </Input>
                        </FormGroup>
                        <FormGroup check>
                            <Label check>
                                <Input type="checkbox" checked={settings.notifications} onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })} />
                                Enable Notifications
                            </Label>
                        </FormGroup>
                        <Button type="submit" color="primary">Save Settings</Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default SettingsPage;