//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash")

mongoose.connect("mongodb://localhost:27017/blogDB", {useNewUrlParser: true, useUnifiedTopology:true});

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
            min: [1, "item cannot be empty"],
            required: true
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

    


    



// const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];

app.get("/", function(req, res) {

// const day = date.getDate();

  
	ListItem.find({}, (err, items)  => {
		if (err) console.error(err);

		if (items.length === 0){

			console.log(items);
			console.log("its empty\n");

			ListItem.insertMany([item1, item2, item3], (err) => {
				
				if(err) console.error(err);
				console.log("default items added\n");
			});
			console.log("redirecting\n");
			res.redirect("/");
		} else
			res.render("list", {listTitle: "today", items: items});
		
	})
	

	});

	app.post("/", function(req, res){

	const item = req.body.newItem;

    const newItem = new ListItem({
        item: item
    })

    newItem.save();

    res.redirect("/");

	});

	app.get("/work", function(req,res){
	res.render("list", {listTitle: "Work List", newListItems: workItems});
	});

	app.get("/about", function(req, res){
	res.render("about");
	});

	app.listen(3000, function() {
	console.log("Server started on port 3000");
	});


// 	db.close();
// })