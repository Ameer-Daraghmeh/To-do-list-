//jshint esversion:6


const express = require("express");
const bodyParser = require("body-parser");


///// mongoose connect

const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/todolistDB');
////////////////////////

const app = express();


//<% EJS %> 
app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//Create mongo collection schema
const itemsSchema = new mongoose.Schema({
  name:  String
});

//Create mongo collection
const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item({ 
  name: "Grap a Smoothie."
});

const item2 = new Item({ 
  name: "Read a book."
});

const item3 = new Item({ 
  name: "Write your ideas."
});

const defaultItems = [item1, item2, item3]



app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){
    if (foundItems.length === 0){

      Item.insertMany(defaultItems, function(err) {
        if (err){
          console.log(err)
        }else{
          console.log("Successfully saved items to DB.")
        }
      });
      res.redirect("/")

    }else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
  
    }
  });


});


const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
})

const List = mongoose.model("List", listSchema);

app.get("/:customListName", function(req, res){

  const customListName = req.params.customListName;


    List.findOne({name: customListName}, function(err, foundList){
      if (!err){
        if(!foundList){
          //Create new list
          const list = new List({
          name: customListName,
          items: defaultItems
          })

        list.save();
        console.log("list created")
        res.redirect("/"+customListName)
    }

    else {
      //Show the list
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }

      }
      
    })

   
   

})



app.post("/delete", function(req, res){

  const checkedItemId = req.body.checkbox;

  Item.findByIdAndRemove(checkedItemId,function(err){

    if (err){
      console.log(err);
    }
    else{
      console.log("Item deleted Successfully");
    }
    
  });
  res.redirect("/");
})

app.post("/", function(req, res){

  const itemName = req.body.newItem;

  const item = new Item({
    name: itemName
  })

  item.save();

  res.redirect("/")
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
