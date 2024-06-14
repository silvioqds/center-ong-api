import { ApiProperty } from "@nestjs/swagger";

export class LastShare {
    @ApiProperty()
    last_date : Date    
}