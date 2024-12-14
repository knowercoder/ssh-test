import * as THREE from 'three';

/**
 * Creates a texture with HTML text drawn on a canvas.
 * @param {string} text - The text to render.
 * @param {object} options - Styling options.
 * @param {number} options.width - Canvas width.
 * @param {number} options.height - Canvas height.
 * @param {string} options.backgroundColor - Background color.
 * @param {string} options.textColor - Text color.
 * @param {string} options.font - Font style.
 * @returns {THREE.Texture} - The generated texture.
 */
export function createTextTexture(text, options = {}) {
    const {
        width = 512,
        height = 512,
        backgroundColor = 'transparent',
        textColor = '#000000',
        font = '48px Arial',
        textAlign = 'center',
        textBaseline = 'middle'
    } = options;

    // Create a canvas element
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    // Get the 2D context
    const ctx = canvas.getContext('2d');

    // Fill the background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Set text properties
    ctx.fillStyle = textColor;
    ctx.font = font;
    ctx.textAlign = textAlign;
    ctx.textBaseline = textBaseline;

    // Draw the text
    ctx.fillText(text, width / 2, height / 2);

    // Create a Three.js texture
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.needsUpdate = true; // Ensure the texture updates

    return texture;
}