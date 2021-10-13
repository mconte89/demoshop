import _ from "underscore";
import React from "react";
import ReactDOM from "react-dom";
import M, {hasLabel} from "../../strings";
import {Actions, Card, ComponentWithTooltips} from "./common";
import {diff, forceBoolean, format, optional, parseBoolean, safeGet, uuid} from "../../utils/lang";
import {Observable} from "../../aj/events";
import {isControl, isControlPressed, isDown, isEnter, isEsc, isShift, isShiftPressed, isUp} from "../utils/keyboard";
import * as mobile from "../utils/mobile";
import * as datasource from "../../utils/datasource";
import {SearchStore} from "../../stores/entities";
import {discriminated} from "../../utils/ajex";
import {Dialog, DIALOG_RESULT_CANCEL, DIALOG_RESULT_OK} from "./dialogs";
import traverse from "../../utils/traverse";
import {FilterTypeMap} from "../../model/enums";
import {formatDate} from "../../utils/date";
import {scrollOnTop} from "../../utils/customUtils";
import * as query from "../../framework/query";
import {getVisibleFilters} from "../../framework/query";

const EXPAND_ANIMATION_TIME = 250
const CELL_PADDING_TOP = 15
const CELL_PADDING_BOTTOM = 15

/*
 * hack to load forms when is useful but prevent circular references of modules. forms.jsx uses grids.jsx
 */

let _forms = null

function forms() {
    if (_forms == null) {
        //from this, the url is not absolute
        _forms = require("./forms")
    }

    return _forms
}


function eachChildren(root, action) {
    if (_.isArray(root)) {
        root.forEach(c => {
            action(c)

            eachChildren(c.children, action)
        })
    }
}


function clearSelection() {
    if (document.selection && document.selection.empty) {
        document.selection.empty();
    } else if (window.getSelection) {
        var sel = window.getSelection();
        sel.removeAllRanges();
    }
}

function childrenData(children, index, childrenProp) {
    if (_.isArray(children)) {
        return children.map(r => {
            return {
                data: r,
                index: index.value++,
                children: childrenData(r[childrenProp], index, childrenProp),
                selected: false
            }
        })
    }

    return null
}

export function arrayResult(arr) {
    let narr = optional(arr, [])
    return {
        rows: narr,
        totalRows: narr.length
    }
}

export function resultToGridData(result, childrenProp = "children") {
    if (!result || !result.rows) {
        return {rows: [], totalRows: 0}
    }

    let index = {value: 0}
    return {
        totalRows: result.totalRows,
        rows: result.rows.map(r => {
            return {
                data: r,
                index: index.value++,
                children: childrenData(r[childrenProp], index, childrenProp),
                selected: false
            }
        })
    }
}

class Selection extends Observable {
    constructor(rows) {
        super()

        this.selectedRows = []
        this.rows = rows || []
        this.shiftPressed = false
        this.controlPressed = false
        this.lastSelected = null
        this.rangeStartRow = null
        this.allSelected = false
        this.single = false
    }

    init(rows) {
        this.rows = rows;
        this.selectedRows = [];
    }

    flatRows() {
        let flatRows = []

        let addRows = (children) => {
            if (!children) {
                return
            }
            children.forEach(c => {
                flatRows.push(c)

                if (c.expanded) {
                    addRows(c.children)
                }
            })
        }

        addRows(this.rows)

        return flatRows
    }

    isSameRow(r1, r2) {
        return r1.data.id ? (r1.data.id == r2.data.id) : (r1 == r2)
    }

    isRowSelected(row) {
        return this.selectedRows.some(r => this.isSameRow(r, row));
    }

    selectRow(row) {
        if (!this.isRowSelected(row)) {
            this.selectedRows.push(row);
        }
    }

    unselectRow(row) {
        this.selectedRows = this.selectedRows.filter(r => !this.isSameRow(r, row));
    }

    setRowSelected(row, selected) {
        if (selected) {
            this.selectRow(row)
        } else {
            this.unselectRow(row);
        }
    }

    handle(row, selectWithCheck) {
        let flatRows = this.flatRows()

        if (isShiftPressed() && !this.single) {
            flatRows.forEach(r => this.unselectRow(r))
            if (this.rangeStartRow == null) {
                this.rangeStartRow = this.lastSelected
                if (this.rangeStartRow == null) {
                    this.rangeStartRow = row
                }
                this.lastSelected = row
                this.selectRow(row)
            } else {
                let startIndex = Math.min(this.rangeStartRow.index, row.index)
                let endIndex = Math.max(this.rangeStartRow.index, row.index)
                flatRows.forEach(r => {
                    if (r.index >= startIndex && r.index <= endIndex) {
                        this.selectRow(r)
                    }
                })
                this.lastSelected = row
            }
        } else if ((isControlPressed() || selectWithCheck) && !this.single) {
            this.setRowSelected(row, !this.isRowSelected(row))
            this.rangeStartRow = row
            this.lastSelected = row
        } else {
            this.selectedRows = []
            this.selectRow(row)
            this.rangeStartRow = row
            this.lastSelected = row
        }

        this.invoke("change")
    }

    getSelectedData() {
        return _.map(_.filter(this.flatRows(), r => this.isRowSelected(r)), r => r.data)
    }

    getSelected() {
        return _.filter(this.flatRows(), r => this.isRowSelected(r))
    }

    isAllSelected() {
        return this.flatRows().length > 0 && _.every(this.flatRows(), r => this.isRowSelected(r))
    }

    toggleAll() {
        this.allSelected = this.isAllSelected()
        this.flatRows().forEach(r => this.setRowSelected(r, !this.allSelected))
        this.allSelected = !this.allSelected
        this.lastSelected = null
        this.rangeStartRow = null

        this.invoke("change")
    }

    clear() {
        this.selectedRows = [];
        this.allSelected = false
        this.lastSelected = null
        this.rangeStartRow = null

        this.invoke("change")
    }

    down() {
        let flatRows = this.flatRows()

        if (!flatRows || flatRows.length == 0) {
            return
        }

        if (!this.lastSelected) {
            this.lastSelected = _.find(flatRows, r => this.isRowSelected(r));
        }

        let index = -1
        if (this.lastSelected) {
            index = flatRows.indexOf(this.lastSelected)
        }

        index++
        if (index >= flatRows.length) {
            index = 0
        }
        let newRow = flatRows[index]
        this.handle(newRow)

        this.invoke("onRowDown", newRow.data)
    }

    up() {
        let flatRows = this.flatRows()

        if (!flatRows || flatRows.length == 0) {
            return
        }

        let index = -1
        if (!this.lastSelected) {
            this.lastSelected = _.find(flatRows, r => this.isRowSelected(r));
        }

        if (this.lastSelected) {
            index = flatRows.indexOf(this.lastSelected)
        }

        index--
        if (index < 0) {
            index = flatRows.length - 1
        }
        let newRow = flatRows[index]
        this.handle(newRow)

        this.invoke("onRowUp", newRow.data)
    }
}

