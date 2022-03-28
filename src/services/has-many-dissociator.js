const _ = require('lodash');
const Operators = require('../utils/operators');
const orm = require('../utils/orm');
const ErrorHTTP422 = require('./errors').ErrorHTTP422;

function HasManyDissociator(model, association, options, params, data) {
  var OPERATORS = new Operators(options);
  var isDelete = Boolean(params.delete);

  this.perform = function () {
    var associatedIds = _.map(data.data, function (value) { return value.id; });
    return orm.findRecord(model, params.recordId)
      .then(function (record) {
        var removeAssociation = false;

        if (isDelete) {
          _.each(model.associations, function(association, associationName) {
            if (associationName === params.associationName) {
              removeAssociation = (association.associationType === 'belongsToMany');
            }
          });
        } else {
          removeAssociation = true;
        }

        if (removeAssociation) {
          return record['remove' + _.upperFirst(params.associationName)](associatedIds);
        }
        return null;
      })
      .then(async function () {
        if (isDelete) {
          var condition = { id: {} };
          condition.id[OPERATORS.IN] = associatedIds;
          const records = await association.findAll({ where: condition });
          for(const record of records){
              record.destroy();
          }
        }
      })
      .catch(function (error) {
        throw new ErrorHTTP422(error.message);
      });
  };
}

module.exports = HasManyDissociator;
