//require modules 
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
require("dotenv").config();
const app = express();
//Local modules
const date = require(__dirname + "/modules/date.js");
//Enable public folder to use carry files
app.use(express.static(__dirname + "/public"));
//To do use body parser in the app
app.use(bodyParser.urlencoded({ extended: true }));
//To do use EJS in app server
app.set('view engine', 'ejs');
//Conexión a base de datos
mongoose.connect("mongodb+srv://"+process.env.MONGO_USERNAME+":"+process.env.MONGO_PASSWORD+"@taskscluster.01jqukg.mongodb.net/"+process.env.MONGO_DBNAME)
.then(() => console.log('Conexión exitosa'))
.catch((err) => console.error("Error de conexión: "+err)); 
/*mongoose.connect("process.env.COSMODB_CONNECT_STRING", {
   auth: {
     username: process.env.COSMOSDB_USER,
     password: process.env.COSMOSDB_PASSWORD
   },
 useNewUrlParser: true,
 useUnifiedTopology: true,
 retryWrites: false,
 socketTimeoutMS: 1000
 })
 .then(() => console.log('Conexión exitosa'))
 .catch((err) => console.error("Error de conexión: "+err));*/
const { Schema } = mongoose;
//Schema and model MongoDB
const taskSchema = new Schema({
    name: String
});
const Task = mongoose.model('Task', taskSchema);
//Listas de tareas
const firstTask = new Task({
    name: "Escribe la tarea que deseas agregar"
});
const secondTask = new Task({
    name: "y pulsa el botón +"
});
const thirdTask = new Task({
    name: "Elimina las tareas dando click en sus casillas"
});
const defalutTasks = [firstTask, secondTask, thirdTask];
//Lista generica
const listSchema = new Schema({
    name: String,
    tasks: [taskSchema]
});
const List = mongoose.model("List", listSchema);
//Respond on main page server
app.get("/", async function (req, res) {
    //UTF-8
    //res.set({ 'content-type': 'application/json; charset=utf-8' });
    //Call to .ejs file
    const foundTasks = await Task.find({}).exec();
    //console.log(foundTasks);
    if (foundTasks.length === 0) {
        Task.insertMany(defalutTasks).then(function () {
            console.log("Escritura realizada");
        }).catch(function (err) {
            console.log(err);
        });
        res.redirect("/");
    } else {
        res.render("list", {
            titleList: "Casa",
            newItem: foundTasks
        });
    }
})
//Respond on main page server with parameters
app.get("/:listName", async function (req, res) {
    const listName = _.capitalize(req.params.listName);
    const documentFound = await List.findOne({ name: listName });
    if (documentFound === null) {
        const list = new List({
            name: listName,
            tasks: defalutTasks
        });
        await list.save();
        res.redirect("/" + listName);
    } else if (documentFound.tasks == "") {
        await List.findOneAndUpdate({ name: listName }, {
            $push: {
                tasks: defalutTasks
            }
        });
        const reWriteData = await List.findOne({ name: listName });
        res.render("list", {
            titleList: reWriteData.name,
            newItem: reWriteData.tasks
        });
    } else {
        res.render("list", {
            titleList: documentFound.name,
            newItem: documentFound.tasks
        });
    }
})
//Respond to post request from general list.ejs
app.post("/nexTask", async function (req, res) {
    const nextTask = req.body.nextTask;
    const titleList = req.body.titleList;
    const foundList = await List.findOne({ name: titleList });
    const newTask = new Task({
        name: nextTask
    });
    if (titleList == "Casa") {
        await newTask.save();
        res.redirect("/");
    } else {
        foundList.tasks.push(newTask);
        await foundList.save();
        res.redirect("/" + titleList);
    }
})
//Respond to post request delete from general list.ejs
app.post("/deleteTask", async function (req, res) {
    const taskCheckId = req.body.taskCheck;
    const listName = req.body.listName;
    if (listName === "Casa") {
        await Task.deleteOne({ _id: taskCheckId });
        res.redirect("/");
    } else {
        await List.findOneAndUpdate({ name: listName }, {
            $pull: {
                tasks: {
                    _id: taskCheckId
                }
            }
        });
        res.redirect("/" + listName);
    }
})
//Respond to another page like about
app.get("/about", function (req, res) {
    res.render("about");
})
//Initialize port 
app.listen(3000, function (req, res) {
    console.log("Servidor corriendo en el puerto 3000");
})