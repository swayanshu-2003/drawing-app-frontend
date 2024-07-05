export function getRandomHexColor() {
    // Generate random values for red, green, and blue components
    const red = Math.floor(Math.random() * 256); // Random integer between 0 and 255
    const green = Math.floor(Math.random() * 256);
    const blue = Math.floor(Math.random() * 256);

    // Convert decimal to hexadecimal
    const redHex = red.toString(16).padStart(2, '0'); // Convert to hex and pad with zero if needed
    const greenHex = green.toString(16).padStart(2, '0');
    const blueHex = blue.toString(16).padStart(2, '0');

    // Concatenate the hexadecimal values
    const hexColor = `#${redHex}${greenHex}${blueHex}`;

    return hexColor;
}