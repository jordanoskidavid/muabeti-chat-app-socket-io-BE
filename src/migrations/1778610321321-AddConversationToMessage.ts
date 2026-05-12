import { MigrationInterface, QueryRunner } from "typeorm";

export class AddConversationToMessage1778610321321 implements MigrationInterface {
    name = 'AddConversationToMessage1778610321321'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`message\` DROP FOREIGN KEY \`FK_71fb36906595c602056d936fc13\``);
        await queryRunner.query(`ALTER TABLE \`message\` CHANGE \`receiverId\` \`conversationId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`conversation_participant\` DROP FOREIGN KEY \`FK_b1a75fd6cdb0ab0a82c5b01c34f\``);
        await queryRunner.query(`ALTER TABLE \`conversation_participant\` CHANGE \`conversationId\` \`conversationId\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`conversation_participant\` ADD CONSTRAINT \`FK_b1a75fd6cdb0ab0a82c5b01c34f\` FOREIGN KEY (\`conversationId\`) REFERENCES \`conversation\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`message\` ADD CONSTRAINT \`FK_7cf4a4df1f2627f72bf6231635f\` FOREIGN KEY (\`conversationId\`) REFERENCES \`conversation\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`message\` DROP FOREIGN KEY \`FK_7cf4a4df1f2627f72bf6231635f\``);
        await queryRunner.query(`ALTER TABLE \`conversation_participant\` DROP FOREIGN KEY \`FK_b1a75fd6cdb0ab0a82c5b01c34f\``);
        await queryRunner.query(`ALTER TABLE \`conversation_participant\` CHANGE \`conversationId\` \`conversationId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`conversation_participant\` ADD CONSTRAINT \`FK_b1a75fd6cdb0ab0a82c5b01c34f\` FOREIGN KEY (\`conversationId\`) REFERENCES \`conversation\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`message\` CHANGE \`conversationId\` \`receiverId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`message\` ADD CONSTRAINT \`FK_71fb36906595c602056d936fc13\` FOREIGN KEY (\`receiverId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
