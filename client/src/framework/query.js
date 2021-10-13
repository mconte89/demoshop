"use strict"

import _ from "underscore"
import {Observable} from "../aj/events"
import {isMatched, optional, stringPower, updatedList} from "../utils/lang"

export const LIKE = "like"
export const GT = "gt"
export const NE = "ne"
export const GTE = "gte"
export const LT = "lt"
export const LTE = "lte"
export const EQ = "eq"
export const IN = "in"
export const NIN = "nin"
export const ID = "id"
export const OR = "or"
export const AND = "and"
export const RANGE = "range"
export const EXACT = "exact"


const DEFAULT_ROWS_PER_PAGE = 50
const DEFAULT_PAGE = 1

export class Query extends Observable {
    constructor(init) {
        super()

        this.page = DEFAULT_PAGE
        this.rowsPerPage = DEFAULT_ROWS_PER_PAGE
        this.sorts = []
        this.filters = []
        this.keyword = null

        this.invokationEnabled = true

        _.assign(this, init)
    }

    live() {
        this.invokationEnabled = true
    }

    hideFilter(property) {
        updatedList(this.filters,  s => s.property === property, s => s.hide = true)
    }

    die() {
        this.invokationEnabled = false
    }

    filter(type, property, value, label = null) {
        if ((value === null || value === undefined) && _.any(this.filters, f => f.property === property)) {
            this.unfilter(property)
            return this
        }

        let current = _.find(this.filters, s => s.property == property)
        if (current) {
            current.value = value
            current.type = type
            current.label = label
        } else {
            this.filters.push({property, type, value, label})
        }

        this.invokeChange()

        return this
    }

    unfilter(property) {
        this.filters = _.filter(this.filters, f => f.property != property)

        this.invokeChange()
        return this
    }

    like(prop, value) {
        this.filter(LIKE, prop, value)
        return this
    }

    gt(prop, value) {
        this.filter(GT, prop, value)
        return this
    }

    ne(prop, value) {
        this.filter(NE, prop, value)
        return this
    }

    gte(prop, value) {
        this.filter(GTE, prop, value)
        return this
    }

    lt(prop, value) {
        this.filter(LT, prop, value)
        return this
    }

    lte(prop, value) {
        this.filter(LTE, prop, value)
        return this
    }

    eq(prop, value) {
        this.filter(EQ, prop, value)
        return this
    }

    in(prop, value) {
        this.filter(IN, prop, value)
        return this
    }

    nin(prop, value) {
        this.filter(NE, prop, value)
        return this
    }

    id(prop, value) {
        this.filter(ID, prop, value)
        return this
    }

    or(prop, value) {
        this.filter(OR, prop, value)
        return this
    }

    and(prop, value) {
        this.filter(AND, prop, value)
        return this
    }

    range(prop, value) {
        this.filter(RANGE, prop, value)
        return this
    }

    sort(prop, descending) {
        let current = _.find(this.sorts, s => s.property == prop)
        if (current) {
            current.descending = descending
        } else {
            this.sorts.push({property: prop, descending})
        }

        this.invokeChange()
        return this
    }

    unsort(prop) {
        this.sorts = _.filter(this.sorts, s => s.property != prop)

        this.invokeChange()
        return this
    }

    clearFilters() {
        //preservo solo gli eventuali filtri nascosti
        this.filters = _.filter(this.filters, f => f.hide)
        this.invokeChange()
        return this
    }

    setPage(page) {
        this.page = page
        this.invokeChange()
        return this
    }

    setRowsPerPage(rowsPerPage) {
        this.rowsPerPage = rowsPerPage
        this.invokeChange()
        return this
    }

    setKeyword(newValue) {
        this.keyword = newValue
        this.invokeChange()
        return this
    }

    invokeChange() {
        if (this.invokationEnabled) {
            this.invoke("change")
        }
    }

    cleaned() {
        return {
            page: this.page,
            rowsPerPage: this.rowsPerPage,
            sorts: this.sorts,
            filters: _.map(this.filters, f => cleanFilter(f)),
            keyword: this.keyword,
            projections: this.projections
        }
    }
}

function cleanFilter(filter) {
    if (filter.type === OR || filter.type === AND) {
        if (!_.isArray(filter.value)) {
            filter.children = []
        } else {
            filter.children = _.map(filter.value, f => cleanFilter(f));
            filter.value = filter.children;
        }
    }

    return filter;
}

export function create(init) {
    let query = new Query(init)
    return query
}

function bothAreNothing(value, other) {
    if (value === undefined && other === undefined) {
        return true
    }

    if (value === null && other === null) {
        return true;
    }

    return false;
}

