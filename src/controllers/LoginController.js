const jwt = require('jsonwebtoken');
const secretKey = 'mySecretKey';

function login(req, res) {
  if (req.session.loggedin !== true) {
    res.render('login/index');
  } else {
    res.redirect('/');
  }
}

function auth(req, res) {
  const data = req.body;

  req.getConnection((err, conn) => {
    conn.query('SELECT * FROM users WHERE email = ?', [data.email], (err, userdata) => {
      if (userdata.length > 0) {
        const user = userdata[0];

        if (data.password === user.password) {
          const token = jwt.sign({ email: user.email }, secretKey);
          req.session.token = token;
          req.session.loggedin = true;
          req.session.name = user.name;

          res.redirect('/');
        } else {
          res.render('login/index', { error: 'Error: incorrect password' });
        }
      } else {
        res.render('login/index', { error: 'Error: user not exists' });
      }
    });
  });
}


function index(req, res) {
  if (req.session.loggedin) {
    res.redirect('/');
  } else {
    res.render('login/index');
  }
}

function logout(req, res) {
  if (req.session.loggedin) {
    req.session.destroy();
  }
  res.redirect('/login');
}

module.exports = {
  index: index,
  login: login,
  logout: logout,
  auth: auth,
};
