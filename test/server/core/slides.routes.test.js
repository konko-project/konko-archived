'use strict';

import path from 'path';
import request from 'supertest';
import expect from 'expect.js';
import mongoose from 'mongoose';
const Core = mongoose.model('Core');
const User = mongoose.model('User');
const Profile = mongoose.model('Profile');
const Slide = mongoose.model('Slide');
const SERVER = require(path.resolve('./configurations/server'));
const app = require(path.resolve(SERVER.build.paths.root, 'configs/app')).default;

let agent;
let s1;
let s2;
let slide;
let admin;
let user;
let banned;
let guest;
let adminHeader;
let userHeader;
let bannedHeader;
let guestHeader;

const each = () => {
  beforeEach(done => {
    s1 = {
      title: 'slide one',
      description: 'slide one description',
      image: 'slide one image url',
      url: 'slide one link url',
      alt: 'slide one image alt',
      order: 0,
    };
    s2 = {
      title: 'slide two',
      description: 'slide two description',
      image: 'slide two image url',
      url: 'slide two link url',
      alt: 'slide two image alt',
      order: 1,
    };
    Slide.create(s1).then(s => {
      slide = s;
      done();
    });
  });
  afterEach(done => {
    Slide.remove().then(done());
  });
};

describe('Slide CRUD Test:', () => {
  before(done => {
    const buildUser = (username, permission = username) => new User({
      email: `${username}@test.com`,
      permission: permission,
      profile: new Profile({ username: username }),
    });
    Core.create({ basic: { title: 'Test' } }).catch(err => {
      expect(err).to.be.empty();
      return done();
    });

    let _app = app(path.resolve(SERVER.build.paths.root));
    agent = request.agent(_app);
    admin = buildUser('admin');
    user = buildUser('user');
    banned = buildUser('banned');
    guest = buildUser('guest');

    admin.profile.save().then(user.profile.save().then(banned.profile.save().then(guest.profile.save().then(
      admin.save().then(user.save().then(banned.save().then(guest.save().then(u => {
        agent.get('/').end((err, res) => {
          let csrfToken = /csrfToken=(.*?)(?=\;)/.exec(res.header['set-cookie'].join(''))[1];
          adminHeader = {
            Authorization: `Bearer ${admin.generateJWT(_app)}`,
            'x-csrf-token': csrfToken,
          };
          userHeader = {
            Authorization: `Bearer ${user.generateJWT(_app)}`,
            'x-csrf-token': csrfToken,
          };
          bannedHeader = {
            Authorization: `Bearer ${banned.generateJWT(_app)}`,
            'x-csrf-token': csrfToken,
          };
          guestHeader = {
            Authorization: `Bearer ${guest.generateJWT(_app)}`,
            'x-csrf-token': csrfToken,
          };
          done();
        });
      }))))
    ))));
  });
  after(done => {
    Profile.remove().then(User.remove().then(Core.remove().then(done())));
  });
  describe('Testing POST', () => {
    each();
    it('should response 401 when JWT is missing in header', done => {
      agent.post('/api/v1/slides')
        .set(adminHeader)
        .set('Authorization', '')
        .send(s2)
        .expect(401, done);
    });
    it('should allow Admin to create a Slide', done => {
      agent.post('/api/v1/slides')
        .set(adminHeader)
        .send(s2)
        .expect(201)
        .expect(({ body: { title, description, image, url, alt, order } }) => {
          expect(title).to.be(s2.title);
          expect(description).to.be(s2.description);
          expect(image).to.be(s2.image);
          expect(url).to.be(s2.url);
          expect(alt).to.be(s2.alt);
          expect(order).to.be(s2.order);
        }).end(done);
    });
    it('should response 401 when User try to create a Slide', done => {
      agent.post('/api/v1/slides')
        .set(userHeader)
        .send(s2)
        .expect(401, done);
    });
    it('should response 401 when Banned User try to create a Slide', done => {
      agent.post('/api/v1/slides')
        .set(bannedHeader)
        .send(s2)
        .expect(401, done);
    });
    it('should response 401 when Guest try to create a Slide', done => {
      agent.post('/api/v1/slides')
        .set(guestHeader)
        .send(s2)
        .expect(401, done);
    });
    it('should response 400 when title is missing', done => {
      s2.title = '';
      agent.post('/api/v1/slides')
        .set(adminHeader)
        .send(s2)
        .expect(400, done);
    });
    it('should response 400 when title is missing', done => {
      s2.title = '';
      agent.post('/api/v1/slides')
        .set(adminHeader)
        .send(s2)
        .expect(400, done);
    });
    it('should response 400 when url is missing', done => {
      s2.url = '';
      agent.post('/api/v1/slides')
        .set(adminHeader)
        .send(s2)
        .expect(400, done);
    });
    it('should allow create same Slide', done => {
      agent.post('/api/v1/slides')
        .set(adminHeader)
        .send(s1)
        .expect(201, done);
    });
  });
  describe('Testing GET', () => {
    each();
    it('should response 401 when JWT is missing in header when quering Slides', done => {
      agent.get('/api/v1/slides')
        .set(adminHeader)
        .set('Authorization', '')
        .expect(401, done);
    });
    it('should allow Admin to query all Slides', done => {
      agent.get('/api/v1/slides')
        .set(adminHeader)
        .expect(200)
        .expect(({ body, body: [s, ...rest] }) => {
          expect(body).to.have.length(1);
          expect(s.title).to.be(slide.title);
          expect(s.description).to.be(slide.description);
          expect(s.image).to.be(slide.image);
          expect(s.url).to.be(slide.url);
          expect(s.alt).to.be(slide.alt);
          expect(s.order).to.be(slide.order);
        }).end(done);
    });
    it('should allow User to query all Slides', done => {
      agent.get('/api/v1/slides')
        .set(userHeader)
        .expect(200)
        .expect(({ body, body: [s, ...rest] }) => {
          expect(body).to.have.length(1);
          expect(s.title).to.be(slide.title);
          expect(s.description).to.be(slide.description);
          expect(s.image).to.be(slide.image);
          expect(s.url).to.be(slide.url);
          expect(s.alt).to.be(slide.alt);
          expect(s.order).to.be(slide.order);
        }).end(done);
    });
    it('should allow Banned User to query all Slides', done => {
      agent.get('/api/v1/slides')
        .set(bannedHeader)
        .expect(200)
        .expect(({ body, body: [s, ...rest] }) => {
          expect(body).to.have.length(1);
          expect(s.title).to.be(slide.title);
          expect(s.description).to.be(slide.description);
          expect(s.image).to.be(slide.image);
          expect(s.url).to.be(slide.url);
          expect(s.alt).to.be(slide.alt);
          expect(s.order).to.be(slide.order);
        }).end(done);
    });
    it('should allow Guest to query all Slides', done => {
      agent.get('/api/v1/slides')
        .set(guestHeader)
        .expect(200)
        .expect(({ body, body: [s, ...rest] }) => {
          expect(body).to.have.length(1);
          expect(s.title).to.be(slide.title);
          expect(s.description).to.be(slide.description);
          expect(s.image).to.be(slide.image);
          expect(s.url).to.be(slide.url);
          expect(s.alt).to.be(slide.alt);
          expect(s.order).to.be(slide.order);
        }).end(done);
    });
    it('should response 401 when JWT is missing when quering a Slide with its id', done => {
      agent.get(`/api/v1/slides/${slide._id}`)
        .set(adminHeader)
        .set('Authorization', '')
        .expect(401, done);
    });
    it('should allow Admin to query a Slide with its id', done => {
      agent.get(`/api/v1/slides/${slide._id}`)
        .set(adminHeader)
        .expect(200)
        .expect(({ body: { _id, title, description, image, url, alt, order } }) => {
          expect(_id).to.be(slide._id.toString());
          expect(title).to.be(slide.title);
          expect(description).to.be(slide.description);
          expect(image).to.be(slide.image);
          expect(url).to.be(slide.url);
          expect(alt).to.be(slide.alt);
          expect(order).to.be(slide.order);
        }).end(done);
    });
    it('should allow User to query a Slide with its id', done => {
      agent.get(`/api/v1/slides/${slide._id}`)
        .set(userHeader)
        .expect(200)
        .expect(({ body: { _id, title, description, image, url, alt, order } }) => {
          expect(_id).to.be(slide._id.toString());
          expect(title).to.be(slide.title);
          expect(description).to.be(slide.description);
          expect(image).to.be(slide.image);
          expect(url).to.be(slide.url);
          expect(alt).to.be(slide.alt);
          expect(order).to.be(slide.order);
        }).end(done);
    });
    it('should allow Banned User to query a Slide with its id', done => {
      agent.get(`/api/v1/slides/${slide._id}`)
        .set(bannedHeader)
        .expect(200)
        .expect(({ body: { _id, title, description, image, url, alt, order } }) => {
          expect(_id).to.be(slide._id.toString());
          expect(title).to.be(slide.title);
          expect(description).to.be(slide.description);
          expect(image).to.be(slide.image);
          expect(url).to.be(slide.url);
          expect(alt).to.be(slide.alt);
          expect(order).to.be(slide.order);
        }).end(done);
    });
    it('should allow Guest to query a Slide with its id', done => {
      agent.get(`/api/v1/slides/${slide._id}`)
        .set(guestHeader)
        .expect(200)
        .expect(({ body: { _id, title, description, image, url, alt, order } }) => {
          expect(_id).to.be(slide._id.toString());
          expect(title).to.be(slide.title);
          expect(description).to.be(slide.description);
          expect(image).to.be(slide.image);
          expect(url).to.be(slide.url);
          expect(alt).to.be(slide.alt);
          expect(order).to.be(slide.order);
        }).end(done);
    });
    it('should response 400 when Slide id is invalid', done => {
      agent.get('/api/v1/slides/12345')
        .set(adminHeader)
        .expect(400, done);
    });
    it('should response 404 when Slide is not exist', done => {
      agent.get(`/api/v1/slides/${new Slide(s2)._id}`)
        .set(adminHeader)
        .expect(404, done);
    });
  });
  describe('Testing PUT', () => {
    each();
    it('should response 401 when JWT is missing in header', done => {
      agent.put(`/api/v1/slides/${slide._id}`)
        .set(adminHeader)
        .set('Authorization', '')
        .expect(401, done);
    });
    it('should allow Admin to update a Slide', done => {
      agent.put(`/api/v1/slides/${slide._id}`)
        .set(adminHeader)
        .send(s2)
        .expect(200)
        .expect(({ body: { title, description, image, url, alt, order } }) => {
          expect(title).to.be(s2.title);
          expect(description).to.be(s2.description);
          expect(image).to.be(s2.image);
          expect(url).to.be(s2.url);
          expect(alt).to.be(s2.alt);
          expect(order).to.be(s2.order);
        }).end(done);
    });
    it('should response 401 when User try to udpate a Slide', done => {
      agent.put(`/api/v1/slides/${slide._id}`)
        .set(userHeader)
        .send(s2)
        .expect(401, done);
    });
    it('should response 401 when Banned User try to udpate a Slide', done => {
      agent.put(`/api/v1/slides/${slide._id}`)
        .set(bannedHeader)
        .send(s2)
        .expect(401, done);
    });
    it('should response 401 when Guest try to udpate a Slide', done => {
      agent.put(`/api/v1/slides/${slide._id}`)
        .set(guestHeader)
        .send(s2)
        .expect(401, done);
    });
    it('should response 400 when title is missing', done => {
      s2.title = '';
      agent.put(`/api/v1/slides/${slide._id}`)
        .set(adminHeader)
        .send(s2)
        .expect(400, done);
    });
    it('should response 400 when image is missing', done => {
      s2.image = '';
      agent.put(`/api/v1/slides/${slide._id}`)
        .set(adminHeader)
        .send(s2)
        .expect(400, done);
    });
    it('should response 400 when url is missing', done => {
      s2.url = '';
      agent.put(`/api/v1/slides/${slide._id}`)
        .set(adminHeader)
        .send(s2)
        .expect(400, done);
    });
    it('should reponse 400 when Slide id is invalid', done => {
      agent.put(`/api/v1/slides/${12345}`)
        .set(adminHeader)
        .send(s2)
        .expect(400, done);
    });
    it('should response 404 when Slide is not exist', done => {
      agent.put(`/api/v1/slides/${new Slide(s2)._id}`)
        .set(adminHeader)
        .send(s2)
        .expect(404, done);
    });
  });
  describe('Testing DELETE', () => {
    each();
    it('should response 401 when JWT is missing in header', done => {
      agent.del(`/api/v1/slides/${slide._id}`)
        .set(adminHeader)
        .set('Authorization', '')
        .expect(401, done);
    });
    it('should allow Admin to remove a Slide', done => {
      agent.del(`/api/v1/slides/${slide._id}`)
        .set(adminHeader)
        .expect(200, done);
    });
    it('should response 401 when User try to remove a Slide', done => {
      agent.del(`/api/v1/slides/${slide._id}`)
        .set(userHeader)
        .expect(401, done);
    });
    it('should response 401 when Banned User try to remove a Slide', done => {
      agent.del(`/api/v1/slides/${slide._id}`)
        .set(bannedHeader)
        .expect(401, done);
    });
    it('should response 401 when Guest try to remove a Slide', done => {
      agent.del(`/api/v1/slides/${slide._id}`)
        .set(guestHeader)
        .expect(401, done);
    });
    it('should response 400 when Slide id is invalid', done => {
      agent.del(`/api/v1/slides/${12345}`)
        .set(adminHeader)
        .expect(400, done);
    });
    it('should response 404 when Slide is not exist', done => {
      agent.del(`/api/v1/slides/${new Slide(s2)._id}`)
        .set(adminHeader)
        .expect(404, done);
    });
  });
});
