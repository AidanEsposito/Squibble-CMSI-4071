import puppeteer from 'puppeteer';
import fs from 'fs';
import { getStorage, ref, uploadBytes } from "firebase/storage";
import app from './firebaseConfig.js'; // Make sure to include .js if using ES modules

const storage = getStorage(app);
const path = './Screenshots';

async function takeScreenshot(url) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' }); 

  const fileName = `screenshot-${new Date().toISOString().replace(/:/g, '-')}.png`;
  const filePath = `${path}/${fileName}`;
  await page.screenshot({ path: filePath });

  console.log(`Screenshot taken: ${fileName}`);

  const screenshotData = fs.readFileSync(filePath);
  const screenshotRef = ref(storage, `screenshots/${fileName}`);
  await uploadBytes(screenshotRef, screenshotData);
  console.log(`Screenshot uploaded to Firebase Storage as: ${fileName}`);

  await browser.close();
  return fileName;
}

takeScreenshot('http://localhost:3000/');
