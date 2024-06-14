import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { User } from "./user.entity";
import { Post } from "./post.entity";
import { BaseEntity } from "./base";

@Entity('liked_user')
export class Liked extends BaseEntity {

   @ManyToOne(() => User, user => user.userLiked) 
   @JoinColumn({ name: 'userLikedId' })
   user: User;
   
   @ManyToOne(() => Post, post => post.postLiked)
   @JoinColumn({ name: 'postLikedId' })
   post: Post;
}