'use strict';

const BaseMapper = require('./base'),
    EventEmitter = require('events'),
    _ = require('underscore');

const connections = {};

module.exports = class extends BaseMapper {
    constructor(knexConfig) {
        super();

        this.config = knexConfig;
        this.knex = this.connection;
        this.schemaBuilder = this.knex.schema;
        this.emitter = new EventEmitter;

        this.tableChecked = new Promise(resolve => {
            app.serverSide(() => {
                this.checkTable().then(resolve)
            });
            app.clientSide(resolve)
        })
    }

    get connection() {
        return connections[this.configToString(this.config)] ||
            (connections[this.configToString(this.config)] = require('knex')(this.config))
    }

    configToString(config) {
        return _.pairs(config).reduce((str, pair) => {
            if(_.isObject(pair[1])) {
                return str + pair[0] + this.configToString(pair[1])
            } else {
                return str + pair[0] + pair[1]
            }
        }, '')
    }

    beforeQuery(query) {
        return Promise.resolve()
    }

    afterQuery(result) {
        return Promise.resolve(result)
    }

    get queryBuilder() {
        return new QueryBuilder(this.knex, this)
    }

    checkTable() {
        return this.schemaBuilder.hasTable(this.tableName).then(exists => {
            if(!exists) {
                return this.schemaBuilder.createTableIfNotExists(this.tableName, t => {
                    this.beforeCreateTable(t);
                    this.addColumns(t)
                }).then(() => {
                    this.emit('table created')
                })
            }
        })
    }

    beforeCreateTable(table) {
    }

    addColumns(table) {
    }

    on() {
        return this.emitter.on.apply(this.emitter, arguments)
    }

    once() {
        return this.emitter.once.apply(this.emitter, arguments)
    }

    emit() {
        return this.emitter.emit.apply(this.emitter, arguments)
    }

    get tableName() {
        throw new Error('mapper should specify table name')
    }

    find() {
        return this.queryBuilder.select().dataParser(this.parseAsCollection.bind(this))
    }

    findOne() {
        return this.queryBuilder.select().dataParser(this.parseAsModel.bind(this))
    }

    fromQueryObject(queryObject) {
        return this.queryBuilder.fromQueryObject(queryObject)
    }

    insert(data) {
        return this.queryBuilder.insert(data, this.PK)
            .then(data => data[0])
    }

    update(data) {
        return this.queryBuilder.update(data, this.PK).where({id: data.id})
            .then(data => data[0] || data)
    }
};

class QueryBuilder {
    constructor(knex, mapper) {
        this.knex = knex;
        this.queryBuilder = knex(mapper.tableName);
        this.mapper = mapper
    }

    parser(data) {
        return data
    }

    dataParser(parser) {
        this.parser = parser;
        return this
    }

    select() {
        this.queryBuilder.select.apply(this.queryBuilder, arguments);
        return this
    }

    as() {
        this.queryBuilder.as.apply(this.queryBuilder, arguments);
        return this
    }

    column() {
        this.queryBuilder.column.apply(this.queryBuilder, arguments);
        return this
    }

    from() {
        this.queryBuilder.from.apply(this.queryBuilder, arguments);
        return this
    }

    withSchema() {
        this.queryBuilder.withSchema.apply(this.queryBuilder, arguments);
        return this
    }

    where() {
        this.queryBuilder.where.apply(this.queryBuilder, arguments);
        return this
    }

    andWhere() {
        this.queryBuilder.andWhere.apply(this.queryBuilder, arguments);
        return this
    }

    orWhere() {
        this.queryBuilder.orWhere.apply(this.queryBuilder, arguments);
        return this
    }

    whereNot() {
        this.queryBuilder.whereNot.apply(this.queryBuilder, arguments);
        return this
    }

    whereIn() {
        this.queryBuilder.whereIn.apply(this.queryBuilder, arguments);
        return this
    }

    whereNotIn() {
        this.queryBuilder.whereNotIn.apply(this.queryBuilder, arguments);
        return this
    }

    whereNull() {
        this.queryBuilder.whereNull.apply(this.queryBuilder, arguments);
        return this
    }

    whereNotNull() {
        this.queryBuilder.whereNotNull.apply(this.queryBuilder, arguments);
        return this
    }

    whereExists() {
        this.queryBuilder.whereExists.apply(this.queryBuilder, arguments);
        return this
    }

    whereNotExists() {
        this.queryBuilder.whereNotExists.apply(this.queryBuilder, arguments);
        return this
    }

