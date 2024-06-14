import { Entity, Column, ManyToMany, JoinTable, OneToMany, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Category } from './category.entity';
import { BaseEntity } from './base';
import { Post } from './post.entity';
import { MaxLength } from 'class-validator';
import { CommentEntity } from './comment.entity';
import { SharePost } from './share.entity';
import { Liked } from './like.entity';

@Entity()
export class User extends BaseEntity {
    
  @ApiProperty()
  @Column()
  username: string;

  @ApiProperty()
  @Column({ default: ''})
  name: string;

  @ApiProperty()
  @Column()
  email: string;

  @ApiProperty()
  @Column({length : 250})
  password: string;

  @ApiProperty()
  @Column()
  isOng: boolean

  @ApiProperty()
  @Column()
  birthdate: Date

  @ApiProperty()
  @Column({ nullable: true })
  telephone: String

  @ApiProperty()
  @Column({nullable: true})
  profilepic: String
  
  @ApiProperty()
  @Column()  
  gender: String

  @ApiProperty()
  @Column({ length: 300, nullable: true })  
  aboutme?: String

  @ApiProperty()
  @Column({ length: 50, nullable : true })
  keyPix?: String

  @ApiProperty()
  @ManyToMany(() => Category, { eager: true })
  @JoinTable()
  categories: Category[];

  @ApiProperty()
  @ManyToOne(() => Category, (cat) => cat.user, { eager: true, cascade: true })
  category: Category;

  @ManyToMany(() => User, {cascade: true})
  @JoinTable({
    name: 'user_followers',
    joinColumn: { name: 'followerId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  following: User[];

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  @OneToMany(() => CommentEntity, (comment) => comment.userCommentId)
  comments: Comment[];

  @OneToMany(() => SharePost, (share) => share.userShare)
  shares: SharePost[];

  @OneToMany(() => Liked, liked => liked.user)  
  userLiked: Post[];
}
