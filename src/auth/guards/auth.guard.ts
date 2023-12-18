import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../interfaces/jwt-payload';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor( 
    private jwtService: JwtService,
    private authService: AuthService ){

  }

  async canActivate( context: ExecutionContext ): Promise<boolean> {

    const request = context.switchToHttp().getRequest();
    //console.log({request})
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('There is no bearer token');
    }

    try {

      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        token,
        {
          secret: process.env.JWT_SEED
        }
      );
      //console.log({payload})

      
      const user = await this.authService.findUserById( payload.id );
      if( !user ) throw new UnauthorizedException('User does not exist');
      if( !user.isActive ) throw new UnauthorizedException('User is not active');

      //En este ejercicio nosotros usamos el payload.id, pero se puede usar todo completo
      // request['user'] = payload;
      request['user'] = user;

    } catch {

      throw new UnauthorizedException();

    }
    
    //return Promise.resolve(true);
    // Como es un método asíncrono se podría simplemente retornar un true
    return true;

  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
