import pool from '../config/db';

// Define um tipo para o objeto de usuário para aproveitar o TypeScript
export interface User {
  usuario_id: number;
  username: string;
  password_hash: string;
  role: string;
  ativo: boolean;
}

export const findByUsername = async (username: string): Promise<User | null> => {
  const result = await pool.query(
    'SELECT * FROM dms_usuarios WHERE username = $1',
    [username]
  );

  if (result.rows.length > 0) {
    return result.rows[0];
  }
  return null;
};