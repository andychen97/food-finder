require('dotenv/config');
const path = require('path');
const express = require('express');
const errorMiddleware = require('./error-middleware');
const ClientError = require('./client-error');
const jwt = require('jsonwebtoken');
const pg = require('pg');
const argon2 = require('argon2');

const app = express();
const publicPath = path.join(__dirname, 'public');

if (process.env.NODE_ENV === 'development') {
  app.use(require('./dev-middleware')(publicPath));
} else {
  app.use(express.static(publicPath));
}

const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const baseUrl = process.env.API_BASE_URL;
const token = process.env.BEARER_TOKEN;

app.use(express.json());

app.get('/api/search', (req, res, next) => {
  const { keyword, location } = req.query;
  const reqs = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  };
  fetch(`${baseUrl}/businesses/search?term=${keyword}&location=${location}`, reqs)
    .then(result => result.json())
    .then(data => res.status(200).json(data))
    .catch(err => console.error('err', err));
});

app.get('/api/search/:clickedId', (req, res, next) => {
  const { clickedId } = req.params;
  const reqs = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  };
  fetch(`${baseUrl}/businesses/${clickedId}`, reqs)
    .then(result => result.json())
    .then(data => res.status(200).json(data))
    .catch(err => console.error('err', err));
});

app.get('/api/search/:clickedId/reviews', (req, res, next) => {
  const { clickedId } = req.params;
  const reqs = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  };
  fetch(`${baseUrl}/businesses/${clickedId}/reviews`, reqs)
    .then(result => result.json())
    .then(data => res.status(200).json(data))
    .catch(err => console.error('err', err));
});

app.post('/api/auth/sign-up', (req, res, next) => {
  const { firstName, lastName, username, password } = req.body;
  if (!firstName || !lastName || !username || !password) {
    throw new ClientError(400, 'username, first name, last name, and password are required fields');
  }

  argon2.hash(password)
    .then(hashed => {
      const params = [firstName, lastName, username, hashed];
      const sql = `
      insert into "users" ("firstName", "lastName", "username", "hashedPassword")
      values ($1, $2, $3, $4)
      returning "userId", "username", "joinedAt"
    `;
      db.query(sql, params)
        .then(result => {
          const [firstElement] = result.rows;
          return res.status(201).send(firstElement);
        })
        .catch(err => next(err));
    })
    .catch(err => next(err));
});

app.post('/api/auth/sign-in', (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    throw new ClientError(401, 'invalid login');
  }
  const sql = `
    select "userId",
           "hashedPassword"
      from "users"
     where "username" = $1
  `;
  const params = [username];
  db.query(sql, params)
    .then(result => {
      const [user] = result.rows;
      if (!user) {
        throw new ClientError(401, 'invalid login');
      }
      const { userId, hashedPassword } = user;
      return argon2
        .verify(hashedPassword, password)
        .then(isMatching => {
          if (!isMatching) {
            throw new ClientError(401, 'invalid login');
          }
          const payload = { userId, username };
          const token = jwt.sign(payload, process.env.TOKEN_SECRET);
          res.json({ token, user: payload });
        });
    })
    .catch(err => next(err));
});

app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
  process.stdout.write(`\n\napp listening on port ${process.env.PORT}\n\n`);
});
