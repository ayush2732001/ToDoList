//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require('lodash');
const app = express();
// ?retryWrites=true&w=majority
mongoose.connect("mongodb+srv://admin-ayush:joyayush@cluster0.vfg1k.mongodb.net/todolistDB?retryWrites=true&w=majority&ssl=true",{useNewUrlParser: true,useUnifiedTopology:true});
// mongoose.connect("mongodb://admin-ayush:joyayush@cluster0-shard-00-00.vfg1k.mongodb.net:27017,cluster0-shard-00-01.vfg1k.mongodb.net:27017,cluster0-shard-00-02.vfg1k.mongodb.net:27017/todolistDB?ssl=true&replicaSet=atlas-t6px4t-shard-0&authSource=admin&retryWrites=true&w=majority
// ",{useNewUrlParser: true,useUnifiedTopology:true});

// const itemsSchema=new mongoose.Schema({
//   name:String
// });

const itemsSchema={
  name:String
};

const Item=new mongoose.model('Item',itemsSchema); //good practice to capitalize first letter of model

const item1=new Item({name:"Buy Food"});
const item2=new Item({name:"Cook Food"});
const item3=new Item({name:"Eat Food"});

const defaultItems=[item1,item2,item3];

mongoose.set('useFindAndModify', false);
//
// console.log(Item.find());


// const listSchema=new mongoose.Schema{
//   name:String,
//   items:[itemsSchema]
// };

const listSchema={
  name:String,
  items:[itemsSchema]
};

const List=new mongoose.model('List',listSchema);


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//const items = ["Buy Food", "Cook Food", "Eat Food"];



const workItems = [];

app.get("/", function(req, res) {

// const day = date.getDate();
    Item.find({},function(err,foundItems)
    {
      if(err) {
        console.log("Error, couldn't find.");
      }
      else
      {
          if(foundItems.length===0)
          {
            Item.insertMany(defaultItems,function(err)
            {
              if(err){console.log(err);}
            });
            res.redirect("/");
          }
          else
          {
            res.render("list", {listTitle: "Today", newListItems: foundItems});
          }
      }

    });
});


app.get("/:customListName",function(req,res){
  const customListName=_.capitalize(req.params.customListName);
  //customListName=_.capitalize(customListName);
  List.findOne({name:customListName},function(err,foundItems){
    if(err){
      console.log(err);
    }
    else{
      if(foundItems===null)
      {
        const newList=new List({name:customListName,items:defaultItems});
        newList.save();


        res.render("list", {listTitle: customListName, newListItems: defaultItems});
      }
      else
      {
        if(foundItems.items.length==0)
        {
          List.findOneAndUpdate({name:customListName},{$push:{items:defaultItems}},function(err){if(err){console.log(err);}});
          res.redirect("/"+customListName);
        }
        else
        {
          res.render("list",{listTitle:foundItems.name,newListItems:foundItems.items});
        }
      }
    }
  })

});

// we can handle in root route itself
// app.post("/:customListName",function(req,res){
//   const customListName=req.params.customListName;
//   console.log(req.body.newItem);
//   List.findOneAndUpdate({name:customListName},{$push:{items:{name:req.body.newItem}}},function(err){if(err){console.log(err);}});
//   res.redirect("/"+customListName);
// });






app.post("/", function(req, res){

  const item = req.body.newItem;
  const newItem=new Item({name:item});
  const listName=req.body.list;
  // console.log(listName);

  if(listName==='Today')
    {newItem.save();
    res.redirect("/");}

  else
  {
    const customListName=req.body.list;
    console.log(req.body.newItem);
    List.findOneAndUpdate({name:customListName},{$push:{items:{name:req.body.newItem}}},function(err){if(err){console.log(err);}});
    res.redirect("/"+customListName);
  }
});

app.post("/delete",function(req,res){
    //console.log(req.body.checkbox);
    console.log(req.body.listName);
    if(req.body.listName==='Today')
  {
      Item.deleteOne({_id:req.body.checkbox},function(err)
        {
        if(err){
          console.log(err);
        }
        else
        {
          console.log('Successfully removed!');
        }
        });
        res.redirect("/");
    }
    else
    {
      const listName=req.body.listName;console.log(listName);
      List.findOne({name:listName},function(err,foundItem){
        if(err)
          {
            console.log(err);
          }
          else
          {
              List.findOneAndUpdate({name:listName},
  {$pull:{items:{_id:req.body.checkbox}}},
  function(err,foundList){if(err){console.log("Shit");}

  else { res.redirect("/"+listName);}
});
          }
      });
    }
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
