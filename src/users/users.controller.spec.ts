import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import {UsersService} from "./users.service";
import {AuthService} from "./auth.service";
import {User} from "./user.entity";
import {NotFoundError} from "rxjs";
import {NotFoundException} from "@nestjs/common";

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeUsersService = {
      findOne: (id: number) => {
        return Promise.resolve({ id, email: 'angga@mail.com', password: '123' } as User)
      },
      find: (email: string) => {
        return Promise.resolve([{id: 1, email, password: '123'} as User])
      },
      //remove: () => {},
      //update: () => {},
    }
    fakeAuthService = {
      signin: (email: string, password: string) => {
        return Promise.resolve({id: 1, email, password} as User);
      },
      //signup: () => {}
    }
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUsersService
        },
        {
          provide: AuthService,
          useValue: fakeAuthService
        }
      ]
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllUsers returns a list of users with the given email', async  () => {
      const users = await controller.findAllUsers('angga@mail.com');
      expect(users.length).toEqual(1);
      expect(users[0].email).toEqual('angga@mail.com');
  });

  it('findUser returns a single user with the given id', async () => {
    const user = await controller.findUser('1');
    expect(user).toBeDefined();
    expect(user.email).toBe('angga@mail.com');
  });

  it('findUser throws an error if user with given id is not found', async () => {
    fakeUsersService.findOne = () => null;
    await expect(controller.findUser('1')).rejects.toThrowError(NotFoundException);
  });

  it('sign in updates session object and returns user', async () => {
    const session = {userId: -1};
    const user = await controller.signIn({email: 'angga@mail.com', password: '123'}, session);
    expect(user.id).toEqual(1);
    expect(session.userId).toEqual(1);
  });
});
