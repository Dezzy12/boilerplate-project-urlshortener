require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const mongodb = require('mongodb');
// Connect to database
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();

// Basic Configuration
const port = process.env.PORT || 3050;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});



app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const { Schema } = mongoose;
const urlSchema = new Schema({
  original_url: { type: String, required: true },
  short_url: { type: String, required: true },
});

const URL = mongoose.model('Url', urlSchema);
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
})



const validUrl = require("valid-url");
const shortid = require("shortid");
module.exports = URL;


app.post("/api/shorturl", (req, res) => {
  let url = req.body.url;
  let shortUrl = shortid.generate();

  if (!validUrl.isWebUri(url)) {
    res.json({ error: 'invalid url' });
    return;
  } else {
    try {
      const newUrl = new URL({
        original_url: url,
        short_url: shortUrl,
      });
      newUrl.save();
      res.json({
        original_url: url,
        short_url: shortUrl,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json("Server error...");
    }
  }
});

app.get('/api/shorturl/:short_url?', async (req, res) => {
  const url = req.params.short_url;
  try {
    const urlParams = await URL.findOne({
      short_url: url
    });
    if (urlParams) {
      return res.redirect(urlParams.original_url);
    } else {
      return res.status(404).json('No URL found');
    }
  } catch (err) {
    console.log(err);
    res.status(500).json('Server error');
  }
});


// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
