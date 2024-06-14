import { ApiProperty } from "@nestjs/swagger"

export class PostUpdateView {

    @ApiProperty()
    postId: number

    @ApiProperty()
    userId: number
    
    @ApiProperty()
    updatedContent: string
 
    @ApiProperty()
    updatedImage: string
}