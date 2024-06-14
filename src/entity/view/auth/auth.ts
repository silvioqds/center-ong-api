import { ApiProperty } from "@nestjs/swagger"

export class Authentication {

    @ApiProperty()
    email : string
    @ApiProperty()
    password : string
}