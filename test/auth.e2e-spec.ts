import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Authentication system', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('handles a sign up request', () => {
        const email = 'angga-ari@mail.com';
        return request(app.getHttpServer())
            .post('/auth/signup')
            .send({
                email: email,
                password: '123'
            })
            .expect(201)
            .then((res) => {
                const {id, email} = res.body;
                expect(id).toBeDefined();
                expect(email).toEqual(email);
            });
    });

    it('sign up as new user then get the currently logged in user', () => {
        const email = 'angga@mail.com';
        const response = request(app.getHttpServer())
            .post('/auth/signup')
            .send({
                email: email,
                password: '123'
            })
            .expect(201);

        const cookie = response.get('Set-Cookie');
        const {body} = await request(app.getHttpServer())
            .get('auth/me')
            .set('Cookie', cookie)
            .expect(200);

        expect(body.id).toBeDefined();
        expect(body.email).toEqual(email);
    });
});
