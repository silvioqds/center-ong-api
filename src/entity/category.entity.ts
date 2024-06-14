import { Column, Entity, ManyToMany, ManyToOne, OneToMany } from "typeorm";
import { User } from "./user.entity";
import { BaseEntity } from "./base";

@Entity()
export class Category extends BaseEntity {

    
    @Column()
    name : string

    @ManyToMany(() => User, user => user.categories)
    users: User[];

    @OneToMany(() => User, (user) => user.category)
    user: User[];
}