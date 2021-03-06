const assign = require('lodash/assign');
const flattenDeep = require('lodash/flattenDeep');
const forIn = require('lodash/forIn');
const isArray = require('lodash/isArray');
const isString = require('lodash/isString');
const keys = require('lodash/keys');
const uniq = require('lodash/uniq');
const simpleStatistics = require('simple-statistics');
const partition = require('../util/partition');
const {
  registerTransform
} = require('../data-set');
const {
  STATISTICS_METHODS
} = require('../constants');
const {
  getFields
} = require('../util/option-parser');

const DEFAULT_OPTIONS = {
  as: [],
  fields: [],
  groupBy: [],
  operations: []
};
const DEFAULT_OPERATION = 'count';

const aggregates = {
  count(data) {
    return data.length;
  },
  distinct(data, field) {
    const values = uniq(data.map(row => row[field]));
    return values.length;
  }
};
STATISTICS_METHODS.forEach(method => {
  aggregates[method] = (data, field) => {
    let values = data.map(row => row[field]);
    if (isArray(values) && isArray(values[0])) {
      values = flattenDeep(values);
    }
    return simpleStatistics[method](values);
  };
});
aggregates.average = aggregates.mean;

function transform(dataView, options) {
  options = assign({}, DEFAULT_OPTIONS, options);
  const rows = dataView.rows;
  const dims = options.groupBy;
  const fields = getFields(options);
  if (!isArray(fields)) {
    throw new TypeError('Invalid fields: it must be an array with one or more strings!');
  }
  let outputNames = options.as || [];
  if (isString(outputNames)) {
    outputNames = [ outputNames ];
  }
  let operations = options.operations;
  if (isString(operations)) {
    operations = [ operations ];
  }
  const DEFAULT_OPERATIONS = [ DEFAULT_OPERATION ];
  if (!isArray(operations) || !operations.length) {
    console.warn('operations is not defined, will use [ "count" ] directly.');
    operations = DEFAULT_OPERATIONS;
    outputNames = operations;
  }
  if (!(operations.length === 1 && operations[0] === DEFAULT_OPERATION)) {
    if (operations.length !== fields.length) {
      throw new TypeError('Invalid operations: it\'s length must be the same as fields!');
    }
    if (outputNames.length !== fields.length) {
      throw new TypeError('Invalid as: it\'s length must be the same as fields!');
    }
  }
  const groups = partition(rows, dims);
  const results = [];
  forIn(groups, group => {
    // const result = pick(group[0], dims);
    const result = group[0];
    operations.forEach((operation, i) => {
      const outputName = outputNames[i];
      const field = fields[i];
      result[outputName] = aggregates[operation](group, field);
    });
    results.push(result);
  });
  dataView.rows = results;
}

registerTransform('aggregate', transform);
registerTransform('summary', transform);

module.exports = {
  VALID_AGGREGATES: keys(aggregates)
};
