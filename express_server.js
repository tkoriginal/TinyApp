//Modules required for application
require('dotenv').config();
const path = require('path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const moment = require('moment');

//Configuration
const PORT = 8080;

//Location modules required
const {generateRandomString, getLongURL, addHttp, isValidLink, urlDatabase, users} = require('./scripts/randomString');

//Express Middleware
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  secret: process.env.secret
}))
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'public/styles')))

//POST Requests to delete a link
app.post('/urls/:id/delete', (req, res) => {
  let id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls')
});

//POST Requests to edit a link
app.post('/urls/:id', (req, res) =>{
  let id = req.params.id;
  let newURL = req.body.longURL;
  urlDatabase[id].longURL = newURL;
  isValidLink(id, newURL);
  res.redirect('/urls')
})

//POST request to add a new link
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(7);
  const longURL = addHttp(req.body.longURL);
  const isValid = true //To start, all urls will be shown as valid and validated after
  const user_id = req.session.user_id;
  const linkCreated = moment();
  urlDatabase[shortURL] = { shortURL, longURL, user_id, isValid, linkCreated };
  isValidLink(shortURL, longURL);
  res.redirect(`/urls/${shortURL}`);
});

//POST request for login form 
app.post('/login', (req, res) => {
  let positiveHit = false
  let cookieUserId = ''
  for (let userID in users) {
    if (users[userID].email === req.body.email) {
      positiveHit = true
      cookieUserId = users[userID].userID;
    }
  }
  if (positiveHit && 
    bcrypt.compareSync(req.body.password, users[cookieUserId].password)){
    req.session.user_id = cookieUserId;
    res.redirect('/urls')
  } else {
    res.status(404)
      .render('404',{message:'User not found'});
  }
});

//POST request to logout
app.post('/logout', (req, res) => {
  res.session = null;
  res.clearCookie('session');
  res.clearCookie('session.sig');
  res.redirect('/login');
})

//POST request to register
app.post('/register', (req, res) => {
  if (req.body.firstName === '' || 
    req.body.lastName === '' || 
    req.body.email === '' || 
    req.body.password === '') {
    res.status(404)
       .render('404', {message:'Please do not leave any fields empty'});
  }
  for (let userID in users) {
    if (users[userID].email === req.body.email) {
      res.status(404)
        .render('404',{message:'Email already used'});
    }
  }
  let userID = generateRandomString(6);
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[userID] = {
    userID: userID,
    firstName: req.body.firstName,
    lastName:req.body.lastName, 
    email: req.body.email, 
    password: hashedPassword
  }
  req.session.user_id = userID;
  res.redirect('/urls')
})

//GET requests to login and render login EJS
app.get('/login', (req, res) => {
  res.render('login');
});

//GET for registration
app.get('/register', (req, res) => {
  res.render('registration')
});

//GET request to take a short URL and redirect to target URL
app.get('/u/:shortURL', (req, res) => {
  const longURL = getLongURL(req.params.shortURL);
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404)
      .render('404',{message:'Short Link doesn\'t exist. Please confirm the link!'})
  }
})

//GET request for page to add new URL
app.get('/urls/new', (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
  } else {
    let templateVars = {
      userID: req.session.user_id,
      user: users[req.session.user_id]
    }
    res.render('urls_new', templateVars);
  }
});

//GET request to EDIT urls
app.get('/urls/:id', (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
  } else if (!urlDatabase[req.params.id]) {
    res.status(404)
      .render('404', {message:'Link doesn\'t exist. Please confirm the link!'})
  } else {
    let id = req.params.id;
    let userID = req.session.user_id;
    const host = req.headers.host;
    let templateVars = { 
      shortURL: id, 
      longURL:urlDatabase[id].longURL, 
      userID: userID,
      host: host,
      user: users[req.session.user_id] }
      res.render('urls_show', templateVars);
    }
})

//GET request to view all URLS that are setup by user
app.get('/urls', (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
  } else {
    userLink = {}
    for (var shortURL in urlDatabase) {
      if (urlDatabase[shortURL].user_id === req.session.user_id) {
        userLink[shortURL] = {
          shortURL: shortURL,
          longURL: urlDatabase[shortURL].longURL,
          isValid: urlDatabase[shortURL].isValid ? 'Valid Link' : 'Invalid Link',
          timeStamp: moment(urlDatabase[shortURL].linkCreated).fromNow()
        }
      }
    }
    const host = req.headers.host;
    let templateVars = {
      host:host,
      urls: userLink,
      userID: req.session.user_id,
      user: users[req.session.user_id]
    }
    res.render('urls_index', templateVars)
  }
});

//GET request for URL database API
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

//Catch all request to either send users to registration or URLs page if cookie exists
app.get('/', (req, res) => {
  if (req.session.user_id){
    res.redirect('/urls')
  } else {
    res.render('registration')
  }
});

app.listen(PORT, () => {
  console.log(`Express app listening on PORT ${PORT}`);
});