export const HIDDEN_FILTER_LABEL = "__label"

export class SearchDialog extends React.Component {
    constructor(props) {
        super(props)

        this.model = new (forms().Model)()
        //aggancio le gridProps alle regole di visiblity
        this.model.data.initialProps =  this.props.gridProps


        if (this.props.query && this.props.query.filters) {
            _.each(this.props.query.filters, f => {
                this.model.data[f.property] = f.value
            })
        }
    }

    componentDidMount() {
        let me = ReactDOM.findDOMNode(this)
        $(me).on('shown.bs.modal', function () {
            $(me).find(".modal-body").find("input").first().focus()
        });
    }

    onChangeValue(e) {
        let value = e.target.value
        this.setState(_.assign(this.state, {value}))
    }

    onTypeChange(e) {
        let type = e.target.value
        this.setState(_.assign(this.state, {type}))
    }

    close() {
        this.onClose(DIALOG_RESULT_OK)
    }

    getFieldFilterType(property) {
        let filterType = this.props.column.filterType;
        if (!filterType) {
            const field = this.model.findField(property)
            if (field) {
                return field.filterType
            }
        } else
            return filterType
    }

    getFilterLabel(property) {

        const propName = property + HIDDEN_FILTER_LABEL
        return this.model.get(propName)
    }

    filter() {
        if (this.props.query && this.props.column && this.props.column.property) {
            const manualFilterType = optional(this.model.get("_filterType"), "eq")
            const data = this.model.sanitized()
            this.props.query.die();
            _.each(_.keys(data), k => {
                if (k !== "_filterType" && k.indexOf(HIDDEN_FILTER_LABEL) === -1 && data[k] && (!_.isEmpty(data[k] + "")) && k !== "initialProps") {
                    const filterType = optional(this.getFieldFilterType(k), manualFilterType)
                    const label = this.getFilterLabel(k)
                    this.props.query.filter(filterType, k, data[k], label)
                }
            })
            this.props.query.page = 1
            this.props.query.live();
            this.props.query.invokeChange();

            this.close()
        }
    }

    getStandardSearchForm(column) {
        return {
            showInCard: false,
            fields: [
                {
                    property: column.property,
                    label: M("value"),
                    placeholder: M("insertValueAndPressEnter"),
                    control: forms().Text,
                    props: {
                        onKeyDown: (model, e) => {
                            if (isEnter(e.which)) {
                                e.preventDefault()
                                this.filter()
                            }
                        }
                    }
                },
                {
                    property: "_filterType",
                    label: M("filterType"),
                    control: forms().Select,
                    props: {
                        allowNull: false,
                        datasource: datasource.fixed([
                            {label: M("filter_like"), value: query.LIKE},
                            {label: M("filter_eq"), value: query.EQ},
                        ])
                    }
                }
            ]
        }
    }

    onClose(dialogResult) {
        if (_.isFunction(this.props.onClose)) {
            this.props.onClose(dialogResult)
        }
    }

    getButtons() {
        return [
            {
                text: M("search"),
                extraClassName: "ok-button btn-link",
                action: (dialog) => {
                    dialog.hide()
                    this.filter()
                },
                dialogResult: DIALOG_RESULT_OK
            },
            {
                text: M("close"),
                extraClassName: "btn-link",
                action: (dialog) => {
                    dialog.hide()
                },
                dialogResult: DIALOG_RESULT_CANCEL
            }
        ]
    }

    render() {
        let column = this.props.column
        let searchForm = this.getStandardSearchForm(column)
        if (!_.isEmpty(column.searchForm)) {
            searchForm = column.searchForm
        }

        this.model.descriptor = searchForm


        const FormBody = forms().FormBody

        return (
            <Dialog title={this.props.column.header} hidden={this.props.hidden} onClose={this.onClose.bind(this)}
                    buttons={this.getButtons()}>
                <div className="row search-dialog">
                    <FormBody className="col-12" model={this.model} descriptor={searchForm}/>
                </div>
            </Dialog>
        )
    }
}


export class HeaderCell extends React.Component {
    constructor(props) {
        super(props)

        let sort = _.filter(props.query.sorts, s => s.property === this.props.column.property)[0];

        this.state = {
            sorting: sort != null && sort,
            sortDescending: sort? sort.descending: false,
            searchDialogHidden: true,
            row: {
                index: 0,
                data: {},
                selectAll: false
            },
        }

    }

    componentDidMount() {
        let me = $(ReactDOM.findDOMNode(this))
        let button = $(this.refs.search)

        me.mouseenter(() => {
            button
                .css({opacity: 0})
                .show()
                .stop()
                .animate({opacity: 1}, 250)
        }).mouseleave(() => {
            button
                .stop()
                .animate({opacity: 0}, 250)
        })
    }

    changeSort() {
        if (!this.props.column.sortable) {
            return
        }
        this.props.query.sorts = [];


        let newState = null


        if (this.state.sorting == false) {
            newState = {sorting: true, sortDescending: false}
        } else if (this.state.sortDescending == false) {
            newState = {sorting: true, sortDescending: true}
        } else {
            newState = {sorting: false, sortDescending: false}
        }

        if (this.props.query) {
            if (newState.sorting) {
                this.props.query.sort(this.props.column.property, newState.sortDescending)
            } else {
                this.props.query.unsort(this.props.column.property)
            }
        }

        this.setState(newState)
    }

    search() {
        _.assign(this.state, {searchDialogHidden: false})
        this.forceUpdate()
    }

    onSearchDialogClose() {
        _.assign(this.state, {searchDialogHidden: true})
        this.forceUpdate()
    }

    onClickToSelectAll() {
        if (_.isFunction(this.props.onSelectAll)) {
            this.props.onSelectAll()
        }
    }

    generateHeader() {
        if (_.isFunction(this.props.column.getHeader))
            return this.props.column.getHeader(this.props.gridProps)
        return this.props.column.header
    }

