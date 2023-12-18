import { IsEmail, IsString, MinLength } from "class-validator";

export class LoginDto {

    // Es lo que neceisto por obligación
    @IsEmail()
    email: string;

    @MinLength(6)
    password: string;

}