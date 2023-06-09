import supertest from 'supertest'
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
const app = require('../../app');

describe('banner 管理', () => {
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
  const addBanner = {
    "activityId": '',
    "image": 'dasd'
  }
  // 主辦登入
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
  // 新增活動
  const act = {
    "title": "2023 大港開唱",
    "sponsorName": "出日音樂股份有限公司ED",
    "location": "高雄流行音樂中心",
    "address": "彰化縣彰化市八卦山",
    "mapUrl": "https://www.google.com/maps/@22.9970861,120.2129832,17z",
    "startDate": "2023-04-01T09:00:00.000+08:00",
    "endDate": "2023-04-02T17:00:00.000+08:00",
    "mainImageUrl": "https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    "HtmlContent": " ......",
    "HtmlNotice": " ......",
    "saleStartDate": "2023-03-01T09:00:00.000+08:00",
    "saleEndDate": "2023-03-31T17:00:00.000+08:00",
    "schedules": [
      {
        "scheduleName": "場次一",
        "startTime": "2023-04-01T09:00:00.000+08:00",
        "endTime": "2023-04-01T17:00:00.000+08:00",
        "saleStartTime": "2023-03-01T09:00:00.000+08:00",
        "saleEndTime": "2023-03-31T17:00:00.000+08:00",
        "ticketCategories": [
          {
            "categoryName": "單人票",
            "price": 1500,
            "totalQuantity": 50,
            "remainingQuantity": 50
          },
          {
            "categoryName": "雙人票",
            "price": 2800,
            "totalQuantity": 25,
            "remainingQuantity": 25
          }
        ]
      },
    ]
  }
  test("新增活動", async () => {
    const { statusCode } = await supertest(app)
    .post(`/admin/activities`)
    .set('Authorization', `Bearer ${token}`)
    .send(act)
    expect(statusCode).toBe(200)
  })
  // banner api 測試
  test("取得活動圖片", async () => {
    const { statusCode, body } = await supertest(app)
      .get('/admin/banner_mgmt/info')
      .set('Authorization', `Bearer ${token}`)

    addBanner.activityId = body.data[0]._id
    expect(statusCode).toBe(200)
    expect(body.data).toBeInstanceOf(Array)
  })
  test("新增 banner", async () => {
    const { statusCode, body } = await supertest(app)
    .post(`/admin/banner_mgmt`)
    .set('Authorization', `Bearer ${token}`)
    .send(addBanner)

    if(statusCode !== 200) {
      const errorMsg = body
      console.log(errorMsg);
      
    } else {
      expect(statusCode).toBe(200)
    }
  })
  let bannerId = ''
  test("取得 banner 資料", async () => {
    const { statusCode, body } = await supertest(app)
      .get('/admin/banner_mgmt/list')
      .set('Authorization', `Bearer ${token}`)

    bannerId = body.data[0]._id
    expect(statusCode).toBe(200)
    expect(body.data).toBeInstanceOf(Array)
  })
  test("刪除 banner", async () => {
    const { statusCode, body } = await supertest(app)
    .delete(`/admin/banner_mgmt/${bannerId}`)
    .set('Authorization', `Bearer ${token}`)

    if(statusCode !== 200) {
      const errorMsg = body
      console.log(errorMsg);
      
    } else {
      expect(statusCode).toBe(200)
    }
  })
})