    render() {
        let sortClass = ""
        if (this.state.sorting && this.state.sortDescending) {
            sortClass = "sorting_desc"
        } else if (this.state.sorting && !this.state.sortDescending) {
            sortClass = "sorting_asc"
        }

        let searchButtonRight = 10
        if (sortClass != "") {
            searchButtonRight += 25
        }
        let cellStyle = {position: "relative"}

        let cellWidth = optional(safeGet(this.props.column.props, "width", null), "")
        if (!_.isEmpty(cellWidth)) {
            cellStyle = _.assign(cellStyle, {width: cellWidth})
        }

        let cellMaxWidth = optional(safeGet(this.props.column.props, "maxWidth", null), "")
        if (!_.isEmpty(cellMaxWidth)) {
            cellStyle = _.assign(cellStyle, {maxWidth: cellMaxWidth})
        }

        let header = this.generateHeader();

        if (this.props.column.header === "selectAllBtn") {

            const column = {
                property: "selectAll",
                cell: EditCheckCell,
                props: {
                    width: "15px",
                    onValueChange: this.onClickToSelectAll.bind(this),
                    valueSupplier: (data, row) => this.props.allSelected
                }
            }
            return (

                <th className="hover checkbox-container" style={cellStyle}>
                    {createCell(column, this.state.row, true, false, column.props, this.props.gridProps)}
                </th>
            )

        } else {
            return (
                <th className={"hover " + sortClass} style={cellStyle}>
                       <span onClick={this.changeSort.bind(this)}
                             className="pointer-cursor">{header}</span>

                    {this.props.column.searchable &&
                    <a ref="search" className="btn btn-sm btn-light" onClick={this.search.bind(this)}
                       style={{display: "none", marginTop: "-6px", position: "absolute", right: searchButtonRight}}><i
                        className="zmdi zmdi-search"/></a>
                    }

                    {this.props.column.searchable &&
                    <SearchDialog column={this.props.column}
                                  query={this.props.query}
                                  gridProps={this.props.gridProps}
                                  hidden={this.state.searchDialogHidden}
                                  onClose={this.onSearchDialogClose.bind(this)}/>
                    }
                </th>
            )
        }
    }
}

export class GridHeader extends React.Component {
    onSelectAll() {
        if (_.isFunction(this.props.onSelectAll)) {
            this.props.onSelectAll()
        }
    }

    onDeselectAll() {
        if (_.isFunction(this.props.onDeselectAll)) {
            this.props.onDeselectAll()
        }
    }

    render() {
        if (_.isEmpty(this.props.descriptor)) {
            return null
        }

        let headerCells = _.filter(this.props.descriptor.columns, (column => !_.isFunction(column.visibility) || column.visibility(this.props.gridProps))).map((c, i) =>
            <HeaderCell key={i}
                        gridProps={this.props.gridProps}
                        column={c}
                        query={this.props.query}
                        allSelected={this.props.allSelected}
                        onSelectAll={this.onSelectAll.bind(this)}/>)

        return (
            <thead>
            <tr>{headerCells}</tr>
            </thead>
        )
    }
}

export class Row extends React.Component {
    constructor(props) {
        super(props)
    }

    doubleClick(e) {
        if (_.isFunction(this.props.onDoubleClick)) {
            this.props.onDoubleClick(this.props.row)
            e.stopPropagation()
            e.preventDefault()
            clearSelection()
        }
    }

    onMouseDown(e) {
        if (_.isFunction(this.props.onMouseDown)) {
            this.props.onMouseDown(this.props.row)
            e.stopPropagation()
        }
    }

    componentDidMount() {
        let expandedNow = this.props.row.expandedNow || false
        if (expandedNow) {
            let me = ReactDOM.findDOMNode(this)
            this.props.row.expandedNow = undefined
            $(me)
                .find("td")
                .css({paddingTop: 0, paddingBottom: 0})
                .stop()
                .animate({paddingTop: CELL_PADDING_TOP, paddingBottom: CELL_PADDING_BOTTOM}, EXPAND_ANIMATION_TIME)
                .end()
                .find(".grid-cell-container")
                .hide()
                .slideDown(EXPAND_ANIMATION_TIME)

        }
    }

    componentDidUpdate() {
        let collapsedNow = this.props.row.collapsedNow || false
        if (collapsedNow) {
            let me = ReactDOM.findDOMNode(this)
            this.props.row.collapsedNow = undefined
            $(me)
                .find("td")
                .stop()
                .animate({paddingTop: 0, paddingBottom: 0}, EXPAND_ANIMATION_TIME)
                .end()
                .find(".grid-cell-container")
                .slideUp(EXPAND_ANIMATION_TIME)
        }
    }

    render() {
        if (_.isEmpty(this.props.descriptor)) {
            return null
        }

        let onExpand = (row) => {
            if (_.isFunction(this.props.onExpand)) {
                this.props.onExpand(row)
            }
        }

        let firstElement = true
        let key = 1
        let className = `level-${this.props.row.level} ` + (this.props.selected ? "selected" : "")
        let rowClassName = this.props.descriptor.rowClassName
        if (rowClassName) {
            if (_.isFunction(rowClassName)) {
                className += " " + rowClassName(this.props.row.data)
            } else {
                className += " " + rowClassName
            }
        }

        let rowContent = null
        const customRowContent = this.props.descriptor.customRowContent

        if (_.isFunction(customRowContent)) {
            rowContent = customRowContent(this.props.row.data, this.props.row)
        }
        let cellStyle = {}
        if (!rowContent) {
            rowContent = _.filter(this.props.descriptor.columns, (column => !_.isFunction(column.visibility) || column.visibility(this.props.gridProps))).map(c => {
                let cell = createCell(c, this.props.row, firstElement, onExpand, c.props, this.props.gridProps)
                firstElement = false

                let cellWidth = optional(safeGet(c.props, "width", null), "")
                if (!_.isEmpty(cellWidth)) {
                    cellStyle = _.assign(cellStyle, {width: cellWidth})
                }

                let cellMaxWidth = optional(safeGet(c.props, "maxWidth", null), "")
                if (!_.isEmpty(cellMaxWidth)) {
                    cellStyle = _.assign(cellStyle, {maxWidth: cellMaxWidth})
                }

                let className = "grid-cell-container";
                if (c.cell === EditCheckCell)
                    className = className + " checkbox-container"

                return <td key={key++} className={c.tdClassName} style={cellStyle}>
                    <div className={className}>{cell}</div>
                </td>
            })
        }

        return (
            <tr onMouseDown={this.onMouseDown.bind(this)} onDoubleClick={this.doubleClick.bind(this)}
                className={className}>{rowContent}</tr>
        )
    }
}

export class GridBody extends React.Component {
    onRowMouseDown(row) {
        if (_.isFunction(this.props.onRowMouseDown)) {
            this.props.onRowMouseDown(row)
        }
    }

    onRowDoubleClick(row) {
        if (_.isFunction(this.props.onRowDoubleClick)) {
            this.props.onRowDoubleClick(row)
        }
    }

    onRowExpand(row) {
        if (_.isFunction(this.props.onRowExpand)) {
            this.props.onRowExpand(row)
        }
    }

    isRowSelected(row) {
        if (this.props.selection)
            return this.props.selection.isRowSelected(row);
        return false;
    }

    render() {
        if (_.isEmpty(this.props.descriptor)) {
            return null
        }

        let rows = this.props.data.rows || []
        let rowElements = []
        let level = this.props.level || 0
        let index = 0
        let addElements = (children, level, parentKey) => {
            let key = 1
            children.forEach(r => {
                r.index = index++
                r.level = level
                let element = (
                    <Row
                        key={parentKey + "_" + key++}
                        descriptor={this.props.descriptor}
                        row={r}
                        gridProps={this.props.gridProps}
                        query={this.props.query}
                        onMouseDown={this.onRowMouseDown.bind(this)}
                        onDoubleClick={this.onRowDoubleClick.bind(this)}
                        onExpand={this.onRowExpand.bind(this)}
                        selected={this.isRowSelected(r)}/>
                )

                rowElements.push(element)

                if (!_.isEmpty(r.children)) {
                    if (r.expanded) {
                        addElements(r.children, level + 1, parentKey + "_" + key)
                    }
                }
            })
        }

        addElements(rows, level, "root")

        return (
            <tbody>
            {rowElements}
            </tbody>
        )
    }
}

