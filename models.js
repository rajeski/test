// Rearranged and reorganized this part of the file

const mongoose = require('mongoose'),
  bcrypt = require('bcrypt');

var movieSchema = mongoose.Schema({
  Title : {type: String, required: true},
  Description : {type: String, required: true},
  Director : {
    Name: String,
    Bio: String
  },
  Actors : [String],
  ImagePath : String,
  Featured: Boolean
});

var userSchema = mongoose.Schema({
  Username : {type: String, required: true},
  Password : {type: String, required: true},
  Email : {type: String, required: true},
  Birthday : Date,
  FavoriteMovies : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

userSchema.statics.hashPassword = function(password) {
  return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword = function(password) {
  return bcrypt.compareSync(password, this.Password);
}

var genreSchema = mongoose.Schema({
  Name : {type: String, required: true},
  Description : {type: String, required: true}
});

var directorSchema = mongoose.Schema({
  Name : {type: String, required: true},
  Bio: {type: String},
  Birth: {type: String},
  Death: {type: String}
});

var Movie = mongoose.model('Movie', movieSchema);
var User = mongoose.model('User', userSchema);
var Genre = mongoose.model('Genre', genreSchema);
var Director = mongoose.model('Director', directorSchema);

module.exports.Movie = Movie;
module.exports.User = User;
module.exports.Genre = Genre;
module.exports.Director = Director; 