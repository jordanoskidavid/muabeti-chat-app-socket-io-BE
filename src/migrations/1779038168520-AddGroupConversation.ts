import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGroupConversation1779038168520 implements MigrationInterface {
    name = 'AddGroupConversation1779038168520'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`conversation\` ADD \`name\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`conversation\` ADD \`isGroup\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`conversation\` DROP COLUMN \`isGroup\``);
        await queryRunner.query(`ALTER TABLE \`conversation\` DROP COLUMN \`name\``);
    }

}
