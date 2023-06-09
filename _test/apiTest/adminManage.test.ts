import supertest from 'supertest'
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import FormData from "form-data";
const app = require('../../app');

describe('admin 帳號', () => {
  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });
  afterAll(async () => {
      await mongoose.disconnect();
      await mongoose.connection.close();
  });

  let token = ''
  const adminUser = {
    "email": "123@gmail.com",
    "account": "test",
    "username": "dd",
    "password": "evfas12As2",
    "confirmPassword": "evfas12As2"
  }

  const admin = {
    "account": "test",
    "password": "evfas12As2"
  }
  const editAdmin = {
    "username": '333'
  }

  test("註冊", async () => {
    const { statusCode } = await supertest(app)
      .post('/admin/register')
      .send(adminUser)
    expect(statusCode).toBe(201)
  })
  test("登入", async () => {
    const { statusCode, body } = await supertest(app)
      .post('/admin/login')
      .send(admin)
      token = body.user.token
    expect(statusCode).toBe(200)
  })
  test("取得主辦資料", async () => {
    const { statusCode, body } = await supertest(app)
      .get('/admin/profiles')
      .set('Authorization', `Bearer ${token}`)
    expect(statusCode).toBe(200)
    expect(body.data.email).toBe(adminUser.email)
    expect(body.data.username).toBe(adminUser.username)
  })
  test("修改主辦資料", async () => {
    const { statusCode } = await supertest(app)
      .patch('/admin/profiles')
      .set('Authorization', `Bearer ${token}`)
      .send(editAdmin)
    expect(statusCode).toBe(200)
  })
  test("刪除主辦", async () => {
    const id = '6458a5e997a755a39290f561'
    const { statusCode } = await supertest(app)
      .delete(`/admin/deleteHost/${id}`)
    expect(statusCode).toBe(200)
  })
  test("登出", async () => {
    const { statusCode } = await supertest(app)
      .post('/admin/logout')
      .set('Authorization', `Bearer ${token}`)
    expect(statusCode).toBe(200)
  })
})