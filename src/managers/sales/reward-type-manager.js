'use strict';

// external deps 
var ObjectId = require('mongodb').ObjectId;

// internal deps
require('mongodb-toolkit');
var BaseManager = require('../base-manager');
var BateeqModels = require('bateeq-models');
var RewardType = BateeqModels.sales.RewardType;
var map = BateeqModels.map;
//var generateCode = require('../../utils/code-generator');
 
module.exports = class RewardTypeManager extends BaseManager {
    constructor(db, user) {
        super(db, user);
        this.collection = this.db.use(map.sales.RewardType);
    }

    _createIndexes() {
        var dateIndex = {
            name: `ix_${map.sales.RewardType}__updatedDate`,
            key: {
                _updatedDate: -1
            }
        }

        var codeIndex = {
            name: `ix_${map.sales.RewardType}_code`,
            key: {
                code: 1
            },
            unique: true
        }

        return this.collection.createIndexes([dateIndex, codeIndex]);
    }
     
    _getQuery(paging) { 
        var deleted = {
            _deleted: false
        };
        var query = _paging.keyword ? {
            '$and': [deleted]
        } : deleted;

        if (_paging.keyword) {
            var regex = new RegExp(_paging.keyword, "i");
            var filterCode = {
                'code': {
                    '$regex': regex
                }
            };
            var filterName = {
                'name': {
                    '$regex': regex
                }
            };
            var $or = {
                '$or': [filterCode, filterName]
            };

            query['$and'].push($or);
        }
        return query; 
    }
 
    _validate(rewardType) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = new RewardType(rewardType);
            // 1. begin: Declare promises.
            var getRewardType = this.collection.singleOrDefault({
                "$and": [{
                    _id: {
                        '$ne': new ObjectId(valid._id)
                    }
                }, {
                        code: valid.code
                    }]
            });
            // 1. end: Declare promises.

            // 2. begin: Validation.
            Promise.all([getRewardType])
                .then(results => {
                    var _rewardType = results[0];

                    if (!valid.code || valid.code == '')
                        errors["code"] = "code is required";
                    else if (_rewardType) {
                        errors["code"] = "code already exists";
                    }

                    if (!valid.name || valid.name == '')
                        errors["name"] = "name is required"; 

                    // 2c. begin: check if data has any error, reject if it has.
                    for (var prop in errors) {
                        var ValidationError = require('../../validation-error');
                        reject(new ValidationError('data does not pass validation', errors));
                    }

                    valid.stamp(this.user.username, 'manager');
                    resolve(valid);
                })
                .catch(e => {
                    reject(e);
                })
        });
    }
};