const FILTERS = {

    eq: (value, other) => {
        if (bothAreNothing(value, other)) {
            return true;
        }

        if (typeof(value) === "string") {
            //case insensitive
            const v1 = `${value}`.toLowerCase()
            const v2 = `${other}`.toLowerCase()

            return v1 === v2
        }

        return value == other
    },

    like: (value, other) => {
        if (bothAreNothing(value, other)) {
            return true
        }

        const v1 = `${value}`.toLowerCase()
        const v2 = `${other}`.toLowerCase()

        return isMatched(v2, v1)
    },

    gt: (value, other) => {
        if (bothAreNothing(value, other)) {
            return false
        }

        return value > other
    },

    ne: (value, other) => {
        return !FILTERS.eq(value, other)
    },

    gte: (value, other) => {
        if (bothAreNothing(value, other)) {
            return false
        }

        return value >= other
    },

    lt: (value, other) => {
        if (bothAreNothing(value, other)) {
            return false
        }

        return value < other
    },

    lte: (value, other) => {
        if (bothAreNothing(value, other)) {
            return false
        }

        return value < other
    },

    in: (value, other) => {
        if (!_.isArray(other)) {
            return false
        }

        for (let element of other) {
            if (FILTERS.eq(element, other)) {
                return true
            }
        }

        return false
    },

    nin: (value, other) => {
        if (!_.isArray(other)) {
            return true
        }

        for (let element of other) {
            if (FILTERS.eq(element, other)) {
                return false
            }
        }

        return true
    },

    id: (value, other) => {
        return FILTERS.eq(value, other)
    },

    or: (value, other) => {
        console.warn("filterFn not implemented")
        return false
    },

    and: (value, other) => {
        console.warn("filterFn not implemented")
        return false
    },

    range: (value, other) => {
        console.warn("filterFn not implemented")
        return false
    }
}

function paginate(rows, query) {
    if (!query.page || !query.rowsPerPage) {
        return rows
    }

    const start = (query.page - 1) * query.rowsPerPage
    const end = start + query.rowsPerPage

    return rows.slice(start, end)
}

export function apply(query, result) {
    if (!result.originalRows) {
        result.originalRows = result.rows
    }

    if (!result.originalTotalRows) {
        result.originalTotalRows = result.totalRows
    }

    const originalTotalRows = result.originalTotalRows
    const originalRows = result.originalRows
    let rows = _.union([], originalRows)

    for (let filter of query.filters) {
        const filterFn = FILTERS[filter.type] || FILTERS.eq

        rows = _.filter(rows, r => filterFn(r.data[filter.property], filter.value))
    }

    for (let sort of query.sorts) {
        rows = _.sortBy(rows, r => {
            const value = r.data[sort.property];
            if (typeof(value) === "string") {
                return stringPower(value) * (sort.descending ? -1 : 1)
            }

            return value * (sort.descending ? -1 : 1)
        });
    }

    const paginatedRows = paginate(rows, query)

    return {totalRows: paginatedRows.length, rows: paginatedRows, originalRows, originalTotalRows}
}


export function merge(first, second) {

    const filters = [];

    if (_.isArray(first.filters)) {
        _.each(first.filters, f => {
            if (!_.any(second.filters, f2 => f2.property === f.property)) {
                filters.push({ property: f.property, type: f.type, value: f.value });
            }
        });
    }

    if (_.isArray(second.filters)) {
        _.each(second.filters, f => {
            if (f.value) {
                filters.push({ property: f.property, type: f.type, value: f.value });
            }
        });
    }

    const sorts = [];

    if (_.isArray(first.sorts)) {
        _.each(first.sorts, f => {
            if (!_.any(second.sorts, f2 => f2.property === f.property)) {
                sorts.push({ property: f.property, descending: f.descending });
            }
        });
    }

    if (_.isArray(second.sorts)) {
        _.each(second.sorts, f => {
            sorts.push({ property: f.property, descending: f.descending });
        });
    }

    const projections = []

    if (_.isArray(first.projections)) {
        _.each(first.projections, f => {
            if (!_.any(second.projections, f2 => f2.property === f.property)) {
                projections.push({ property: f.property, visible: f.visible });
            }
        });
    }

    if (_.isArray(second.projections)) {
        _.each(second.projections, f => {
            projections.push({ property: f.property, visible: f.visible });
        });
    }

    const nq = create()
    nq.filters = filters;
    nq.sorts = sorts;
    nq.keyword = _.isEmpty(second.keyword) ? first.keyword : second.keyword
    nq.page = first.page
    nq.rowsPerPage = first.rowsPerPage
    nq.projections = projections

    return nq;
}

export function getVisibleFilters(query) {
    if (!query)
        query = create();
    return _.filter(optional(query.filters, []), s =>{
        return s.hide !== true
    })

}

