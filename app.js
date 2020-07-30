//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose= require("mongoose");
const _= require("lodash");

mongoose.connect("mongodb+srv://admin-isuru:Asha123@cluster0.i1kld.mongodb.net/todolistDB?retryWrites=true&w=majority", {useNewUrlParser: true});

const todoSchema = {
  name: String
}


const todolistItems= mongoose.model("todolistItem", todoSchema);

//Custom List Schema
const listSchema = {
  name: String,
  items: [todoSchema]
};

//model
const List= mongoose.model("List", listSchema);

const app = express();

const item1= new todolistItems({
  name: "Work"
});
const item2= new todolistItems({
  name: "Eat"
});
const item3= new todolistItems({
  name: "Play hard"
});

const updatedItems= [item1, item2, item3];


let items=[];
let workItems= [];

app.set('view engine', 'ejs');

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));



app.get("/", function(req, res) {

  todolistItems.find({}, function(err, foundItems){
    if (foundItems.length===0){
      todolistItems.insertMany(updatedItems, function(err){
        if (err){
          console.log(err);
        }
        else {
          console.log("Successfully added to the database");
        }
      res.redirect("/");
    })
    }
    else {
      res.render("list", {listType: "Today", newListItems: foundItems});
    }
  })


});

app.post("/", function(req, res){
  var item= req.body.newItem;
  var list= req.body.list;

  const newtoDo= new todolistItems({
      name: item
  }
  )

  if (list==="Today"){
    newtoDo.save();
    res.redirect("/");
  }
  else {
    List.findOne({name: list}, function(err, foundList){
        foundList.items.push(newtoDo);
        foundList.save();
        res.redirect("/" + list);
    })
  }

  })

  app.post("/delete", function(req, res){
    const checkedItemId= req.body.box;
    const listName= req.body.listName;

    if (listName=== "Today"){
      todolistItems.findByIdAndRemove(checkedItemId, function(err){
        if (err){
          console.log(err);
        }
        else {
          console.log("Successfully deleted from the database!");
          res.redirect("/");
        }
    })
    }
    else {
        List.findOneAndUpdate(
          {name: listName},
          {$pull: {items: {_id: checkedItemId}}},
          function (err, foundList){
            if (!err){
              res.redirect("/"+listName);
            }

          }
        )
    }
  })


//Express route parameters
app.get("/:customListName", function(req, res){
  const customListName= _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if (!err){
      if (!foundList){
        //Create a new list
        const list= new List({
          name: customListName,
          items: updatedItems
        })
        list.save();
        res.redirect("/"+ customListName);
      }
      else {
        //Show existing list
        res.render("list", {listType: foundList.name, newListItems: foundList.items})
      }
    }
  })

})

app.listen(3000, function() {
  console.log("Server started on port 3000.");
});
