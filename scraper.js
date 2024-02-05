import puppeteer from 'puppeteer';

async function waitForTimeout(milliseconds) {
    return new Promise(r => setTimeout(r, milliseconds));
}

class Scraper {
    constructor() {
        this.getValueSelector = "button.v-btn.v-btn--block.v-btn--is-elevated.v-btn--has-bg.theme--dark.v-size--x-large.success";
    }
    getMinimalArgs() {
        return [
            '--autoplay-policy=user-gesture-required',
            '--disable-background-networking',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-breakpad',
            '--disable-client-side-phishing-detection',
            '--disable-component-update',
            '--disable-default-apps',
            '--disable-dev-shm-usage',
            '--disable-domain-reliability',
            '--disable-extensions',
            '--disable-features=AudioServiceOutOfProcess',
            '--disable-hang-monitor',
            '--disable-ipc-flooding-protection',
            '--disable-notifications',
            '--disable-offer-store-unmasked-wallet-cards',
            '--disable-popup-blocking',
            '--disable-print-preview',
            '--disable-prompt-on-repost',
            '--disable-renderer-backgrounding',
            '--disable-setuid-sandbox',
            '--disable-speech-api',
            '--disable-sync',
            '--hide-scrollbars',
            '--ignore-gpu-blacklist',
            '--metrics-recording-only',
            '--mute-audio',
            '--no-default-browser-check',
            '--no-first-run',
            '--no-pings',
            '--no-sandbox',
            '--no-zygote',
            '--password-store=basic',
            '--use-gl=swiftshader',
            '--use-mock-keychain',
        ]
    }

    async openPageInNewBrowser() {
        const browser = await puppeteer.launch({headless:true, args: this.getMinimalArgs(), userDataDir: './cache' });

        const page = await browser.newPage();

        await page.goto("https://dslaterrealty.housejet.com/getHomeValue");

        await page.waitForSelector("#input-18");

        return {page, browser};
    }

    async scrapeLocationData(address) {
        let result = "";
        const {page, browser} = await this.openPageInNewBrowser();

        await page.type("#input-18", address);
        await waitForTimeout(500);
        
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');

        try {
            await page.waitForSelector(this.getValueSelector, { timeout: 3000 });
        } catch(err) {
            result = "Try Again";
            return await browser.close();
        }
        await waitForTimeout(1000);
        await page.click(this.getValueSelector);

        try {
            result = await this.injectEventListener(page);
            await browser.close();
        } catch(err) {
            result = err;
            await browser.close();
        }

        return result;
    }
    
    async injectEventListener(page) {
        return new Promise((resolve, reject) => {
            page.on("response", async(response) => {
                let correctResponse = response.url() === "https://dslaterrealty.housejet.com/api/pub/client-leads/homeValueReport" ? response:false;
            
                if(!correctResponse) return;
        
                correctResponse = await correctResponse.json();
                
                if(!correctResponse.property.valuation) reject("No valuation Found.");

                resolve(correctResponse.property.valuation);
            });
        });
    }
}

export default Scraper;