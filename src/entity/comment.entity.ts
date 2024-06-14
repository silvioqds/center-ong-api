import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { Post } from "./post.entity";
import { BaseEntity } from "./base";
import { User } from "./user.entity";

@Entity('comment')
export class CommentEntity extends BaseEntity {

   @Column()
   text: string;

   @ManyToOne(() => User, user => user.comments) 
   @JoinColumn({ name: 'userCommentId' })
   userCommentId: User
   
   @ManyToOne(() => Post, post => post.comments)
   post: Post;
}