import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { BaseEntity } from './base';
import { CommentEntity } from './comment.entity';
import { SharePost } from './share.entity';
import { Liked } from './like.entity';

@Entity()
export class Post extends BaseEntity {

  @Column({length: 350})
  content: string;

  @Column({nullable: true})
  image: string;

  @Column({ default: 0 })
  likes: number;

  @OneToMany(() => CommentEntity, comment => comment.post)
  comments: CommentEntity[];

  @ManyToOne(() => User, (user) => user.posts, { eager: true, cascade: true })
  author: User;

  @OneToMany(() => SharePost, (share) => share.post)
  shares: SharePost[];
  
  @OneToMany(() => Liked, liked => liked.post)
  postLiked: Liked[];

}
