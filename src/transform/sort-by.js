const isArray = require('lodash/isArray');
const reverse = require('lodash/reverse');
const sortBy = require('lodash/sortBy');
const {
  registerTransform
} = require('../data-set');
const {
  getFields
} = require('../util/option-parser');

/*
 * options: {
 *   type: 'sort-by',
 *   fields: [],
 *   order: 'ASC' // 'DESC'
 * }
 */

const VALID_ORDERS = [ 'ASC', 'DESC' ];

function transform(dataView, options = {}) {
  const fields = getFields(options, [ dataView.getColumnName(0) ]);
  if (!isArray(fields)) {
    throw new TypeError('Invalid fields: must be an array with strings!');
  }
  dataView.rows = sortBy(dataView.rows, fields);
  const order = options.order;
  if (order && VALID_ORDERS.indexOf(order) === -1) {
    throw new TypeError(`Invalid order: ${order} must be one of ${VALID_ORDERS.join(', ')}`);
  } else if (order === 'DESC') {
    dataView.rows = reverse(dataView.rows);
  }
}
registerTransform('sort-by', transform);
registerTransform('sortBy', transform);
