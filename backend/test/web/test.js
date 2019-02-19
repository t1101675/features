/**
  * Web Server测试
  */

const fs = require('fs')
const chai = require('chai')
const expect = chai.expect
chai.use(require('chai-http'))
const app = require('../../web-server/server')
const should = require('should')
const utility = require('../../web-server/server/utility/utility')

global.MOCHA_TESTING = true

/**
  * 模拟账户的设置
  */
var account_info = {
  'username': 'lyricz1998',
  'password': 'features',
  'email': 'stdafx@126.com'
}

var pwd_change = {
  'username': 'lyricz1998',
  'orgpw': 'features',
  'newpw': 'newfeatures'
}

var pwd_change_w = {
  'username': 'lyricz1998',
  'orgpw': 'features0',
  'newpw': 'newfeatures'
}

var account_info_c = {
  'username': 'lyricz1998',
  'password': 'newfeatures',
  'email': 'stdafx@126.com'
}

var account_info_e = {
  'username': 'lyricz2000',
  'password': 'features',
  'email': 'stdafx@126.com'
}

var account_info_f = {
  'username': 'lyricz1998',
  'password': 'bugbugbug',
  'email': 'stdafx@126.com'
}

var account_info_u = {
  'username': 'the_account_does_not_exist',
  'password': 'features',
  'email': 'stdafx@126.com'
}

var account_info_m = {
  'username': 'wrong_lyricz1998',
  'password': 'features',
  'email': 'it_is_not_an_email'
}

var admin_account = {
  'username': 'admin00',
  'password': 'features',
  'email': 'lyricz@yeah.net'
}

var pass_be = {
  'username': 'lyricz1998',
  'pass_be': 'd89a3dh8'
}

var pass_be_m = {
  'username': 'lyricz1998',
  'pass_be': 'a_wrong_backend_password'
}

var right_token
var wrong_token = 'a_wrong_token'


/**
  * 测试开始
  */
