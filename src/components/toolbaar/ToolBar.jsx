import React, { useState } from 'react';
import { BsFillEraserFill } from 'react-icons/bs';
import { CgShapeRhombus } from 'react-icons/cg';
import { FaRegCircle, FaRegSquare } from 'react-icons/fa';
import { GiArrowCursor } from 'react-icons/gi';
import { IoIosArrowRoundForward } from 'react-icons/io';
import { IoRemoveOutline } from 'react-icons/io5';
import { LuPencil } from 'react-icons/lu';
import { TiSortAlphabetically } from 'react-icons/ti';

const ToolBar = ({ tool, setTool, selectedColor, setSelectedColor }) => {

    // Default color
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const buttons = [
        {
            cta: "select",
            icon: <GiArrowCursor />,
            className: "",
        },
        {
            cta: "rectangle",
            icon: <FaRegSquare />,
            className: "",
        },
        {
            cta: "rhombus",
            icon: <CgShapeRhombus />,
            className: "",
        },
        {
            cta: "ellipse",
            icon: <FaRegCircle />,
            className: "",
        },
        {
            cta: "arrow",
            icon: <IoIosArrowRoundForward />,
            className: "text-2xl p-[3px]",
        },
        {
            cta: "line",
            icon: <IoRemoveOutline />,
            className: "text-2xl p-[3px]",
        },
        {
            cta: "pencil",
            icon: <LuPencil />,
            className: "",
        },
        {
            cta: "text",
            icon: <TiSortAlphabetically />,
            className: "text-2xl p-[3px]",
        },
        // {
        //     cta: "eraser",
        //     icon: <BsFillEraserFill />,
        //     className: "",
        // },
    ];

    const colors = [
        { name: "White", hex: "#ffffff" },
        { name: "Red", hex: "#ff0000" },
        { name: "Green", hex: "#00ff00" },
        { name: "Blue", hex: "#0000ff" },
        { name: "Yellow", hex: "#ffff00" },
    ];

    const handleSelectTool = (cta) => {
        setTool(cta);
    };

    const handleColorChange = (color) => {
        setSelectedColor(color);
        setDropdownOpen(false);
    };

    return (
        <div className="flex flex-row justify-center items-center bg-white px-2 md:px-4 py-1 shadow-md rounded-lg md:space-x-4 w-fit  sm:gap-4">
            {buttons.map((btn, index) => (
                <button
                    onClick={() => handleSelectTool(btn.cta)}
                    key={index}
                    className={`p-2 hover:bg-gray-200 rounded-md ${btn.className} ${tool === btn.cta && 'bg-purple-700 text-white hover:bg-purple-600'}`}
                >
                    {btn.icon}
                </button>
            ))}
            <div className="relative">
                <input

                    type="color"
                    value={selectedColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="absolute opacity-0"
                />
                <div className="flex items-center cursor-pointer" onClick={() => setDropdownOpen(!dropdownOpen)}>
                    <div
                        className="w-8 h-8 rounded-full border border-gray-300 shadow-md bg-rainbow-circle"
                    // style={{ backgroundColor: selectedColor }}
                    ></div>
                    <div className="w-6 h-6 ml-2 p-1 border border-gray-300 rounded-md" style={{ backgroundColor: selectedColor }}>

                    </div>
                </div>
                {dropdownOpen && (
                    <div className="absolute mt-2 p-2 ml-7 bg-white border border-gray-300 rounded-md shadow-lg">
                        {colors.map((color, index) => (
                            <div
                                key={index}
                                className="flex items-center p-1 cursor-pointer hover:bg-gray-200"
                                onClick={() => handleColorChange(color.hex)}
                            >
                                <span className="w-6 h-6 block rounded" style={{ backgroundColor: color.hex }}></span>

                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ToolBar;
