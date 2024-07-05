import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Invite = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const boardId = queryParams.get('board');
    const [ws, setWs] = useState(null);
    const [connected, setConnected] = useState(false);
    const [name, setName] = useState('User')

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:4000'); // Replace with your WebSocket URL
        setWs(socket);

        socket.onopen = () => {
            console.log('WebSocket connected');
            setConnected(true);
        };

        socket.onmessage = (event) => {
            console.log('WebSocket message:', event.data);
        };

        socket.onclose = () => {
            console.log('WebSocket disconnected');
            setConnected(false);
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        return () => {
            socket.close();
        };
    }, []);

    const handleAcceptInvite = () => {
        if (connected) {
            ws.send(JSON.stringify({ type: 'user-name', name }));
            navigate(`/${boardId}`);
        } else {
            console.log('WebSocket not connected');
        }
    };

    return (
        <div>
            <input type="text" placeholder='enter your name' onChange={(e) => setName(e.target.value)} />
            <button onClick={handleAcceptInvite} disabled={!connected}>
                Accept Invite
            </button>
        </div>
    );
};

export default Invite;
