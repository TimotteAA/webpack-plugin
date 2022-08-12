const puppeteer = require('puppeteer');

(async () => {
    //创建一个浏览器
    const browser = await puppeteer.launch();
    //创建一个网页
    const page = await browser.newPage();
    //打开网页 www.baidu.com
    await page.goto('https://www.baidu.com');
    //要在页面实例上下文中执行的方法
    await page.evaluate(x => {
        return Promise.resolve(8 * x);
    }, 7);
    //关闭浏览器
    await browser.close();
})();

