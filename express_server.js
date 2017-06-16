'use strict';

var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080;
var cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');


// Middlewares
//============

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  secret: 'manuel',
  maxAge: 24 * 60 * 60 * 1000
}));


// Routes
// ======

var urlDatabase = {
  "userID": {
    "b2xVn2": "http://www.lighthouselabs.ca",
  },

  "user2ID": {
    "9sm5xK": "http://www.google.com"
  }

};

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

const users = {
  "userID": {
    id: "userID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2ID": {
    id: "user2ID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

// This function is used to generate a random ID when a new user registers in TinyApp
function generateRandomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for(let i = 0; i < 6; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function urlsForUser(userID) {
  return urlDatabase[userID];
}

app.get("/urls", (req, res) => {
  var userId = req.session.user_id;
  let templateVars = {
    urls: urlsForUser(userId),
    user: users[userId]
  };

  res.render("urls_index", templateVars);
});

//Endpoint to get the request for page "new" and renders page "new"
app.get("/urls/new", (req, res) => {
  if (req.session.user_id){
    res.render("urls_new");
  } else {
    res.redirect('/urls/login');
  }

});

//Endpoint to get the request for any ID and renders page for that ID
app.get("/urls/:id", (req, res) => {
  var userId = req.session.user_id;
  let userUrls = urlsForUser(userId);
  var shortURL = req.params.id;
  var templateVars = {
    user: users[userId],
    shortURL: req.params.id,
    longURL: urlDatabase[userId][shortURL]
  };
  res.render("urls_update", templateVars);
});


app.post("/urls", (req, res) => {
  var shortURL = generateRandomString();

  const longURL = 'http://' + req.body.longURL;

  const user = userExistsId(req.session.user_id);

  if (!user) {
    res.redirect("/");
  } else {
    if(urlDatabase[user.id]){
       urlDatabase[user.id][shortURL] = longURL;
    } else {
      var key = shortURL;
      var temp = {};
      temp[key] = longURL;
      urlDatabase[user.id] = temp;
    }
    res.redirect("/urls");
  }
});

function getLongURLfromShortURL(shortURL) {
  for (const userID in urlDatabase) {
    const userUrls = urlDatabase[userID];
    if (userUrls[shortURL]) {
      return userUrls[shortURL];
    }
  }
}

app.get("/u/:shortURL", (req, res) => {
  if (getLongURLfromShortURL(req.params.shortURL) in urlDatabase) {
    let longURL = getLongURLfromShortURL(req.params.shortURL).longURL;
    //let URL = "http://" + longURL;
    res.redirect(longURL);
    return ;
  } else {
    res.status(400).send(`You shoud put right shortURL<br>Go to
    <a href="/urls">login</a> in page<br>or go to <a href="/register">
    Register</a> page`);
  }
});

app.post("/urls/:id/delete", (req, res) => {
  var userId = req.session.user_id;
  delete urlDatabase[userId][req.params.id];

  res.redirect("/urls");
});

app.post("/urls/:id/update", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  if (!userID){
    res.status(403).send('You must be logged in<br><a href="/login"><button>Login to tinyApp</button></a>');
    return;
  }

  let userUrls = urlDatabase[userID];

  console.log("user urls", userUrls, "shortURL", shortURL);

  if (!userUrls || userUrls.hasOwnProperty(shortURL) === false) {
    res.status(403).send('You don\'t own the URL<br><a href="/login"><button>Login to tinyApp</button></a>');
  } else {
    userUrls[shortURL] = longURL;
    res.redirect("/urls");
  }
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

function userExists(email){
   for (let user in users) {
    if(users[user].email === email) {
      return users[user];
    }
  }
}
function userExistsId(id){
  for (let user in users) {
    if(users[user].id === id) {
      return users[user];
    }
  }
}

app.post('/login', function (req, res) {
  let user = userExists(req.body.email);
  if (user) {
    if (bcrypt.compareSync(req.body.password, user.password)) {
      req.session.user_id = user.id;
      res.redirect('/urls');
    } else {
      res.status(403).send('Incorrect password<br><a href="/login"><button>Back to login</button></a>');
    }
  } else {
    res.status(403).send('Email not found<br><a href="/login"><button>Back to login</button></a>');
  }
});

//returns a page that includes a form with an email and password field.
app.get('/register', (req, res) => {
  res.render('register', {});
});

// generates a random user ID and sets the session -- cookie switched to session--
app.post('/register', (req, res) => {

  if (req.body.email === '' || req.body.password === '') {
    res.status(400).send('You must provide a password or email address<br><a href="/register"><button>Back to registration</button></a>');
    return;
  }

  for (let user in users) {
    if (users[user].email === req.body.email) {
      res.status(400).send('Email already exists<br><a href="/register"><button>Back to registration<button></a>');
      return;
    }
  }
  const password = req.body["password"];
  const hashed_password = bcrypt.hashSync(password, 10);
  let Id = generateRandomString();
  //The new ID generated is put into the users DB and has the values taken from the post reques
  users[Id] = {
    id: Id,
    email: req.body.email,
    password: hashed_password
  };
  urlDatabase[Id] = {};

  //It sets the session with the user ID generated above.
  req.session.user_id = Id;
  res.redirect("/urls");
});

app.get('/login', (req, res) => {
  res.render('login');
});

// Initialize app
// ==============
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});