export class FooterCell extends React.Component {
    render() {
        return (
            <th>
                <div className="grid-cell-container">
                    {this.props.column.header != "selectAllBtn" && this.props.column.header}
                </div>

            </th>
        )
    }
}

export class GridFooter extends React.Component {
    render() {
        if (_.isEmpty(this.props.descriptor)) {
            return null
        }

        let id = 1
        let footerCells = _.filter(this.props.descriptor.columns, (column => !_.isFunction(column.visibility) || column.visibility(this.props.gridProps))).map(c =>
            <FooterCell key={id++} column={c} query={this.props.query}/>)

        return (
            <tfoot>
            <tr>{footerCells}</tr>
            </tfoot>
        )
    }
}

export class Cell extends ComponentWithTooltips {
    getValue() {
        let column = this.props.column
        let property = this.props.property
        let row = this.props.row

        return traverse(row.data).get(property);
    }
}

export class EditTextCell extends Cell {

    constructor(props) {
        super(props)

        this.state = {value: ""}
    }

    componentWillUpdate(nextProps, nextState) {
        if (nextProps.value != nextState.value) {
            this.setState({value: nextProps.value})
        }
    }

    componentDidMount() {
        super.componentDidMount()
        this.setState({value: this.props.value})
    }

    onValueChange(e) {
        let newValue = e.target.value
        this.setState({value: newValue})

        if (_.isFunction(this.props.onValueChange)) {
            let column = this.props.column
            let property = this.props.property
            let row = this.props.row
            this.props.onValueChange(column, row.data, newValue)
        }
    }

    render() {
        let column = this.props.column
        let property = this.props.property
        let row = this.props.row

        return (
            <div className="edit-text-cell">
                <input
                    type={optional(this.props.type, "text")}
                    className="form-control input-sm"
                    data-property={property}
                    placeholder={this.props.placeholder}
                    value={optional(this.state.value, "")}
                    onChange={this.onValueChange.bind(this)}/>
            </div>
        )
    }
}

export class TextCell extends Cell {
    toggleExpand(e) {
        if (_.isFunction(this.props.onExpand)) {
            this.props.onExpand(this.props.row)
            e.preventDefault()
            e.stopPropagation()
            e.nativeEvent.stopImmediatePropagation()
        }
    }

    render() {
        let marginLeft = 30 * (this.props.row.level || 0)
        let icon = "zmdi "
        if (!this.props.row.expanded) {
            icon += " zmdi-plus"
        } else {
            icon += " zmdi-minus"
        }

        let formatter = _.isFunction(this.props.formatter) ? this.props.formatter : v => v

        let caret = !_.isEmpty(this.props.row.children) && this.props.firstElement ?
            <a style={{marginLeft: marginLeft, marginRight: 20}} className="expand-button"
               onClick={this.toggleExpand.bind(this)} onMouseDown={(e) => e.stopPropagation()}>
                <i className={"c-black " + icon}/>
            </a> : null

        let style = {}
        if (caret == null && this.props.row.level > 0 && this.props.firstElement) {
            style.marginLeft = marginLeft + 20
        }

        let titleTooltip = optional(this.props.tooltip, false)

        let text = formatter(this.props.value, this.props.row.data);

        let className = "textcell-title " + (_.isFunction(this.props.getExtraClassName) ? this.props.getExtraClassName(this.props.value, this.props.row.data) : "")

        return (
            <div className="textcell-container">{caret}<p data-toggle={titleTooltip? "tooltip" : ""} title={text} className={className} style={style}>{text}</p></div>
        )
    }
}


export class DateCell extends Cell {

    getValue() {
        if (_.isFunction(this.props.formatter))
            this.props.formatter(this.props.value);
        else
            return this.props.value;
    }

    render() {
        let value = this.getValue();

        if (!value)
            return "-";

        let dateFormat = optional(this.props.format, M("dateFormat"));
        let formattedDate = formatDate(value, dateFormat);

        return (
            <div>{formattedDate}</div>
        )
    }

}

export class CheckCell extends Cell {
    render() {
        let checked = this.props.value === true || this.props.value === "true" || parseInt(this.props.value) > 0
        let icon = checked ? "zmdi zmdi-check" : "zmdi zmdi-square-o"

        return (
            <i className={icon}/>
        )
    }
}

export class ActionsCell extends Cell {
    componentDidMount() {
        super.componentDidMount()
        let me = ReactDOM.findDOMNode(this)
        let showAlways = parseBoolean(this.props.showAlways)
        if (!showAlways) {
            $(me).closest("tr")
                .mouseenter(() => {
                    $(me).find(".grid-action").stop().fadeIn(250)
                })
                .mouseleave(() => {
                    $(me).find(".grid-action").stop().fadeOut(250)
                })
                .find(".grid-action").hide()
        }

    }

    render() {
        let actionKey = 1
        let actions = this.props.column.actions.map(a =>
            React.createElement(Actions.getButtonClass(a), {
                key: actionKey++,
                action: a,
                arguments: [this.props.row.data],
                className: "grid-action"
            })
        )

        return (
            <div className="grid-actions-container">
                {actions}
            </div>
        )
    }
}

export class SelectCell extends Cell {

    constructor(props) {
        super(props)

        if (_.isEmpty(props.datasource)) {
            throw new Error("Datasource is null")
        }
    }

    componentDidMount() {
        super.componentDidMount()
        this.onDataSourceChange = this.props.datasource.on("change", () => {
            this.forceUpdate()
        })
    }

    componentWillUnmount() {
        super.componentWillUnmount()
        this.props.datasource.off("change", this.onDataSourceChange);
    }

    onChange(e) {
        const value = e.target.value
        let column = this.props.column
        let row = this.props.row
        if (_.isFunction(this.props.onChange)) {
            this.props.onChange(column, row.data, value)
        }
    }

    render() {
        let datasource = this.props.datasource
        let options = optional(() => datasource.data.rows, []).map(o => <option key={o.value}
                                                                                value={o.value}>{o.label}</option>)
        let allowNull = parseBoolean(this.props.allowNull)

        return (
            <div className="form-group select-cell">
                <div className="fg-line">
                    <div className="select">
                        <select className="form-control" value={optional(this.props.value, "")}
                                onChange={this.onChange.bind(this)}>
                            {allowNull &&
                            <option value=""></option>
                            }
                            {options}

                        </select>
                    </div>
                </div>
            </div>
        )
    }
}

