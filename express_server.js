'use strict';


var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

// Configuration
//==============
app.set("view engine", "ejs")

// Middlewares
//============

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));




//console.log(generateRandomString());

// app.get("/hello", (req, res) => {
//   res.end("<html><body>Hello <b>World</b></body></html>\n");
// });
// app.get("/urls.json", (req, res) => {
// res.json(urlDatabase);
// });


// Routes
// ======

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};


function generateRandomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for(let i = 0; i < 6; i++) {
  text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}


//it gets the request from client and renders page requested
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//it gets the request for page "new" and renders page "new"
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//it gets the request for any ID and renders page for that ID
app.get("/urls/:id", (req, res) => {
  let templateVars = {shortURL: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render("urls_show", templateVars);
});


app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = 'http://' + req.body.longURL
  res.redirect("/urls");
});

//it gets the request for page "shortURL" and renders page "shor URL"
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});



// Initialize app
// ==============
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});