const bcrypt = require('bcrypt');

// Pega a senha do argumento da linha de comando.
const password = process.argv[2];

if (!password) {
  console.log('Por favor, forneça uma senha.');
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
  console.log('Hash gerado:', hash);
});