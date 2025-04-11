/**
 * HTML Splitter - Main Entry Point
 * 
 * This is the main entry point for the HTML Splitter application.
 * It handles the initialization and coordination of the application.
 */

import { splitHTML } from './utils/splitter.js';

// Example usage
const html = '<div>Hello World</div>';
const result = splitHTML(html);
console.log(result);

export { splitHTML }; 