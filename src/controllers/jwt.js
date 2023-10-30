const jwt = require('jsonwebtoken');
const secretKey = 'mySecretKey'; 

function generateToken(email) {
  return jwt.sign({ email }, secretKey, { expiresIn: '1h' }); // Genera un token JWT con una caducidad de 1 hora
}

function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, secretKey);
    return decoded;
  } catch (error) {
    return null; // Devuelve null si el token no es válido
  }
}

module.exports = {
  generateToken,
  verifyToken,
};
