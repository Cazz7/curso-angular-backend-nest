import { IsEmail, IsString, MinLength } from "class-validator";

export class CreateUserDto {

    // Es lo que neceisto por obligación
    @IsEmail()
    email: string;

    @IsString()
    name: string;

    @MinLength(6)
    password: string;

}
