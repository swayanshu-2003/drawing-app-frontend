import React, { useEffect, useRef, useState } from 'react';
import ToolBar from '../toolbaar/ToolBar';
import Footer from '../footer/Footer';
import CanvasDraw from '../canvas/CanvasDraw';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const Draw = () => {
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const [selectedColor, setSelectedColor] = useState("#000000");
    const [bgCol, setBgCol] = useState('#f0faff');
    const [tool, setTool] = useState('pencil');
    const [elements, setElements] = useState([]);
    const [socket, setSocket] = useState(null);
    const [user, setUser] = useState(0);
    const [otherCursors, setOtherCursors] = useState({});
    const [cursorColor, setCursorColor] = useState('black');

    const loc = useLocation();
    const room = loc.pathname.split('/')[1]; // Set your room name here

    useEffect(() => {
        // Connect to the WebSocket server with the room protocol
        const ws = new WebSocket(import.meta.env.VITE_WS_URL, room);
        setSocket(ws);

        // Cleanup on component unmount
        return () => {
            ws.close();
        };
    }, [room]);

    useEffect(() => {
        async function sendEle() {
            await axios.post(import.meta.env.VITE_BACKEND_URL, elements);
        }
        sendEle();
    }, [elements]);

    useEffect(() => {
        async function getEle() {
            const data = await axios.get(import.meta.env.VITE_BACKEND_URL);
            setElements(data?.data?.elements);
        }
        getEle();
    }, []);

    useEffect(() => {
        if (!socket) return;

        // Handle incoming messages
        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'cursor') {
                if (message.room === room) {

                    setCursorColor(message?.color);
                    setOtherCursors(prevCursors => ({
                        ...prevCursors,
                        [message.user]: { x: message.x, y: message.y, color: message?.color, userName: message.userName }
                    }));
                }

            } else if (message.type === 'undo') {
                const data = JSON.parse(message?.data);
                setElements(prev => {
                    const filtered = prev.filter(ele => ele.id !== data.id);
                    return filtered;
                });

            } else if (message.type === 'erase') {
                const a = JSON.parse(message?.data);
                const data = [...a][0];
                setElements(prev => {
                    if (prev?.length === 1) {
                        return [];
                    }
                    const filtered = prev.filter(ele => ele.id !== data.id);

                    return filtered;
                });

            } else if (message.type === 'reset') {
                setElements([]);
            } else if (message.type === 'bg-change') {
                setBgCol(message.bgColor);
            } else {
                setUser(message.user);
                setCursorColor(message?.color);
                const ele = JSON.parse(message.element);
                setElements((prevElements) => [...prevElements, ele]);
            }
        };

    }, [socket]);

    return (
        <div className="min-h-screen flex flex-col items-center bg-gray-100 overflow-hidden">
            <div className="w-auto absolute top-3 my-0 flex items-start justify-center">
                <ToolBar tool={tool} setTool={setTool} selectedColor={selectedColor} setSelectedColor={setSelectedColor} />
            </div>
            <CanvasDraw
                bgCol={bgCol}
                tool={tool}
                canvasRef={canvasRef}
                ctxRef={ctxRef}
                elements={elements}
                setElements={setElements}
                color={selectedColor}
                socket={socket}
                user={user}
                otherCursors={otherCursors}
                cursorColor={cursorColor}
            />
            <div className="w-fit flex absolute bottom-3 right-3">
                <Footer socket={socket} user={user} elements={elements} setElements={setElements} tool={tool} setTool={setTool} bgCol={bgCol} setBgCol={setBgCol} />
            </div>
        </div>
    );
};

export default Draw;
