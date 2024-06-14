import { ApiProperty } from "@nestjs/swagger"

export class PostCreateView{
    @ApiProperty()
    userId: number
   
    @ApiProperty()
    content: string
    
    @ApiProperty()
    image: string
}