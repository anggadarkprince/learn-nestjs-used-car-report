import {Test} from "@nestjs/testing";
import {AuthService} from "./auth.service";
import {UsersService} from "./users.service";
import {User} from "./user.entity";
import {BadRequestException, NotFoundException, UnauthorizedException} from "@nestjs/common";

describe('AuthService', () => {
    let service: AuthService;
    let fakeUsersService: Partial<UsersService>;

    beforeEach(async () => {
        // Create a fake of the users services
        const users: User[] = [];
        fakeUsersService = {
            findOne: () => Promise.resolve({} as User),
            find: (email: string) => {
                const foundUsers = users.filter(user => user.email === email);
                return Promise.resolve(foundUsers);
            },
            create: (email: string, password: string) => {
                const user = {id: (new Date()).getSeconds(), email, password} as User;
                users.push(user);
                return Promise.resolve(user);
            }
        }
        const module = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UsersService,
                    useValue: fakeUsersService
                }
            ],
        }).compile();
        service = module.get(AuthService);
    });

    it('can create an instance of auth service', async () => {
        expect(service).toBeDefined();
    });

    it('creates a new user with a salted and hashed password', async () => {
        const user = await service.signup('angga@mail.com', 'angga123');
        expect(user.password).not.toEqual('angga123');
        const [salt, hash] = user.password.split('.');
        expect(salt).toBeDefined();
        expect(hash).toBeDefined();
    });

    it('throws an error if user sign up with email that is in used', async () => {
        //fakeUsersService.find = () => Promise.resolve([{id: 1, email: 'angga.ari@mail.com', password: 'abc'} as User]);
        await service.signup('angga.ari@mail.com', 'angga.ari');
        await expect(service.signup('angga.ari@mail.com', 'angga.ari')).rejects.toThrowError(BadRequestException);
    });

    it('throws if sign in is called with an unused email', async () => {
        await service.signup('angga.ari@mail.com', 'angga.ari');
        await expect(service.signin('angga@mail.com', 'angga.ari')).rejects.toThrowError(NotFoundException);
    });

    it('throws if an invalid password is provided', async () => {
        //fakeUsersService.find = () => Promise.resolve([{id: 1, email: 'angga.ari@mail.com', password: 'abc'} as User]);
        await service.signup('angga.ari@mail.com', 'angga.ari');
        await expect(service.signin('angga.ari@mail.com', '123')).rejects.toThrowError(UnauthorizedException);
    });

    it('returns a user if correct password is provided', async () => {
        //fakeUsersService.find = () => Promise.resolve([{id: 1, email: 'angga.ari@mail.com', password: 'c56d117e08f66df1.b26523622592c612bde79256665c31e279db6e7e5b8c0f96f9244034a0bf1bae'} as User]);
        await service.signup('angga.aria@mail.com', '123');
        const user = await service.signin('angga.aria@mail.com', '123');
        expect(user).toBeDefined();
    });
});