require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const app = express();
const data = require('./movies-data-small.json');

app.use(morgan('dev'));
app.use(validateBearerToken);
app.use(helmet());
app.use(cors());

function validateBearerToken(req, res, next) {
  const API_TOKEN = process.env.API_TOKEN;
  const authToken = req.get('Authorization');

  if (authToken === undefined) {
    return res.status(400).json({ error: 'Authorization Header missing from request' });
  }

  if (!authToken.toLowerCase().startsWith('bearer ')) {
    return res.status(400).json({ error: 'Invalid Authorization method: Must use Bearer strategy' });
  }

  const token = authToken.split(' ')[1];

  if (token !== API_TOKEN) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  next();
}

function handleTypes(req, res) {
  let { genre, country, avg_vote } = req.query;
  let results = data;

  genre = genre && genre.toLowerCase();
  country = country && country.toLowerCase();
  avg_vote = avg_vote && parseInt(avg_vote);

  if(!genre && !country && !avg_vote) {
    return res  
      .send(results);
  }

  if(genre) {
    results = results.filter(movie => movie.genre.toLowerCase().includes(genre));
  }

  if(country){
    results = results.filter(movie => movie.country.toLowerCase().includes(country));
  }

  if(avg_vote) {
    results = results.filter(movie => parseInt(movie.avg_vote) >= avg_vote);
  }
  
  return res.json(results);
}


app.get( '/movie', validateBearerToken, handleTypes);

const PORT = 8000;

app.listen(PORT, () => {
  console.log(`Server started on PORT ${PORT}`);
});