"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql2_1 = __importDefault(require("mysql2"));
const http_1 = __importDefault(require("http"));
const fs_1 = __importDefault(require("fs"));
let connected = false;
const con = mysql2_1.default.createConnection({
    host: "localhost",
    user: "root",
    password: "Jurgita1981",
    database: "employees"
});
con.connect((error) => {
    if (error)
        throw error;
    connected = true;
    console.log('Prisijungta');
});
const server = http_1.default.createServer((req, res) => {
    const url = req.url;
    const method = req.method;
    console.log(url === null || url === void 0 ? void 0 : url.split("/"));
    //     let filePath = `public${url}`;
    // if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()){
    //     console.log(path.extname(filePath));
    //     const ext=path.extname(filePath);
    //     switch (ext) {
    //         case ".css":
    //             res.setHeader("Content-Type", "text/css; charset=utf-8");
    //             break;
    //         case ".js":
    //             res.setHeader("Content-Type", "application/javascript; charset=utf-8");
    //             break;
    //         case ".jpg":
    //         case ".png":
    //         case ".jpeg":
    //             res.setHeader("Content-Type", "image/jpg; charset=utf-8");
    //             break;
    //     }
    //     let file=fs.readFileSync(filePath);
    //     res.write(file);
    //     return res.end();
    // }
    if (url == '/employees' && method == 'GET') {
        if (connected) {
            con.query("SELECT * FROM employees;", (error, result) => {
                if (error)
                    throw error;
                res.setHeader("Contect-Type", "text/html; charset=utf-8");
                let rows = "";
                result.forEach((e) => {
                    rows += "<tr>";
                    rows += `<td>${e.name}</td> <td>${e.surname} </td> <td>${e.education}</td> <td>${e.salary}</td> <td> <a href='/employee/${e.id}' class="btn btn-success">Plačiau</a></td>`;
                    rows += "</tr>";
                });
                let template = fs_1.default.readFileSync('templates/employees.html').toString();
                template = template.replace(`{{employees_table}}`, rows);
                res.write(template);
                res.end();
            });
        }
    }
    if ((url === null || url === void 0 ? void 0 : url.split("/")[1]) == 'employee' && method == 'GET') {
        let id = parseInt(url === null || url === void 0 ? void 0 : url.split("/")[2]);
        con.query(`SELECT * FROM employees WHERE id=${id};`, (error, result) => {
            if (error)
                throw error;
            let employee = result[0];
            res.setHeader("Contect-Type", "text/html; charset=utf-8");
            let template = fs_1.default.readFileSync('templates/employee.html').toString();
            res.write(template);
            res.end();
        });
    }
});
server.listen(2990, 'localhost');
