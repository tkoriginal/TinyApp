const app = require('express')();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const PORT = 8080;

const {generateRandomString} = require('./randomString');
const {urlDatabase} = require('./data');

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
  const username = req.body.username;
  res.cookie('username', username, {domain: 'localhost'});
  res.redirect('/urls');
})

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
})

//GET requests
app.get('/register', (req, res) => {
  res.render('registration')
})

app.get('/u/:shortURL', (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL])
})

app.get('/urls/new', (req, res) => {
  let templateVars = {username: req.cookies["username"] }
  res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  let id = req.params.id;
  let templateVars = { 
    shortURL: id, longURL:urlDatabase[id], username: req.cookies["username"]
  }
  res.render('urls_show', templateVars);
})

app.get('/urls', (req, res) => {
  let templateVars = {
    urls: urlDatabase, 
    username: req.cookies["username"] 
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

