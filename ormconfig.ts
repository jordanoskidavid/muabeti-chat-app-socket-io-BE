import { DataSource } from 'typeorm';
import { User } from './src/users/user.entity'; // we’ll create this soon

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'root',
  database: 'muabeti_db',
  entities: [User],
  migrations: ['src/migrations/*.ts'],
});
