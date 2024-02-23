import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import {dirname} from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;
var to_doList = [];
var date = new Date().getDate();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/",(req, res)=>{
    res.render(__dirname + "/views/index.ejs");
});

app.post("/added",(req, res)=>{
    if (req.body.newTodo != '') {
        to_doList.push(req.body.newTodo);
    }
    res.render(__dirname + "/views/index.ejs",{
        listTodo : to_doList
    });
});

app.listen(port, ()=>{
    console.log(`app listen form port ${port}`);
});