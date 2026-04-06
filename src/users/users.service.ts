import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existingEmail = await this.findByEmail(createUserDto.email);
    if (existingEmail) throw new ConflictException('Email already exists');

    const existingUsername = await this.findByUsername(createUserDto.username);
    if (existingUsername)
      throw new ConflictException('Username already exists');

    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  findByUsername(username: string) {
    return this.userRepository.findOne({ where: { username } });
  }

  findAll() {
    return this.userRepository.find();
  }

  async findById(id: string) {
    // we should check if the new email or username is can be update or not
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.preload({
      id: id,
      ...updateUserDto,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.userRepository.save(user);
  }
  async remove(id: string) {
    const user = await this.findById(id);
    return this.userRepository.remove(user);
  }

  async findByEmailOrUsername(emailOrUsername: string) {
    return this.userRepository.findOne({
      where: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });
  }
}
