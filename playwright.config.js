testDir: 'e2e',
timeout: 30000,
use: {
    browserName: 'chromium',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
}