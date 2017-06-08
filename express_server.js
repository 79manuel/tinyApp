'use strict';


var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
var cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
//const userService = require('./services/user-service');


// Middlewares
//============

app.set("view engine", "ejs")
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

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
    id: "userID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2ID": {
    id: "user2ID",
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
//     let users = {
//   user: req.cookies["user"],
//   };
//   res.render("urls_index", users.user);
// })
  let users = {

    urls: urlDatabase,
    userId: req.cookies["user_id"]
  };

  res.render("urls_index", users);
});

//it gets the request for page "new" and renders page "new"
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//it gets the request for any ID and renders page for that ID
app.get("/urls/:id", (req, res) => {
  let users = {shortURL: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render("urls_show", users);
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

app.post('/logout', (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/urls');
});

const userExists = email => {
  for (let user in users) {
    if(users[user].email === email) {
      return user;
    }
  }
}

// sets the cookie with the value(user) introduced by user
app.post('/login', function (req, res) {
  console.log("Looking at req.body.email", req.body.email)
  for (let user in users) {
    let userID = userExists(req.body.email);
    console.log('userID', userID);
      if (!userID) {
        res.status(403).send('Email not found');
      }
      if (users[userID].password !== req.body.password) {
        res.status(403).send('Password not found');
      }

      res.cookie('user_id', userID);
      res.redirect('/urls');
    }
  });

  // res.cookie('user', req.body.user);// requires the user value from
  //                                           // request's body.
  // res.redirect('/urls') // All POST req follow the pattern Redirect/Get



//returns a page that includes a form with an email and password field.
  app.get('/register', (req, res) => {
    res.render('urls_register', {});
  });

  // generate a random user ID and sets the cookie
  app.post('/register', (req, res) => {
    if (req.body.email === '' || req.body.password === '') {
      res.status(400).send('You must provide a password or email address');
      return;
    }

    for (let user in users) {
      if (users[user].email === req.body.email) {
        res.status(400).send('Email already exists');
        return;
      }
    }

    //It generates random ID
    let Id = generateRandomString();
    //The new ID generated is put into the users DB and has the values taken from the post reques
    users[Id] = {
      id: Id,
      email: req.body.email,
      password: req.body.password
    }
    console.log(users);
    //It sets the cookie with the user ID generated above.
    res.cookie('user_id', Id);
    res.redirect("/urls");
  });

  app.get('/login', (req, res) => {
    res.render('urls_login');
  });



// Initialize app
// ==============
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});