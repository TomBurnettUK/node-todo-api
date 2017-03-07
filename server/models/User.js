const mongoose = require('mongoose');

const User = mongoose.model('User', {
  email: {
    type: String,
    required: true,
    minLength: 5
  }
});

module.exports = User;