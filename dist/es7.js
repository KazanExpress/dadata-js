function getQueryString(params) {
    return Object
        .keys(params)
        .map((k) => {
        if (Array.isArray(params[k])) {
            return params[k]
                .map((val) => val ? `${encodeURIComponent(k)}[]=${encodeURIComponent(val)}` : '')
                .join('&');
        }
        return params[k] ? `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}` : '';
    })
        .join('&');
}
function fromDot(obj, path) {
    if (!path)
        return obj;
    return path.split('.').reduce((o, i) => typeof o === 'object' ? o[i] : o, obj);
}

class Container {
    constructor(model, name, fields, source) {
        this.data = {};
        this.fields = {};
        this.model = model;
        this.name = name;
        this.fields = fields;
        if (source) {
            this.data = source;
        }
    }
    /**
     * Sets a external source for a container
     * @param source Data source
     */
    setSource(source) {
        this.data = source;
        this.model.setProxy(this.name);
    }
}

var DEFAULTS;
(function (DEFAULTS) {
    DEFAULTS.IS_JSON_RESPONSE = true;
    DEFAULTS.QUERY_METHOD = 'GET';
    DEFAULTS.CONTAINER_PROXY_PREFIX = '$';
})(DEFAULTS || (DEFAULTS = {}));

class BaseModel {
    constructor(parent = null) {
        this.processors = {};
        this.modifiers = {};
        this.described_containers = {};
        this.containers = {};
        /**
         * Adds new containers to the model
         * @param containers Array of containers
         */
        this.addContainer = function () {
            if (arguments.length >= 2) {
                var full_name = arguments[0];
                var fields = arguments[1];
                var source = arguments[2];
            }
            else {
                const base = arguments[0];
                full_name = base.name;
                fields = base.fields;
                source = base.source;
            }
            let extended_fields = this.getExtendedFields(full_name);
            let name = full_name;
            if (extended_fields) {
                fields = Object.assign({}, fields, extended_fields.extended);
                name = extended_fields.name;
            }
            let new_container = new Container(this, name, fields, source);
            this.containers[name] = new_container;
            this.setProxy(name);
            return this;
        };
        this.addContainers = containers => {
            if (Array.isArray(containers))
                containers.forEach(this.addContainer);
            for (let name in containers) {
                const { fields, source } = containers[name];
                this.addContainer(name, fields, source);
            }
            return this;
        };
        this.parent = parent;
        this.addFieldProcessorsBulk({
            'int': (value) => !value ? 0 : (parseInt(value) ? +parseInt(value) : 0),
            'string': (value) => (typeof value) == 'string' ? value : (!value ? '' : '' + value),
            'array': (value) => Array.isArray(value) ? value : [],
            'bool': (value) => value ? true : false,
            // Processors for testing:
            'usd': (value) => value.toString() != 'NaN' ? (value.toString().indexOf('$') < 0 ? value + '$' : value) : value,
            'kzt': (value) => value.toString() != 'NaN' ? (value.toString().indexOf('₸') < 0 ? value + '₸' : value) : value
        });
    }
    /**
     * Sets a Proxy alias for the container
     * to the root of this class
     * @param container_name Container name
     */
    setProxy(container_name) {
        if (this.getContainer(container_name)) {
            let original = this.containers[container_name].data;
            let proxy_name = `${DEFAULTS.CONTAINER_PROXY_PREFIX}${container_name}`;
            this[proxy_name] = original;
        }
        else {
            console.error(`
        BaseAjax::setProxy()
        Container ${container_name} not found
      `);
        }
    }
    /**
     * Creates a method to proceed a processors chain
     * @param names Processors chain
     */
    createProcessorCallie(names) {
        let names_ar = names.split('.');
        return (data) => {
            let is_stop = false;
            let acc = data;
            for (let name of names_ar) {
                // check if there is a modifier
                if (name.indexOf(`:`) >= 0) {
                    let full_mod = name.split(':');
                    let mod_name = full_mod[0];
                    let mod_params = JSON.parse(full_mod[1]);
                    if (this.modifiers[mod_name]) {
                        let mod_result = this.modifiers[mod_name](acc, mod_params);
                        acc = mod_result.value || acc;
                        is_stop = mod_result.break || is_stop;
                    }
                    if (is_stop) {
                        break;
                    }
                }
                else {
                    acc = this.proceedProcessor(name, acc);
                }
            }
            return acc;
        };
    }
    /**
     * Gets a container
     * @param name Container name
     */
    getContainer(name) {
        return this.containers[name];
    }
    /**
     * Proceeds the processor
     * @param name Processor name
     * @param data Data to proceed
     */
    proceedProcessor(name, data) {
        if (this.processors[name])
            return this.processors[name](data);
        else
            return undefined;
    }
    /**
     * Gets the extended fields for controller.
     * @param name The name
     * @return The extended fields.
     */
    getExtendedFields(name) {
        const keyword = ' extends ';
        let is_extends = !!~name.indexOf(keyword);
        if (is_extends) {
            let name_splitted = name.split(keyword).map((el) => el.replace(/\s/g, ''));
            let extended = {};
            // Several extends
            if (~name_splitted[1].indexOf('[')) {
                let extends_arr = name_splitted[1]
                    .replace(/[\[\]]/g, '')
                    .split(',');
                extends_arr.forEach((el) => {
                    if (this.described_containers[el]) {
                        extended = Object.assign({}, extended, this.described_containers[el]);
                    }
                });
            }
            else {
                if (this.described_containers[name_splitted[1]]) {
                    extended = Object.assign({}, extended, this.described_containers[name_splitted[1]]);
                }
            }
            return { name: name_splitted[0], extended };
        }
        else {
            return false;
        }
    }
    /**
     * Describe basic container
     *
     * @param      {string}  full_name  The full name
     * @param      {Object}  fields     The fields
     */
    describeContainer(full_name, fields = {}) {
        let extended_fields = this.getExtendedFields(full_name);
        let name = full_name;
        if (extended_fields) {
            fields = Object.assign({}, fields, extended_fields.extended);
            name = extended_fields.name;
        }
        this.described_containers[name] = fields;
        return this;
    }
    /**
     * Gets a real processor name
     * (ex. from '@container_name.some_field')
     * @param name Processor name
     */
    getProcessor(name) {
        if (~name.indexOf('@')) {
            let splitted_keys = name.replace('@', '').split('.');
            let container_name = splitted_keys[0];
            let container = this.getContainer(container_name);
            if (container) {
                let property_name = splitted_keys.slice(-1).join('');
                let processor_name = container.fields[property_name];
                if (~processor_name.indexOf('@')) {
                    return this.getProcessor(processor_name);
                }
                else {
                    return processor_name;
                }
            }
        }
        return name;
    }
    /**
     * Adds a new modifier
     * @param params Name and a callback for a new modifier
     */
    addModifier(params) {
        let name = params.name || null;
        let callie = params.proc || null;
        if (!name || !callie) {
            console.error(`
        BaseAjax::addModifier()
        You should specify both name and callback
      `);
            return this;
        }
        this.modifiers[name] = callie;
        return this;
    }
    /**
     * Adds a new processor
     * @param params Name and a callback for a new processor
     */
    addFieldProcessor(params) {
        let name = params.name;
        let callie = params.proc;
        if (!name || !callie) {
            console.error(`
        BaseModel::addFieldProcessor()
        You should specify both name and callback
      `);
            return this;
        }
        this.processors[name] = callie;
        return this;
    }
    /**
     * Adds new processors
     * @param processors Names and a callbacks for new processors
     */
    addFieldProcessorsBulk(processors) {
        this.processors = Object.assign({}, this.processors, processors);
        return this;
    }
    /**
     * Adds new modifiers
     * @param modifiers Names and a callbacks for new modifiers
     */
    addModifiersBulk(modifiers) {
        this.modifiers = Object.assign({}, this.modifiers, modifiers);
        return this;
    }
    /**
     * Gets a field value from a container
     * @param container_name Container name
     * @param field Field name
     */
    getFieldFromContainer(container_name, field) {
        let container = this.getContainer(container_name);
        let context_group = container ? container.data : null;
        if (!context_group) {
            console.error(`BaseModel::getFieldFromContainer() Container ${container_name} not found`);
        }
        return fromDot(context_group, field);
    }
    /**
     * Generates a method for a query
     * @param params Custom params and Fetch params
     */
    generateQuery(params) {
        let uri = params.uri;
        let method = (params.method || DEFAULTS.QUERY_METHOD).toUpperCase();
        let container_name = params.container || null;
        let container;
        if (container_name) {
            container = this.getContainer(container_name);
        }
        let data = container ? this.getFields(container_name) : (params.data || null);
        let mode = params.mode;
        let headers = params.headers || {};
        let credentials = params.credentials;
        let check = params.check || 'status';
        let is_json = (params.json === true || params.json === false) ? params.json : DEFAULTS.IS_JSON_RESPONSE;
        if (method == 'GET' && data) {
            uri = uri + (!~uri.indexOf('?') ? '?' : '&') + getQueryString(data);
            data = null;
        }
        else if (method != 'GET') {
            data = JSON.stringify(data);
        }
        let result = () => {
            return new Promise((resolve, reject) => {
                let fetch_params = {
                    headers: Object.assign({}, headers),
                    credentials,
                    method,
                    mode,
                    body: data
                };
                let before_fetch_result = {
                    uri,
                    fetch_params
                };
                if (!!(this.beforeFetch && this.beforeFetch.constructor && this.beforeFetch.call && this.beforeFetch.apply)) {
                    before_fetch_result = this.beforeFetch(uri, fetch_params);
                }
                fetch(before_fetch_result.uri, before_fetch_result.fetch_params).then((response) => {
                    if (this.interceptor) {
                        let is_continue = this.interceptor(response);
                        if (!is_continue) {
                            reject();
                        }
                    }
                    if (!response.ok) {
                        reject();
                    }
                    if (is_json) {
                        response.json().then((json) => {
                            resolve(json);
                        }).catch(() => {
                            let err = new Error('Json parse error');
                            err.type = 'json';
                            reject(err);
                        });
                    }
                    else {
                        response.text().then((text) => {
                            resolve(text);
                        }).catch(() => {
                            let err = new Error('Text retrieve error');
                            err.type = 'text';
                            reject(err);
                        });
                    }
                }).catch((error) => {
                    reject(error);
                });
            });
        };
        return result;
    }
    /**
     * Parses an expression
     * Note:  Due to some restrictions
     *        you should only compare
     *        fields with the boolean values
     *        ex.: if(&.someGetter == false)
     * @param expression Conditional expression
     */
    parseCondition(expression) {
        let items = expression.split(' ');
        for (let i in items) {
            let splitted_keys = items[i].split('.');
            if (splitted_keys.length) {
                let model_path = splitted_keys.slice(1, -1).join('.');
                let property_name = splitted_keys.slice(-1).join('');
                // from parent
                if (splitted_keys[0] == '^') {
                    items[i] = fromDot(this.parent, model_path)[property_name];
                }
                // from self class
                if (splitted_keys[0] == '&') {
                    items[i] = fromDot(this, model_path)[property_name];
                }
                // from container
                if (splitted_keys[0] == '@') {
                    let container_name = splitted_keys[0].replace('@', '');
                    items[i] = this.getFieldFromContainer(container_name, model_path)[property_name];
                }
            }
        }
        expression = items.join(' ');
        return Function.apply(null, [].concat('return ' + expression))();
    }
    /**
     * Gets proceeded fields from a container
     * @param container_name Container name
     */
    getFields(container_name) {
        let container = this.getContainer(container_name);
        if (!Object.keys(container.fields).length) {
            console.error(`
        BaseModel::getFields()
        You have to specify field names
      `);
            return {};
        }
        if (!container.fields) {
            return container.data || {};
        }
        let result = {};
        Object.keys(container.fields)
            .map((el) => {
            let is_required = !~el.indexOf('?');
            let model = container.data;
            let field_name = el.replace(/\?/g, '');
            let property_name = field_name;
            let value = null;
            let external_value = null;
            let is_external = false;
            // has condition:
            let condition = el.match(/if\((.+)\)/i);
            let condition_result = true;
            if (condition && condition.length > 1) {
                condition_result = this.parseCondition(condition[1]);
            }
            // if add this field
            if (condition_result) {
                // is external:
                if (~el.indexOf('.')) {
                    let keys = el.split(' ')[0];
                    let splitted_keys = keys.split('.');
                    property_name = splitted_keys.slice(-1).join('');
                    // now we see - it's an external field
                    if (splitted_keys[0] == '^' || splitted_keys[0] == '&' || splitted_keys[0].indexOf('@') === 0) {
                        is_external = true;
                        let model_path = splitted_keys.slice(1, -1).join('.');
                        // from container
                        if (splitted_keys[0].indexOf('@') === 0) {
                            let tmp_container_name = splitted_keys[0].replace('@', '');
                            model = this.getFieldFromContainer(tmp_container_name, model_path);
                        }
                        else 
                        // from parent
                        if (splitted_keys[0] == '^' && this.parent) {
                            model = fromDot(this.parent, model_path);
                        }
                        else 
                        // from self class
                        if (splitted_keys[0] == '&') {
                            model = fromDot(this, model_path);
                        }
                    }
                    if (!model) {
                        console.error(`BaseModel::getFields() Field ${el} not found`);
                    }
                    external_value = model[property_name];
                    field_name = property_name;
                }
                let el_without_cond = el.replace(/if\((.+)\)/ig, '').trim();
                // is alias:
                if (~el_without_cond.indexOf(' as ')) {
                    let keys = el_without_cond.split(' as ');
                    if (!is_external) {
                        property_name = keys[0];
                    }
                    field_name = keys[1];
                }
                value = is_external ? external_value : model[property_name];
                if (is_required || (!is_required && value)) {
                    let proc_names = this.getProcessor(container.fields[el]);
                    let processors = this.createProcessorCallie(proc_names);
                    result[field_name] = processors ? processors(value) : value;
                }
            }
        });
        return result;
    }
}

