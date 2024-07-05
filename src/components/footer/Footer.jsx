import React, { useEffect, useState } from 'react';
import { BiUndo, BiRedo } from 'react-icons/bi';
import { useLocation } from 'react-router-dom';

const Footer = ({ setBgCol, bgCol, elements, setElements, user, socket }) => {
    const [disabledBtn, setDisabledButton] = useState(false);
    const [shareText, setShareText] = useState("Share");
    const location = useLocation()
    const handleUndo = () => {

        const a = elements.filter((ele) => ele.user === user)
        const lastElement = a[a?.length - 1]
        console.log(lastElement)
        const undoMessage = JSON.stringify({ type: 'undo', data: JSON.stringify(lastElement) });
        socket.send(undoMessage);

        setElements(prev => {
            const newEle = prev.filter((ele) => ele !== lastElement);
            // console.log(newEle)

            return newEle
        })
    };
    useEffect(() => {
        if (elements.length === 0) {
            setDisabledButton(true)
        } else {
            setDisabledButton(false)
        }
    }, [elements])

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.ctrlKey && event.key === 'z') {
                handleUndo();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);


    const handleClear = () => {
        setBgCol('#f0faff')
        const undoMessage = JSON.stringify({ type: 'reset', data: [] });
        socket.send(undoMessage);

        setElements([]);
    }

    const handleShare = () => {
        const path = location?.pathname
        const id = path.split('/')[1];
        const url = `${import.meta.env.VITE_BASE_URL}/${id}`
        navigator.clipboard.writeText(url).then(
            () => {
                setShareText("Copied...");
                setTimeout(() => {
                    setShareText("Share");
                }, 2000);
            },
            (err) => {
                console.error("Failed to copy text: ", err);
            }
        );
    }

    const handleChangeBgColor = (e) => {
        setBgCol(e.target.value);
        const undoMessage = JSON.stringify({ type: 'bg-change', bgColor: e.target.value });
        socket.send(undoMessage)
    }

    return (
        <div className="flex justify-center items-center bg-[#ececf4] px-2 py-1 rounded-lg space-x-4 w-fit shadow-md">
            {/* Undo button */}
            <button
                disabled={disabledBtn}
                onClick={handleUndo}
                className={`p-2 ${disabledBtn && 'text-gray-300 cursor-not-allowed'} rounded-md`}
            >
                <BiUndo />
            </button>
            <button
                disabled={disabledBtn}
                onClick={handleClear}
                className={`p-2 ${disabledBtn && 'text-gray-300 cursor-not-allowed'} rounded-md`}
            >
                Reset
            </button>
            {/* Redo button */}
            {/* <button
                disabled={disabledBtn.redo}
                onClick={handleRedo}
                className={`p-2 ${disabledBtn.redo && 'text-gray-300 cursor-not-allowed'} rounded-md`}
            >
                <BiRedo />
            </button> */}
            {/* Color picker (unchanged) */}
            <div className="relative cursor-pointer">
                <input
                    type="color"
                    value={bgCol}
                    onChange={handleChangeBgColor}
                    className="absolute opacity-0 cursor-pointer"
                />
                <div className="flex items-center cursor-pointer">
                    <div
                        className="w-8 h-8 rounded-full border border-gray-300 shadow-md bg-rainbow-circle cursor-pointer"
                    // style={{ backgroundColor: bgCol }}
                    ></div>
                </div>
            </div>
            <button
                onClick={handleShare}
                className={`p-2  rounded-md`}
            >
                {shareText}
            </button>
        </div>
    );
};

export default Footer;