    whereBetween() {
        this.queryBuilder.whereBetween.apply(this.queryBuilder, arguments);
        return this
    }

    whereNotBetween() {
        this.queryBuilder.whereNotBetween.apply(this.queryBuilder, arguments);
        return this
    }

    whereRaw() {
        this.queryBuilder.whereRaw.apply(this.queryBuilder, arguments);
        return this
    }

    innerJoin() {
        this.queryBuilder.innerJoin.apply(this.queryBuilder, arguments);
        return this
    }

    leftJoin() {
        this.queryBuilder.leftJoin.apply(this.queryBuilder, arguments);
        return this
    }

    leftOuterJoin() {
        this.queryBuilder.leftOuterJoin.apply(this.queryBuilder, arguments);
        return this
    }

    rightJoin() {
        this.queryBuilder.rightJoin.apply(this.queryBuilder, arguments);
        return this
    }

    rightOuterJoin() {
        this.queryBuilder.rightOuterJoin.apply(this.queryBuilder, arguments);
        return this
    }

    outerJoin() {
        this.queryBuilder.outerJoin.apply(this.queryBuilder, arguments);
        return this
    }

    fullOuterJoin() {
        this.queryBuilder.fullOuterJoin.apply(this.queryBuilder, arguments);
        return this
    }

    crossJoin() {
        this.queryBuilder.crossJoin.apply(this.queryBuilder, arguments);
        return this
    }

    joinRaw() {
        this.queryBuilder.joinRaw.apply(this.queryBuilder, arguments);
        return this
    }

    distinct() {
        this.queryBuilder.distinct.apply(this.queryBuilder, arguments);
        return this
    }

    groupBy() {
        this.queryBuilder.groupBy.apply(this.queryBuilder, arguments);
        return this
    }

    groupByRaw() {
        this.queryBuilder.groupByRaw.apply(this.queryBuilder, arguments);
        return this
    }

    orderBy() {
        this.queryBuilder.orderBy.apply(this.queryBuilder, arguments);
        return this
    }

    orderByRaw() {
        this.queryBuilder.orderByRaw.apply(this.queryBuilder, arguments);
        return this
    }

    having() {
        this.queryBuilder.having.apply(this.queryBuilder, arguments);
        return this
    }

    offset() {
        this.queryBuilder.offset.apply(this.queryBuilder, arguments);
        return this
    }

    limit() {
        this.queryBuilder.limit.apply(this.queryBuilder, arguments);
        return this
    }

    union() {
        this.queryBuilder.union.apply(this.queryBuilder, arguments);
        return this
    }

    unionAll() {
        this.queryBuilder.unionAll.apply(this.queryBuilder, arguments);
        return this
    }

    insert() {
        this.queryBuilder.insert.apply(this.queryBuilder, arguments);
        return this
    }

    returning() {
        this.queryBuilder.returning.apply(this.queryBuilder, arguments);
        return this
    }

    update() {
        this.queryBuilder.update.apply(this.queryBuilder, arguments);
        return this
    }

    del() {
        this.queryBuilder.del.apply(this.queryBuilder, arguments);
        return this
    }

    transaction() {
        this.queryBuilder.transaction.apply(this.queryBuilder, arguments);
        return this
    }

    transacting() {
        this.queryBuilder.transacting.apply(this.queryBuilder, arguments);
        return this
    }

    forUpdate() {
        this.queryBuilder.forUpdate.apply(this.queryBuilder, arguments);
        return this
    }

    forShare() {
        this.queryBuilder.forShare.apply(this.queryBuilder, arguments);
        return this
    }

    count() {
        this.queryBuilder.count.apply(this.queryBuilder, arguments);
        return this
    }

    min() {
        this.queryBuilder.min.apply(this.queryBuilder, arguments);
        return this
    }

    max() {
        this.queryBuilder.max.apply(this.queryBuilder, arguments);
        return this
    }

    sum() {
        this.queryBuilder.sum.apply(this.queryBuilder, arguments);
        return this
    }

    increment() {
        this.queryBuilder.increment.apply(this.queryBuilder, arguments);
        return this
    }

    decrement() {
        this.queryBuilder.decrement.apply(this.queryBuilder, arguments);
        return this
    }

    truncate() {
        this.queryBuilder.truncate.apply(this.queryBuilder, arguments);
        return this
    }

    pluck() {
        this.queryBuilder.pluck.apply(this.queryBuilder, arguments);
        return this
    }