var _extends$1 = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

const DADATA_API_URL = 'https://suggestions.dadata.ru/suggestions/api/4_1/rs';

const DADATA_SERVICES = ['fio', 'address', 'party', 'email', 'bank'];

const DADATA_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

const SUGGESTION_METHODS = {
  'fio': 'POST',
  'address': 'POST',
  'party': 'POST',
  'email': 'POST',
  'bank': 'POST'
};

const DADATA_PARTY_STATUSES = ['ACTIVE', 'LIQUIDATING', 'LIQUIDATED'];

const DADATA_PARTY_TYPES = ['LEGAL', 'INDIVIDUAL'];

class DaDataModel extends BaseModel {
  constructor(root, token) {
    super(root);
    this.addHeaders(DADATA_HEADERS);
    this.setToken(token);

    this.describeContainer('query', {
      'query': 'string.strip:300'
    }).describeContainer('base extends query', {
      'count?': 'int'
    })

    // FIO CONTAINER
    .addContainer('fio extends base', {
      'parts?': 'array',
      'gender?': 'string'
    })

    // ADDRESS CONTAINER
    .addContainer('address extends base', {
      'locations?': 'array',
      'locations_boost?': 'array',
      'from_bound?': 'bound',
      'to_bound?': 'bound'
    })

    // PARTY CONTAINER
    .addContainer('party extends base', {
      'status?': 'array.party_status',
      'type?': 'array.party_types',
      'locations?': 'array'
    })

    // EMAIL CONTAINER
    .addContainer('email extends base', {})

    // BANK CONTAINER
    .addContainer('bank extends base', {
      'status?': 'array.party_status',
      'type?': 'array.party_types'
    })

    // FIND ADDRESS BY ID CONTAINER
    .addContainer('find_address extends query', {})

    // FIND PARTY BY ID CONTAINER
    .addContainer('find_party extends query', {
      'type?': 'string.party_types',
      'branch_type?': 'string'
    }).addFieldProcessorsBulk({
      bound: val => val && val.value ? val : null,
      party_status: val => DADATA_PARTY_STATUSES.includes(val) ? val : null,
      party_types: val => DADATA_PARTY_TYPES.includes(val) ? val : null
    }).addModifiersBulk({
      strip: (value, param = 0) => {
        return { value: value.substr(0, param) };
      },
      allow: (value, params) => {
        return { break: !!~params.indexOf(value) };
      },
      default: (value, param) => {
        return { value: value || param };
      }
    });
  }

