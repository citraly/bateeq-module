var should = require('should');
var helper = require('../helper');
var validate = require('bateeq-models').validator.article;
var manager;

function getData() {
    var ArticleType = require('bateeq-models').article.ArticleType;
    var articleType = new ArticleType();

    var now = new Date();
    var stamp = now / 1000 | 0;
    var code = stamp.toString(36);

    articleType.code = code;
    articleType.name = `name[${code}]`;
    articleType.description = `description for ${code}`;

    return articleType;
}

before('#00. connect db', function(done) {
    helper.getDb()
        .then(db => {
            var ArticleTypeManager = require('../../src/managers/article/article-type-manager');
            manager = new ArticleTypeManager(db, {
                username: 'unit-test'
            });
            done();
        })
        .catch(e => {
            done(e);
        })
});

var createdId;
it('#01. should success when create new data', function(done) {
    var data = getData();
    manager.create(data)
        .then(id => {
            id.should.be.Object();
            createdId = id;
            done();
        })
        .catch(e => {
            done(e);
        })
});

var createdData;
it(`#02. should success when get created data with id`, function(done) {
    manager.getById(createdId)
        .then(data => {
            validate.articleType(data);
            createdData = data;
            done();
        })
        .catch(e => {
            done(e);
        })
});

it(`#03. should success when update created data`, function(done) {

    createdData.code += '[updated]';
    createdData.name += '[updated]';
    createdData.description += '[updated]';

    manager.update(createdData)
        .then(id => {
            createdId.toString().should.equal(id.toString());
            done();
        })
        .catch(e => {
            done(e);
        });
});

it(`#04. should success when get updated data with id`, function(done) {
    manager.getById(createdId)
        .then(data => {
            validate.articleType(data);
            data.code.should.equal(createdData.code);
            data.name.should.equal(createdData.name);
            data.description.should.equal(createdData.description);
            done();
        })
        .catch(e => {
            done(e);
        })
});

it(`#05. should success when delete data`, function(done) { 
    manager.delete(createdData)
        .then(id => {
            createdId.toString().should.equal(id.toString());
            done();
        })
        .catch(e => {
            done(e);
        });
});

it(`#06. should _deleted=true`, function(done) {
    manager.getById(createdId)
        .then(data => {
            validate.articleType(data);
            data._deleted.should.be.Boolean();
            data._deleted.should.equal(true);
            done();
        })
        .catch(e => {
            done(e);
        })
});