// Rearranged and reorganized this file prior to Heroku hosting

const express = require('express'),
  bodyParser = require('body-parser'),
  uuid = require('uuid'),
  mongoose = require('mongoose'),
  passport = require('passport');
require('./passport');

const { check, validationResult } = require('express-validator');

const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;

const app = express();
const cors = require('cors');

var allowedOrigins = ['http://localhost:8080', 'http://testsite.com'];

app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){ // If a specific origin isn’t found on the list of allowed origins
      var message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
      return callback(new Error(message ), false);
    }
    return callback(null, true);
  }
}));

mongoose.connect('mongodb://localhost:27017/MyFlicksDB', {useNewUrlParser: true}); 

const morgan = require('morgan');

// mongoose.connect(
//   // pending... mongodb...
//   {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
//   }
// );

app.use(bodyParser.json());

var auth = require('./auth')(app);

// Morgan middleware library - log all terminal requests 
app.use(morgan('common'));
  
// To serve static file(s) - public folder
app.use(express.static('public'));
  
// Middleware error-handling function - log application-level errors to terminal
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('An error occured');
});

mongoose.connect(`mongodb+srv://rajeski:testPassword@myflicksdb-vrzhr.mongodb.net/test?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('connected to the database');
  })
  .catch((error) => {
    console.group();
    console.log('error connecting to the database: ', error.message);
    console.log('Error name: ', error.name);
    console.log('Error Reason: ', error.reason);
    console.groupEnd();
    process.exit(1);
  });
  
// POST users' request 

app.post('/users', 
function(req, res) {
  Users.findOne( {Username : req.body.Username })
  .then(function(user) {
    if (user) {
      return res.status(400).send(req.body.Username + "already exists"); 
    } else {
      Users 
      .create({
        Username: req.body.Username, 
        Password: req.body.Password, 
        Email: req.body.Email, 
        Birthday: req.body.Birthday  
      })
      .then(function(user) { res.status(201).json(user) })
      .catch(function(error) {
        console.error(error);
        res.status(500).send("Error: " + error);
      })
    }   
  }).catch(function(error) {
    console.error(error);
    res.status(500).send("Error : + error");
  });
});

// POST Add movie, user's favorites' list 
app.post('/users/:Username/Movies/:MovieID', 
passport.authenticate('jwt', { session: false }),
function(req, res) {
  Users.findOneAndUpdate({ Username : req.params.Username }, {
    $push : { FavoriteMovies : req.params.MovieID }
  },
  { new : true }, // Return updated document 
  function(err, updatedUser) {
    if (err) {
      console.error(err);
      res.status(500).send("Error: " + err);
    } else {
      res.json(updatedUser)
    }
  })
});

app.post('/movies', 
passport.authenticate('jwt', { session: false }),
function(req, res) {
  Movie.create({
        Title: req.body.Title, 
        Description: req.body.Description, 
        Genre: req.body.Genre, 
        Director: req.body.Director  
      })
      .then(function(movies) { res.status(201).json(movies) })
      .catch(function(error) {
        console.error(error);
        res.status(500).send("Error: " + error);
      })
    });

// PUT users' request 

app.put('/users/:Username', 
passport.authenticate('jwt', { session: false }),
function(req, res) {
  console.log('REQ', req.body);
  Users.findOneAndUpdate({ Username : req.params.Username }, { $set :
  {
    Username : req.body.Username,
    Password : req.body.Password,
    Email : req.body.Email,
    Birthday : req.body.Birthday
  }},
  { new : true }, // Return updated document 
  function(err, updatedUser) {
    if(err) {
      console.error(err);
      res.status(500).send("Error: " +err);
    } else {
      res.json(updatedUser)
    }
  })
});

// READ GET genres

app.get('/genres/:Name', 
passport.authenticate('jwt', { session: false }),
function(req, res) {
  Movie.find({
    'Genre.Name': req.params.Name
  })
    .then((movies) => {
      res.json(movies);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
}
);

// READ GET director

app.get('/director/:Name', 
passport.authenticate('jwt', { session: false }),
function(req, res) {
  Movie.find({
    'Director.Name': req.params.Name
  })
    .then((movies) => {
      res.json(movies);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
}
);

// READ GET movies

app.get('/movies', 
passport.authenticate('jwt', { session: false }), 
function(req, res) {
  Movie.find()
  .then(function(movies) {
    res.status(201).json(movies)
  }).catch(function(err) {
    console.error(err);
    res.status(500).send("Error: " + err);
  });
});

// READ GET single movie by title

app.get('/movies/:Title',
passport.authenticate('jwt', { session: false }),
  function (req, res) {
    Movie.findOne({
        Title: req.params.Title
      })
      .then(function (movies) {
        res.json(movies);
      })
      .catch(function (err) {
        console.error(err);
        res.status(500).send("Error:" + err);
      });
  }
);

// READ GET all users

app.get('/users', 
function(req, res) {
  Users.find()
  .then(function(users) {
    res.status(201).json(users)
  })
  .catch(function(err) {
    console.error(err);
    res.status(500).send("Error: " + err);
  });
});

// READ Get a user by username 

app.get('/user/:Username', function(req, res) {
  User.findOne( {Username : req.params.Username })
  .then(function(user) {
    res.json(user)
  })
  .catch(function(err) {
    console.error(err);
    res.status(500).send("Error: " + err);
  });
});

// DELETE Remove movie, user's favorites' list

app.delete('/users/:Username/FavoriteMovies/:MovieID', 
passport.authenticate('jwt', { session: false }),
function(req, res) {
  const { Username, MovieID } = req.params;	 
  console.log(Username, MovieID);	 
  Users.findOneAndUpdate(	  
    // Update requested information
    {	    
      Username: Username	      
    },	    
    {	    
      $pull: {	      
        FavoriteMovies: MovieID	       
      }	      
    },	    
    {	    
      new: true	 
    }, // Return updated document 
    function(err, updatedUser) {	
      if (err) {	      
        console.error(err);	        
        res.status(500).send('Error: ' + err);	     
      } else {	     
        res.json(updatedUser);	   
      }	      
    }	    
  );	 
});

// DELETE request 

// Delete user by username
app.delete('/users/:Username', 
passport.authenticate('jwt', { session: false }),
function(req, res) {
  console.log('REQ', req.body);
  Users.findOneAndRemove({ Username: req.params.Username })
  .then(function(user) {
    if (!user) {
      res.status(400).send(req.params.Username + " was not found");
    } else {
      res.status(200).send(req.params.Username + " was deleted.");
    }
  })
  .catch(function(err) {
    console.error(err);
    res.status(500).send("Error: " + err);
  });
});

app.use((err, req, res, next) => {
  var logEntryTimestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  var logEntry = `${logEntryTimestamp} - Error: ${err.stack}`;
  console.error(logEntry);
  res.status(500).send('Please Stand By!');
});
  
// Listen for requests

var port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", function() {
console.log("Listening on Port 3000");
});

// app.listen(8080, function() {
//   console.log('Your app is listening on port 8080');
// });