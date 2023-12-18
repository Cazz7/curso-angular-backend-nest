import { UserSchema } from './entities/login.entity';
import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './entities/user.entity';
import * as bcryptjs from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponse } from './interfaces/login-response';

import { LoginDto, RegisterUserDto, CreateUserDto, UpdateAuthDto } from './dto';

interface UserNoPass {
  _id: string;
  email: string;
  name: string;
  isActive: boolean;
  roles: string[];
}

@Injectable()
export class AuthService {

  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService,
    ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    //console.log(createUserDto);



    // 1- Encriptar la contraseña
    // 2- Guardar el usuario
    // 3- Generar el JWT (Json Web Token)
    try {
      //Aquí estoy desestructurando el password en una variable aparte y todo lo demás en otra que se va a llamar 
      //userData
      const { password, ...userData } = createUserDto;

      //const newUser = new this.userModel( createUserDto );

      // Nueva manera para encriptar
      const newUser = new this.userModel( {
        password: bcryptjs.hashSync( password, 10 ),
        ...userData // Esparso el resto 
      } );
      await newUser.save();
      const { password:_, ...user } = newUser.toJSON();

      return user;

    } catch (error) {
      if( error.code === 11000 ){
        throw new BadRequestException(`${ createUserDto.email } already exists!`)
      }
      throw new InternalServerErrorException('Oops something happened!')
    }

  }

  async register(registerDto : RegisterUserDto): Promise<LoginResponse>{

      //const { email, name, password } = registerDto;
      const user = await this.create(registerDto);

      return {
        user: user,
        token: this.getJwt({ id: user._id }), 
      }


  }

  async login(loginDto: LoginDto): Promise<LoginResponse>{

    /**
      User { _id, name, email, roles }
      Token -> AASDFA.ASDFASDF.ASDFAS
    */
   // Verificar ese usuario buscando en la bd
   const { email, password } = loginDto;
   const user = await this.userModel.findOne( { email } );

   if( !user ){
    throw new UnauthorizedException('Not valid credentials - email');

   }
   // contraseña
   if( !bcryptjs.compareSync( password, user.password ) ){// Si no hacen match
    throw new UnauthorizedException('Not valid credentials - password');
   } 

   const { password:_ , ...rest } = user.toJSON();

   return {
    user: rest,
    token: this.getJwt({ id: user._id }), // el _id no sirve porque es el que viene de mongo
   }

  }

  findAll(): Promise<User[]> {
    // Esto normalmente se hace con paginación cuando son muchísimos usuarios
    return this.userModel.find();
  }

  async findUserById( id: string ): Promise<UserNoPass>{
    const user = await this.userModel.findById( id );
    const { password, ...rest } = user.toJSON(); // Con el toJSON nos aseguramos que no mande métodos innecesarios
    return rest;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  getJwt( payload: JwtPayload ){
    const token = this.jwtService.sign(payload);
    return token;
  }

}
