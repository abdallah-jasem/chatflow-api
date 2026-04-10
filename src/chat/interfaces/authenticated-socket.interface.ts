import { JwtPayload } from '../../auth/interface/jwt-payload.interface';
import { Socket } from 'socket.io';

export interface AuthenticatedSocket extends Socket {
  data: {
    user: JwtPayload;
  };
}
