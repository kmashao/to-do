//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash")

mongoose.connect("mongodb+srv://admin-kmashao:iamadmin@todolist-tilof.gcp.mongodb.net/toDoListDB", {useNewUrlParser: true, useUnifiedTopology:true, useFindAndModify: false });

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

var db = mongoose.connection;

 db.on('error', console.error.bind(console, "connection error"));
 db.once('open', () => {


    const toDoSchema = new mongoose.Schema({
        item: {
            type: String,
            required: [true, "No item provided"]
        }
    })
    
    const ListItem = mongoose.model("item", toDoSchema);

    const item1 = new ListItem({
        item: "Welcome to your todo list"
    });

    const item2 = new ListItem({
        item: "Click + to add items"
    });

    const item3 = new ListItem({
        item: "<-- delete items"
    });

    const defaultItems = [item1, item2, item3]

    
    const customListSchema = new mongoose.Schema({
        name: {
            type: String,
            required: [true, "name cannot be empty"]
        },
        listItems: [toDoSchema]
    })

    const List = mongoose.model("list", customListSchema);


    app.get("/", function(req, res) {

        ListItem.find({}, (err, items)  => {
            if (err) console.error(err);

            if (items.length === 0){

                ListItem.insertMany(defaultItems, (err) => {
                    
                    if(err) console.error(err);
                    console.log("default items added\n");
                });
                res.redirect("/");
            } else
                res.render("list", {listTitle: "Today", items: items});
        });
	});


    app.get("/:listType", (req, res) => {

        const listType = _.capitalize(req.params.listType);

        List.findOne({name: listType}, (err, list) => {
            if(err) console.error(err);
            
            if(listType === "Favicon.ico"){
                res.redirect("/");
            } else if(_.isEmpty(list)){

                const defaultList = new List({
                    name: listType,
                    listItems: defaultItems
                });

                defaultList.save();
                res.redirect("/" + listType);
            }else {
                res.render("list", {listTitle: listType, items: list.listItems});

            }
        })
    })

	app.post("/", function(req, res){

        const item = req.body.newItem;
        const listName = req.body.list;

        const newItem = new ListItem({
            item: item
        })

        if (listName === "Today"){

            newItem.save();
            console.log(item + " added to Today's list.");

            res.redirect("/");

        }else {
            List.findOne({name: listName}, (err, listFound) => {
                if(err) console.error(err)
                
                listFound.listItems.push(newItem);
                listFound.save();      

                res.redirect("/" + listName);
            })
        }
	});

    app.post("/delete", (req, res) => {
        const itemId = req.body.checkBox;
        const listName = req.body.listType

        console.log(itemId + "\n" +listName);

        if (listName === "Today"){
            ListItem.findByIdAndDelete(itemId, (err, item) => {
                if (err) console.error(err);
    
                res.redirect("/");
            })
        }else {
            List.findOneAndUpdate({name: listName}, {$pull : {listItems : {_id: itemId}}}, (err, listFound) => {
                if (err) console.log(err);
                else{
                    console.log("item deleted");
                    res.redirect("/" + listName);
                }
            })
        }

    })

	app.get("/about", function(req, res){
	    res.render("about");
    });
    
    let port = process.env.PORT;
    if (_.isEmpty(port)) {
        port = 3000;
    }

	app.listen(port, function() {
	    console.log("Server started successfully");
	});


// 	db.close();
})