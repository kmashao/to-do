//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash")

mongoose.connect("mongodb://localhost:27017/toDoListDB", {useNewUrlParser: true, useUnifiedTopology:true, useFindAndModify: false });

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

var db = mongoose.connection;

 db.on('error', console.error.bind(console, "connection error"));
// db.once('open', () => {


    const toDoSchema = new mongoose.Schema({
        item: {
            type: String,
            required: [true, "No item provided"]
        }
    })
    
    const ListItem = mongoose.model("item", toDoSchema);

    const item1 = new ListItem({
        item: "Buy food"
    });

    const item2 = new ListItem({
        item: "do homework"
    });

    const item3 = new ListItem({
        item: "eat dinner"
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

                console.log(items);
                console.log("its empty\n");

                ListItem.insertMany(defaultItems, (err) => {
                    
                    if(err) console.error(err);
                    console.log("default items added\n");
                });
                console.log("redirecting\n");
                res.redirect("/");
            } else
                res.render("list", {listTitle: "Today", items: items});
        });
	});


    app.get("/:listType", (req, res) => {

        let listType = _.capitalize(req.params.listType);

        List.findOne({name: listType}, (err, list) => {
            if(err) console.error(err);
            
            if(_.isEmpty(list)){
                const defaultList = new List({
                    name: listType,
                    listItems: defaultItems
                });

                defaultList.save();
                console.log(listType + " added");
                res.redirect("/" + listType);
            }else {
                res.render("list", {listTitle: listType, items: list.listItems});

            }
        })
    });

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

	app.listen(3000, function() {
	    console.log("Server started on port 3000");
	});


// 	db.close();
// })