describe("Backend tests start:", function() {

  it("should go throught all the process", async () => {

    utility.randString()
    const legitTest = utility.legitTest
    legitTest.username(1).should.equal(false)
    legitTest.username('s').should.equal(false)
    legitTest.username('@!#@!??').should.equal(false)
    legitTest.username('lyricz1998').should.equal(true)

    legitTest.nickname(1).should.equal(false)
    legitTest.nickname('lyricz').should.equal(true)

    legitTest.slot(1).should.equal(false)
    legitTest.slot('1').should.equal(true)
    legitTest.profile({mimetype: 'image/png', size: 1}).should.equal(true)
    legitTest.hero({mimetype: 'image/png', size: 1}).should.equal(true)

    /**
      * 等待数据库
      */
    await new Promise((resolve, err) => {
      setTimeout(resolve, 3000)
    })

    await chai.request(app).post('/api/register')
      .send(account_info_m)
      .then(async (res) => {
        expect(res).to.have.status(200)
        expect(res.body.info_code).to.equal(2)
      })

    /* Register OK */
    await chai.request(app).post('/api/register')
      .send(account_info)
      .then(async (res) => {
        expect(res).to.have.status(200)
        expect(res.body.info_code).to.equal(0)

        /* Login with an account which does not exist */
        await chai.request(app).post('/api/login')
          .send(account_info_u)
          .then(async (res) => {
            expect(res).to.have.status(200)
            expect(res.body.info_code).to.equal(1)
          })

        /* Login with a wrong password */
        await chai.request(app).post('/api/login')
          .send(account_info_f)
          .then(async (res) => {
            expect(res).to.have.status(200)
            expect(res.body.info_code).to.equal(2)
          })

        /* Login without activation */
        await chai.request(app).post('/api/login')
          .send(account_info)
          .then(async (res) => {
            expect(res).to.have.status(200)
            expect(res.body.info_code).to.equal(3)
          })

        /* Get actcode with a wrong admin pass */
        await chai.request(app).post('/api/getactcode')
          .send(pass_be_m)
          .then(async (res) => {
            expect(res).to.have.status(404)
          })

        /* Get actcode OK */
        await chai.request(app).post('/api/getactcode')
          .send(pass_be)
          .then(async (res) => {
            expect(res).to.have.status(200)
            expect(res.body).to.have.property('actcode')
            let actcode = res.body.actcode

            /* Activation Error */
            await chai.request(app).get('/api/activate?username=lyricz1998&code=wrong_actcode')
              .then(async (res) => {
                expect(res).to.have.status(200)
                expect(res.body.info_code).to.equal(1)
              })

            /* Activation OK */
            await chai.request(app).get('/api/activate?username=lyricz1998&&code=' + actcode)
              .then(async (res) => {
                expect(res).to.have.status(200)

                /* Now login ok */
                await chai.request(app).post('/api/login')
                  .send(account_info)
                  .then(async (res) => {
                    expect(res).to.have.status(200)
                    expect(res.body.info_code).to.equal(0)
                    expect(res.body).to.have.property('token')
                    /* NOTE: here will be a token */
                    right_token = res.body.token

                    /* Wrong token test */
                    await chai.request(app).post('/api/users')
                      .set('authorization', wrong_token)
                      .send({'username': 'lyricz1998'})
                      .then(async (res) => {
                        expect(res).to.have.status(401)
                        expect(res.body.info_code).to.equal(-1)
                      })

                    /* No token test */
                    await chai.request(app).post('/api/users')
                      .then(async (res) => {
                        expect(res).to.have.status(401)
                        expect(res.body.info_code).to.equal(-2)
                      })

                    /* Token pass test, here we test the userlist function */
                    /* admin account required */
                    await chai.request(app).post('/api/users')
                      .set('authorization', right_token)
                      .send({'username': 'lyricz1998'})
                      .then(async (res) => {
                        expect(res).to.have.status(404)
                        // expect(res.body).to.have.property('userlist')
                        // console.log(res.body.userlist)
                      })

                    /* Change password with a wrong orginal password */
                    await chai.request(app).post('/api/resetpw')
                      .set('authorization', right_token)
                      .send(pwd_change_w)
                      .then(async (res) => {
                        expect(res).to.have.status(200)
                        expect(res.body.info_code).to.equal(1)
                      })

                    /* Change password OK */
                    await chai.request(app).post('/api/resetpw')
                      .set('authorization', right_token)
                      .send(pwd_change)
                      .then(async (res) => {
                        expect(res).to.have.status(200)
                        expect(res.body.info_code).to.equal(0)
                      })

                    /* Login with the new password and update the token */
                    await chai.request(app).post('/api/login')
                      .send(account_info_c)
                      .then(async (res) => {
                        expect(res).to.have.status(200)
                        expect(res.body.info_code).to.equal(0)
                        expect(res.body.isact).to.be.true
                        expect(res.body).to.have.property('token')
                        /* NOTE: here will be a token */
                        right_token = res.body.token
                      })

                    /* Change the password via email */
                    await chai.request(app).post('/api/reqpw')
                      .send({username: 'lyricz1998', email: 'stdafx@126.com'})
                      .then(async (res) => {
                        expect(res).to.have.status(200)
                        expect(res.body.info_code).to.equal(0)
                      })

                    var change_code
                    /* Get the changecode via hole */
                    await chai.request(app).post('/api/getchangcode')
                      .send(pass_be)
                      .then(async (res) => {
                        expect(res).to.have.status(200)
                        expect(res.body.info_code).to.equal(0)
                        change_code = res.body.change_code
                      })

                    /* Change the password via change_code(wrong) */
                    await chai.request(app).post('/api/newpw')
                      .send({'username': 'lyricz1998', 'newpw': 'newfeatures', 'change_code': 'wrong_change_code'})
                      .then(async (res) => {
                        expect(res).to.have.status(200)
                        expect(res.body.info_code).to.equal(2)
                      })

                    /* Change the password via change_code(right) */
                    await chai.request(app).post('/api/newpw')
                      .send({'username': 'lyricz1998', 'newpw': 'newfeatures', 'change_code': change_code})
                      .then(async (res) => {
                        expect(res).to.have.status(200)
                        expect(res.body.info_code).to.equal(0)
                      })

                    /* Finally Game */
                    await chai.request(app).get('/api/game')
                      .send({'username': 'lyricz1998'})
                      .set('authorization', right_token)
                      .then(async (res) => {
                        expect(res).to.have.status(200)
                        expect(res.body.info_code).to.equal(0)
                      })
                  })
              })
          })
    })

    /* Query nickname */
    await chai.request(app).get('/api/quni?usernames=admin00')
      .then(async (res) => {
        expect(res).to.have.status(200)
      })

    /* Get ranklist */
    await chai.request(app).get('/api/ranklist')
      .then(async (res) => {
        expect(res).to.have.status(200)
        expect(res.body.length).to.equal(21)
      })

    /* Register with an existing account */
    await chai.request(app).post('/api/register')
      .send(account_info)
      .then(async (res) => {
        expect(res).to.have.status(200)
        expect(res.body.info_code).to.equal(1)
      })

    /* Register with a same email */
    await chai.request(app).post('/api/register')
      .send(account_info_e)
      .then(async (res) => {
        expect(res).to.have.status(200)
        expect(res.body.info_code).to.equal(3)
      })

    /* Del the account */
    /* Admin account required */
    await chai.request(app).post('/api/deluser')
      .send({'username': 'lyricz1998', 'delusername': 'lyricz1998'})
      .set('authorization', right_token)
      .then(async (res) => {
        expect(res).to.have.status(404)
      })

    /* Change nickname */
    await chai.request(app).post('/api/chni')
      .send({'username': 'lyricz1998', 'nickname': 'changed'})
      .set('authorization', right_token)
      .then(async (res) => {
        expect(res).to.have.status(200)
        expect(res.body.info_code).to.equal(0)
      })

    /* CheckAvailable */
    await chai.request(app).post('/api/chav')
      .send({'username': 'admin00', 'email': 'stdafx@126.com'})
      .then(async (res) => {
        expect(res).to.have.status(200)
        expect(res.body.info_code).to.equal(3)
      })

    /* Login with an admin user */
    await chai.request(app).post('/api/login')
      .send(admin_account)
      .then(async (res) => {
        expect(res).to.have.status(200)
        expect(res.body.info_code).to.equal(0)
        right_token = res.body.token

        /* Get a default profile */
        await chai.request(app).get('/api/get_profile?username=admin00')
          .then(async (res) => {
            expect(res).to.have.status(200)
          })

        /* Upload profile */
        await chai.request(app).post('/api/upload_profile')
          .attach('profile', fs.readFileSync(__dirname + '/upp.png'), 'upp.png')
          .field('username', 'admin00')
          .set('authorization', right_token)
          .then(async (res) => {
            expect(res).to.have.status(200)
          })

        /* Get a profile */
        await chai.request(app).get('/api/get_profile?username=admin00')
          .then(async (res) => {
            expect(res).to.have.status(200)
          })

        /* Get a default hero */
        await chai.request(app).get('/api/get_hero?username=admin00&slot=0').then(async (res) => { expect(res).to.have.status(200) })
        await chai.request(app).get('/api/get_hero?username=admin00&slot=1').then(async (res) => { expect(res).to.have.status(200) })
        await chai.request(app).get('/api/get_hero?username=admin00&slot=2').then(async (res) => { expect(res).to.have.status(200) })

        /* Upload a hero */
        await chai.request(app).post('/api/upload_hero')
          .attach('hero', fs.readFileSync(__dirname + '/upp.png'), 'upp.png')
          .field('username', 'admin00')
          .field('slot', '0')
          .set('authorization', right_token)
          .then(async (res) => {
            expect(res).to.have.status(200)
          })

        /* Get a hero */
        await chai.request(app).get('/api/get_hero?username=admin00&slot=0')
          .then(async (res) => {
            expect(res).to.have.status(200)
          })

        /* Clear a hero */
        await chai.request(app).post('/api/clear_hero')
          .send({'username': 'admin00', 'slot': '0'})
          .set('authorization', right_token)
          .then(async (res) => {
            expect(res).to.have.status(200)
          })

        /* Get Userlist */
        await chai.request(app).post('/api/users')
          .send({'username': 'admin00'})
          .set('authorization', right_token)
          .then(async (res) => {
            expect(res).to.have.status(200)
            expect(res.body).to.have.property('userlist')
          })

        /* Del the account */
        await chai.request(app).post('/api/deluser')
          .send({'username': 'admin00', 'delusername': 'lyricz1998'})
          .set('authorization', right_token)
          .then(async (res) => {
            expect(res).to.have.status(200)
            expect(res.body.info_code).to.equal(0)
          })
      })

    /**
      * 数据库测试
      */
    const DB = require('../../web-server/server/database/db_api')

    let users = await DB.findUsers({username: 'admin00'})
    users.length.should.equal(1)

    await DB.updateUserAfterGame('admin00', {
      score: 4,
    }, false) /* Not async saving */

    await chai.request(app).post('/api/history')
      .send({'username': 'admin00'})
      .set('authorization', right_token)
      .then(async (res) => {
        expect(res).to.have.status(200)
        expect(res.body.history.length).to.equal(4)
      })

    let rkl = await DB.ranklist()
    rkl.length.should.equal(20)

    await DB.updateUserAfterGame('admin00', {
      score: 4,
    }) /* Async saving */

    /* Error */
    let err = await DB.updateUserAfterGame('lyricz', {
      score: 10
    })
    err.should.equal(-1)

    /**
      * 结束
      */
    app.closeDB()
    app.close()
  })
})