    first() {
        this.queryBuilder.first.apply(this.queryBuilder, arguments);
        return this
    }

    clone() {
        this.queryBuilder.clone.apply(this.queryBuilder, arguments);
        return this
    }

    modify() {
        this.queryBuilder.modify.apply(this.queryBuilder, arguments);
        return this
    }

    columnInfo() {
        this.queryBuilder.columnInfo.apply(this.queryBuilder, arguments);
        return this
    }

    debug() {
        this.queryBuilder.debug.apply(this.queryBuilder, arguments);
        return this
    }

    connection() {
        this.queryBuilder.connection.apply(this.queryBuilder, arguments);
        return this
    }

    options() {
        this.queryBuilder.options.apply(this.queryBuilder, arguments);
        return this
    }

    then(callback) {
        const cacheEngine = this.mapper.cacheEngine;
        const isSelectQuery = this.toString().includes('select ');
        let hasCache = false;
        return this.mapper.tableChecked.then(() => {
            return this.mapper.beforeQuery(this)
        }).then(() => {
            if(cacheEngine) {
                if(isSelectQuery) {
                    const key = this.toString();
                    return cacheEngine.get(key).then(cache => {
                        if(cache) {
                            hasCache = true;
                            return this.parser(cache)
                        }
                    })
                } else {
                    (this.mapper.clearCache || _.noop)()
                }
            }
        }).then(cache => {
            if(cache) {
                return cache
            }
            return new Promise((resolve, reject) => {
                app.serverSide(() => {
                    this.serverQuery(resolve)
                });

                app.clientSide(() => {
                    this.clientQuery(resolve, reject)
                })
            })
        }).then(data => {
            if(cacheEngine && isSelectQuery) {
                const key = this.toString();
                if(!hasCache && data) {
                    cacheEngine.set(key, data)
                }
            }
            return this.mapper.afterQuery(data)
        }).then(data => {
            return callback(data)
        })
    }

    serverQuery(done) {
        this.queryBuilder.then(data => {
            done(this.parser(data))
        })
    }

    clientQuery(done, reject) {
        const socketConnection = app.get('socketConnection'),
            options = {
                mapper: this.mapper.fileName,
                queryObject: this.toQueryObject()
            };
        socketConnection.emit('query', options, (err, data) => {
            if(err) {
                reject(err)
            } else {
                done(this.parser(data))
            }
        })
    }

    toQueryObject() {
        let obj = {};
        Object.keys(this.queryBuilder).filter(key => key[0] == '_')
            .forEach(key => obj[key] = this.queryBuilder[key]);
        obj = this.stringifyFunc(obj);
        return obj
    }

    traverse(obj, process) {
        return _.mapObject(obj, (value, key, obj) => {
            if(typeof value == 'object' && value != obj) {
                const res = this.traverse(value, process);
                if(value instanceof Array) {
                    return _.values(res)
                }
                return res
            }
            return process(value)
        })
    }

    stringifyFunc(obj) {
        return this.traverse(obj, value => {
            if(_.isFunction(value)) {
                return value.toString()
            } else {
                return value
            }
        })
    }

    parseFunc(obj) {
        return this.traverse(obj, value => {
            if(typeof value == 'string' && value.includes('function')) {
                return new Function(value.replace(/\n/g, ' ').match(/{(.*)}/)[1])
            } else {
                return value
            }
        })
    }

    toString() {
        return this.queryBuilder.toString()
    }

    boolify(obj) {
        return this.traverse(obj, value => {
            if(value === 'false') {
                return false
            } else if(value === 'true') {
                return true
            } else {
                return value
            }
        })
    }

    fromQueryObject(queryObject) {
        queryObject = this.parseFunc(queryObject);
        queryObject = this.boolify(queryObject);
        Object.assign(this.queryBuilder, queryObject);
        const queryStr = this.queryBuilder.toString();
        if(this.validateQuery(queryStr)) {
            return this.queryBuilder.then(data => {
                //console.log(1, data);
                return data
            })
        } else {
            throw new Error('invalid query')
        }
    }

    validateQuery(queryStr) {
        if(this.mapper.validateQuery) {
            return this.mapper.validateQuery(queryStr)
        } else {
            return !/\bjoin\b|\bunion\b|\binsert\b|\bupdate\b|\bdelete\b/gi.test(queryStr)
                && new RegExp(`from\\s+\\S*${this.mapper.tableName}\\S*`).test(queryStr)
        }
    }
}