export class KeywordSearch extends React.Component {
    render() {
        return (
            <div className="col-md-offset-8 col-md-4 keyword-search">
                <form action="">
                    <div className="input-group">
                        <span className="input-group-addon"><i className="zmdi zmdi-search"></i></span>
                        <div className="fg-line">
                            <input type="text" className="form-control" placeholder="Search..."/>
                        </div>
                    </div>
                </form>
            </div>
        )
    }
}

export class Filter extends React.Component {
    unfilter() {
        if (!this.props.query) {
            return
        }

        this.props.query.unfilter(this.props.data.property)
    }

    getColumn() {
        return _.find(this.props.descriptor.columns, c => c.property == this.props.data.property)
    }

    isHiddenInFilters() {
        return _.any(this.props.descriptor.hiddenFilters, h => h == this.props.data.property)
    }

    render() {
        const column = this.getColumn()
        //TODO: unificare questo sistema con il getVisibleFilters richiamato dal padre di questo componente (Filters)
        const hiddenInFilters = this.isHiddenInFilters()
        const name = column ? column.header : this.props.data.property
        const value = this.props.data.label ? this.props.data.label : this.props.data.value
        const type = FilterTypeMap.get(this.props.data.type)

        if (hiddenInFilters) {
            return null
        }

        return (
            <button onClick={this.unfilter.bind(this)}
                    className="btn btn-no-shadow btn-primary waves-effect m-r-10">{M(name)} {type} {M(value)} <i
                className="zmdi zmdi-close"></i></button>
        )
    }
}

export class Filters extends React.Component {
    clearFilters() {
        if (!this.props.query) {
            return
        }

        this.props.query.clearFilters()
    }

    render() {
        let filters = []
        if (this.props.query) {
            filters = getVisibleFilters(this.props.query).map(f => <Filter key={f.property + f.type + f.value} data={f}
                                                                           query={this.props.query}
                                                                           descriptor={this.props.descriptor}/>)
        }

        let actions = [
            {icon: "zmdi zmdi-delete", action: this.clearFilters.bind(this)}
        ]

        return (
            <div className="search-filters">
                <button type="button" onClick={this.clearFilters.bind(this)}
                        className="btn btn-no-shadow btn-primary waves-effect m-r-10"><i className="zmdi zmdi-delete"/>
                </button>
                {filters}
            </div>
        )
    }
}


export class Pagination extends React.Component {
    changePage(page) {
        let previousPage = this.props.query.page;
        this.props.query.setPage(page)

        if (page !== previousPage)
            this.scrollTop()
    }

    scrollTop() {
        scrollOnTop()
    }

    getTotalPages() {
        if (!this.props.data || !this.props.data.rows || !this.props.query) {
            return 1
        }

        let totalPages = parseInt(Math.ceil(this.props.data.totalRows / this.props.query.rowsPerPage))
        return totalPages
    }

    nextPage() {
        let totalPages = this.getTotalPages()
        if (this.props.query.page < totalPages) {
            this.props.query.setPage(this.props.query.page + 1)
            this.scrollTop()

        }
    }

    previousPage() {
        if (this.props.query.page > 1) {
            this.props.query.setPage(this.props.query.page - 1)
            this.scrollTop()
        }
    }

    firstPage() {
        this.props.query.setPage(1)
        this.scrollTop()
    }

    lastPage() {
        this.props.query.setPage(this.getTotalPages())
        this.scrollTop()
    }

    render() {
        if (_.isEmpty(this.props.query) || _.isEmpty(this.props.data.rows)) {
            return null
        }

        let totalPages = this.getTotalPages()
        let visible = totalPages > 1
        let page = parseInt(this.props.query.page || 1)
        let pages = []
        let visiblePages = []
        if (totalPages > 10) {
            if (page > 1) {
                visiblePages.push(page - 1)
            }
            visiblePages.push(page)
            if (page < totalPages) {
                visiblePages.push(page + 1)
            }

            let range = 10
            if (totalPages > 100) {
                range = 100
            } else if (totalPages > 1000) {
                range = 1000
            }

            visiblePages = _.sortBy(_.union(visiblePages, _.range(range, totalPages, range)), i => i)
        } else {
            visiblePages = _.range(1, totalPages + 1)
        }
        visiblePages.forEach(i => {
            let active = i === page ? "active" : ""
            pages.push(<li key={i} className={"page-item " + active}><a className="page-link"
                                                                        onClick={this.changePage.bind(this, i)}>{i}</a>
            </li>)
        })

        return (
            <nav>
                <ul className="pagination" hidden={!visible}>
                    <li className="page-item pagination-first">
                        <a onClick={this.firstPage.bind(this)} aria-label="First" className="page-link">
                        </a>
                    </li>
                    <li className="page-item pagination-prev">
                        <a onClick={this.previousPage.bind(this)} aria-label="Previous" className="page-link">
                        </a>
                    </li>
                    {pages}
                    <li className="page-item pagination-next">
                        <a onClick={this.nextPage.bind(this)} aria-label="Next" className="page-link">
                        </a>
                    </li>
                    <li className="page-item pagination-last">
                        <a onClick={this.lastPage.bind(this)} aria-label="First" className="page-link">
                        </a>
                    </li>
                </ul>
            </nav>
        )
    }
}


export class ResultSummary extends React.Component {
    render() {
        let totalRows = 0
        let start = 0
        let stop = 0
        let rowsPerPage = 0
        let page = 0
        if (this.props.query && this.props.data.rows) {
            rowsPerPage = this.props.query.rowsPerPage || 0
            totalRows = this.props.data.totalRows
            page = parseInt(this.props.query.page || 1)
            start = (page - 1) * rowsPerPage + 1
            stop = Math.min(page * rowsPerPage, totalRows)
        }

        return (
            <p className="result-summary">{format(M("pagination"), start, stop, totalRows)}</p>
        )
    }
}

export class NoCard extends React.Component {
    render() {
        return (
            <div>{this.props.children}</div>
        )
    }
}

export class QuickSearch extends React.Component {
    constructor(props) {
        super(props)

        this.state = {value: ""}
        this._onChange = _.debounce((keyword) => {
            if (!_.isEmpty(this.props.query)) {
                this.props.query.setKeyword(keyword)
            }
        }, 500)
        this.initialValue = this.getInitialValue()
    }

    getInitialValue() {
        let state = optional(discriminated(optional(SearchStore.state, {}), this.props.discriminator), {});
        if (state) {
            return safeGet(state.query, "keyword", "");
        }

        return "";
    }

    componentDidMount() {
        this.setState({value: this.initialValue})
        const me = ReactDOM.findDOMNode(this);

        $(me).find("input[type=search]")
            .focus(() => {
                $(me).find(".quick-search").addClass("quick-search__active");
            })
            .blur(() => {
                $(me).find(".quick-search").removeClass("quick-search__active");
            })

    }

