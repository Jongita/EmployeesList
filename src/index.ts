
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

     
    if (url=='/employees' && method=='GET'){
        if (connected){
            con.query<Employee[]>("SELECT * FROM employees;", (error,result)=>{
                if (error) throw error;
                res.setHeader("Content-Type", "text/html; charset=utf-8");
                let rows="";
                result.forEach((e)=>{ 
                    rows+="<tr>";
                    rows+=`<td>${e.id}</td> <td>${e.name}</td> <td>${e.surname}</td> <td>${e.education != null? e.education:'-'}</td> <td>${e.salary != null ? (e.salary / 100).toFixed(2) : '-'}</td> <td> <a href='/employee/${e.id}' class="btn btn-success">Plačiau</a> <a href='/delete/${e.id}' class="btn btn-danger">Ištrinti</a></td>`;
                    rows+="</tr>";
                });
               
                let template=fs.readFileSync('templates/employees.html').toString();
                template=template.replace('{{employees_table}}', rows);
                
              
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
      
    if (url=='/add' && method=='POST'){
        if (connected){
           const reqBody:any[]=[];
           req.on('data', (d)=>{
                reqBody.push(d);
           });
           req.on('end', ()=>{
            
                const reqData=decodeURIComponent(Buffer.concat(reqBody).toString());
                const dd=reqData.split('&');
                console.log(dd); 
                
                const name= mysql.escape(dd[0].split('=')[1]);
                const surname=mysql.escape(dd[1].split('=')[1]);
                const gender=mysql.escape(dd[2].split('=')[1]);
                const phone=mysql.escape(dd[3].split('=')[1]);
                const birthday=mysql.escape(dd[4].split('=')[1]);
                const education=mysql.escape(dd[5].split('=')[1]);
                const salary=mysql.escape(dd[6].split('=')[1]);

                const sql=`INSERT INTO employees(name, surname, gender, phone, birthday, education, salary) VALUES (${name}, ${surname}, ${gender}, ${phone}, ${birthday}, ${education}, ${salary})`;
                con.query(sql, (error)=>{
                    if (error) throw error;
                });

                res.writeHead(302, {
                    'Location':'/employees'
                })
                res.end();
           });


        } 
    }

      //Funkcija iškviečiame kai ateiname į pridėjimo langą
    if (url=='/add' && method=='GET'){
        if (connected){
            let template=fs.readFileSync('templates/add.html').toString();
            res.write(template);
            res.end();
        } 
    }

    
    if ( url?.split("/")[1] == 'delete' ){
        //Pasiimame iš url id
        let id=parseInt(url?.split("/")[2]);
        con.query<Employee[]>(`DELETE FROM employees WHERE id=${id};`, (error,result)=>{
            if (error) throw error;
            res.writeHead(302, {
                'Location':'/employees'
            })
            res.end();
        });
        
        
    }


})

    server.listen(2990, 'localhost');