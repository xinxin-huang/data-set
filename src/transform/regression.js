const assign = require('lodash/assign');
const regression = require('regression');
const getSeriesValues = require('../util/get-series-values');
const {
  registerTransform
} = require('../data-set');

const DEFAULT_OPTIONS = {
  as: [ 'x', 'y' ],
  // fields: [ 'x', 'y' ], // required two fields
  method: 'linear', // regression method: linear, exponential, logarithmic, power, polynomial
  // extent: [], // extent to execute regression function, default: [ min(x), max(x) ]
  bandwidth: 1, // bandWidth to execute regression function
  order: 2, // order of the polynomial curve
  precision: 2 // the number of significant figures the output is rounded to
};

const REGRESSION_METHODS = [
  'linear',
  'exponential',
  'logarithmic',
  'power',
  'polynomial'
];

function transform(dataView, options) {
  options = assign({}, DEFAULT_OPTIONS, options);
  const fields = options.fields;
  if (!Array.isArray(fields) || fields.length !== 2) {
    throw new TypeError(`invalid fields: ${options.fields}`);
  }
  const [ xField, yField ] = fields;
  const method = options.method;
  if (REGRESSION_METHODS.indexOf(method) === -1) {
    throw new TypeError(`invalid method: ${method}`);
  }
  const points = dataView.rows.map(row => [ row[xField], row[yField] ]);
  const regressionResult = regression[method](points, options);
  let extent = options.extent;
  if (!Array.isArray(extent) || extent.length !== 2) {
    extent = dataView.range(xField);
  }
  const valuesToPredict = getSeriesValues(extent, options.bandwidth);
  const result = [];
  const [ asX, asY ] = options.as;
  valuesToPredict.forEach(value => {
    const row = {};
    const [ x, y ] = regressionResult.predict(value);
    row[asX] = x;
    row[asY] = y;
    if (isFinite(y)) {
      result.push(row);
    }
  });
  dataView.rows = result;
}

registerTransform('regression', transform);

module.exports = {
  REGRESSION_METHODS
};
