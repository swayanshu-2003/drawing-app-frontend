import React, { useEffect, useState } from 'react';
import { BsFillCircleFill } from 'react-icons/bs';
import { FaMousePointer } from 'react-icons/fa';
import rough from 'roughjs';
import { v4 as uuidv4 } from 'uuid';
import { getRandomHexColor } from '../../utils/randomColourGenerator'
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const roughGenerator = rough.generator();

const CanvasDraw = ({ cursorColor, otherCursors, bgCol, tool, canvasRef, ctxRef, elements, setElements, color, socket, user }) => {
    const [isDrawing, setIsDrawing] = useState(false);
    const [textPosition, setTextPosition] = useState(null);
    const [currentText, setCurrentText] = useState('');
    const [showCursor, setShowCursor] = useState(false);
    const [eraserPath, setEraserPath] = useState([]);
    const [selectedElements, setSelectedElements] = useState([]);
    const [selectionRect, setSelectionRect] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [drawingElement, setDrawingElement] = useState(null);




    const loc = useLocation();



    // useEffect(() => {
    //     const canvas = canvasRef.current;
    //     const ctx = canvas.getContext('2d');

    //     // Clear canvas
    //     ctx.clearRect(0, 0, canvas.width, canvas.height);

    //     // Render other users' cursors
    //     Object.keys(otherCursors).forEach(userId => {
    //         const { x, y } = otherCursors[userId];
    //         const iconSize = 20; // Size of the cursor icon
    //         ctx.beginPath();
    //         ctx.arc(x, y, iconSize / 2, 0, 2 * Math.PI);
    //         ctx.fillStyle = 'blue'; // Customize cursor color
    //         ctx.fill();
    //     });
    // }, [otherCursors]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.lineCap = "round";

        ctxRef.current = ctx;

        const handleKeyDown = (e) => {
            if (textPosition && tool === 'text') {
                if (e.key === 'Enter') {
                    const newElement = {
                        id: uuidv4(),
                        type: 'text',
                        offsetX: textPosition.x,
                        offsetY: textPosition.y,
                        text: currentText,
                        stroke: color // Store the current color with the element
                    }
                    setElements(prevElements => [
                        ...prevElements,
                        newElement
                    ]);
                    setTextPosition(null);
                    setCurrentText('');
                    setShowCursor(false);
                    sendElementToServer(newElement)

                } else if (e.key === 'Backspace') {
                    setCurrentText(currentText.slice(0, -1));
                } else if (e.key.length === 1) {
                    setCurrentText(currentText + e.key);
                }
            } else if (e.key === 'Delete') {
                setElements(prevElements => prevElements.filter((_, index) => !selectedElements.includes(index)));
                setSelectedElements([]);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [textPosition, tool, currentText, setElements, color, selectedElements]);

    useEffect(() => {
        ctxRef.current.strokeStyle = color;
    }, [color]);





    useEffect(() => {
        if (ctxRef.current) {
            const ctx = ctxRef.current;
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

            elements.length > 0 && elements?.forEach((element, index) => {
                ctx.strokeStyle = selectedElements?.includes(index) ? 'gray' : (element?.stroke || color); // Highlight selected elements

                ctx.lineWidth = selectedElements.includes(index) ? 3 : 2;
                if (element?.type === 'pencil') {
                    const path = element.path;
                    ctx.beginPath();
                    ctx.moveTo(path[0][0], path[0][1]);
                    for (let i = 1; i < path.length; i++) {
                        ctx.lineTo(path[i][0], path[i][1]);
                    }
                    ctx.stroke();
                } else if (element?.type === 'line') {
                    ctx.beginPath();
                    ctx.moveTo(element.offsetX, element.offsetY);
                    ctx.lineTo(element.width, element.height);
                    ctx.stroke();
                } else if (element?.type === 'rectangle') {
                    ctx.beginPath();
                    ctx.rect(element?.offsetX, element.offsetY, element.width, element.height);
                    ctx.stroke();
                } else if (element?.type === 'ellipse') {
                    ctx.beginPath();
                    ctx.ellipse(
                        element?.offsetX + element?.width / 2,
                        element?.offsetY + element?.height / 2,
                        element?.width / 2,
                        element?.height / 2,
                        0,
                        0,
                        2 * Math.PI
                    );
                    ctx.stroke();
                } else if (element?.type === 'arrow') {
                    const { startX, startY, endX, endY } = element;
                    const dx = endX - startX;
                    const dy = endY - startY;
                    const angle = Math.atan2(dy, dx);
                    const arrowLength = Math.sqrt(dx * dx + dy * dy);

                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(endX, endY);
                    ctx.stroke();

                    const arrowHeadSize = 10;
                    ctx.beginPath();
                    ctx.moveTo(endX, endY);
                    ctx.lineTo(
                        endX - arrowHeadSize * Math.cos(angle - Math.PI / 6),
                        endY - arrowHeadSize * Math.sin(angle - Math.PI / 6)
                    );
                    ctx.lineTo(
                        endX - arrowHeadSize * Math.cos(angle + Math.PI / 6),
                        endY - arrowHeadSize * Math.sin(angle + Math.PI / 6)
                    );
                    ctx.lineTo(endX, endY);
                    ctx.stroke();
                } else if (element?.type === 'rhombus') {
                    const { startX, startY, endX, endY } = element;
                    const width = Math.abs(endX - startX);
                    const height = Math.abs(endY - startY);
                    const centerX = (startX + endX) / 2;
                    const centerY = (startY + endY) / 2;
                    const angle = Math.atan2(endY - startY, endX - startX);

                    ctx.beginPath();
                    ctx.moveTo(centerX + width / 2 * Math.cos(angle + Math.PI / 4), centerY + width / 2 * Math.sin(angle + Math.PI / 4));
                    ctx.lineTo(centerX + height / 2 * Math.cos(angle + Math.PI * 3 / 4), centerY + height / 2 * Math.sin(angle + Math.PI * 3 / 4));
                    ctx.lineTo(centerX - width / 2 * Math.cos(angle + Math.PI / 4), centerY - width / 2 * Math.sin(angle + Math.PI / 4));
                    ctx.lineTo(centerX - height / 2 * Math.cos(angle + Math.PI * 3 / 4), centerY - height / 2 * Math.sin(angle + Math.PI * 3 / 4));
                    ctx.closePath();
                    ctx.stroke();
                } else if (element?.type === 'text') {
                    const { offsetX, offsetY, text, stroke } = element;
                    ctx.font = '20px Patrick Hand';
                    ctx.fillStyle = stroke || color;
                    ctx.fillText(text, offsetX, offsetY);
                }
            });

            if (textPosition) {
                ctx.font = '20px Arial';
                ctx.fillText(currentText, textPosition.x, textPosition.y);
                if (showCursor) {
                    const textWidth = ctx.measureText(currentText).width;
                    ctx.fillRect(textPosition.x + textWidth, textPosition.y - 16, 2, 20);
                }
            }

            if (selectionRect) {
                ctx.strokeStyle = 'red';
                ctx.lineWidth = 1;
                ctx.setLineDash([5, 3]);
                ctx.strokeRect(selectionRect.x, selectionRect.y, selectionRect.width, selectionRect.height);
                ctx.setLineDash([]);
            }
            // Object.keys(otherCursors).forEach(userId => {
            //     const { x, y } = otherCursors[userId];
            //     ctx.fillStyle = 'blue'; // Customize cursor color
            //     ctx.beginPath();
            //     ctx.arc(x, y, 5, 0, 2 * Math.PI);
            //     ctx.fill();
            // });
        }
    }, [elements, currentText, textPosition, showCursor, color, selectedElements, selectionRect]);

    const isPointInElement = (x, y, element) => {
        const offsetX = element.offsetX || element.startX;
        const offsetY = element.offsetY || element.startY;
        const width = element.width || element.endX - element.startX;
        const height = element.height || element.endY - element.startY;

        if (element?.type === 'text') {
            const textWidth = ctxRef.current.measureText(element.text).width;
            const textHeight = 20; // Approximate text height
            return (
                x >= offsetX &&
                x <= offsetX + textWidth &&
                y >= offsetY - textHeight &&
                y <= offsetY
            );
        }

        if (element?.type === 'pencil') {
            return element.path.some(([px, py]) => {
                return (
                    x >= px - 5 && x <= px + 5 &&
                    y >= py - 5 && y <= py + 5
                );
            });
        }

        return (
            x >= offsetX && x <= offsetX + width && y >= offsetY && y <= offsetY + height
        );
    };

    const isElementInRect = (element, rect) => {
        const offsetX = element.offsetX || element.startX;
        const offsetY = element.offsetY || element.startY;
        const width = element.width || element.endX - element.startX;
        const height = element.height || element.endY - element.startY;

        return (
            offsetX >= rect.x &&
            offsetX + width <= rect.x + rect.width &&
            offsetY >= rect.y &&
            offsetY + height <= rect.y + rect.height
        );
    };

    const isElementIntersectingEraserPath = (element, eraserPath) => {
        return eraserPath.some(([x, y]) => isPointInElement(x, y, element));
    };

    const handleMouseDown = (e) => {
        const { offsetX, offsetY } = e.nativeEvent;

        if (tool === 'eraser') {
            setEraserPath([[offsetX, offsetY]]);
            const newElements = elements.filter(element => !isPointInElement(offsetX, offsetY, element));


            const erasedElement = elements.filter(element => isPointInElement(offsetX, offsetY, element))


            const eraseMessage = JSON.stringify({ type: 'erase', data: JSON.stringify(erasedElement) });


            socket.send(eraseMessage);

            setElements(newElements);
            return;
        }

        if (tool === 'select') {
            setSelectionRect({ x: offsetX, y: offsetY, width: 0, height: 0 });
            setIsDrawing(true);
            return;
        }

        if (tool === 'pencil') {
            setElements(prevElements => [
                ...prevElements, {
                    id: uuidv4(),
                    user: user,
                    offsetX,
                    offsetY,
                    type: 'pencil',
                    path: [[offsetX, offsetY]],
                    stroke: color // Store the current color with the element
                }
            ]);
        } else if (tool === 'line') {
            setElements(prevElements => [
                ...prevElements, {
                    id: uuidv4(),
                    user: user,
                    type: 'line',
                    offsetX,
                    offsetY,
                    width: offsetX,
                    height: offsetY,
                    stroke: color // Store the current color with the element
                }
            ]);
        } else if (tool === 'rectangle') {
            setElements(prevElements => [
                ...prevElements, {
                    id: uuidv4(),
                    user: user,
                    type: 'rectangle',
                    offsetX,
                    offsetY,
                    width: 0,
                    height: 0,
                    stroke: color // Store the current color with the element
                }
            ]);
        } else if (tool === 'ellipse') {
            setElements(prevElements => [
                ...prevElements, {
                    id: uuidv4(),
                    user: user,
                    type: 'ellipse',
                    offsetX,
                    offsetY,
                    width: 0,
                    height: 0,
                    stroke: color // Store the current color with the element
                }
            ]);
        } else if (tool === 'arrow') {
            setElements(prevElements => [
                ...prevElements, {
                    id: uuidv4(),
                    user: user,
                    type: 'arrow',
                    startX: offsetX,
                    startY: offsetY,
                    endX: offsetX,
                    endY: offsetY,
                    stroke: color // Store the current color with the element
                }
            ]);
        } else if (tool === 'rhombus') {
            setElements(prevElements => [
                ...prevElements, {
                    id: uuidv4(),
                    user: user,
                    type: 'rhombus',
                    startX: offsetX,
                    startY: offsetY,
                    endX: offsetX,
                    endY: offsetY,
                    stroke: color // Store the current color with the element
                }
            ]);
        } else if (tool === 'text') {
            setTextPosition({ x: offsetX, y: offsetY });
            setShowCursor(true);
        }

        setIsDrawing(true);
    };

    const handleMouseMove = (e) => {
        const { offsetX, offsetY } = e.nativeEvent;

        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'cursor', x: offsetX, y: offsetY, room: loc.pathname.split('/')[1] }));
        }

        if (isDrawing) {
            if (tool === 'select') {
                setSelectionRect(prevRect => ({
                    ...prevRect,
                    width: offsetX - prevRect.x,
                    height: offsetY - prevRect.y
                }));
                return;
            }

            if (tool === 'pencil') {
                setElements(prevElements => {
                    const newElements = [...prevElements];
                    const currentElement = newElements[newElements.length - 1];
                    const newPath = [...currentElement.path, [offsetX, offsetY]];
                    newElements[newElements.length - 1] = {
                        ...currentElement,
                        path: newPath,
                        stroke: color // Update the stroke color of the pencil path
                    };
                    sendElementToServer(newElements[newElements.length - 1])
                    setDrawingElement(newElements[newElements.length - 1])
                    return newElements;
                });
            } else if (tool === 'line') {
                setElements(prevElements =>
                    prevElements.map((ele, index) => {
                        if (index === elements.length - 1) {
                            const newEle = {
                                ...ele,
                                width: offsetX,
                                height: offsetY,
                                stroke: color // Update the stroke color of the line
                            };
                            setDrawingElement(newEle)
                            // sendElementToServer(drawingElement)

                            return newEle;
                        } else {
                            return ele;
                        }
                    })
                );
            } else if (tool === 'rectangle') {
                setElements(prevElements =>
                    prevElements.map((ele, index) => {
                        if (index === elements.length - 1) {
                            const newEle = {
                                ...ele,
                                width: offsetX - ele?.offsetX,
                                height: offsetY - ele?.offsetY,
                                stroke: color // Update the stroke color of the rectangle
                            }

                            setDrawingElement(newEle)

                            return newEle;
                        } else {
                            return ele;
                        }
                    })
                );
            } else if (tool === 'ellipse') {
                setElements(prevElements =>
                    prevElements.map((ele, index) => {
                        if (index === elements.length - 1) {
                            const newEle = {
                                ...ele,
                                width: Math.abs(offsetX - ele.offsetX) * 2,
                                height: Math.abs(offsetY - ele.offsetY) * 2,
                                stroke: color // Update the stroke color of the ellipse
                            }

                            setDrawingElement(newEle);

                            return newEle;
                        } else {
                            return ele;
                        }
                    })
                );
            } else if (tool === 'arrow') {
                setElements(prevElements =>
                    prevElements.map((ele, index) => {
                        if (index === elements.length - 1) {
                            const newEle = {
                                ...ele,
                                endX: offsetX,
                                endY: offsetY,
                                stroke: color // Update the stroke color of the arrow
                            }

                            setDrawingElement(newEle);

                            return newEle;
                        } else {
                            return ele;
                        }
                    })
                );
            } else if (tool === 'rhombus') {
                setElements(prevElements =>
                    prevElements.map((ele, index) => {
                        if (index === elements.length - 1) {
                            const newEle = {
                                ...ele,
                                endX: offsetX,
                                endY: offsetY,
                                stroke: color // Update the stroke color of the arrow
                            }

                            setDrawingElement(newEle);

                            return newEle;
                        } else {
                            return ele;
                        }
                    })
                );
            } else if (tool === 'eraser') {
                setEraserPath(prevPath => {
                    const newPath = [...prevPath, [offsetX, offsetY]];
                    const newElements = elements.filter(element => !isElementIntersectingEraserPath(element, newPath));
                    const erasedElement = elements.filter(element => isElementIntersectingEraserPath(element, newPath));
                    const eraseMessage = JSON.stringify({ type: 'erase', data: JSON.stringify(erasedElement) });
                    socket.send(eraseMessage);
                    setElements(newElements);
                    return newPath;
                });
            }
        }
    };




    const handleMouseUp = (e) => {
        if (tool === 'select' && selectionRect) {
            const selectedIndexes = elements
                .map((element, index) => (isElementInRect(element, selectionRect) ? index : -1))
                .filter(index => index !== -1);
            setSelectedElements(selectedIndexes);
            setSelectionRect(null);
        }
        sendElementToServer(drawingElement)
        setIsDrawing(false);
        setEraserPath([]);
    };
    const sendElementToServer = (element) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ element: JSON.stringify(element) }));
        }
    };




    const handleTouchDown = (e) => {
        const offsetX = e.targetTouches[0].clientX;
        const offsetY = e.targetTouches[0].clientY;
        if (tool === 'eraser') {
            setEraserPath([[offsetX, offsetY]]);
            const newElements = elements.filter(element => !isPointInElement(offsetX, offsetY, element));


            const erasedElement = elements.filter(element => isPointInElement(offsetX, offsetY, element))


            const eraseMessage = JSON.stringify({ type: 'erase', data: JSON.stringify(erasedElement) });


            socket.send(eraseMessage);

            setElements(newElements);
            return;
        }

        if (tool === 'select') {
            setSelectionRect({ x: offsetX, y: offsetY, width: 0, height: 0 });
            setIsDrawing(true);
            return;
        }

        if (tool === 'pencil') {
            setElements(prevElements => [
                ...prevElements, {
                    id: uuidv4(),
                    user: user,
                    offsetX,
                    offsetY,
                    type: 'pencil',
                    path: [[offsetX, offsetY]],
                    stroke: color // Store the current color with the element
                }
            ]);
        } else if (tool === 'line') {
            setElements(prevElements => [
                ...prevElements, {
                    id: uuidv4(),
                    user: user,
                    type: 'line',
                    offsetX,
                    offsetY,
                    width: offsetX,
                    height: offsetY,
                    stroke: color // Store the current color with the element
                }
            ]);
        } else if (tool === 'rectangle') {
            setElements(prevElements => [
                ...prevElements, {
                    id: uuidv4(),
                    user: user,
                    type: 'rectangle',
                    offsetX,
                    offsetY,
                    width: 0,
                    height: 0,
                    stroke: color // Store the current color with the element
                }
            ]);
        } else if (tool === 'ellipse') {
            setElements(prevElements => [
                ...prevElements, {
                    id: uuidv4(),
                    user: user,
                    type: 'ellipse',
                    offsetX,
                    offsetY,
                    width: 0,
                    height: 0,
                    stroke: color // Store the current color with the element
                }
            ]);
        } else if (tool === 'arrow') {
            setElements(prevElements => [
                ...prevElements, {
                    id: uuidv4(),
                    user: user,
                    type: 'arrow',
                    startX: offsetX,
                    startY: offsetY,
                    endX: offsetX,
                    endY: offsetY,
                    stroke: color // Store the current color with the element
                }
            ]);
        } else if (tool === 'rhombus') {
            setElements(prevElements => [
                ...prevElements, {
                    id: uuidv4(),
                    user: user,
                    type: 'rhombus',
                    startX: offsetX,
                    startY: offsetY,
                    endX: offsetX,
                    endY: offsetY,
                    stroke: color // Store the current color with the element
                }
            ]);
        } else if (tool === 'text') {
            setTextPosition({ x: offsetX, y: offsetY });
            setShowCursor(true);
        }

        setIsDrawing(true);
    }


    const handleTouchMove = (e) => {
        console.log(e.targetTouches[0].clientX)
        const offsetX = e.targetTouches[0].clientX;
        const offsetY = e.targetTouches[0].clientY;
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'cursor', x: offsetX, y: offsetY, room: loc.pathname.split('/')[1] }));
        }

        if (isDrawing) {
            if (tool === 'select') {
                setSelectionRect(prevRect => ({
                    ...prevRect,
                    width: offsetX - prevRect.x,
                    height: offsetY - prevRect.y
                }));
                return;
            }

            if (tool === 'pencil') {
                setElements(prevElements => {
                    const newElements = [...prevElements];
                    const currentElement = newElements[newElements.length - 1];
                    const newPath = [...currentElement.path, [offsetX, offsetY]];
                    newElements[newElements.length - 1] = {
                        ...currentElement,
                        path: newPath,
                        stroke: color // Update the stroke color of the pencil path
                    };
                    sendElementToServer(newElements[newElements.length - 1])
                    setDrawingElement(newElements[newElements.length - 1])
                    return newElements;
                });
            } else if (tool === 'line') {
                setElements(prevElements =>
                    prevElements.map((ele, index) => {
                        if (index === elements.length - 1) {
                            const newEle = {
                                ...ele,
                                width: offsetX,
                                height: offsetY,
                                stroke: color // Update the stroke color of the line
                            };
                            setDrawingElement(newEle)
                            // sendElementToServer(drawingElement)

                            return newEle;
                        } else {
                            return ele;
                        }
                    })
                );
            } else if (tool === 'rectangle') {
                setElements(prevElements =>
                    prevElements.map((ele, index) => {
                        if (index === elements.length - 1) {
                            const newEle = {
                                ...ele,
                                width: offsetX - ele?.offsetX,
                                height: offsetY - ele?.offsetY,
                                stroke: color // Update the stroke color of the rectangle
                            }

                            setDrawingElement(newEle)

                            return newEle;
                        } else {
                            return ele;
                        }
                    })
                );
            } else if (tool === 'ellipse') {
                setElements(prevElements =>
                    prevElements.map((ele, index) => {
                        if (index === elements.length - 1) {
                            const newEle = {
                                ...ele,
                                width: Math.abs(offsetX - ele.offsetX) * 2,
                                height: Math.abs(offsetY - ele.offsetY) * 2,
                                stroke: color // Update the stroke color of the ellipse
                            }

                            setDrawingElement(newEle);

                            return newEle;
                        } else {
                            return ele;
                        }
                    })
                );
            } else if (tool === 'arrow') {
                setElements(prevElements =>
                    prevElements.map((ele, index) => {
                        if (index === elements.length - 1) {
                            const newEle = {
                                ...ele,
                                endX: offsetX,
                                endY: offsetY,
                                stroke: color // Update the stroke color of the arrow
                            }

                            setDrawingElement(newEle);

                            return newEle;
                        } else {
                            return ele;
                        }
                    })
                );
            } else if (tool === 'rhombus') {
                setElements(prevElements =>
                    prevElements.map((ele, index) => {
                        if (index === elements.length - 1) {
                            const newEle = {
                                ...ele,
                                endX: offsetX,
                                endY: offsetY,
                                stroke: color // Update the stroke color of the arrow
                            }

                            setDrawingElement(newEle);

                            return newEle;
                        } else {
                            return ele;
                        }
                    })
                );
            } else if (tool === 'eraser') {
                setEraserPath(prevPath => {
                    const newPath = [...prevPath, [offsetX, offsetY]];
                    const newElements = elements.filter(element => !isElementIntersectingEraserPath(element, newPath));
                    const erasedElement = elements.filter(element => isElementIntersectingEraserPath(element, newPath));
                    const eraseMessage = JSON.stringify({ type: 'erase', data: JSON.stringify(erasedElement) });
                    socket.send(eraseMessage);
                    setElements(newElements);
                    return newPath;
                });
            }
        }
    }

    const handleTouchUp = (e) => {
        console.log(e)
        if (tool === 'select' && selectionRect) {
            const selectedIndexes = elements
                .map((element, index) => (isElementInRect(element, selectionRect) ? index : -1))
                .filter(index => index !== -1);
            setSelectedElements(selectedIndexes);
            setSelectionRect(null);
        }
        sendElementToServer(drawingElement)
        setIsDrawing(false);
        setEraserPath([]);
    }


    return (
        <div className='w-full overflow-hidden'>
            {Object.keys(otherCursors).map(userId => {


                return (
                    <div
                        key={userId}
                        className="absolute"
                        style={{ left: otherCursors[userId].x, top: otherCursors[userId].y }}
                    >
                        <FaMousePointer className='text-sm' style={{ color: otherCursors[userId].color }} />
                        <span className='text-xs px-1 rounded' style={{ backgroundColor: otherCursors[userId].color, color: "white", border: `1px solid ${otherCursors[userId].color}` }}>{otherCursors[userId].userName}</span>
                    </div>)
            })}
            <canvas
                onTouchStart={handleTouchDown}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchUp}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                ref={canvasRef}
                height={window.innerHeight}
                width={window.innerWidth}
                className={` ${tool && 'cursor-crosshair'}`} style={{ backgroundColor: bgCol }} ></canvas>
        </div >
    );
};

export default CanvasDraw;