    onChange(e) {
        this.setState({value: e.target.value})
        this._onChange(e.target.value)
    }

    onKeyDown(e) {
        if (isEnter(e.which)) {
            e.preventDefault()
        }
    }

    onDelete() {
        this.setState({value: ""})
        this._onChange("")
    }

    render() {
        const placeholder = !_.isEmpty(this.props.placeholder) ? this.props.placeholder : M("search")

        return (
            <div className="quick-search-container">
                <div className="quick-search">
                    <i className="zmdi zmdi-search pull-left"/>
                    <div className="quick-search-input-container">
                        <input type="search" value={this.state.value} onKeyDown={this.onKeyDown.bind(this)}
                               onChange={this.onChange.bind(this)} placeholder={placeholder}/>
                        <div className="form-control__bar"/>
                    </div>
                </div>
            </div>
        )
    }
}

export class Grid extends React.Component {
    constructor(props) {
        super(props)
        this.state = {rows: null, selection: new Selection()}
        this.queryInitialized = false
        this.initSelection()
        this.initQuery(props)
        this.stack = []
    }

    componentDidMount() {
        this.initQuery(this.props)

        if (this.props.query) {
            this.props.query.on("change", () => {
                this.state.selection = null
            })
        }
    }

    componentDidUpdate(prevProps, prevState) {
        let oldRows = prevProps.data && prevProps.data.rows
        let rows = this.props.data && this.props.data.rows

        //se c'è differenza va resettato così da farlo reinizializzare
        if (diff(oldRows, rows).length > 0) {
            this.initSelection()
        }
    }

    componentWillUnmount() {
        if (this.props.query && this.isClientSideQuerying()) {
            this.props.query.off("change", this.onQueryChange)
        }
    }

    isClientSideQuerying() {
        return forceBoolean(this.props.clientSideQuerying)
    }

    getTotalRows() {
        let totalRows = parseInt(this.props.data.totalRows)
        return totalRows
    }

    isAllSelected() {
        return this.state.selection && this.state.selection.isAllSelected()
    }

    onKeyPress(e) {

    }

    onBlur() {
        if (this.state.selection) {
            this.state.selection.shiftPressed = false
            this.state.selection.controlPressed = false
        }
    }

    onKeyDown(e) {
        let me = ReactDOM.findDOMNode(this)
        if (this.state.selection != null) {
            if (isShift(e.which)) {
                me.onselectstart = function () {
                    return false
                }
                this.state.selection.shiftPressed = true
                e.preventDefault()
                return
            } else if (isControl(e.which)) {
                this.state.selection.controlPressed = true
                e.preventDefault()
                return
            } else if (isUp(e.which)) {
                this.state.selection.up()
                e.preventDefault()
                return
            } else if (isDown(e.which)) {
                this.state.selection.down()
                e.preventDefault()
                return
            } else if (isEsc(e.which)) {
                this.state.selection.clear()
                e.preventDefault()
                return
            }
        }

        if (_.isFunction(this.props.onKeyDown)) {
            this.props.onKeyDown(e)
        }
    }

    onKeyUp(e) {
        let me = ReactDOM.findDOMNode(this)
        if (this.state.selection != null) {
            if (isShift(e.which)) {
                me.onselectstart = null
                this.state.selection.shiftPressed = false
                e.preventDefault()
                return
            } else if (isControl(e.which)) {
                this.state.selection.controlPressed = false
                e.preventDefault()
                return
            }
        }

        if (_.isFunction(this.props.onKeyUp)) {
            this.props.onKeyUp(e)
        }

    }

    onRowMouseDown(row) {
        let selectionEnabled = optional(parseBoolean(this.props.selectionEnabled), true)
        if (!selectionEnabled) {
            return
        }

        if (this.state.selection)
            this.state.selection.handle(row)
    }

    onRowDoubleClick(row) {
        if (_.isFunction(this.props.onRowDoubleClick)) {
            this.props.onRowDoubleClick(row.data)
        }
    }

    onRowExpand(row) {
        let expanded = !row.expanded

        if (expanded) {
            eachChildren(row.children, r => r.expandedNow = true)
        } else {
            eachChildren(row.children, r => r.collapsedNow = true)
        }
        if (!expanded) {
            this.forceUpdate()

            setTimeout(() => {
                row.expanded = expanded
                this.forceUpdate()
            }, EXPAND_ANIMATION_TIME)
        } else {
            row.expanded = expanded
            this.forceUpdate()
        }

        if (_.isFunction(this.props.onRowExpand)) {
            this.props.onRowExpand(row.data, expanded)
        }
    }

    initSelection() {
        let props = this.props
        let selectionEnabled = optional(parseBoolean(props.selectionEnabled), true)
        if (!selectionEnabled) {
            return
        }

        let rows = props.data && props.data.rows
        if (!_.isEmpty(rows)) {
            if (!this.state.selection)
                this.state.selection = new Selection()

            this.state.selection.init(rows)
            this.state.selection.single = props.selectionMode === "single"
            this.state.selection.on("change", () => {


                _.assign(this.state, {rows: this.state.selection.rows})
                this.setState(this.state.selection);

                if (_.isFunction(this.props.onSelectionChanged)) {

                    this.stack = _.filter(this.stack, selected => _.any(this.state.selection.getSelected(), s => s.index === selected.index))

                    const lastSelected = this.state.selection.lastSelected;
                    if (!_.isEmpty(lastSelected)) {
                        if (optional(this.state.selection, {}).isRowSelected(lastSelected)) {
                            this.stack.push(lastSelected)
                        } else {
                            this.stack = _.filter(this.stack, s => s.index !== lastSelected.index)
                        }
                    }

                    this.props.onSelectionChanged(this.state.selection.getSelectedData(), safeGet(_.last(this.stack), "data"))
                }
            })

            this.state.selection.on("onRowDown", (row) => {
                if (_.isFunction(this.props.onRowDown)) {
                    this.props.onRowDown(row)
                }
            })

            this.state.selection.on("onRowUp", (row) => {
                if (_.isFunction(this.props.onRowUp)) {
                    this.props.onRowUp(row)
                }
            })

            if (props.initialSelection) {
                _.each(props.initialSelection, s => {
                    this.state.selection.selectRow(s)
                })
            }
        }
    }

    initQuery(props) {
        if (!this.queryInitialized) {
            this.queryInitialized = true

            if (!props.query) {
                this.standardQuery = query.create()

                if (forceBoolean(props.clientSideQuerying)) {
                    this.standardQuery.on("change", () => {
                        query.apply(this.standardQuery, props.data)

                        this.forceUpdate()
                    })
                }
            } else {
                if (forceBoolean(props.clientSideQuerying)) {
                    props.query.on("change", this.onQueryChange = () => {
                        query.apply(props.query, props.data)

                        this.forceUpdate()
                    })

                }
            }
        }
    }

