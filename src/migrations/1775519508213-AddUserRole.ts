import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserRole1775519508213 implements MigrationInterface {
    name = 'AddUserRole1775519508213'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`role\` enum ('admin', 'user') NOT NULL DEFAULT 'user'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`role\``);
    }

}
