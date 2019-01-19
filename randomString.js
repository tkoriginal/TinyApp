const {urlDatabase} = require('./data')
const request = require('request');
const generateRandomString = (length) =>  {
  let chars = '01234567890QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm'
  let output = [];
  for ( let i = 0; i < length; i++){
    randomIndex = Math.floor(Math.random()*62) + 1
    output.push(chars[randomIndex])
  }
  return output.join('');
};

function getLongURL(shortURL) {
  for (userLinks in urlDatabase) {
    if(!!urlDatabase[userLinks][shortURL]) {
      return urlDatabase[userLinks][shortURL];
    }
  }
  return null;
}

function addHttp(url) {
  if (!/^(f|ht)tps?:\/\//i.test(url)) {
     url = "http://" + url;
  }
  return url;
}

function isValidLink(shortURL, LongURL) {
  request(LongURL, async(err, res) => {
    if (await res.statusCode !== 200) {
      urlDatabase[shortURL].isValid = false;
    }
  })
}


module.exports = {generateRandomString, getLongURL, addHttp, isValidLink};