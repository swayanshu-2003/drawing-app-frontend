import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { uuid } from "../../utils/uuidGenerator"
import image from "../../assets/landingImg.jpg"
import { useNavigate } from 'react-router-dom';


const LandingPage = () => {
    const navigate = useNavigate()

    const handleCreateWhiteBoard = () => {
        const roomId = uuid();
        navigate(`${roomId}`);
    }



    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <header className="text-5xl font-extrabold text-gray-900 mb-4">
                Sketch It
            </header>
            <p className="text-gray-700 text-xl mb-8 text-center px-4">
                Create and collaborate on a digital whiteboard with ease. Sketch It provides a seamless experience for your creative needs.
            </p>
            {image && (
                <div className="w-full max-w-screen-md h-64 mb-8 rounded-lg shadow-lg overflow-hidden">
                    <img src={image} alt="Sketch Application from Unsplash" className="w-full h-full object-cover" />
                </div>
            )}
            <button
                className="bg-green-600 text-white font-bold py-2 px-4 rounded-full shadow-lg hover:bg-green-500 transition duration-300"
                onClick={handleCreateWhiteBoard}
            >
                Create Whiteboard
            </button>
        </div>
    );
};

export default LandingPage;