    toggleSelectAll() {
        let selectionEnabled = optional(parseBoolean(this.props.selectionEnabled), true)
        if (!selectionEnabled) {
            return
        }

        if (this.state.selection) {
            this.state.selection.toggleAll()
        }
    }


    clearSelection() {
        let selectionEnabled = optional(parseBoolean(this.props.selectionEnabled), true)
        if (!selectionEnabled) {
            return
        }

        if (this.state.selection) {
            this.state.selection.clear()
        }
    }

    getSelection() {
        let selectionEnabled = optional(parseBoolean(this.props.selectionEnabled), true)
        if (!selectionEnabled) {
            return
        }

        if (this.state.selection) {
            return this.state.selection.getSelectedData()
        } else {
            return null
        }
    }

    getTotalPages() {
        if (!this.props.data || !this.props.data.rows || !this.props.query) {
            return 1
        }

        let totalPages = parseInt(Math.ceil(this.props.data.totalRows / this.props.query.rowsPerPage))
        return totalPages
    }

    getQuery() {
        return optional(this.props.query, this.standardQuery)
    }

    getData() {
        let result = null;
        if (this.isClientSideQuerying()) {
            result = query.apply(this.getQuery(), optional(this.props.data, {rows: [], totalRows: 0}))
        } else {
            result = optional(this.props.data, {rows: [], totalRows: 0})
        }

        if (_.isFunction(this.props.descriptor.resultTransformer)) {
            result = this.props.descriptor.resultTransformer(result)
        }

        return result;
    }

    onSelectWithCheck(column, data, value, row) {
        const selectionEnabled = optional(parseBoolean(this.props.selectionEnabled), true)

        if (selectionEnabled) {
            this.state.selection.handle(row, true)
        }
    }

    getDescriptor() {
        const original = this.props.descriptor;

        let descriptor = original;

        if (mobile.isMobile()) {
            descriptor = _.assign({}, original, {
                columns: _.union(original.columns, [{
                    cell: ActionsCell,
                    tdClassName: "grid-actions",
                    actions: [
                        {
                            icon: "zmdi zmdi-edit", action: (row) => {
                                if (_.isFunction(this.props.onRowDoubleClick)) {
                                    this.props.onRowDoubleClick(row)
                                }
                            }
                        }
                    ],
                    props: {
                        showAlways: true
                    }
                }])
            })
        }

        const selectionEnabled = optional(parseBoolean(this.props.selectionEnabled), true)
        const selectWithCheck = forceBoolean(this.props.selectWithCheck)

        if (selectWithCheck && selectionEnabled) {
            descriptor = _.assign({}, original, {
                columns: _.union([
                    {
                        property: "selected",
                        header: "selectAllBtn",
                        cell: EditCheckCell,
                        className: "checkbox-container",
                        props: {
                            width: "48px",
                            onValueChange: this.onSelectWithCheck.bind(this),
                            valueSupplier: (data, row) => this.isRowSelected(row)
                        }
                    }], original.columns)
            });
        }

        return descriptor;
    }


    isRowSelected(row) {
        let selection = optional(this.state.selection, null)
        if (selection)
            return selection.isRowSelected(row)
        return false;
    }


    getQuickSearchPlaceHolder() {
        if (this.props.quickSearchPlaceholder)
            return this.props.quickSearchPlaceholder;
        let key = "quickSearch_" + this.props.entity;
        if (hasLabel(key))
            return M(key);
        return M("search");
    }

    gridProps() {
        return optional(this.props.gridProps, {})
    }

    render() {
        if (_.isEmpty(this.props.descriptor)) {
            return null
        }

        const data = this.getData()
        const myQuery = this.getQuery()

        //customization properties
        const showFilters = getVisibleFilters(myQuery).length > 0 && !this.props.hideFilter
        const quickSearchEnabled = optional(parseBoolean(this.props.quickSearchEnabled), false)
        const quickSearchPlaceholder = this.getQuickSearchPlaceHolder();
        const headerVisible = optional(parseBoolean(this.props.headerVisible), true)
        const headerVisibleNoResults = optional(parseBoolean(this.props.headerVisibleNoResults), true)
        const footerVisible = optional(parseBoolean(this.props.footerVisible), true)
        const summaryVisible = optional(parseBoolean(this.props.summaryVisible), true)
        const noResultsVisible = optional(parseBoolean(this.props.noResultsVisible), true)
        const filtersVisible = optional(parseBoolean(this.props.filtersVisible), true)
        const paginationEnabled = optional(parseBoolean(this.props.paginationEnabled), true)
        let tableClassName = optional(this.props.tableClassName, "table table-hover table-bordered")
        if (showFilters) {
            tableClassName += " br-t"
        }
        const tableId = optional(this.props.tableId, uuid())
        const noResultsText = optional(this.props.noResultsText, M("noResults"))
        const hasResults = (data && data.rows) ? data.rows.length > 0 : false
        const hasPagination = this.getTotalPages() > 1
        const anchorHeader = optional(parseBoolean(this.props.anchorHeader), false)
        const scrollHorizontal = optional(parseBoolean(this.props.scrollHorizontal), false)
        let Container = optional(parseBoolean(this.props.showInCard), true) ? Card : NoCard
        let descriptor = this.getDescriptor()

        let parentTableClass = optional(this.props.parentTableClass, "parent-table")
        if (scrollHorizontal) {
            parentTableClass += " grid-scroll-horizontal"
            if (!anchorHeader) {
                parentTableClass += " nowrap"
            }
        }

        return (
            <div className="grid" tabIndex="0" onBlur={this.onBlur.bind(this)} onKeyPress={this.onKeyPress.bind(this)}
                 onKeyUp={this.onKeyUp.bind(this)} onKeyDown={this.onKeyDown.bind(this)}>
                <Container>
                    <div>
                        {quickSearchEnabled &&
                        <QuickSearch discriminator={this.props.discriminator} query={myQuery}
                                     placeholder={quickSearchPlaceholder}/>
                        }

                        {showFilters && filtersVisible &&
                        <Filters query={myQuery} descriptor={descriptor}/>
                        }

                        <div className="clearfix"></div>

                        <div className="with-result">
                            <div className={parentTableClass}>
                                {
                                    anchorHeader &&
                                    <table className="table table-fixed">
                                        <GridHeader gridProps={this.gridProps()} descriptor={descriptor} query={myQuery}
                                                    allSelected={this.isAllSelected()}
                                                    onSelectAll={this.toggleSelectAll.bind(this)}/>
                                    </table>
                                }
                                <div className="parent-table-content">
                                    <table id={tableId} className={tableClassName}>
                                        {headerVisible && (hasResults || !hasResults && headerVisibleNoResults) &&
                                        <GridHeader gridProps={this.gridProps()} descriptor={descriptor} query={myQuery}
                                                    allSelected={this.isAllSelected()}
                                                    onSelectAll={this.toggleSelectAll.bind(this)}/>
                                        }

                                        {hasResults &&
                                        <GridBody
                                            selection={this.state.selection}
                                            descriptor={descriptor}
                                            data={data}
                                            gridProps={this.gridProps()}
                                            query={myQuery}
                                            onRowExpand={this.onRowExpand.bind(this)}
                                            onRowMouseDown={this.onRowMouseDown.bind(this)}
                                            onRowDoubleClick={this.onRowDoubleClick.bind(this)}/>
                                        }


                                        {hasResults && footerVisible &&
                                        <GridFooter gridProps={this.gridProps()} descriptor={descriptor}/>
                                        }
                                    </table>
                                </div>
                            </div>


                            {hasResults && hasPagination && paginationEnabled &&
                            <div className="pull-right m-20">
                                <Pagination data={this.props.data} query={myQuery}/>
                            </div>
                            }

                            {hasResults && summaryVisible &&
                            <ResultSummary query={myQuery} data={this.props.data}/>
                            }

                            {!hasResults && noResultsVisible &&
                            <div className="no-results text-center p-30">
                                <h1><i className="zmdi zmdi-info-outline"/></h1>
                                <h4>{noResultsText}</h4>
                            </div>
                            }

                            <div className="clearfix"></div>

                        </div>
                    </div>
                </Container>
            </div>
        )
    }
}

