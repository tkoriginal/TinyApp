require('dotenv').config();
const app = require('express')();
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const PORT = 8080;

const {generateRandomString, getLongURL, addHttp, isValidLink} = require('./randomString');
const {urlDatabase, users} = require('./data');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  secret: process.env.secret
}))


//POST Requests
app.post('/urls/:id/delete', (req, res) => {
  let id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls')
});

app.post('/urls/:id', (req, res) =>{
  let id = req.params.id;
  let newURL = req.body.longURL;
  urlDatabase[id].longURL = newURL;

  res.redirect('/urls')
})

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(7);
  const longURL = addHttp(req.body.longURL);
  const isValid = true //To start, all urls will be shown as valid and validated after
  const user_id = req.session.user_id;
  urlDatabase[shortURL] = { shortURL, longURL, user_id, isValid };
  isValidLink(shortURL, longURL);
  console.log(urlDatabase);
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
  if (positiveHit === 1 && 
    bcrypt.compareSync(req.body.password, users[cookieUserId].password)){
    req.session.user_id = cookieUserId;
    res.redirect('/urls')
  } else {
    res.status(404)
      .render('404',{message:'User not found'});
  }
});

app.post('/logout', (req, res) => {
  res.session = null;
  res.clearCookie('session');
  res.clearCookie('session.sig');
  res.redirect('/login');
})

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
      console.log(users[userID].email, req.body.email)
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
      .render('404',{message:'Short Link doesn\'t exist. Please confirm the link!'})
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
      longURL:urlDatabase[id].longURL, 
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
    userLink = {}
    for (var shortURL in urlDatabase) {
      if (urlDatabase[shortURL].user_id === req.session.user_id) {
        userLink[shortURL] = {
          shortURL: shortURL,
          longURL: urlDatabase[shortURL].longURL,
          isValid: urlDatabase[shortURL].isValid,
        }
      }
    }
    let templateVars = {
      urls: userLink,
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
  if (req.session.user_id){
    res.redirect('/urls')
  } else {
    res.render('index')
  }
});

app.listen(PORT, () => {
  console.log(`Express app listening on PORT ${PORT}`);
});

//Have to merge with master
