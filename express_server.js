const app = require('express')();
const bodyParser = require('body-parser');
const PORT = 8080;

const {generateRandomString} = require('./randomString');
const {urlDatabase} = require('./data');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }))


var urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
}

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



app.get('/urls/new', (req, res) => {
  console.log('new called');
  res.render('urls_new');
});

app.get('/urls/:id', (req, res) => {
  let id = req.params.id;
  let templateVars = { shortURL: id, longURL:urlDatabase[id] }
  res.render('urls_show', templateVars);
})


app.get('/urls', (req, res) => {
  res.render('urls_index', { urls: urlDatabase })
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/u/:shortURL', (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL])
})

app.get('/', (req, res) => {
  res.send('Hello there!');
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n')
})

app.listen(PORT, () => {
  console.log(`Express app listening on PORT ${PORT}`);
});

