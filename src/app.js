const express = require('express');
const { engine } = require('express-handlebars');
const myconnection = require('express-myconnection');
const mysql = require('mysql');
const session = require('express-session');
const bodyParser = require('body-parser');
const loginRoutes = require('./routes/login');
const jwt = require('jsonwebtoken');
const secretKey = 'mySecretKey'; 
const jwtUtil = require('./controllers/jwt'); 

const app = express();
app.set('port', 5000);

app.set('views', __dirname + '/views');
app.engine('.hbs', engine({
  extname: '.hbs',
}));
app.set('view engine', 'hbs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.use(myconnection(mysql, {
  host: 'localhost',
  user: 'root',
  password: '',
  port: 3306,
  database: 'nodelogin'
}, 'single'));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Error de conexión a la base de datos');
});

app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

app.listen(app.get('port'), () => {
  console.log('listening on port ', app.get('port'));
});

app.use('/', loginRoutes);

app.get('/', (req, res) => {
  const token = req.session.token;
  if (!token) {
    return res.redirect('/login');
  }

  const decodedToken = jwtUtil.verifyToken(token);
  if (!decodedToken) {
    return res.redirect('/login');
  }

  if (decodedToken.email) {
    req.getConnection((err, connection) => {
      if (err) {
        console.error('Error de conexión a la base de datos: ' + err.message);
        res.status(500).send('Error de conexión a la base de datos');
        return;
      }

      const query = 'SELECT * FROM users';

      connection.query(query, (err, results) => {
        if (err) {
          console.error('Error al obtener datos de la base de datos: ' + err.message);
          res.status(500).send('Error al obtener datos de la base de datos');
          return;
        }

        res.render('home', { name: req.session.name, users: results });
      });
    });
  } else {
    res.redirect('/login');
  }
});

app.get('/add-employee', (req, res) => {
  const token = req.session.token;
  if (!token) {
    return res.redirect('/login');
  }

  const decodedToken = jwtUtil.verifyToken(token);
  if (!decodedToken) {
    return res.redirect('/login');
  }

  if (decodedToken.email) {
    res.render('add-employee', { name: req.session.name });
  } else {
    res.redirect('/login');
  }
});

app.post('/add-employee', (req, res) => {
  const token = req.session.token;
  if (!token) {
    return res.redirect('/login');
  }

  const decodedToken = jwtUtil.verifyToken(token);
  if (!decodedToken) {
    return res.redirect('/login');
  }

  if (decodedToken.email) {
    const { email, name, Apellidos, Telefono, Direccion } = req.body;

    req.getConnection((err, connection) => {
      if (err) {
        console.error('Error de conexión a la base de datos: ' + err.message);
        res.status(500).send('Error de conexión a la base de datos');
        return;
      }

      const query = 'INSERT INTO users (email, name, Apellidos, Telefono, Direccion) VALUES (?, ?, ?, ?, ?)';
      connection.query(query, [email, name, Apellidos, Telefono, Direccion], (err, results) => {
        if (err) {
          console.error('Error al agregar empleado: ' + err.message);
          res.status(500).send('Error al agregar empleado');
          return;
        }

        res.redirect('/');
      });
    });
  } else {
    res.redirect('/login');
  }
});

app.post('/edit-employee/:email', (req, res) => {
  const token = req.session.token;
  if (!token) {
    return res.redirect('/login');
  }

  const decodedToken = jwtUtil.verifyToken(token);
  if (!decodedToken) {
    return res.redirect('/login');
  }

  if (decodedToken.email) {
    const email = req.params.email;
    const { name, Apellidos, Telefono, Direccion } = req.body;

    req.getConnection((err, connection) => {
      if (err) {
        console.error('Error de conexión a la base de datos: ' + err.message);
        res.status(500).send('Error de conexión a la base de datos');
        return;
      }

      const query = 'UPDATE users SET name = ?, Apellidos = ?, Telefono = ?, Direccion = ? WHERE email = ?';
      connection.query(query, [name, Apellidos, Telefono, Direccion, email], (err, results) => {
        if (err) {
          console.error('Error al modificar empleado: ' + err.message);
          res.status(500).send('Error al modificar empleado');
          return;
        }

        res.redirect('/');
      });
    });
  } else {
    res.redirect('/login');
  }
});

app.post('/delete-employee/:email', (req, res) => {
  const token = req.session.token;
  if (!token) {
    return res.redirect('/login');
  }

  const decodedToken = jwtUtil.verifyToken(token);
  if (!decodedToken) {
    return res.redirect('/login');
  }

  if (decodedToken.email) {
    const email = req.params.email;

    req.getConnection((err, connection) => {
      if (err) {
        console.error('Error de conexión a la base de datos: ' + err.message);
        res.status(500).send('Error de conexión a la base de datos');
        return;
      }

      const query = 'DELETE FROM users WHERE email = ?';
      connection.query(query, [email], (err, results) => {
        if (err) {
          console.error('Error al eliminar empleado: ' + err.message);
          res.status(500).send('Error al eliminar empleado');
          return;
        }

        res.redirect('/');
      });
    });
  } else {
    res.redirect('/login');
  }
});

const path = require('path');
app.post('/search-employee', (req, res) => {
  const token = req.session.token;
  if (!token) {
    return res.redirect('/login');
  }

  const decodedToken = jwtUtil.verifyToken(token);
  if (!decodedToken) {
    return res.redirect('/login');
  }

  if (decodedToken.email) {
    const searchTerm = req.body.searchTerm;
    const viewPath = path.join(__dirname, 'views/layouts', 'search-results');

    req.getConnection((err, connection) => {
      if (err) {
        console.error('Error de conexión a la base de datos: ' + err.message);
        res.status(500).send('Error de conexión a la base de datos');
        return;
      }

      const query = 'SELECT * FROM users WHERE name LIKE ?';
      connection.query(query, [`%${searchTerm}%`], (err, results) => {
        if (err) {
          console.error('Error al buscar empleados: ' + err.message);
          res.status(500).send('Error al buscar empleados');
          return;
        }

        res.render(viewPath, { name: req.session.name, searchTerm, results });
      });
    });
  } else {
    res.redirect('/login');
  }
});
