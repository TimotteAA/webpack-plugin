const express = require("express");
const path = require("path");
const fs = require("fs");

class Server {
    constructor(port, outPutDir) {
        this._port = port;
        this._outPutDir = outPutDir;
    }

    async getAllFile(outputPath) {

        const files = fs.readdirSync(outputPath);
        console.log(files);
        const res = [];
        for (let file of files) {
            const filePath = path.resolve(outputPath, file);
            const isFile = await this.isFile(filePath);
            if (isFile) {
                res.push(file);
            }
        }
        console.log(res, "res");
        return res;
    }

    isFile(file) {
        return new Promise((resolve, reject) => {
            fs.stat(file, (err, stat) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (stat.isFile()) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            })
        })
    }


    async run(outputPath) {
        this.server = express();

        const files = await this.getAllFile(outputPath);

        if (Array.isArray(files) && files.length) {
            for (let file of files) {
                this.watch(file);
            }
        }

        this.server.listen(this._port, () => {
            console.log(`server run success in port ${this._port}`);
        })
    }

    watch(file) {
        const filePath = `/${file === "index.html" ? "" : file}`
        this.server.get(filePath, (req, res) => {
            // 特判图片
            if (file.includes("./jpg")) {
                const imgPath = path.resolve(this._outPutDir, file);
                res.sendFile(fs.readFileSync(imgPath).toString('base64'))
            } else {
                res.sendFile(path.resolve(this._outPutDir, file))
            }
        })
    }

    stop() {
        process.exit()
    }
}

module.exports = Server;
