var express = require("express");
var parser  = require("body-parser");
var hbs     = require("express-handlebars");
var mongoose= require("./db/connection");
var session = require("express-session");
var cmongo  = require("connect-mongo");

var app     = express();
var SMongo  = cmongo(session);

var Candidate = mongoose.model("Candidate");

app.use(session({
  secret: "some random string",
  resave: false,
  saveUninitialized: false,
  store: new SMongo({
    mongooseConnection: mongoose.connection
  })
}));


app.set("port", process.env.PORT || 3001);
app.set("view engine", "hbs");
app.engine(".hbs", hbs({
  extname:        ".hbs",
  partialsDir:    "views/",
  layoutsDir:     "views/",
  defaultLayout:  "layout-main"
}));
app.use("/assets", express.static("public"));
app.use(parser.urlencoded({extended: true}));

app.get("/", function(req, res){
  res.render("app-welcome");
});

app.get("/candidates", function(req, res){
  Candidate.find({}).then(function(candidates){
    res.render("candidates-index", {
      candidates: candidates
    });
  });
});

app.get("/candidates/:name", function(req, res){
  Candidate.findOne({name: req.params.name}).then(function(candidate){
    res.render("candidates-show", {
      candidate: candidate
    });
  });
});

app.post("/candidates", function(req, res){
  Candidate.create(req.body.candidate).then(function(candidate){
    res.redirect("/candidates/" + candidate.name);
  });
});

app.post("/candidates/:name/delete", function(req, res){
  Candidate.findOneAndRemove({name: req.params.name}).then(function(){
    res.redirect("/candidates")
  });
});

app.post("/candidates/:name", function(req, res){
  Candidate.findOneAndUpdate({name: req.params.name}, req.body.candidate, {new: true}).then(function(candidate){
    res.redirect("/candidates/" + candidate.name);
  });
});

app.post("/candidates/:name/positions", function(req, res){
  Candidate.findOne({name: req.params.name}).then(function(candidate){
    candidate.positions.push(req.body.position);
    candidate.save().then(function(){
      res.redirect("/candidates/" + candidate.name);
    });
  });
});

app.post("/candidates/:name/positions/:index", function(req, res){
  Candidate.findOne({name: req.params.name}).then(function(candidate){
    candidate.positions.splice(req.params.index, 1);
    candidate.save().then(function(){
      res.redirect("/candidates/" + candidate.name);
    });
  });
});

app.listen(app.get("port"), function(){
  console.log("It's aliiive!");
});
