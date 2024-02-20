import express from 'express';
import bodyParser from 'body-parser';
import {dirname} from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { error } from 'console';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;
var to_doList = [];
var date = new Date().getDate();


mongoose.connect('mongodb+srv://syihabachmad0:PentolKasar3000@cluster0.pxtg5fa.mongodb.net/test');

const todoSchema = new mongoose.Schema({
    _id: Number,
    task: { 
        type: String, 
        required: true 
    }
});

const Todo = await mongoose.model('todoLists', todoSchema);
// const todoDefault = new Todo({
//     _id: 0,
//     task: "add your todo"
// });
// await todoDefault.save().then(function (data) {
//     if (data) {
//         console.log(`successfull to add ${todoDefault}`);
//     } else {
//         console.log("Error => "+ err);
//     };
// });


app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/",(req, res)=>{
    Todo.find().then( async (data) => {
        if (!data) {
            
        };        
        console.log("Todolist :" + data);
        res.render(__dirname + "/views/index.ejs", {
            Todolist: data
        });
    }).catch((error) => {
        console.error(error);
        res.status(500).send("Internal Server Error");
    });
});

app.post("/added",(req, res)=>{
    if (req.body.newTodo != '') {
        Todo.find().then((data) => {
            const newTodo = new Todo({
                _id: data.length,
                task: req.body.newTodo
            });
            console.log("receive: " + newTodo);
            newTodo.save().then(function (data) {
                    if (data) {
                        console.log(`successfull to add ${newTodo}`);
                    } else {
                        console.log(err);
                    };
                });
        })
        
        
    }
    res.redirect("/");
});

app.post("/delete",(req, res)=>{
    //console.log(req.body.checkbox);
    Todo.findByIdAndRemove({_id:req.body.checkbox}).then((data)=>{
        if (!data) {
            console.log('cannot delete :' + req.body.checkbox);
        } else {
            console.log('succcess to delete : ' + data);
        }
    });
    res.redirect("/");
});

///////////////////////////////////////////////////////////////////////
// for custom todo list

// creating schema of task list in the array of taskList
const itemSchema = new mongoose.Schema({
    reqParameter : String,
    taskList : [{
        _id : Number,
        task : String
    }]
});

// adding table to bata base
const Item = mongoose.model('Item', itemSchema);

app.get("/:parameter", async (req, res)=>{
    // get parameter form the body
    const parameter = req.params.parameter;

    // find to check parameter is already exist
    Item.findOne({reqParameter: parameter}).then(async (data)=>{
            if (!data) {

                // creating new item of parameter if does not exist 
                const newItem = new Item({
                    reqParameter: parameter,
                    taskList : [{
                        _id : 0,
                        task : `Add Your Todo for ${parameter}`
                    }]
                });
    
                //save new Item of parameter
                await newItem.save().then( async (data)=>{
                    if (!data) {
                        console.log(data);
                    } else {
                        console.log("succes to add: " + data.reqParameter);

                        // find after save new Item then render todo list to EJS
                        var newItemAdded = await Item.findOne({reqParameter: parameter});
                        await res.render(__dirname + "/views/index.ejs",{
                            title: parameter,
                            Todolist : newItemAdded.taskList,
                            parameter : parameter
                        });
                    };
                });
            // if Item of parameter exist
            } else {
                console.log("parameter: " + parameter + " is already exits");
                // render of todolist at parameter Item already exist to EJS
                await res.render(__dirname + "/views/index.ejs",{
                    title: parameter,
                    Todolist : data.taskList,
                    parameter : parameter
                    });
            };
        });
});

app.post("/added/:parameter", async (req, res)=>{
    const parameter = req.params.parameter;
    if (req.body.newTodo != '') {

        // get taskList.length to create order id of new todo
        await Item.findOne({reqParameter: parameter}).then( async (data) => {
            const newTodo = new Todo({
                _id : data.taskList.length,
                task: req.body.newTodo
            });
            console.log("receive: " + newTodo);
            // push new todo to Tasklist array
            await Item.updateOne({reqParameter: parameter}, {$push: { taskList: newTodo }}).then((data) => {
                if (data) {
                    console.log(`successfull to add ${newTodo}`);
                } else {
                    console.log(err);
                };
            });
        })
    }
    // go to /parameter again
    res.redirect(`/${parameter}`);
});

app.post("/delete/:parameter", async(req, res)=>{
    // get parameter
    const parameter = req.params.parameter;
    // get id of taskList object
    const id = req.body.checkbox;
    // delete/pull out object that _id matches with id from the takList array
    await Item.updateOne({ reqParameter:parameter },{ $pull: { taskList: { _id: id } } }).then( (err, result) => {
          if (err) {
            console.error('Error:', err);
          } else {
            console.log('success remove:', result);
          }
        }
      );
    // go to /parameter again
    res.redirect("/"+parameter);
});


const server = app.listen(port, function() {
  server.timeout = 50000; // Timeout 50 detik
  console.log(`app listen form port ${port}`);
});
