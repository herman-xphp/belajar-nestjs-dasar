import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import * as httpMock from 'node-mocks-http';
import { UserService } from './user.service';
import {
  Connection,
  MongoDBConnection,
  MySQLConnection,
} from '../connection/connection';
import { mailService, MailService } from '../mail/mail.service';
import {
  createUserRepository,
  UserRepository,
} from '../user-repository/user-repository';
import { MemberService } from '../member/member.service';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      imports: [],
      providers: [
        UserService,
        MemberService,
        {
          provide: Connection,
          useClass:
            process.env.DATABASE == 'mysql'
              ? MySQLConnection
              : MongoDBConnection,
        },
        {
          provide: MailService,
          useValue: mailService,
        },
        {
          provide: 'EmailService',
          useExisting: MailService,
        },
        {
          provide: UserRepository,
          useFactory: createUserRepository,
          inject: [Connection],
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should can say hello', async () => {
    const response = await controller.sayHallo('Eko');
    expect(response).toBe('Hello Eko');
  });

  it('should can view template', () => {
    const response = httpMock.createResponse();
    controller.viewHello('Eko', response);

    expect(response._getRenderView()).toBe('index.html');
    expect(response._getRenderData()).toEqual({
      name: 'Eko',
      title: 'Template Engine',
    });
  });
});
