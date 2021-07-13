const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

exports.connect = async (settings) => {

  try {

    const url = `mongodb+srv://admin:6842684Aa@cluster0.lwb9y.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

    await mongoose.connect(url, {

      useNewUrlParser: true,
      useUnifiedTopology: true,

    });

    console.log('Connected to Mongo 👍');

  }
  catch (err){

    console.error(err);

  }
}