export class EditCheckCell extends Cell {

    constructor(props) {
        super(props)
        this.checkbox = React.createRef()
        this.state = {value: "false"}
    }

    componentDidMount() {
        super.componentDidMount()
        this.setState({value: this.props.value})
    }

    onValueChange(e) {
        e.stopPropagation();

        let newValue = this.checkbox.current.checked
        this.setState({value: newValue})

        if (this.props.binding) {
            row.data[column.property] = checked
        }

        if (_.isFunction(this.props.onValueChange)) {
            let column = this.props.column
            let property = this.props.property
            let row = this.props.row
            this.props.onValueChange(column, row.data, newValue, row)
        }
    }

    getValue() {
        if (_.isFunction(this.props.valueSupplier)) {
            let column = this.props.column
            let property = this.props.property
            let row = this.props.row

            return this.props.valueSupplier(row.data, row, column)
        } else {
            return optional(this.state.value, "false")
        }
    }

    onMouseDown(e) {
        e.stopPropagation();
    }

    onClick(e) {
        this.onValueChange(e)
    }

    render() {
        let className = "grid-cell-container checkbox-container " + optional(this.props.className, "")
        let property = this.props.property
        let value = forceBoolean(this.getValue());
        let checked = value
        let tr = $(this.checkbox.current).parent().parent().parent().parent()
        let inputCheckbox = null;

        if ($(tr).hasClass("disabled")) {
            inputCheckbox =
                <input type="checkbox" ref={this.checkbox} value={value} data-property={property} checked={checked}
                       disabled="disabled"/>
        } else {
            inputCheckbox =
                <input type="checkbox" ref={this.checkbox} value={value} data-property={property} checked={checked}/>
        }

        return (
            <div className={className}>
                <div className="checkbox">
                    {inputCheckbox}
                    <label className="checkbox__label" onClick={this.onClick.bind(this)}
                           onMouseDown={this.onMouseDown.bind(this)}/>
                </div>
            </div>
        )
    }
}

export class MultiTextCell extends Cell {

    render() {
        let formatter = _.isFunction(this.props.formatter) ? this.props.formatter : v => v
        let values = _.map(formatter(this.props.value), (v, i) => {

            let item = _.isFunction(this.props.singleItemFormatter) ? this.props.singleItemFormatter(v) : v
            let spanClass = _.isFunction(this.props.itemClass) ? this.props.itemClass(i) : "";

            return (
                <li key={v + Math.random()}><span className={spanClass}>{item}</span></li>
            )
        })

        let bulletStyle = this.props.hideBullets ? "none" : "disc";
        return (
            <ul style={{paddingLeft: "0px", listStyleType: bulletStyle}}>{values}</ul>
        )
    }
}


export function createCell(column, row, firstElement, onExpand, props = {}, gridProps = {}) {
    let key = column.property + "" + row.index
    let value = traverse(row.data).get(column.property);
    let cell = _.isFunction(column.getCell) ? column.getCell(value, row, props, gridProps) : column.cell;
    return React.createElement(cell, _.assign({
        key,
        column,
        property: column.property,
        row,
        value,
        firstElement,
        onExpand
    }, props))

}

export class ButtonCell extends Cell {
    onClick() {
        if (_.isFunction(this.props.action)) {
            this.props.action(this.props.column, this.props.row.data, this.props.value)
        }
    }

    render() {
        let formatter = _.isFunction(this.props.formatter) ? this.props.formatter : v => v
        let className = optional(this.props.className, "btn btn-link ")
        let value = formatter(this.getValue())

        return (
            value === "NA" ?
                <span>{value}</span>
                :

                <a ref="button" className={className} onClick={this.onClick.bind(this)}>
                    <span>{value}</span>
                </a>
        )
    }
}

export class TextCellWithSubText extends Cell {
    toggleExpand(e) {
        if (_.isFunction(this.props.onExpand)) {
            this.props.onExpand(this.props.row)
            e.preventDefault()
            e.stopPropagation()
            e.nativeEvent.stopImmediatePropagation()
        }
    }

    render() {
        let marginLeft = 30 * (this.props.row.level || 0)
        let icon = "zmdi "
        if (!this.props.row.expanded) {
            icon += " zmdi-plus"
        } else {
            icon += " zmdi-minus"
        }

        let formatterTitle = _.isFunction(this.props.formatterTitle) ? this.props.formatterTitle : v => v
        let formatterSubtitle = _.isFunction(this.props.formatterSubtitle) ? this.props.formatterSubtitle : v => v

        let caret = !_.isEmpty(this.props.row.children) && this.props.firstElement ?
            <a style={{marginLeft: marginLeft, marginRight: 20}} href="javascript:;" className="expand-button"
               onClick={this.toggleExpand.bind(this)} onMouseDown={(e) => e.stopPropagation()}>
                <i className={"c-black " + icon}/>
            </a> : null

        let style = {}
        if (caret == null && this.props.row.level > 0 && this.props.firstElement) {
            style.marginLeft = marginLeft + 20
        }

        let titleClass = "textcell-title" + (optional(this.props.titleBold, false) ? " bold" : "")

        let titleTooltip = optional(this.props.titleTooltip, false)

        let subtitleTooltip = optional(this.props.subtitleTooltip, false)
        let text = formatterTitle(this.props.value, this.props.row.data);

        return (
            <div className="textcell-container">{caret}
                <p data-toggle={titleTooltip? "tooltip" : ""} title={text} className={titleClass}>{text}</p>
                <p data-toggle={subtitleTooltip? "tooltip" : ""}  className="textcell-subtitle">{formatterSubtitle(this.props.value, this.props.row.data)}</p>
            </div>

        )
    }
}

export class ReadOnlyImageCell {
}