const app = require('express')();
const bodyParser = require('body-parser');
const PORT = 8080;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }))


var urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabls.ca',
  '9sm5xK': 'http://www.google.com'
}


app.get('/urls/new', (req, res) => {
  console.log('new called');
  res.render('urls_new');
})

app.get('/urls', (req, res) => {
  res.render('urls_index', { urls: urlDatabase })
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  res.send('OK')      // Respond with 'Ok' (we will replace this)
});

app.get('/urls/:id', (req, res) => {
  let id = req.params.id;
  let templateVars = { shortURL: id, longURL:urlDatabase[id] }
  res.render('urls_show', templateVars);
})

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n')
})

app.listen(PORT, () => {
  console.log(`Example app listening on PORT ${PORT}`);
});