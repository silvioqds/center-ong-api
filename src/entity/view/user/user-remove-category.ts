import { ApiProperty } from "@nestjs/swagger"

export class UserRemoveCategory {
   @ApiProperty()
   userId:number

   @ApiProperty()
   categoryId:number
}