# TinyApp
### The App that will help shorten your URLs for you.
###### Work-in progress version on [heroku](https://tk-tinyapp.herokuapp.com/)
---
App built using Node, Express and EJS. Come with user authentication, session management (via cookie sessions).

### Current Release feature (v1.0.0):
- Users can create an account
- Users can create short links
- Users can copy these links and post externally
- Short links will redirect to appropriate website
- Users can update links
- Users can delete links
- Users can logout
- Users state is preserved between sessions
- Links will be validated to ensure they are valid or let the user know
- Users will have a view on when a link was created

### Future Release features (v1.1.0):
- User will get stats on unique visits to their link

### Setup
- Fork and clone repo
- ```npm install``` to get all dependencies
- Create an .ENV file in the root folder and set up as ``` secret=token```  and 'token' can be any string
- PORT is set to 8080 by default and can be modified in ```express_server.js```
- `npm start` to start the server

### Usage
- Once the server is running, start by registering
- New URLs can be created using the `Create New Short URL` link

### Bugs/Work in progress
- If a link has a space in it, the app will break
- Styling is yet to be completed for the Edit and New URLs pages

