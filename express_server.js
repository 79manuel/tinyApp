'use strict';


var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
var cookieParser = require('cookie-parser');

// Configuration
//==============
app.set("view engine", "ejs")
app.use(cookieParser());

// Middlewares
//============

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));




//console.log(generateRandomString());

// app.get("/hello", (req, res) => {
//   res.end("<html><body>Hello <b>World</b></body></html>\n");
// });
app.get("/urls.json", (req, res) => {
res.json(urlDatabase);
});


// Routes
// ======
app.get("/urls.json", (req, res) => {
res.json(urlDatabase);
});

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userID": {
    id: "aaa",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2ID": {
    id: "bbb",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}


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

app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

// sets the cookie with the value(username) introduced by user
app.post('/login', function (req, res) {
  res.cookie('username', req.body.username);// requires the username value from
                                            // request's body.
  res.redirect('/urls') // All POST req follow the pattern Redirect/Get

  let templateVars = {
  username: req.cookies["username"],
  };
  res.render("urls_index", templateVars.username);
})

//returns a page that includes a form with an email and password field.
  app.get('/register', (req, res) => {
    res.render('urls_register');
  });

  // generate a random user ID
  app.post('/register', (req, res) => {
    let Id = generateRandomString();
    users[Id] = req.body.id;
    res.redirect("/register");
  });



// Initialize app
// ==============
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});