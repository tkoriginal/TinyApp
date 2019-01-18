require('dotenv').config();
const app = require('express')();
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const PORT = 8080;

//Custom Imports
const {generateRandomString, getLongURL, addHttp, isValidLink} = require('./randomString');
const {urlDatabase, users} = require('./data');

//Middleware
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  secret: process.env.secret
}))


//POST Requests
app.post('/login', (req, res) => {
  let positiveHit = 0
  let cookieUserId = ''
  for (let userID in users) {
    if (users[userID].email === req.body.email && users[userID].email !== undefined) {
      positiveHit = 1
      cookieUserId = users[userID].userID;
    }
  }
  if (positiveHit === 1 && 
    bcrypt.compareSync(req.body.password, users[cookieUserId].password)){
    req.session.user_id = cookieUserId;
    res.redirect('/urls')
  } else {
    res.status(403)
      .send('User not found');
  }
});

app.post('/logout', (req, res) => {
  res.session = null;
  res.clearCookie('session');
  res.clearCookie('session.sig');
  res.redirect('/login');
})

app.post('/urls/:id/delete', (req, res) => {
  let id = req.params.id;
  console.log(id);
  delete urlDatabase[req.session.user_id][id];
  res.redirect('/urls')
});

app.post('/urls/:id', (req, res) =>{
  let id = req.params.id;
  let newURL = req.body.longURL;
  urlDatabase[req.session.user_id][id] = newURL;
  res.redirect('/urls')
})

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString(6);
  longURL = addHttp(req.body.longURL);
  isValidLink(longURL)
  urlDatabase[req.session.user_id][shortURL] = longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

app.post('/register', (req, res) => {
  if (req.body.firstName === '' || 
    req.body.lastName === '' || 
    req.body.email === '' || 
    req.body.password === '') {
    res.status(400)
       .send('Please do not leave any fields empty');
    return
  }
  for (let userID in users) {
    if (users[userID].email === req.body.email) {
      console.log(users[userID].email, req.body.email)
      res.status(400)
        .send('Email already used');
    }
  }
  let userID = generateRandomString(7);
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[userID] = {
    userID: userID,
    firstName: req.body.firstName,
    lastName:req.body.lastName, 
    email: req.body.email, 
    password: hashedPassword
  }
  urlDatabase[userID] = {}
  console.log(urlDatabase);
  req.session.user_id = userID;
  res.redirect('/urls')
})

//GET requests
app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('registration')
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = getLongURL(req.params.shortURL);
  console.log(longURL);
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404)
       .send('Short Link doesn\'t exist. Please confirm the link!')
  }
})

app.get('/urls/new', (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
  } else {
    let templateVars = {
      userID: req.session.user_id,
      userObj: function () { return users[this.userID]}
      }
    res.render('urls_new', templateVars);
  }
});

app.get('/urls/:id', (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
  } else {
    let id = req.params.id;
    let userID = req.session.user_id;
    let templateVars = { 
      shortURL: id, 
      longURL:urlDatabase[userID][id], 
      userID: userID,
      userObj: function () { return users[this.userID] }
    }
    res.render('urls_show', templateVars);
  }
})

app.get('/urls', (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
  } else {
    let templateVars = {
      urls: urlDatabase,
      userID: req.session.user_id,
      userObj: function () { return users[this.userID] }
    }
    res.render('urls_index', templateVars)
  }
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});


app.get('/', (req, res) => {
  res.redirect('/urls')
});

app.listen(PORT, () => {
  console.log(`Express app listening on PORT ${PORT}`);
});

