const app = require('express')();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const PORT = 8080;

const {generateRandomString} = require('./randomString');
const {urlDatabase, users} = require('./data');

app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

//POST Requests
app.post('/urls/:id/delete', (req, res) => {
  let id = req.params.id;
  console.log(id);
  delete urlDatabase[id];
  res.redirect('/urls')
});

app.post('/urls/:id', (req, res) =>{
  let id = req.params.id;
  console.log(id)
  let newURL = req.body.longURL;
  urlDatabase[id] = newURL;
  res.redirect('/urls')
})

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString(6);
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post('/login', (req, res) => {
  let positiveHit = 0
  let cookieUserId = ''
  for (let userID in users) {
    if (users[userID].email === req.body.email) {
      positiveHit = 1
      cookieUserId = users[userID].userID;
    }
  }
  if (positiveHit === 1) {
    res.cookie('userID', cookieUserId, {domain: 'localhost'});
    res.redirect('/urls')
  } else {
    res.status(403)
      .send('User not found');
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('userID');
  res.redirect('/login');
})

app.post('/register', (req, res) => {
  if (req.body.firstName === '' || 
    req.body.lastName === '' || 
    req.body.email === '' || 
    req.body.password === '') {
    res.status(400)
       .send('Please do not leave any fields empty');
  }
  for (let userID in users) {
    if (users[userID].email === req.body.email) {
      console.log(users[userID].email, req.body.email)
      res.status(400)
        .send('Email already used');
  }
}
  let userID = generateRandomString(7);
  users[userID] = {
    userID: userID,
    firstName: req.body.firstName,
    lastName:req.body.lastName, 
    email: req.body.email, 
    password: req.body.password
  }
  res.cookie('userID', users[userID].userID, {domain: 'localhost'});
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
  res.redirect(urlDatabase[req.params.shortURL])
})

app.get('/urls/new', (req, res) => {
  let templateVars = {
    userID: req.cookies["userID"],
    userObj: function () { return users[this.userID]}
    }
  res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  let id = req.params.id;
  let templateVars = { 
    shortURL: id, 
    longURL:urlDatabase[id], 
    userID: req.cookies["userID"],
    userObj: function () { return users[this.userID] }
  }
  res.render('urls_show', templateVars);
})

app.get('/urls', (req, res) => {
  let templateVars = {
    urls: urlDatabase, 
    userID: req.cookies["userID"],
    userObj: function () { return users[this.userID] }
  }
  res.render('urls_index', templateVars)
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

