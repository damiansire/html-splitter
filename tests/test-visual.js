import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Function to find all HTML files recursively
function findHtmlFiles(dir) {
    let results = [];
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            // Skip node_modules, dist and output directories
            if (file !== 'node_modules' && file !== 'dist' && file !== 'output') {
                results = results.concat(findHtmlFiles(filePath));
            }
        } else if (file.endsWith('.html')) {
            results.push(filePath);
        }
    });
    
    return results;
}

// Function to take screenshot of a page
async function takeScreenshot(page, filePath) {
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    
    // Take screenshot
    const screenshot = await page.screenshot({
        fullPage: true,
        type: 'png'
    });
    
    return screenshot;
}

// Function to compare two images
function compareImages(img1, img2) {
    const img1Data = PNG.sync.read(img1);
    const img2Data = PNG.sync.read(img2);
    
    const { width, height } = img1Data;
    const diff = new PNG({ width, height });
    
    const numDiffPixels = pixelmatch(
        img1Data.data,
        img2Data.data,
        diff.data,
        width,
        height,
        { threshold: 0.1 }
    );
    
    return {
        isDifferent: numDiffPixels > 0,
        diffImage: PNG.sync.write(diff),
        diffPixels: numDiffPixels
    };
}

async function runVisualTests() {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    // Find all HTML files
    const htmlFiles = findHtmlFiles(__dirname);
    
    // Create screenshots directory if it doesn't exist
    const screenshotsDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    
    // Process each HTML file
    for (const filePath of htmlFiles) {
        const fileName = path.basename(filePath);
        const folderName = fileName.replace('.html', '');
        const outputPath = path.join(__dirname, 'output', folderName, fileName);
        
        if (!fs.existsSync(outputPath)) {
            console.log(`Skipping ${fileName} - No generated version found`);
            continue;
        }
        
        try {
            // Take screenshot of original
            await page.goto(`file://${filePath}`);
            const originalScreenshot = await takeScreenshot(page, filePath);
            
            // Take screenshot of generated
            await page.goto(`file://${outputPath}`);
            const generatedScreenshot = await takeScreenshot(page, outputPath);
            
            // Compare screenshots
            const { isDifferent, diffImage, diffPixels } = compareImages(
                originalScreenshot,
                generatedScreenshot
            );
            
            // Save results
            const testDir = path.join(screenshotsDir, folderName);
            if (!fs.existsSync(testDir)) {
                fs.mkdirSync(testDir, { recursive: true });
            }
            
            fs.writeFileSync(path.join(testDir, 'original.png'), originalScreenshot);
            fs.writeFileSync(path.join(testDir, 'generated.png'), generatedScreenshot);
            
            if (isDifferent) {
                fs.writeFileSync(path.join(testDir, 'diff.png'), diffImage);
                console.log(`❌ ${fileName} - Visual differences found (${diffPixels} pixels)`);
            } else {
                console.log(`✅ ${fileName} - No visual differences found`);
            }
            
        } catch (error) {
            console.error(`Error testing ${fileName}:`, error.message);
        }
    }
    
    await browser.close();
}

// Run tests
runVisualTests().catch(console.error); 