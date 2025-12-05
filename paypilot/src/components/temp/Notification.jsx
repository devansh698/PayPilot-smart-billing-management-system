// src/components/NotificationsPage.js
import React, { useEffect, useState } from 'react';
import { fetchNotifications, markNotificationAsRead } from '../api';
import { Container, ListGroup, ListGroupItem, Button, Alert } from 'reactstrap';

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadNotifications = async () => {
            try {
                const response = await fetchNotifications();
                setNotifications(response.data);
                setLoading(false);
            } catch (error) {
                setError('Failed to fetch notifications');
                setLoading(false);
            }
        };
        loadNotifications();
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            await markNotificationAsRead(id);
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            setError('Failed to mark notification as read');
        }
    };

    return (
        <Container className="mt-5">
            <h2>Your Notifications</h2>
            {loading ? (
                <h2>Loading...</h2>
            ) : (
                <>
                    {error && <Alert color="danger">{error}</Alert>}
                    <ListGroup>
                        {notifications.map(notification => (
                            <ListGroupItem key={notification._id} className={notification.isRead ? 'read' : 'unread'}>
                                {notification.message}
                                {!notification.isRead && (
                                    <Button color="success" onClick={() => handleMarkAsRead(notification._id)}>Mark as Read</Button>
                                )}
                            </ListGroupItem>
                        ))}
                    </ListGroup>
                </>
            )}
        </Container>
    );
};

export default NotificationsPage;