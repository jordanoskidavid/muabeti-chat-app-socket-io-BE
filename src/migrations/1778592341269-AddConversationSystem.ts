import { MigrationInterface, QueryRunner } from "typeorm";

export class AddConversationSystem1778592341269 implements MigrationInterface {
    name = 'AddConversationSystem1778592341269'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`conversation\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`conversation_participant\` (\`id\` int NOT NULL AUTO_INCREMENT, \`userId\` int NOT NULL, \`conversationId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`conversation_participant\` ADD CONSTRAINT \`FK_b1a75fd6cdb0ab0a82c5b01c34f\` FOREIGN KEY (\`conversationId\`) REFERENCES \`conversation\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`conversation_participant\` ADD CONSTRAINT \`FK_dd90174e375c888d7f431cf829e\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`conversation_participant\` DROP FOREIGN KEY \`FK_dd90174e375c888d7f431cf829e\``);
        await queryRunner.query(`ALTER TABLE \`conversation_participant\` DROP FOREIGN KEY \`FK_b1a75fd6cdb0ab0a82c5b01c34f\``);
        await queryRunner.query(`DROP TABLE \`conversation_participant\``);
        await queryRunner.query(`DROP TABLE \`conversation\``);
    }

}
