/* global describe before after it */

/* eslint-disable */

const assert = require('assert');
const { expect, should } = require('chai');

/* eslint-enable */

const path = require('path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const environment = require('dotenv');
const varium = require('varium');
const { connect } = require('marpat');
const { Filemaker } = require('../index.js');

const manifestPath = path.join(__dirname, './env.manifest');

chai.use(chaiAsPromised);

describe('Client Capabilities', () => {
  let database;
  let client;
  before(done => {
    environment.config({ path: './test/.env' });
    varium({ manifestPath });
    connect('nedb://memory')
      .then(db => {
        database = db;
        return database.dropDatabase();
      })
      .then(() => {
        return done();
      });
  });

  before(done => {
    client = Filemaker.create({
      database: process.env.DATABASE,
      server: process.env.SERVER,
      user: process.env.USERNAME,
      password: process.env.PASSWORD
    });
    client.save().then(client => done());
  });

  after(done => {
    client
      .logout()
      .then(response => done())
      .catch(error => done());
  });

  it('should show the current status', () => {
    return expect(client.status())
      .to.eventually.be.a('object')
      .that.has.all.keys('data', 'pending', 'queue', 'sessions')
      .and.property('data');
  });

  it('should reset the client', () => {
    return expect(client.reset().catch(error => error))
      .to.eventually.be.a('object')
      .that.has.all.keys('message');
  });
});