  get headers() {
    return this._headers || {};
  }

  set headers(value) {
    this._headers = value || {};
  }

  beforeFetch(uri, fetch_params) {
    fetch_params.headers = _extends$1({}, fetch_params.headers, this.headers);
    return { uri, fetch_params };
  }

  addHeaders(headers = {}) {
    this._headers = _extends$1({}, this._headers, headers);
  }

  setToken(token) {
    this.token = token;
    this.addHeaders({
      'Authorization': `Token ${token}`
    });
  }

  // QUERY METHODS
  suggest(type, options) {
    if (!this.getContainer(type)) {
      return new Promise((resolve, reject) => {
        reject({
          error: `Suggestion type "${type}" not found`
        });
      });
    }

    this.containers[type].data = _extends$1({}, options);
    return this.generateQuery({
      uri: `${DADATA_API_URL}/suggest/${type}`,
      method: SUGGESTION_METHODS[type],
      container: type
    })();
  }

  detectAddressByIP(ip) {
    return this.generateQuery({
      uri: `${DADATA_API_URL}/detectAddressByIp`,
      method: 'GET',
      data: { ip }
    })();
  }

  findById(type, options) {
    if (!this.getContainer(`find_${type}`)) {
      return new Promise((resolve, reject) => {
        reject({
          error: `Find by id type "${type}" not found`
        });
      });
    }

    this.containers[`find_${type}`].data = _extends$1({}, options);
    return this.generateQuery({
      uri: `${DADATA_API_URL}/findById/${type}`,
      method: 'POST',
      container: `find_${type}`
    })();
  }

  checkStatus(service = '') {
    if (service && !DADATA_SERVICES.includes(service)) {
      return new Promise((resolve, reject) => {
        reject({
          error: `Service "${service}" not found`
        });
      });
    }

    return this.generateQuery({
      uri: `${DADATA_API_URL}/status/${service}`,
      method: 'GET'
    })();
  }
}

var _extends$2 = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

class DaData {
  constructor(API_KEY) {
    this.model = new DaDataModel(this, API_KEY);
    this.token = API_KEY;
    this._suggestions = [];
  }

  get suggestions() {
    return this._suggestions;
  }

  async suggest(type, query /* , count, options */) {
    try {
      var count = arguments[2] || null;
      var options = arguments[3] || {};
      var result = await this.model.suggest(type, _extends$2({ query, count }, options));

      if (!!result.suggestions) {
        this._suggestions = [...result.suggestions];
        return this.suggestions;
      } else {
        throw new Error('Result is empty');
      }
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  clearCache() {
    const temp = [...this._suggestions];
    this._suggestions.splice(0);
    return temp;
  }

  detectAddressByIP() {
    return this.model.detectAddressByIP(arguments[0] || null);
  }
}

export default DaData;
