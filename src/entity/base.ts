import { BeforeUpdate, Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export abstract class BaseEntity {

    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    dateInclude: Date;
  
    @Column({ type: 'timestamp', default: null })
    dateUpdated: Date;
  
    @BeforeUpdate()
    updateDate() {
      this.dateUpdated = new Date();
    }

    @Column({ type: 'timestamp', nullable: true })
    dateDeleted: Date | null
}