// backend/generateHash.js
const bcrypt = require('bcryptjs'); // Alterado para bcryptjs

const password = process.argv[2];

if (!password) {
  console.log('Uso: node generateHash.js <sua_senha_aqui>');
  process.exit(1);
}

const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Erro ao gerar o hash:', err);
    return;
  }
  console.log('Senha original:', password);
  console.log('--- COPIE O HASH ABAIXO ---');
  console.log(hash); // Apenas o hash será exibido para facilitar a cópia
});