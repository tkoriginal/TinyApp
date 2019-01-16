const generateRandomString = (length) =>  {
  let chars = '01234567890QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm'
  let output = [];
  for ( let i = 0; i < length; i++){
    randomIndex = Math.floor(Math.random()*62) + 1
    output.push(chars[randomIndex])
  }
  return output.join('');
};

module.exports = {generateRandomString};