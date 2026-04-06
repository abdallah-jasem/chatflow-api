import { Injectable } from '@nestjs/common';
import { HashingService } from './hashing.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptService extends HashingService {
  async hash(data: string) {
    return bcrypt.hash(data, 10);
  }

  async compare(data: string, encrypted: string) {
    return bcrypt.compare(data, encrypted);
  }
}
