
import mysql from 'mysql2';

import http from 'http';

import fs from 'fs';
import path from "path";
import { Employee } from "./models/employees";


let connected=false;

const con=mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"Jurgita1981",
    database:"employees"
});

con.connect((error:any)=>{
    if (error) throw error;
    connected=true;
    console.log('Prisijungta');

});

    const server=http.createServer((req,res)=>{
        const url=req.url;
        const method=req.method;

        console.log(url?.split("/"));

        let filePath = `public${url}`;
    
    if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()){
        console.log(path.extname(filePath));
        const ext=path.extname(filePath);
        switch (ext) {
            case ".css":
                res.setHeader("Content-Type", "text/css; charset=utf-8");
                break;
            case ".js":
                res.setHeader("Content-Type", "application/javascript; charset=utf-8");
                break;
            case ".jpg":
            case ".png":
            case ".jpeg":
                res.setHeader("Content-Type", "image/jpg; charset=utf-8");
                break;
        }
        let file=fs.readFileSync(filePath);
        res.write(file);
        return res.end();
    }


        if(url=='/employees' && method=='GET'){
        if (connected){
        con.query<Employee[]>("SELECT * FROM employees;", (error, result) => {
        if(error) throw error;
        res.setHeader("Contect-Type", "text/html; charset=utf-8");
        let rows="";
        result.forEach((e)=>{
            rows+="<tr>";
            rows+=`<td>${e.id}</td> <td>${e.name}</td> <td>${e.surname} </td> <td>${e.education != null? e.education:'-'}</td> <td>${e.salary != null ? (e.salary / 100).toFixed(2) : '-'}</td> <td> <a href='/employee/${e.id}' class="btn btn-success">Plačiau</a></td>`;
            rows+="</tr>";

        })
        let template=fs.readFileSync('templates/employees.html').toString();
        template=template.replace(`{{employees_table}}`, rows);
        res.write(template);
        res.end();
    });
        }
    }

        if(url?.split("/")[1] == 'employee' && method=='GET'){
            let id=parseInt(url?.split("/")[2]);
            con.query<Employee[]>(`SELECT * FROM employees WHERE id=${id};`, (error, result) => {
        if(error) throw error;
        let employee=result[0];
        console.log(employee);
        res.setHeader("Contect-Type", "text/html; charset=utf-8");
        
        let template=fs.readFileSync('templates/employee.html').toString();
       
        template=template.replace("{{ name }}", employee.name);
        template=template.replace("{{ surname }}", employee.surname);
        template=template.replace("{{ gender }}", employee.gender!=null?employee.gender:'-');
        template=template.replace("{{ phone }}", employee.phone!=null?employee.phone:'-');
        template=template.replace("{{ birthday }}", employee.birthday!=null?employee.birthday.toLocaleDateString():'-');
        template=template.replace("{{ education }}", employee.education!=null?employee.education:'-');
        template=template.replace("{{ salary }}", employee.salary!=null?(employee.salary / 100).toString():'-');
        res.write(template);
        res.end();
    });
    }


})

    server.listen(2990, 'localhost');