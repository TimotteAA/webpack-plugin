const Server = require("./Server");
const puppeteer = require('puppeteer');
const fs = require("fs");
const path = require("path");

// 替换输入的图片
const imgBASE64 = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

class MySkeleton {
    constructor(options) {
        // 无头浏览器读取的端口
        this.port = options.port;
        // output中的输出路径
        this.outputPath = options.path;
        // 创建一个基于express的server。
        this.server = new Server(this.port, this.outputPath);
        // dom样式缓存
        this.skeletonOptions = options.skeletonStyles;
    }

    genSkeleton(options, element) {
        let rootElement = element;
        console.log("22行", options, element);
    }

    async apply(compiler) {
        console.log(this.outputPath);
        compiler.hooks.done.tap("MySkeleton", async (complitation) => {
            console.log('webpack 编译结束')

            await this.server.run(this.outputPath);
            const options = this.skeletonOptions;
            let newHTMl;
            try {
                newHTMl = await this.launchPuppter(options, this.outputPath)
            } catch (err) {
                console.error("err", err.message);
            }
            // console.log(newHTMl);
            fs.writeFileSync(path.resolve(this.outputPath, "new.html"), newHTMl, {encoding: "utf8"});
            // this.server.stop()
        })
    }

    async launchPuppter(options, finalPath) {
        const browser = await puppeteer.launch({
            headless: false,
            ignoreHTTPSErrors: true,
            args: [`--window-size=1920,1080`],
            defaultViewport: {
                width:1920,
                height:1080
            }
        });
        const page = await browser.newPage();
        await page.goto(`http://localhost:${this.port}`);
        await page.screenshot({path: 'example.png'});

        const genSkeleton = this.genSkeleton.bind(this);
        // 项putter暴露函数..
        await page.exposeFunction("genSkeleton", genSkeleton);

        // dom计算的内容
        const newHTML = await page.evaluate(async (options, imgBASE64) => {
            return await new Promise(resolve => {
                const CLASS_NAME_PREFIX = "timo-skeleton-";
                //处理按钮
                function buttonHandler(element, options = {}) {
                    const className = CLASS_NAME_PREFIX + 'button';  // sk-button
                    const rule = `{
                  color: ${options.color} !important;
                  background:  ${options.color} !important;
                  border:  none !important;
                  box-shadow: none !important;
                }`
                    addStyle(`.${className}`, rule)
                    element.classList.add(className)
                }

                //处理图片
                function imageHandler(element, options = {}) {
                    const { height, width } = element.getBoundingClientRect()
                    const attrs = {
                        width, height, src: imgBASE64
                    }
                    setAttributes(element, attrs)
                    const className = CLASS_NAME_PREFIX + 'image';  // sk-image
                    const rule = `{
                  background:  ${options.color} !important;
                }`

                    addStyle(`.${className}`, rule)
                    element.classList.add(className)
                }

                // dom上设置元素属性 height with src等
                function setAttributes(element, attrs) {
                    Object.keys(attrs).forEach(key => element.setAttribute(key, attrs[key]))
                }

                //把对应的类名和样式 一一对应存起来
                function addStyle(selector, rule) {
                    if (!styleCache.has(selector)) {
                        styleCache.set(selector, rule)
                    }
                }

                console.log("126", options, genSkeleton)
                let root = document.getElementById("root")
                const buttons = []  //所有的按钮
                const imgs = []  //所有的图片
                const styleCache = new Map();
                function traverse(options) {
                    let { button, image } = options;
                    (function preTraverse(element) {
                        if (element.children && element.children.length > 0) {
                            //如果有子元素, 遍历子元素
                            Array.from(element.children).forEach(children => preTraverse(children))
                        }
                        if (element.tagName == 'BUTTON') {
                            buttons.push(element)
                        } else if (element.tagName == 'IMG') {
                            imgs.push(element)
                        }
                    })(root)
                    buttons.forEach(item => buttonHandler(item, button))
                    imgs.forEach(item => imageHandler(item, image))
                }
                traverse(options);
                let rules = '';
                // 读取
                for (const [selector, rule] of styleCache){
                    rules += `${selector} ${rule}\n`
                }
                console.log('rules ==>', rules)
                //创建style元素, 注入样式
                const styleElement = document.createElement('style');
                styleElement.innerHTML= rules;
                document.head.appendChild(styleElement);

                // 把新的html内容覆盖到原有的html中
                const newHTML = document.documentElement.innerHTML;
                resolve(newHTML);
            })

        }, options, imgBASE64);
        return newHTML
        // await browser.close();
    }
}

module.exports = MySkeleton;
