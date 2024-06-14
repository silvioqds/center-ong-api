import { Entity, JoinColumn, ManyToMany, ManyToOne } from "typeorm";
import { Post } from "./post.entity";
import { BaseEntity } from "./base";
import { User } from "./user.entity";


@Entity('share_post')
export class SharePost extends BaseEntity
{
    @ManyToOne(() => User, user => user.shares, {eager : true}) 
    @JoinColumn({ name: 'userShareId' })
    userShare: User
    
    @ManyToOne(() => Post, post => post.shares, {eager : true})
    post: Post;
}