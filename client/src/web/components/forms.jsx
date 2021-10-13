import React from "react";
import ReactDOM from "react-dom";
import M, {getLanguage} from "../../strings"
import {Actions, Card, HeaderBlock} from "./common"
import {diff, format, optional, parseBoolean, safeGet} from "../../utils/lang"
import {Observable} from "../../aj/events"
import {ActionsCell, Grid, HIDDEN_FILTER_LABEL, resultToGridData} from "./grids"
import {isCancel} from "../utils/keyboard"
import * as inputfile from "../utils/inputfile"
import * as datasource from "../../utils/datasource"
import _ from "underscore"
import * as session from "../../api/session";
import {getSessionToken, hasPermission, isSuperuser} from "../../api/session";
import {toast} from "../../plugins";
import * as config from "../../framework/config";
import {connect} from "../utils/aj";
import * as ui from "../utils/ui";
import {clearTabState, setSelectedTab} from "../../actions/tabs";
import {discriminated} from "../../utils/ajex";
import {TabsStore} from "../../stores/tabs"
import * as notificationCenter from "../../utils/notificationCenter";
import {Dialog} from "./dialogs";
import {formatDate, getDateFromString, momentInstance} from "../../utils/date";

export const VALIDATION_ERROR = {}


function isFieldVisible(field, descriptor, model) {

    let isVisible = true;
    if (_.isFunction(descriptor.visibility)) {
        isVisible = descriptor.visibility(field, model, descriptor)
    }

    if (isVisible) {
        if (_.isFunction(field.visibility)) {
            isVisible = field.visibility(model)
        }
    }

    return isVisible
}

function setValueInModel(model, property, value) {
    let i;
    property = property.split('.');
    for (i = 0; i < property.length - 1; i++) {
        if (i === 0) {
            model = model.data[property[i]];
        } else if (model != null) {
            model = model[property[i]];
        }
    }
    if (model != null)
        model[property[i]] = value;
}

export class Model extends Observable {
    constructor(form) {
        super()

        this.entity = null;
        this.descriptor = null
        this.initialData = {}
        this.data = {}
        this.validationResult = {}
        this.initialized = false
        this.form = form
        this.changesTrackingDisabled = false
    }

    invalidateForm() {
        if (this.form) {
            this.form.forceUpdate()
        }
    }

    load(data) {
        this.data = data ? data : {}
        if (data != null && (!this.initialized || data != this.initialData)) {
            this.invoke("load", this)
            this.initialized = true

            this.initialData = _.clone(this.data)
        }
    }

    findField(property) {
        if (this.descriptor == null) {
            throw new Error("Please specify a descriptor")
        }

        const Break = {}
        let field = null
        try {
            if (!_.isEmpty(this.descriptor.areas)) {
                this.descriptor.areas.forEach(a => {
                    if (!_.isEmpty(a.tabs)) {
                        a.tabs.forEach(t => {
                            if (!_.isEmpty(t.fields)) {
                                t.fields.forEach(f => {
                                    if (f.property == property) {
                                        field = f
                                        throw Break
                                    }
                                })
                            }
                            if (field != null) {
                                throw Break
                            }
                        })
                    }
                    if (field != null) {
                        return
                    }
                    if (!_.isEmpty(a.fields)) {
                        a.fields.forEach(f => {
                            if (f.property == property) {
                                field = f
                                throw Break
                            }
                        })
                    }
                    if (field != null) {
                        throw Break
                    }
                })
            }

            if (field == null) {
                if (!_.isEmpty(this.descriptor.tabs)) {
                    this.descriptor.tabs.forEach(t => {
                        if (!_.isEmpty(t.fields)) {
                            t.fields.forEach(f => {
                                if (f.property == property) {
                                    field = f
                                    throw Break
                                }
                            })
                        }
                        if (field != null) {
                            throw Break
                        }
                    })
                }
            }

            if (field == null) {
                if (!_.isEmpty(this.descriptor.fields)) {
                    this.descriptor.fields.forEach(f => {
                        if (f.property == property) {
                            field = f
                            throw Break
                        }
                    })
                }
            }
        } catch (e) {
            if (e !== Break) {
                throw e
            }
        }

        return field
    }

    hasChanges() {
        let d = diff(this.data, this.initialData)
        return d.length > 0
    }

    trackChanges() {
        this.changesTrackingDisabled = false
    }

    untrackChanges() {
        this.changesTrackingDisabled = true
    }

    reset() {
        this.initialized = false
        this.data = {}
        this.initialData = {}
    }

    set(property, value) {
        let initialValue = this.data[property]
        this.data[property] = value

        if (!this.changesTrackingDisabled) {
            this.invoke("property:change", property, value)
        }
    }

    assign(property, value) {
        let actual = optional(this.get(property), {})
        this.set(property, _.assign(actual, value))
    }

    get(property) {
        if (_.has(this.data, property)) {
            return this.data[property]
        } else {
            return null
        }
    }

    validateField(validationResult, field) {
        let value = this.data[field.property]
        try {
            if (_.isFunction(field.validator)) {
                field.validator(value)
            }

            validationResult[field.property] = {
                valid: true,
                message: null
            }
        } catch (e) {
            validationResult[field.property] = {
                valid: false,
                message: e.message
            }
        }
    }

    sanitized() {
        let sanitized = {}

        _.each(_.keys(this.data), property => {
            let value = this.data[property]
            let field = this.findField(property)
            if (field) {
                if (_.isFunction(field.sanitizer)) {
                    value = field.sanitizer(value)
                }
            }
            sanitized[property] = value
        })

        return sanitized
    }

    validate() {
        this.validationResult = {}
        if (!_.isEmpty(this.descriptor.areas)) {
            this.descriptor.areas.forEach(a => {
                if (!_.isEmpty(a.tabs)) {
                    a.tabs.forEach(t => {
                        if (!_.isEmpty(t.fields)) {
                            t.fields.forEach(f => {
                                this.validateField(this.validationResult, f)
                            })
                        }
                    })
                }
                if (!_.isEmpty(a.fields)) {
                    a.fields.forEach(f => {
                        this.validateField(this.validationResult, f)
                    })
                }
            })
        }

        if (!_.isEmpty(this.descriptor.tabs)) {
            this.descriptor.tabs.forEach(t => {
                if (!_.isEmpty(t.fields)) {
                    t.fields.forEach(f => {
                        this.validateField(this.validationResult, f)
                    })
                }
            })
        }

        if (!_.isEmpty(this.descriptor.fields)) {
            this.descriptor.fields.forEach(f => {
                this.validateField(this.validationResult, f)
            })
        }

        let invalid = _.any(this.validationResult, v => !v.valid)
        if (invalid) {
            throw VALIDATION_ERROR
        }
    }

    resetValidation() {
        this.validationResult = {}
    }

    setError(property, message) {
        this.validationResult[property] = {
            valid: false,
            message: message
        }
    }

    resetError(property) {
        this.validationResult[property] = {
            valid: true
        }
    }

    generateValidationResultForForm() {
        return {
            errors: _.filter(_.keys(this.validationResult), k => !this.validationResult[k].valid).map((k) => { return {property: k, message: this.validationResult[k].message}})
        }
    }
}

export class Label extends React.Component {
    render() {
        let field = this.props.field;
        let model = this.props.model;
        let className = optional(this.props.className, "");
        let text = _.isFunction(field.getLabel) ? field.getLabel(model) : field.label;
        let isRequired = _.isFunction(field.isRequired) ? field.isRequired(model) : optional(field.isRequired, false)
        if (isRequired) {
            text = text + " *"
        }

        return (
            !_.isEmpty(text) &&
            <label style={{width: "100%"}} htmlFor={field.property} className={className}>{text}</label>
        )
    }
}

export class Area extends React.Component {

    getExtra() {
        return null
    }

    render() {
        let descriptor = this.props.descriptor
        let area = this.props.area
        let inline = optional(descriptor.inline, false)
        inline = optional(area.inline, inline)
        let defaultFieldCass = inline ? InlineField : Field
        let tabs = !_.isEmpty(area.tabs) &&
            <Tabs areaId={optional(area.id, Math.random())} tabs={area.tabs} model={this.props.model}
                  descriptor={descriptor}/>
        let fields = !_.isEmpty(area.fields) && _.filter(area.fields, f => isFieldVisible(f, descriptor, this.props.model)).map(f => React.createElement(optional(() => f.component, () => defaultFieldCass), {
            key: f.property,
            model: this.props.model,
            field: f,
            descriptor: descriptor
        }))
        let title = _.isFunction(area.getTitle) ? area.getTitle(this.props.model, this.props.params) : area.title;

        return (
            <Card title={title} subtitle={area.subtitle} actions={area.actions}>
                {tabs}
                <div className="col-md-12 zero-padding">
                    <div className="row">
                        {fields}
                    </div>
                </div>
                <div className="clearfix"></div>

                {this.getExtra()}
            </Card>
        )
    }
}

export class AreaNoCard extends React.Component {

    isAreaVisible() {
        let model = this.props.model;
        if (_.isFunction(this.props.area.visibility)) {
            return this.props.area.visibility(model)
        }
        return true;
    }

    onClick() {
        if (this.props.area.fields.length > 0 && _.isFunction(this.props.area.fields[0].onClick)) {
            this.props.area.fields[0].onClick();
        }
    }

    render() {
        let descriptor = this.props.descriptor
        let area = this.props.area
        let showTabs = _.isFunction(area.showTabs) ? area.showTabs(this.props.model) : true
        let tabs = !_.isEmpty(area.tabs) && showTabs &&
            <Tabs areaId={optional(area.id, Math.random())} lcid={lcid} tabs={area.tabs} model={this.props.model}/>
        let fields = !_.isEmpty(area.fields) && _.filter(area.fields, f => isFieldVisible(f, descriptor, this.props.model)).map(f => React.createElement(optional(() => f.component, () => Field), {
            key: f.property != null ? f.property : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            model: this.props.model,
            field: f,
            descriptor: descriptor,
            onCancel: this.props.onCancel,
            onClick: this.onClick.bind(this)
        }))
        let actionKey = 1
        let className = "area-no-card col-12";
        if (area.className) {
            className += " " + area.className;
        }

        let bodyClassName = "area-no-card-body";
        if (area.bodyClassName) {
            bodyClassName += " " + area.bodyClassName;
        }
        let useBootstrapRow = optional(descriptor.useBootstrapRow, true);
        let style = useBootstrapRow
            ? {
                marginRight: "-15px",
                marginLeft: "-15px",
            }
            : {
                marginRight: "0",
                marginLeft: "0",
            };

        if (this.isAreaVisible()) {
            return (
                <div className={className}>
                    <div className="area-no-card-header">
                        {area.title &&
                        <h2>{area.title} {area.subtitle && <small>{area.subtitle}</small>}</h2>
                        }

                        <Actions actions={area.actions}/>
                    </div>
                    <div className={bodyClassName} stformyle={style}>
                        <div className="clearfix col-12">
                            <div className="row">{fields}</div>
                        </div>
                        {tabs}
                    </div>
                    {area.separator &&
                    <div className={area.separator}></div>
                    }
                </div>
            )
        } else {
            return <div/>
        }
    }
}


export class Tabs extends React.Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        let self = this
        TabsStore.subscribe(this, state => {
            self.forceUpdate()
        })
    }

    componentWillUnmount() {
        if (this.canClearTabState()) {
            clearTabState({
                discriminator: this.getDiscriminator()
            })
        }
        TabsStore.unsubscribe(this)
    }

    canClearTabState() {
        return false;
    }

    getDiscriminator() {
        return this.props.areaId + (this.props.model.get("id") ? this.props.model.get("id") : "")
    }

    getTabClass(selectedTab, key, firstTabKey) {
        if ((selectedTab && key == selectedTab) || (!selectedTab && key == firstTabKey)) {
            return "active"
        }
        return "";
    }

    onClick(selectedTabId) {
        setSelectedTab({
            selectedTab: selectedTabId,
            discriminator: this.getDiscriminator()
        })
    }

    render() {

        let self = this
        let descriptor = this.props.descriptor
        let tabs = this.props.tabs
        let state = optional(discriminated(optional(TabsStore.state, {}), this.getDiscriminator()), {})
        let selectedTab = state.selectedTab;

        let firstTabId = tabs[0].id
        var nav = tabs.map(n => {
            let key = "nav_" + n.key;
            return (
                <li key={key} className={this.getTabClass(selectedTab, n.id, firstTabId)}
                    onClick={this.onClick.bind(this, n.id)}><a className="tab-button"
                                                               role="tab" data-key={n.id}
                                                               data-toggle="tab"
                                                               href={`#${n.key}`}>{n.title}</a>
                </li>
            )
        })

        let panes = tabs.map(c => {

            let key = "pane_" + c.key;

            let inline = optional(descriptor.inline, false)

            inline = optional(c.inline, inline)

            let defaultFieldClass = inline ? InlineField : Field

            let fields = !_.isEmpty(c.fields) && _.filter(c.fields, f => isFieldVisible(f, descriptor, this.props.model)).map(f => React.createElement(optional(() => f.component, () => defaultFieldClass), {
                key: f.property,
                model: this.props.model,
                field: f,
                onCancel: this.props.onCancel,
                canSave: this.props.canSave
            }))

            return (
                <div key={key} role="tabpanel"
                     className={"tab-pane " + (this.getTabClass(selectedTab, c.id, firstTabId))} id={`${c.key}`}>
                    <div className="row">{fields}</div>
                    <div className="clearfix"></div>
                </div>
            )
        })


        return (

            <div>

                <ul className="tab-nav" style={{textAlign: "center"}} role="tablist">

                    {nav}

                </ul>


                <div className="tab-content">

                    {panes}

                </div>

            </div>

        )

    }
}

let AREA_KEY = 1
let TAB_KEY = 1

export function generateKeys(descriptor) {
    if (!descriptor.hasKeys) {
        if (!_.isEmpty(descriptor.areas)) {
            descriptor.areas.forEach(a => {
                if (_.isEmpty(a.key)) {
                    a.key = "area" + AREA_KEY++
                }

                if (!_.isEmpty(a.tabs)) {
                    a.tabs.forEach(t => {
                        if (_.isEmpty(t.key)) {
                            t.key = "tab" + TAB_KEY++
                        }
                    })
                }
            })
        }

        if (!_.isEmpty(descriptor.tabs)) {
            descriptor.tabs.forEach(t => {
                if (_.isEmpty(t.key)) {
                    t.key = "tab" + TAB_KEY++
                }
            })
        }

        descriptor.hasKeys = true
    }
}

export class FormSubmitEvent {
    constructor(form, model) {
        this.form = form
        this.model = model
        this.stopped = false
    }

    stop() {
        this.stopped = true
    }

    forceSubmit() {
        this.form.forceSubmit()
    }
}

export class FormBody extends React.Component {


    isAreaVisible(area) {
        let model = this.props.model

        if (_.isFunction(area.visibility)) {
            return area.visibility(model)
        }

        return true
    }

    render() {
        let descriptor = this.props.descriptor
        generateKeys(descriptor)
        let model = this.props.model
        let inline = optional(descriptor.inline, false)
        let defaultFieldCass = inline ? InlineField : Field
        let areas = !_.isEmpty(descriptor.areas) && _.filter(descriptor.areas, a => this.isAreaVisible(a)).map(a => React.createElement(optional(() => a.component, () => Area), {
            key: a.key,
            model: model,
            area: a,
            descriptor,
            canSave: this.props.canSave,
            onCancel: this.props.onCancel
        }))
        let tabs = !_.isEmpty(descriptor.tabs) &&
            <Tabs areaId={optional(area.id, Math.random())} tabs={descriptor.tabs} model={model}
                  descriptor={descriptor}/>
        let fields = !_.isEmpty(descriptor.fields) && _.filter(descriptor.fields, f => isFieldVisible(f, descriptor, model)).map(f => React.createElement(optional(() => f.component, () => defaultFieldCass), {
            key: f.property,
            model: model,
            field: f,
            descriptor: descriptor,
            params: this.props.params,
            onCancel: this.props.onCancel
        }))
        let showInCard = optional(descriptor.showInCard, true)

        let className = "form-body clearfix " + optional(this.props.className, "")

        return (
            <div className={className}>
                {areas}
                {(tabs.length > 0 || fields.length > 0) &&
                (showInCard
                        ?
                        <Card padding="false">
                            {tabs}
                            <div className="">
                                <div className="row">
                                    {fields}
                                </div>
                            </div>
                            <div className="clearfix"/>
                        </Card>
                        :
                        <div className="form-body-content">
                            <div className="col-12">
                                <div className="row">
                                    {tabs}
                                    {fields}
                                </div>
                            </div>
                            <div className="clearfix"/>
                        </div>
                )
                }
            </div>
        )
    }
}

export class Form extends React.Component {
    constructor(props) {
        super(props)

        this.model = new Model(this);
        this.model.entity = this.props.entity
        this.model.once("load", () => {
            let descriptor = this.props.descriptor;
            if (_.isFunction(descriptor.onModelLoadFirstTime)) {
                descriptor.onModelLoadFirstTime(this.model)
            }
        })

        this.model.on("load", () => {
            let descriptor = this.props.descriptor
            if (_.isFunction(descriptor.onModelLoad)) {
                descriptor.onModelLoad(this.model)
            }
        })

        let descriptor = this.props.descriptor;

        if (descriptor.stores) {
            descriptor.stores.forEach(s => connect(this, s))
        }


    }

    componentWillUpdate(props, state) {
        let descriptor = this.props.descriptor
        if (_.isFunction(descriptor.formUpdateFunction)) {
            descriptor.formUpdateFunction(state, this.state, this.model)
        }
    }

    submit() {
        this.onSubmit()
    }

    forceSubmit() {
        if (_.isFunction(this.props.onSubmit)) {
            this.props.onSubmit(this.model.sanitized())
        }
    }

    onSubmit(e) {
        if (e) {
            e.preventDefault()
        }

        let event = new FormSubmitEvent(this, this.model)

        try {
            let descriptor = this.props.descriptor
            if (_.isFunction(descriptor.beforeSubmit)) {
                descriptor.beforeSubmit(event)

                if (event.stopped) {
                    return
                }
            }
        } catch (e) {
            if (e === VALIDATION_ERROR) {
                this.forceUpdate()
                return
            } else {
                throw e
            }
        }

        try {
            this.model.validate()
            if (_.isFunction(this.props.onSubmit)) {
                this.props.onSubmit(this.model.sanitized())
            }
        } catch (e) {
            if (e === VALIDATION_ERROR) {
                this.forceUpdate()
            } else {
                throw e
            }
        }
    }

    onCancel(e) {
        if (_.isFunction(this.props.onCancel)) {
            this.props.onCancel()
        }
    }

    componentWillReceiveProps(nextProps) {
        this.model.descriptor = nextProps.descriptor
        this.model.load(nextProps.data)
    }

    getExtra() {
        return null
    }

    showFormFooter() {
        return optional(this.props.descriptor.showFormFooter, true)
    }


    render() {
        let descriptor = this.props.descriptor
        let model = this.model

        let inline = optional(descriptor.inline, false)
        let className = inline ? "form-horizontal" : ""
        let showFormFooter = this.showFormFooter();
        let style = optional(this.props.style, {})


        return (
            <div className="form" style={style}>
                <form action="" className={className} role="form" onSubmit={this.onSubmit.bind(this)}>
                    <FormBody  descriptor={descriptor} model={model} onCancel={this.onCancel.bind(this)}/>

                    {showFormFooter &&
                    <FormFooter canCancel={this.props.canCancel} canSave={this.props.canSave} descriptor={descriptor} model={model} onCancel={this.onCancel.bind(this)}/>
                    }
                    <div className="clearfix"></div>
                    {this.getExtra()}
                </form>
            </div>
        )
    }
}

class FormFooter extends React.Component {

    constructor(props) {
        super(props)
    }


    onCancel() {
        if (_.isFunction(this.props.onCancel)) {
            this.props.onCancel();
        }
    }

    canSave() {
        let descriptor = this.props.descriptor;
        return _.isFunction(descriptor.canSave) ? descriptor.canSave(this.props.model) : true
    }

    canCancel() {
        let descriptor = this.props.descriptor;
        return _.isFunction(descriptor.canCancel) ? descriptor.canCancel(this.props.model) : true
    }

    render() {
        const descriptor = this.props.descriptor;

        let submitText = M("save");
        let cancelText = M("back");
        if (descriptor) {
            if (descriptor.submitText) {
                submitText = descriptor.submitText;
            }
            if (descriptor.cancelText) {
                cancelText = descriptor.cancelText;
            }
        }

        const style = {paddingBottom: "30px"}

        const canSave = this.canSave();
        const canCancel = this.canCancel();

        return (

            <div className="btn-actions-bar" style={style}>

                {canCancel &&
                <button type="button" className="btn btn-dark" onClick={this.onCancel.bind(this)}><i
                    className="zmdi zmdi-arrow-back"/> {cancelText}</button>
                }
                {canSave &&
                <button type="submit" className="btn btn-primary"><i className="zmdi zmdi-save"/> {submitText}</button>}
            </div>
        );
    }

}

/************************
 Controls and Fields
 ************************/
export const FORM_FOOTER = "actionsButtons"

export class Field extends React.Component {

    componentDidMount() {
        let self = this;
        let me = ReactDOM.findDOMNode(this)
        $(me).find("#" + this.generatePopoverId()).popover();
        $('body').on('click', function (e) {
            $('[data-toggle=popover]').each(function () {
                // hide any open popovers when the anywhere else in the body is clicked
                if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
                    $(this).popover('hide');
                }
            });
        });
    }

    generatePopoverId() {
        return "popover_" + this.props.field.property
    }

    render() {

        if (this.props.field.property == FORM_FOOTER) {

            return (
                <div className="col-12">
                    <FormFooter descriptor={this.props.descriptor} model={this.props.model}
                                onCancel={this.props.onCancel.bind(this)}/>
                </div>

            );

        }
        let popoverId = this.generatePopoverId()
        let model = this.props.model
        let className = "form-group " + (this.props.field.size ? this.props.field.size : "col-sm-12")
        let control = React.createElement(_.isFunction(this.props.field.getControl) ? this.props.field.getControl(model) : this.props.field.control, _.assign({
            field: this.props.field,
            model: this.props.model
        }, this.props.field.props));
        let hasLabel = (this.props.field.label != undefined && this.props.field.label != null) || _.isFunction(this.props.field.getLabel)
        let validationResult = optional(model.validationResult[this.props.field.property], {valid: true})
        if (!validationResult.valid) {
            className += " has-error"
        }
        if (!_.isEmpty(this.props.field.className)) {
            className += " " + this.props.field.className
        }

        let style = {};

        if (this.props.field.emptyRow) {
            style["minHeight"] = 0;
            style["marginBottom"] = 0;
        } else {
            style["minHeight"] = 58;
        }

        if (this.props.field.hidden && this.props.field.hidden == true) {
            className = "";
            style = {};
        }
        let hasToolTip = this.props.field.tooltip != undefined && this.props.field.tooltip != null
        return (
            <div className={className} style={style}>
                <div style={{display: 'inline-flex'}}>
                    {hasLabel &&
                    <Label field={this.props.field} model={model}/>
                    }
                    {hasToolTip &&
                    <a id={popoverId} style={{cursor: 'pointer', marginLeft: '5px', color: '#2196F3'}} className=""
                       title=""
                       data-toggle="popover" data-placement="top" data-original-title={this.props.field.tooltip}>
                        <i className="zmdi zmdi-info-outline"/>
                    </a>}
                </div>
                {control}
                {!validationResult.valid && !_.isEmpty(validationResult.message) &&
                <small className="help-block">{validationResult.message}</small>
                }
                <i className="form-group__bar"></i>
            </div>
        )
    }
}

export class InlineField extends React.Component {
    render() {
        if (this.props.field.property == FORM_FOOTER) {
            return (
                <FormFooter descriptor={this.props.descriptor} model={this.props.model}
                            onCancel={this.onCancel.bind(this)}/>
            );

        }

        let model = this.props.model
        let className = "form-group " + (this.props.field.size ? this.props.field.size : "col-sm-12")
        let control = React.createElement(this.props.field.control, _.assign({
            field: this.props.field,
            model: this.props.model
        }, this.props.field.props))
        let hasLabel = this.props.field.label != undefined && this.props.field.label != null
        let inline = optional(this.props.inline, false)
        let controlSize = hasLabel ? "col-sm-10" : "col-sm-12"
        let validationResult = optional(model.validationResult[this.props.field.property], {valid: true})
        if (!validationResult.valid) {
            className += " has-error"
        }
        if (!_.isEmpty(this.props.field.className)) {
            className += " " + this.props.field.className
        }
        return (

            <div className={className}>
                {hasLabel &&
                <div className="col-sm-2">
                    <Label field={this.props.field} className="control-label"/>
                </div>
                }
                <div className={controlSize}>
                    {control}
                    {!validationResult.valid && !_.isEmpty(validationResult.message) &&
                    <small className="help-block">{validationResult.message}</small>
                    }
                </div>
                <i className="form-group__bar"></i>
            </div>
        )
    }
}


export class Control extends React.Component {
    constructor(props) {
        super(props)
    }

    onValueChange(e) {
        let value = e.target.value
        let model = this.props.model
        let field = this.props.field
        model.set(field.property, value)
        this.forceUpdate()
    }
}

//TODO: non funziona ancora
export class Currency extends Control {

    constructor(props) {
        super(props);
        this.decimal = props.decimal || ",";
        this.prefix = props.prefix || "€";
        this.thousands = props.thousands || ".";
        this.precision = props.precision || 2
    }

    componentDidUpdate() {
        let field = this.props.field
        let me = ReactDOM.findDOMNode(this)
        $(me).find("#" + field.property).maskMoney({
            prefix: this.prefix,
            thousands: this.thousands,
            decimal: this.decimal,
            precision: this.precision
        });
    }

    render() {
        let field = this.props.field
        let maxLength = optional(this.props.maxLength, "");

        return (
            <input
                type="text"
                id={field.property}
                className="form-control input-sm"
                data-property={field.property}
                placeholder={field.placeholder}
                value={optional(this.props.model.get(field.property), "")}
                onChange={this.onValueChange.bind(this)}
                maxLength={maxLength}/>
        )
    }
}

export class Text extends Control {
    render() {
        let field = this.props.field
        let maxLength = optional(this.props.maxLength, "");
        let icon = optional(field.icon, null);
        let style = {};
        if (icon != null)
            style.paddingRight = "20px";

        return (
            <div className="input-group" style={{marginBottom: "0px"}}>
                <input
                    type="text"
                    className="form-control input-sm"
                    id={field.property}
                    data-property={field.property}
                    placeholder={field.placeholder}
                    style={style}
                    value={optional(this.props.model.get(field.property), "")}
                    onChange={this.onValueChange.bind(this)}
                    maxLength={maxLength}/>
                {icon != null && <div className="input-group-addon m-t-7" style={{marginLeft: "-10px"}}>
                    <span className={icon}/>
                </div>}
                <i className="form-group__bar"></i>
            </div>

        )
    }
}

export class TextArea extends Control {
    render() {
        let field = this.props.field
        let style = {
            height: optional(this.props.height, "150px")
        }
        return (
            <textarea
                style={style}
                className="form-control"
                id={field.property}
                data-property={field.property}
                placeholder={field.placeholder}
                value={optional(this.props.model.get(field.property), "")}
                onChange={this.onValueChange.bind(this)}/>
        )
    }
}

export class ReadOnlyTextArea extends Control {
    render() {
        let field = this.props.field
        let style = {
            height: optional(this.props.height, "150px")
        }
        return (
            <textarea
                style={style}
                className="form-control"
                id={field.property}
                data-property={field.property}
                placeholder={field.placeholder}
                value={optional(this.props.model.get(field.property), "")}
                disabled="disabled"
                onChange={this.onValueChange.bind(this)}/>
        )
    }
}

export class CountdownReadonly extends Control {

    constructor(props) {
        super(props)
        this.date = null;
        this.timer = null;
    }

    componentDidMount() {
        let field = this.props.field
        let model = this.props.model
        let formatter = optional(() => this.props.getValue, () => {
            return v => v
        });
        this.date = optional(formatter(model.get(field.property), model), "")

        this.timer = setInterval(() => {
            this.forceUpdate();
        }, 1000);
    }

    getValue() {
        if (this.date != null) {
            var ms = momentInstance()(this.date).diff(momentInstance()(new Date()));
            var d = momentInstance().duration(ms);
            return Math.floor(d.asHours()) + momentInstance().utc(ms).format(":mm:ss");

        }
        return "";


    }

    componentWillUnmount() {
        if (this.timer != null)
            clearInterval(this.timer);
    }

    render() {
        let field = this.props.field


        return (
            <div className="fg-line">
                <input
                    disabled="disabled"
                    readOnly="readOnly"
                    type="text"
                    className="form-control input-sm"
                    id={field.property}
                    data-property={field.property}
                    placeholder={field.placeholder}
                    value={this.getValue()}
                    onChange={this.onValueChange.bind(this)}/>
            </div>
        )
    }
}

export const BUTTON_COLOR_RED = "btn-danger";
export const BUTTON_COLOR_BLUE = "btn-primary";
export const BUTTON_COLOR_SUCCESS = "btn-success";
export const BUTTON_COLOR_WHITE = "btn-default";
export const BUTTON_COLOR_ORANGE = "btn-orange";


export class MultiButton extends React.Component {
    render() {
        let model = this.props.model

        let buttons = _.map(_.filter(this.props.buttons, b => _.isFunction(b.isVisible) ? b.isVisible(model) : true), b => {
                let iconClass = "zmdi " + b.icon;
                let classname = "btn waves-effect " + optional(b.color, BUTTON_COLOR_WHITE);
                let text = b.text;
                return <a key={b.property + Math.random()} style={{marginRight: "10px", color: "white", cursor: "pointer"}}
                          onClick={b.click.bind(this, model)}
                          className={classname}><i className={iconClass}/> {text} </a>
            }
        );

        return (
            <div>
                {buttons}
            </div>
        )
    }
}


export class ReadOnlySimpleText extends Control {

    getText() {
        let field = this.props.field
        let model = this.props.model
        let formatter = optional(() => this.props.formatter, () => {
            return v => v
        })
        return optional(formatter(model.get(field.property), model), "")
    }


    render() {
        let field = this.props.field
        let style = {
            color: "#9E9E9E",
            fontSize: "12px"
        }

        return (
            <span style={style}>{this.getText()}</span>
        )
    }
}

export class ReadOnlyText extends Control {

    getText() {
        let field = this.props.field
        let model = this.props.model
        let formatter = optional(() => this.props.formatter, () => {
            return v => v
        })
        return optional(formatter(model.get(field.property), this.props.model), "")
    }

    render() {
        let field = this.props.field
        let showIcon = optional(this.props.showIcon, true)
        let className = "form-control input-sm";
        if (_.isFunction(this.props.getClassName)) {
            className = this.props.getClassName(this.props.model);
        }
        if (_.isFunction(this.props.getExtraClassName)) {
            className = className + " " + this.props.getExtraClassName(this.props.model);
        }
        return (

            <div className="input-group m-b-0">
                <input
                    style={{opacity: "1"}}
                    disabled="disabled"
                    readOnly="readOnly"
                    type="text"
                    className={className}
                    id={field.property}
                    data-property={field.property}
                    placeholder={field.placeholder}
                    value={this.getText()}
                    onChange={this.onValueChange.bind(this)}/>

                {showIcon && <div className="input-icon-container">
                    <i className="zmdi zmdi-lock zmdi-hc-fw"/>
                </div>}

            </div>
        )
    }
}

export class Color extends Control {

    componentDidMount() {
        let field = this.props.field
        let model = this.props.model
        let me = ReactDOM.findDOMNode(this)
        let input = $(me).find("#" + field.property)
        $(me).find(".color-picker").farbtastic(v => {
            model.set(field.property, v)
            this.forceUpdate()
        })
    }

    render() {
        let field = this.props.field
        let value = this.props.model.get(field.property)
        let colorStyle = {backgroundColor: `${optional(value, "#000000")}`}

        return (
            <div className="cp-container">
                <div className="">
                    <div className="dropdown">
                        <input
                            type="text"
                            className="form-control cp-value"
                            data-toggle="dropdown"
                            aria-expanded="false"
                            id={field.property}
                            data-property={field.property}
                            placeholder={field.placeholder}
                            value={optional(this.props.model.get(field.property), "")}
                            onChange={this.onValueChange.bind(this)}/>

                        <div className="dropdown-menu">
                            <div className="color-picker" data-cp-default="#000000"></div>
                        </div>

                        <i className="cp-value" style={colorStyle}/>
                    </div>
                </div>
            </div>
        )
    }
}

export class Spacer extends Control {

    getContent() {
        if (_.isFunction(this.props.formatter)) {
            let model = this.props.model;
            return this.props.formatter(model);
        }
        if (this.props.content) {
            return this.props.content;
        }
        return null;
    }

    onClick() {
        if (_.isFunction(this.props.onClick))
            this.props.onClick()
    }

    render() {
        let defaultTheme = parseBoolean(optional(this.props.defaultTheme, true));
        let className = (defaultTheme) ? "form-spacer-control" : "";
        if (this.props.className) {
            className += " " + this.props.className;
        }
        let content = this.getContent();
        let showBorderBottom = optional(this.props.showBorderBottom, false);
        //<div className={((defaultTheme) ? "form-spacer-control" : "")}>
        return (
            <div className={className}>
                {content &&
                <div onClick={this.onClick.bind(this)}>{content}</div>}
                {showBorderBottom &&
                <hr style={{width: "100%"}}></hr>}
            </div>
        )
    }
}

export class Mail extends Control {
    render() {
        let field = this.props.field

        return (
            <input
                type="email"
                className="form-control input-sm"
                id={field.property}
                data-property={field.property}
                placeholder={field.placeholder}
                value={optional(this.props.model.get(field.property), "")}
                onChange={this.onValueChange.bind(this)}/>
        )
    }
}

//https://flatpickr.js.org/options/
export class DateTime extends Control {

    getDefaultFormat() {
        return "d/m/Y";
    }

    componentDidMount() {

    }

    componentWillUpdate(props, state) {
        this.setData()
    }

    onDateChanged(value) {
        let field = this.props.field;
        let model = this.props.model;
        let date = value?  getDateFromString(value).valueOf() : null
        model.set(field.property, date)

        if (date) {
            if (optional(this.props.putLabelInModel, false))
                model.set(field.property +  HIDDEN_FILTER_LABEL, formatDate(new Date(date)))
        }

    }

    setData() {
        let options = {
            //TODO: default locale dalle impo
            locale: this.props.locale || getLanguage(),
            dateFormat: this.props.format ? this.props.format : this.getDefaultFormat()
        };

        let minDate = this.props.getMinDate && this.props.getMinDate(this.props.model);
        let maxDate = this.props.getMaxDate && this.props.getMaxDate(this.props.model);
        let disabledDates = this.props.getDisabledDates && this.props.getDisabledDates(this.props.model);

        if (minDate) {
            options["minDate"] = minDate
        }

        if (maxDate) {
            options["maxDate"] = maxDate
        }

        if (disabledDates) {
            options["disabledDates"] = disabledDates
        }

        let me = ReactDOM.findDOMNode(this);
        let value = this.getItemValue();


        if (value)
            options["defaultDate"] = value

        options["onChange"] = (selectedDates, dateStr, instance) => {
            this.onDateChanged(dateStr)
        }
        $(me).find("#" + this.getItemId()).flatpickr(options);
    }

    getItemValue() {
        let field = this.props.field;
        let model = this.props.model;
        return model.get(field.property)
    }

    getItemId() {
        let field = this.props.field;
        return field.property;
    }

    getItemProperty() {
        let field = this.props.field;
        return field.property;
    }

    getItemPlaceHolder() {
        return this.props.field.placeholder;
    }

    isDisabled() {
        return _.isFunction(this.props.isDisabled) ? this.props.isDisabled(this.props.model) : false
    }

    render() {
        let disabled = this.isDisabled();

        return (
            <div className="input-group" style={{marginBottom: "0px"}}>
                <input
                    style={{paddingLeft: "0px"}}
                    disabled={disabled}
                    type="text"
                    className="form-control input-sm"
                    id={this.getItemId()}
                    data-property={this.getItemProperty()}
                    placeholder={this.getItemPlaceHolder()}/>
                <div className="input-group-addon">
                    <span className="zmdi zmdi-calendar"/>
                </div>
            </div>
        )
    }
}


export class YesNo extends Control {
    onValueChange(e) {
        let value = parseBoolean(e.target.value)
        let model = this.props.model
        let field = this.props.field
        model.set(field.property, value)
        this.forceUpdate()
    }

    componentDidMount() {
        let model = this.props.model
        let field = this.props.field
        let fn = () => {
            let value = parseBoolean(model.get(field.property))
            if (value === null || value === undefined) {
                value = false
            }
            model.untrackChanges()
            model.set(field.property, value)
            model.trackChanges()
        }

        model.once("load", fn)
        fn()
    }

    render() {
        const field = this.props.field
        const yesText = optional(this.props.yesText, M("yes"))
        const noText = optional(this.props.noText, M("no"))
        const yesId = `__yesno-${field.property}-yes`
        const noId = `__yesno-${field.property}-no`
        const className = "yesno " + (this.props.className || "");
        return (
            <div className={className}>
                <div className="radio radio--inline">
                    <input id={yesId} type="radio" name={field.property} value="true"
                           checked={optional(this.props.model.get(field.property), false)}
                           onChange={this.onValueChange.bind(this)}/>
                    <label htmlFor={yesId} className="radio__label">{yesText}</label>
                </div>
                <div className="radio radio--inline">
                    <input id={noId} type="radio" name={field.property} value="false"
                           checked={!(optional(this.props.model.get(field.property), false))}
                           onChange={this.onValueChange.bind(this)}/>
                    <label htmlFor={noId} className="radio__label">{noText}</label>
                </div>
            </div>
        )
    }
}


export class Switch extends Control {
    onValueChange(e) {
        let value = e.target.checked
        let model = this.props.model
        let field = this.props.field
        model.set(field.property, value)
        this.forceUpdate()
    }

    render() {
        let field = this.props.field

        return (
            <div className="toggle-switch">
                <input
                    type="checkbox"
                    hidden="hidden"
                    name={field.property}
                    id={field.property}
                    data-property={field.property}
                    checked={optional(this.props.model.get(field.property), false)}
                    onChange={this.onValueChange.bind(this)}/>

                <label htmlFor={field.property} className="ts-helper"></label>
                <label htmlFor={field.property} className="ts-label">{field.placeholder}</label>
            </div>
        )
    }
}

export class Number extends Control {
    constructor(props) {
        super(props)

        this.setState({})
    }

    // getMinValue() {
    //     return _.isFunction(this.props.getMinValue) ? this.props.getMinValue(this.props.model) : 0;
    // }


    onValueChange(e) {
        let value = e.target.value
        let model = this.props.model
        let field = this.props.field

        if (value == "" || value == "-" || (this.props.onlyInteger ? value.match(/^\d+$/) : value.match(/^-?(\d+\.?\d{0,9}|\.\d{1,9})$/))) {

            model.set(field.property, value)
            this.forceUpdate()
            if (_.isFunction(this.props.performOnChange)) {
                this.props.performOnChange(this.props.model, value);
            }
        }

    }


    render() {
        let field = this.props.field

        return (
            <input
                ref="text"
                type="text"
                className="form-control input-sm"
                id={field.property}
                data-property={field.property}
                placeholder={field.placeholder}
                value={optional(this.props.model.get(field.property), "")}
                onChange={this.onValueChange.bind(this)}/>
        )
    }
}


export class Select extends Control {

    constructor(props) {
        super(props)

        this.__dataSourceOnChange = (data) => {
            this.forceUpdate()
        }
    }

    onValueChange(e) {
        let multiple = optional(this.props.multiple, false)
        let value = $(e.target).val()
        let model = this.props.model
        let field = this.props.field

        if (multiple) {
            if (value == null) {
                value = []
            }
        }

        model.set(field.property, value)

        if (optional(this.props.putLabelInModel, false))
            model.set(field.property +  HIDDEN_FILTER_LABEL, this.generateValueLabel(value))

        this.forceUpdate()
    }

    componentDidMount() {
        if (!_.isEmpty(this.props.datasource)) {
            this.props.datasource.on("change", this.__dataSourceOnChange)
        }

        let me = ReactDOM.findDOMNode(this)
        let model = this.props.model
        let field = this.props.field
        let multiple = optional(this.props.multiple, false)

        $(me)
            .focus(() => {
                $(me).addClass("fg-toggled")
            })
            .blur(() => {
                $(me).removeClass("fg-toggled")
            })

        let self = this;
        $(me).find("select")
            .selectpicker({
                liveSearch: optional(this.props.searchEnabled, false)
            })
            .on("loaded.bs.select", function () {
                if (_.isEmpty(model.get(field.property))) {
                    let value = $(this).val()

                    if (multiple) {
                        if (_.isEmpty(value)) {
                            value = []
                        }
                    }

                    model.untrackChanges()
                    model.set(field.property, value)
                    if (optional(self.props.putLabelInModel, false))
                        model.set(field.property + HIDDEN_FILTER_LABEL, self.generateValueLabel(value))
                    model.trackChanges()
                }
            })
    }

    generateValueLabel(value) {
        try {
            let label = this.getSingleItemLabel(this.props.datasource.data.rows.filter(o => o.id === value || o.value === value)[0])
            return label;
        } catch (e) {
            return value
        }
    }

    componentDidUpdate() {
        let model = this.props.model
        let field = this.props.field
        let me = ReactDOM.findDOMNode(this)
        let multiple = optional(this.props.multiple, false)

        $(me).find("select").selectpicker("refresh")
    }

    componentWillUnmount() {
        if (!_.isEmpty(this.props.datasource)) {
            this.props.datasource.off("change", this.__dataSourceOnChange)
        }
    }

    getSingleItemValue(value) {
        return _.isFunction(this.props.getSingleItemValue) ? this.props.getSingleItemValue(value) : value.value
    }

    getSingleItemLabel(value) {
        return _.isFunction(this.props.getSingleItemLabel) ? this.props.getSingleItemLabel(value) : value.label
    }

    render() {
        let model = this.props.model
        let field = this.props.field
        let datasource = this.props.datasource
        let options = optional(() => datasource.data.rows, []).map(o =>
            <option
                key={this.getSingleItemValue(o)}
                value={this.getSingleItemValue(o)}>{
                this.getSingleItemLabel(o)}
            </option>)
        let multiple = optional(this.props.multiple, false)

        return (
            <div className="fg-line">
                <select
                    id={field.property}
                    className="form-control"
                    data-property={field.property}
                    onChange={this.onValueChange.bind(this)}
                    title={field.placeholder}
                    value={optional(model.get(field.property), multiple ? [] : "")}
                    multiple={multiple}>
                    {this.props.allowNull &&
                    <option key="empty" value=""
                            style={{color: "#999999"}}>{optional(this.props.nullText, M("noSelection"))}</option>
                    }
                    {options}
                </select>
            </div>
        )
    }
}


export class Lookup extends Control {
    constructor(props) {
        super(props)

        this.datasource = this.props.datasource || datasource.create()
        this.query = this.props.query || query.create()
        this.entityPrefixUrl = isSuperuser() ? "entities/" : "settings/";

        this.__dataSourceOnChange = (data) => {
            this.forceUpdate()
        }

        this.__queryChange = () => {
            if (_.isFunction(this.props.loader)) {
                this.props.loader(this.query, this.datasource)
            }
        }
    }

    componentDidMount() {
        this.datasource.on("change", this.__dataSourceOnChange)
        this.query.on("change", this.__queryChange)

        let me = ReactDOM.findDOMNode(this)
        $(me).find(".selection-row")
            .mouseenter(function () {
                $(this).find(".action").stop().fadeIn(250)
            })
            .mouseleave(function () {
                $(this).find(".action").stop().fadeOut(250)
            })
            .find(".action").hide()

        $(me)
            .focus(() => {
                $(me).addClass("fg-toggled")
            })
            .blur(() => {
                $(me).removeClass("fg-toggled")
            })

        $(me).find(".lookup-grid").modal({show: false})

        if (_.isFunction(this.props.loader)) {
            this.props.loader(this.query, this.datasource)
        }
    }

    componentWillUnmount() {
        this.datasource.off("change", this.__dataSourceOnChange)
        this.query.off("change", this.__queryChange)
    }

    showEntities(e) {
        e.stopPropagation()

        if (!this.dialogAlreadyOpened) {
            if (this.props.query) {
                this.props.query.invokeChange()
            }
        }
        this.dialogAlreadyOpened = true

        let me = ReactDOM.findDOMNode(this)
        $(me).find(".lookup-grid").modal("show")
    }

    select() {
        let me = ReactDOM.findDOMNode(this)
        $(me).find(".lookup-grid").modal("hide")

        let model = this.props.model
        let field = this.props.field
        let grid = this.refs.searchGrid
        let current = optional(model.get(field.property), [])
        let selection = optional(grid.getSelection(), [])
        let mode = this.checkedMode()
        let result = null
        if (mode == "single") {
            if (selection.length == 0) {
                return
            }

            result = selection[0]
        } else if (mode == "multiple") {
            result = _.union(current, [])
            selection.forEach(s => {
                let comparer = r => {
                    if (_.has(s, "id")) {
                        return s.id == r.id
                    } else {
                        return _.isEqual(s, r)
                    }
                }
                if (!_.any(result, comparer)) {
                    result.push(s)
                }
            })
        }

        model.set(field.property, result)

        this.forceUpdate()
    }

    remove(e) {
        e.stopPropagation()

        let mode = this.checkedMode()
        if (mode == "single") {
            this.removeAll()
        } else if (mode == "multiple") {
            this.removeSelection()
        }
    }

    removeRow(row) {
        let model = this.props.model
        let field = this.props.field
        let current = optional(model.get(field.property), [])
        let result = _.filter(current, r => {
            if (_.has(row, "id")) {
                return row.id != r.id
            } else {
                return !_.isEqual(row, r)
            }
        })
        model.set(field.property, result)

        this.forceUpdate()
    }

    removeSelection() {
        let model = this.props.model
        let field = this.props.field
        let grid = this.refs.selectionGrid
        let selection = grid.getSelection()
        let current = optional(model.get(field.property), [])
        let result = _.filter(current, (c) => {
            return !_.any(selection, r => {
                if (_.has(c, "id")) {
                    return c.id == r.id
                } else {
                    return _.isEqual(c, r)
                }
            })
        })
        model.set(field.property, result)

        this.forceUpdate()
    }

    removeAll() {
        let mode = this.checkedMode()
        let model = this.props.model
        let field = this.props.field
        let v = null
        if (mode == "single") {
            v = null
        } else if (mode == "multiple") {
            v = []
        }
        model.set(field.property, v)

        this.forceUpdate()
    }

    checkedMode() {
        let mode = this.props.mode
        if ("multiple" != mode && "single" != mode) {
            throw new Error("Please specify a mode for lookup: [single|multiple]")
        }
        return mode
    }

    getHeaderText() {
        let field = this.props.field
        let mode = this.checkedMode()
        let model = this.props.model
        let value = model.get(field.property)

        if (_.isEmpty(value)) {
            return <span className="placeholder">{this.getPlaceholderText()}</span>
        } else {
            return this.getCurrentValueDescription()
        }
    }

    getCurrentValueDescription() {
        let model = this.props.model
        let field = this.props.field
        let mode = this.checkedMode()

        if (mode == "multiple") {
            let rows = model.get(field.property)
            return rows.length == 1 ? M("oneElementSelected") : format(M("nElementsSelected"), rows.length)
        } else if (mode == "single") {
            let row = model.get(field.property)
            if (row == null) {
                return ""
            }

            let customFormatter = field.formatter || this.props.formatter
            let formatter = _.isFunction(customFormatter) ? customFormatter : (row) => {
                if (_.has(row, "name")) {
                    return row["name"]
                } else if (_.has(row, "description")) {
                    return row["description"]
                } else {
                    return JSON.stringify(row)
                }
            }

            return formatter(row)
        }
    }

    onGridKeyDown(e) {
        if (isCancel(e.which)) {
            this.remove(e)
            e.preventDefault()
        }
    }

    getPlaceholderText() {
        let field = this.props.field

        if (field.placeholder) {
            return field.placeholder
        } else {
            return M("nothingSelected")
        }
    }

    openEntity(e) {
        e.stopPropagation()

        let enabled = optional(parseBoolean(this.props.enable), true)
        if (!enabled) {
            return;
        }

        let model = this.props.model
        let field = this.props.field
        let current = optional(model.get(field.property), [])

        if (!_.isEmpty(current)) {
            ui.navigate(this.entityPrefixUrl + this.props.entity + "/" + current.id, true)
        }
    }

    createEntity(e) {
        e.stopPropagation()
        ui.navigate(this.entityPrefixUrl + this.props.entity + "/new", true)
    }


    render() {
        let mode = this.checkedMode()
        let model = this.props.model
        let field = this.props.field
        let rows = model.get(field.property) || []
        let selectionGrid = mode == "multiple" ? _.assign({}, this.props.selectionGrid, {
            columns: _.union(this.props.selectionGrid.columns, [{
                cell: ActionsCell,
                tdClassName: "grid-actions",
                actions: [
                    {icon: "zmdi zmdi-delete", action: (row) => this.removeRow(row)}
                ]
            }])
        }) : null
        let addClassName = "zmdi zmdi-more"


        let openEntity = mode == "single" && !_.isEmpty(this.props.entity) && rows.length !== 0 && optional(this.props.openEntity, hasPermission([this.props.entity + ":edit"]))
        let createEntity = !_.isEmpty(this.props.entity) && optional(this.props.openEntity, hasPermission([this.props.entity + ":new"]))


        return (
            <div className="fg-line" tabIndex="0">
                <div className="lookup" style={{marginBottom: "0px"}}>
                    <div className="lookup-header" onClick={this.showEntities.bind(this)}>
                        <div className="actions">
                            <a href="javascript:;" className="actions__item" title={M("remove")}
                               onClick={this.remove.bind(this)}><i className="zmdi zmdi-close"/></a>
                            <a href="javascript:;" className="actions__item" title={M("add")}
                               onClick={this.showEntities.bind(this)}><i className={addClassName}/></a>
                            {openEntity &&
                            <a href="javascript:;" className="actions__item m-r-0" title={M("openEntity")}
                               onClick={this.openEntity.bind(this)}><i className="zmdi zmdi-open-in-new"/></a>}
                            {createEntity &&
                            <a href="javascript:;" className="actions__item m-r-0" title={M("createEntity")}
                               onClick={this.createEntity.bind(this)}><i className="zmdi zmdi-plus"/></a>}

                        </div>
                        <span className="lookup-current-value">{this.getHeaderText()}</span>
                        <div className="clearfix"></div>
                    </div>

                    {mode == "multiple" &&
                    <Grid
                        ref="selectionGrid"
                        descriptor={selectionGrid}
                        data={resultToGridData({rows: rows, totalRows: rows.length})}
                        showInCard="false"
                        quickSearchEnabled="false"
                        headerVisible="false"
                        footerVisible="false"
                        summaryVisible="false"
                        noResultsVisible="false"
                        paginationEnabled="false"
                        tableClassName="table table-condensed table-hover"
                        onKeyDown={this.onGridKeyDown.bind(this)}
                    />
                    }
                </div>

                <div className="lookup-grid modal fade" id="myModal" tabIndex="-1" role="dialog"
                     aria-labelledby="myModalLabel">
                    <div className="modal-dialog modal-lg" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="myModalLabel">{field.label}</h5>
                            </div>
                            <div className="modal-body">
                                <Grid
                                    ref="searchGrid"
                                    descriptor={this.props.popupGrid}
                                    data={resultToGridData(this.datasource.data)}
                                    query={this.props.query}
                                    showInCard="false"
                                    quickSearchEnabled="true"
                                    footerVisible="true"
                                    selectWithCheck="true"
                                    summaryVisible="true"
                                    paginationEnabled="true"
                                    tableClassName="table table-condensed table-hover"
                                    onRowDoubleClick={this.select.bind(this)}
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-link ok-button"
                                        onClick={this.select.bind(this)}>{M("ok")}</button>
                                <button type="button" className="btn btn-link"
                                        data-dismiss="modal">{M("cancel")}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export class File extends Control {
    constructor(props) {
        super(props)

        this.state = {filename: null}
    }

    onFileSelected(e) {
        let model = this.props.model
        let field = this.props.field
        let file = e.target.files[0]
        inputfile.readDataUrl(file).then(result => {
            model.set(field.property, result)
            this.setState({filename: file.name})
        })
    }

    remove(e) {
        e.preventDefault()
        e.stopPropagation()

        let model = this.props.model
        let field = this.props.field
        model.set(field.property, null)
        this.setState({filename: null})
    }

    search(e) {
        e.preventDefault()
        e.stopPropagation()

        let me = ReactDOM.findDOMNode(this)
        $(me).find("input[type=file]").click()
    }

    render() {
        let model = this.props.model
        let field = this.props.field
        let value = model.get(field.property)
        let hasValue = !_.isEmpty(value)

        return (
            <div className="input-file fg-line" tabIndex="0">
                <div onClick={this.search.bind(this)}>
                    {!hasValue ?
                        <div>
                            <div className="actions pull-right">
                                <a href="javascript:;" title={M("search")} onClick={this.search.bind(this)}
                                   className="m-r-0"><i className="zmdi zmdi-search"/></a>
                            </div>
                            <span className="placeholder">{field.placeholder}</span>
                        </div>
                        :
                        <div>
                            <div className="actions pull-right">
                                <a href="javascript:;" title={M("remove")} onClick={this.remove.bind(this)}
                                   className="m-r-0"><i className="zmdi zmdi-close"/></a>
                            </div>
                            <span className="input-file-name"><span
                                className="zmdi zmdi-file"></span> {this.state.filename}</span>
                        </div>
                    }
                </div>

                <input type="file" accept={field.accept} onChange={this.onFileSelected.bind(this)}/>
            </div>
        )
    }
}

export class Image extends Control {
    constructor(props) {
        super(props)
    }

    onFileSelected(e) {
        let model = this.props.model
        let field = this.props.field
        let file = e.target.files[0]
        inputfile.readDataUrl(file).then(result => {
            model.set(field.property, result)
            this.forceUpdate()
        })
    }

    delete(e) {
        e.stopPropagation()
        e.preventDefault()

        let model = this.props.model
        let field = this.props.field
        let me = ReactDOM.findDOMNode(this)
        $(me).find("input[type=file]").val(null)

        model.set(field.property, null)
        this.forceUpdate()
    }

    search(e) {
        e.preventDefault()
        e.stopPropagation()

        let me = ReactDOM.findDOMNode(this)
        $(me).find("input[type=file]").click()
    }

    render() {
        let model = this.props.model
        let field = this.props.field
        let accept = field.accept || ".jpg,.png,.jpeg,.gif,.bmp"

        let imgStyle = {
            "backgroundRepeat": "no-repeat",
            "backgroundSize": "contain",
            "backgroundPosition": "center",
            "height": "150px",
            "backgroundColor": "#F2F2F2"
        }
        if (this.props.width) {
            imgStyle.width = this.props.width
        }
        if (this.props.height) {
            imgStyle.height = this.props.height
        }

        let imageData = model.get(field.property)

        return (
            <div className="input-image">
                <div onClick={this.search.bind(this)}>
                    {!_.isEmpty(imageData) ?
                        <div className="input-image-container">
                            <div className="actions">
                                <a href="javascript:;" onClick={this.delete.bind(this)} className="delete-button"><i
                                    className="zmdi zmdi-close"></i></a>
                            </div>
                            <div className="input-image"
                                 style={_.assign(imgStyle, {"backgroundImage": `url("${imageData}")`})}></div>
                        </div>
                        :
                        <div className="input-image"
                             style={_.assign(imgStyle, {"backgroundImage": `url("resources/images/noimage.png")`})}></div>
                    }
                </div>
                <input type="file" accept={accept} onChange={this.onFileSelected.bind(this)}/>
            </div>
        )
    }
}

export class Gallery extends Control {
    constructor(props) {
        super(props)
        this.state = {images: []};
        this.model = this.props.model;
        this.field = this.props.field;
        this.counter = 0;

    }

    componentDidMount() {


        this.model.once("load", () => {

            let value = optional(this.model.get(this.field.property), []);
            _.assign(this.state, {images: value});
            this.forceUpdate()
        })
    }


    onImageAdd(newImage) {

        let images = optional(this.state.images, []);

        if (!_.any(images, i => i === newImage)) {
            images.push(newImage);
            _.assign(this.state, {images: images})

            this.model.set(this.field.property, images)
            this.forceUpdate()
            return true;
        }

        return false;
    }

    onImageDelete(imageToRemove) {
        let images = optional(this.state.images, []);

        images = _.filter(images, i => i !== imageToRemove)
        _.assign(this.state, {images: images})
        this.model.set(this.field.property, images)
        this.forceUpdate()

    }


    createSingleImageComponent(imageData) {
        this.counter++;

        return <SingleImage key={this.field.property + "_" + this.counter}
                            imageData={imageData}
                            onImageAdd={this.onImageAdd.bind(this)}
                            onImageDelete={this.onImageDelete.bind(this)}
        />
    }

    render() {
        let images = optional(this.state.images, []);
        let fields = [];
        let actions = [];

        if (images.length > 0) {
            _.forEach(images, (e) => {
                fields.push(this.createSingleImageComponent(e))
            })

        }

        fields.push(this.createSingleImageComponent())

        return (
            <div>
                {fields}

            </div>


        )
    }
}

export class MultiFile extends Control {
    constructor(props) {
        super(props)
        this.state = {files: []};
        this.model = this.props.model;
        this.field = this.props.field;
        this.counter = 0;
        this.fileTypes = this.field.fileTypes || "*";
    }

    componentDidMount() {

        this.model.once("load", () => {

            let value = optional(this.model.get(this.field.property), []);
            _.assign(this.state, {files: value});
            this.forceUpdate()
        })
    }


    onAdd(newFile) {
        let files = optional(this.state.files, []);

        if (!_.any(files, i => i.data === newFile.data)) {
            files.push(newFile);
            _.assign(this.state, {files: files})

            this.model.set(this.field.property, files)
            this.forceUpdate()
            return true;
        }

        return false;
    }

    onDelete(toRemove) {
        let files = optional(this.state.files, []);
        files = _.filter(files, i => i.data !== toRemove.data)
        _.assign(this.state, {files: files})
        this.model.set(this.field.property, files)
        this.forceUpdate()

    }


    createSingleFileComponent(data) {
        this.counter++;

        return <SingleFile key={this.field.property + "_" + this.counter}
                           file={data ? data : {}}
                           fileTypes={this.fileTypes}
                           onAdd={this.onAdd.bind(this)}
                           onDelete={this.onDelete.bind(this)}
        />
    }

    render() {
        let files = optional(this.state.files, []);
        let fields = [];
        let actions = [];
        let title = optional(this.props.field.title, M("attachments"))

        if (files.length > 0) {
            _.forEach(files, (e) => {
                fields.push(this.createSingleFileComponent(e))
            })

        }

        fields.push(this.createSingleFileComponent())

        return (
            <div>
                <HeaderBlock title={title} label={this.props.field.label} actions={actions}/>
                {fields}

            </div>


        )
    }
}

export class SingleImage extends Control {
    constructor(props) {
        super(props)


        this.state = {data: props.data}
    }

    onFileSelected(e) {
        let file = e.target.files[0]
        inputfile.readDataUrl(file).then(result => {
            if (_.isFunction(this.props.onImageAdd)) {
                if (this.props.onImageAdd(result)) {
                    _.assign(this.state, {imageData: result})
                    this.forceUpdate()
                }
            }

        })
    }

    delete(e) {
        e.stopPropagation()
        e.preventDefault()

        let me = ReactDOM.findDOMNode(this)
        $(me).find("input[type=file]").val(null)

        let image = this.state.imageData;
        _.assign(this.state, {imageData: null})
        this.forceUpdate()
        if (_.isFunction(this.props.onImageDelete)) {
            this.props.onImageDelete(image)
        }

    }

    search(e) {

        e.preventDefault()
        e.stopPropagation()

        let me = ReactDOM.findDOMNode(this)
        $(me).find("input[type=file]").click()
    }

    render() {
        let accept = ".jpg,.png,.jpeg,.gif,.bmp"

        let imgStyle = {
            "backgroundRepeat": "no-repeat",
            "backgroundSize": "contain",
            "backgroundPosition": "center",
            "height": "150px",
            "backgroundColor": "#F2F2F2"
        }
        if (this.props.width) {
            imgStyle.width = this.props.width
        }
        if (this.props.height) {
            imgStyle.height = this.props.height
        }

        let imageData = optional(this.state.imageData, null)

        return (
            <div className="input-image col-sm-4 col-ms-6" style={{marginBottom: '5px'}}>
                <div onClick={this.search.bind(this)}>
                    {!_.isEmpty(imageData) ?
                        <div className="input-image-container">
                            <div className="actions">
                                <a href="javascript:;" onClick={this.delete.bind(this)} className="delete-button"><i
                                    className="zmdi zmdi-close"></i></a>
                            </div>
                            <div className="input-image"
                                 style={_.assign(imgStyle, {"backgroundImage": `url("${imageData}")`})}></div>
                        </div>
                        :
                        <div className="input-image"
                             style={_.assign(imgStyle, {"backgroundImage": `url("resources/images/noimage.png")`})}></div>
                    }
                </div>
                <input type="file" accept={accept} onChange={this.onFileSelected.bind(this)}/>
            </div>
        )
    }
}

export class PasswordText extends Control {
    render() {
        let field = this.props.field

        return (
            <div className="fg-line">
                <input
                    type="password"
                    className="form-control input-sm"
                    id={field.property}
                    data-property={field.property}
                    placeholder={field.placeholder}
                    value={optional(this.props.model.get(field.property), "")}
                    onChange={this.onValueChange.bind(this)}/>
            </div>
        )
    }
}

export class SingleFile extends Control {
    constructor(props) {
        super(props)

        let filename = optional(props.file.filename, null);
        let data = optional(props.file.data, null);
        let base64 = optional(props.file.base64, null);

        this.state = {filename: filename, data: data, base64: base64}
    }

    onFileSelected(e) {
        let file = e.target.files[0]
        showLoader()
        inputfile.readDataUrl(file).then(result => {
            if (_.isFunction(this.props.onAdd)) {
                this.props.onAdd({data: result, filename: file.name, base64: true})
            }
            hideLoader()
        })
    }

    remove(e) {
        e.stopPropagation()
        e.preventDefault()


        if (_.isFunction(this.props.onDelete)) {
            this.props.onDelete({data: this.state.data, filename: this.state.filename})
        }
    }

    download(e) {
        e.preventDefault()
        e.stopPropagation()

        let value = optional(this.state.data, null)

        let url = config.get("service.url") + value
        window.open(url)
    }


    search(e) {
        e.preventDefault()
        e.stopPropagation()

        let me = ReactDOM.findDOMNode(this)

        //Serve per invocare il change se si seleziona un file uguale al precedente
        $(me).find("input[type=file]").val("")
        $(me).find("input[type=file]").click()
    }

    render() {

        let value = optional(this.state.data, null)
        //let fileName = optional(this.state.filename, null)
        let hasValue = !_.isEmpty(value)
        let readOnly = optional(this.props.readOnly, false)
        let canDownload = hasValue && !value.includes("base64");
        let component = null
        let fileTypes = optional(this.props.fileTypes, "*")

        if (!hasValue) {
            component = (
                <div>
                    <div className="actions pull-right">
                        <a href="javascript:;" title={M("search")} onClick={this.search.bind(this)} className="m-r-0"><i
                            className="zmdi zmdi-search"/></a>
                    </div>
                    <span className="placeholder"></span>
                </div>
            )
        } else {
            component = (
                <div>
                    <div className="actions pull-right">
                        {readOnly &&
                        <a href="javascript:;" title={M("remove")} onClick={this.remove.bind(this)} className="m-r-0"><i
                            className="zmdi zmdi-close"/></a>}
                        {canDownload && <a href="javascript:;" title={M("download")} onClick={this.download.bind(this)}
                                           className="m-r-0"><i className="zmdi zmdi-download"/></a>}
                    </div>
                    <span className="input-file-name"><span className="zmdi zmdi-file"/> {this.state.filename} </span>
                </div>
            )
        }

        return (
            <div className="col-sm-4 col-ms-6" style={{marginBottom: '5px'}}>
                <div className="input-file fg-line" tabIndex="0">
                    <div onClick={this.search.bind(this)}>
                        {component}
                    </div>

                    <input type="file" accept={fileTypes} onChange={this.onFileSelected.bind(this)}/>
                </div>
            </div>

        )
    }
}

export const MULTI_FILE_MODE_SINGLE = "multiFileSingle";
export const MULTI_FILE_MODE_MULTIPLE = "multiFileMultiple";

//Dropzone
export class NewMultiFile extends Control {
    constructor(props) {
        super(props)
        this.state = {files: []};
        this.model = this.props.model;
        this.field = this.props.field;
        this.dropzone = null;
        this.addRemoveLinks = this.props.addRemoveLinks;
        this.maxFilesize = this.props.maxFilesize || null;
        this.maxFiles = optional(this.props.maxFiles, null);
        this.mode = this.props.mode || MULTI_FILE_MODE_MULTIPLE;
        this.acceptedFiles = this.props.acceptedFiles || null;
        this.disableInitOnModelLoad = this.props.disableInitOnModelLoad || false
    }

    isMultiple() {
        return this.mode === MULTI_FILE_MODE_MULTIPLE;
    }

    initDropzone() {
        if (this.dropzone != null)
            this.dropzone.destroy();

        $(ReactDOM.findDOMNode(this)).find("div#dropzone").html("")

        this.dropzone = new Dropzone("div#dropzone", this.generateOptions());

        //if multiple is an array else is an object
        let value = optional(this.model.get(this.field.property), null);
        let files = [];
        if (this.isMultiple() && value != null) {
            files.push(value)
        } else {
            if (value)
                files = value ? value : files;
        }
        _.assign(this.state, {files: files});

        if (_.isFunction(this.props.onValueChange)) {
            if (this.isMultiple())
                this.props.onValueChange(files, this.model);
            else
                this.props.onValueChange(value, this.model);
        }

        let filesToAdd = _.isArray(files) ? files : [files]

        var filtered = _.filter(filesToAdd, f => f != null)
        if (filtered) {
            _.forEach(filtered, f => {
                this.dropzone.options.addedfile.call(this.dropzone, f)
                this.dropzone.emit("success", f);
                this.dropzone.emit("complete", f);
                this.dropzone.options.maxFiles--;
            })
        }

        // files.forEach((f) =>    this.dropzone.options.addedfile.call(this.dropzone, f))
        this.forceUpdate()
    }

    componentDidMount() {

        if (!this.disableInitOnModelLoad) {
            this.model.once("load", () => {
                this.initDropzone();
            })
        } else {
            this.dropzone = new Dropzone("div#dropzone", this.generateOptions());
        }


    }

    componentWillUnmount() {
        if (this.dropzone != null)
            this.dropzone.destroy();
    }

    generateOptions() {
        let options = {};
        options.url = config.get("upload.url");

        options.headers = {
            'token': getSessionToken()
        }

        options.timeout = 180000

        if (this.acceptedFiles) {
            options.acceptedFiles = this.acceptedFiles;
        }
        if (this.maxFiles) {
            options.maxFiles = this.maxFiles;
        }
        if (this.maxFilesize) {
            options.maxFilesize = this.maxFilesize;
        }

        if (this.addRemoveLinks && _.isFunction(this.addRemoveLinks)) {
            options.addRemoveLinks = this.addRemoveLinks(this.model);
        }

        options.dictRemoveFileConfirmation = M("areYouSure");

        options.success = this.onAdd.bind(this)
        options.error = this.onError.bind(this);
        options.removedfile = this.onDelete.bind(this);
        return options;
    }

    onError(file, errorMessage) {
        this.dropzone.removeFile(file)
        toast(errorMessage)

    }

    generateToken() {
        return session.getSessionToken()
    }

    onAdd(file, uploadedFile) {
        if ((uploadedFile == null || !uploadedFile.value) && !file.path) {
            toast("Errore durante l'upload del file")

        } else {
            let files = optional(this.state.files, []);

            let newFile = uploadedFile != null ? uploadedFile.value : file
            newFile.size = file.size

            if (!this.disableInitOnModelLoad) {
                $(file.previewElement).click(() => {
                    location.href = config.get("attachment.download") + "?path=" + newFile.path + "&filename=" + newFile.name + "&__TOKEN=" + encodeURIComponent(getSessionToken());
                })

                if (!_.any(files, i => i != null && i.data === newFile.data)) {
                    files.push(newFile);
                    _.assign(this.state, {files: files})

                    this.model.set(this.field.property, (this.isMultiple()) ? files : newFile)
                    if (_.isFunction(this.props.onValueChange)) {
                        this.props.onValueChange(newFile, this.model);
                    }

                    this.forceUpdate()
                    return true;
                }
            } else {
                if (_.isFunction(this.props.onValueChange)) {
                    this.props.onValueChange(newFile);
                }
                this.dropzone.removeAllFiles(true);
            }
            return false;
        }

    }

    onDelete(toRemove) {

        if (!this.disableInitOnModelLoad) {
            let files = optional(this.state.files, []);
            files = _.filter(files, i => i.data !== toRemove.data)
            _.assign(this.state, {files: files})
            this.model.set(this.field.property, this.isMultiple() ? files : null);
            this.initDropzone()

            if (_.isFunction(this.props.onValueChange)) {
                this.props.onValueChange(null, this.model);
            }
        }


    }

    render() {
        let files = optional(this.state.files, []);
        let fields = [];
        let actions = [];
        let title = this.props.field != null ? optional(this.props.field.title, M("attachments")) : ""

        if (files.length > 0) {
            //_.forEach(files, (e) => {fields.push(this.createSingleFileComponent(e))})
        }

        if (this.filesNumber === null || (this.filesNumber !== null && files.length < this.filesNumber)) {
            // fields.push(this.createSingleFileComponent())
        }

        let label = this.props.field != null ? this.props.field.label : ""

        return (
            <div>
                {(label != "" || title != "" || actions.length > 0) &&
                <HeaderBlock title={title} label={label} actions={actions}/>}
                <div id="dropzone" className="dropzone">
                </div>

            </div>


        )
    }
}

export class FieldContainer extends React.Component {

}

export class Column extends FieldContainer {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        let me = ReactDOM.findDOMNode(this);
        $(me).parent().css("margin-bottom", "0").css("padding-bottom", "10px").css("padding-top", "20px");
    }

    setValueInModel(model, property, value) {
        let i;
        property = property.split('.');
        for (i = 0; i < property.length - 1; i++) {
            if (i === 0) {
                model = model.data[property[i]];
            } else if (model != null) {
                model = model[property[i]];
            }
        }
        if (model != null)
            model[property[i]] = value;
    }

    render() {

        let className = optional(this.props.className, "")
        className += " " + optional(this.props.size, "col-sm-12")
        // let size = _.isFunction(this.props.field.getSize) ? this.props.field..getSize(this.props.model) : optional(this.props.size, "col-sm-12")
        let style = {};
        if (this.props.field.noLateralPadding) {
            style.paddingLeft = "0";
            style.paddingRight = "0";
        }

        let defaultFieldCass = Field;
        let fields = this.props.field.fields;
        let descriptor = this.props.descriptor;

        let fieldsComponents = !_.isEmpty(fields) && _.filter(fields, f => isFieldVisible(f, descriptor, this.props.model)).map((f, i) => React.createElement(optional(() => f.component, () => defaultFieldCass), {
            key: f.property + "-" + i,
            model: this.props.model,
            field: f,
            descriptor: descriptor,
            onCancel: this.props.onCancel
        }));

        return (

            <div className={className} style={style}>
                {!_.isEmpty(this.props.title) &&
                <h4>{this.props.title}</h4>
                }
                <div className="row">
                    {fieldsComponents}
                </div>
            </div>

        );

    }

}

export class Button extends React.Component {
    onClick() {
        if (_.isFunction(this.props.onClick)) {
            this.props.onClick(this.props.model)
        }
    }

    render() {

        let disabled = _.isFunction(this.props.isDisabled) ? this.props.isDisabled(this.props.model) : false

        return (
            <button onClick={this.onClick.bind(this)} type="button" className={this.props.className + " btn"}
                    style={{fontWeight: 700, width: "100%"}} disabled={disabled}>{this.props.text}</button>
        )
    }
}

export class AdvancedTextEditor extends Control {
    constructor(props) {
        super(props);
        this.emptyEditorValue = "<p><br></p>";
        this.formatProperty = safeGet(props.field, "formatProperty", "format");
        this.formatDatasource = TextFormatDatasource;
        this.format = props.format != null ? props.format : TextFormat.ADVANCED_TEXT.value;
        this.state = {
            showFormatModal: false,
            submit: false,
        };
        this.randomId = Math.floor(Math.random() * (9999 - 1));
    }

    getEditorDOMElement() {
        return $(ReactDOM.findDOMNode(this)).find(".jodit_container");
    }

    getEditorTarget() {
        return this.editor;
    }

    componentDidMount() {
        this.initEditor();
        notificationCenter.addObserver("refreshEditor:clicked", this.reloadEditor.bind(this))
    }

    generateButtons() {
        let buttons = this.props.readOnlyForm ? [] : [
            // this.getModeButton()
        ];

        if (this.format === TextFormat.ADVANCED_TEXT.value) {
            buttons.push(
                {name: "bold", icon: "bold", tooltip: M("bold")},
                {name: "strikethrough", icon: "strikethrough", tooltip: M("strikethrough")},
                {name: "underline", icon: "underline", tooltip: M("underline")},
                {name: "italic", icon: "italic", tooltip: M("italic")},
                {name: "|", icon: "|"},
                // {name: "superscript", icon: "superscript", tooltip: M("superscript")},
                // {name: "subscript", icon: "subscript", tooltip: M("subscript")},
                // {name: "|", icon: "|"},
                {name: "ul", icon: "ul", tooltip: M("ul")},
                {name: "ol", icon: "ol", tooltip: M("ol")},
                {name: "outdent", icon: "outdent", tooltip: M("outdent")},
                {name: "indent", icon: "indent", tooltip: M("indent")},
                {name: "|", icon: "|"},
                // {name: "font", icon: "font", tooltip: M("font")},
                // {name: "fontsize", icon: "fontsize", tooltip: M("fontsize")},
                {name: "brush", icon: "brush", tooltip: M("brush")},
                // {name: "paragraph", icon: "paragraph", tooltip: M("paragraph")},
                {name: "align", icon: "left", tooltip: M("align")},
                {name: "hr", icon: "hr", tooltip: M("hr")},
                {name: "|", icon: "|"},
                // {name: "symbol", icon: "omega", tooltip: M("symbol")},
                // {name: "table", icon: "table", tooltip: M("table")},
                // {name: "|", icon: "|"},
                {name: "link", icon: "link", tooltip: M("link")},
                // {name: "image", icon: "image", tooltip: M("image")},
                // {name: "video", icon: "video", tooltip: M("video")},
            );
        }

        return buttons;
    }

    initEditor() {
        let self = this;
        let placeholder = _.isFunction(this.props.field.getPlaceholder) ? this.props.field.getPlaceholder(this.props.model) : optional(this.props.field.placeholder, this.props.placeholder);
        if (placeholder == null)
            placeholder = M("writeCommentHere");
        let buttons = this.generateButtons();

        let mode = this.format === TextFormat.HTML.value ? Jodit.MODE_SOURCE : Jodit.MODE_WYSIWYG;

        let askBeforePasteHTML = this.format !== TextFormat.SIMPLE_TEXT.value;

        let height = optional(this.props.field.height, 200);
        let minHeight = optional(this.props.field.minHeight, 165);

        Jodit.defaultOptions.controls.table.data.classList = [];

        let popupImages = [
            {name: 'bin'},
            {name: 'pencil'},
            {name: 'valign'},
            {name: 'left'},
        ];

        this.editor = new Jodit(this.getComponentId(), {
            "askBeforePasteHTML": askBeforePasteHTML,
            "askBeforePasteFromWord": askBeforePasteHTML,
            "defaultActionOnPaste": askBeforePasteHTML ? "" : "insert_clear_html",
            "readonly": optional(this.props.readOnlyForm, false),
            "toolbarSticky": false,
            "toolbarAdaptive": false,
            "height": height,
            "minHeight": minHeight,
            "buttons": buttons,
            "defaultMode": mode,
            "placeholder": placeholder,
            "allowResizeY": false,
            "spellcheck": false,
            "showCharsCounter": false,
            "showWordsCounter": false,
            "showXPathInStatusbar": false,
            "addNewLineOnDBLClick ": false,
            "enter": 'br',
            "addNewLine": false,
            "limitChars": optional(this.props.maxLength, null),
            "events": {
                getIcon: function (name, control, clearName) {
                    switch (clearName) {
                        case 'textFormat':
                            return '<div style="width: auto !important; padding-left: 10px; padding-right: 10px;"><span style="font-size:14px;">' + self.getFormatName() + '</span></div>';
                    }
                },
                change: function (newValue, oldValue) {
                    self.onChange(newValue);
                },
                afterOpenPasteDialog: (dialog, msg, title, callback) => {
                    $(".jodit_dialog_header-title").text(M("pasteAsHtml"));
                    $(".jodit_promt").text(M("pasteAsHtmlDescription"));
                    $($(".jodit_button span")[0]).text(M("keep"));
                    $($(".jodit_button span")[1]).text(M("insertAsText"));
                    $($(".jodit_button span")[2]).text(M("insertOnlyText"));
                    $($(".jodit_button span")[3]).text(M("cancel"));
                },
            },
        });

        //post init ops
        let editorDOMElement = this.getEditorDOMElement(); //summernote doesn't even assign custom placeholder to codeview mode

        // editorDOMElement.find(".jodit_toolbar_btn-textFormat").css({"position":"absolute", "right":"0", "padding-right": "10px"});
        editorDOMElement.find(".jodit_toolbar").addClass("min-height-32");
        let value = this.getValue();
        if (value)
            this.updateEditor(value);//value update
    }

    getValue() {
        return optional(this.props.content, null)
    }

    onChange(newValue) {
        if (_.isFunction(this.props.onChange))
            this.props.onChange(newValue)
    }

    getFormatName() {
        switch (this.format) {
            case TextFormat.SIMPLE_TEXT.value:
                return TextFormat.SIMPLE_TEXT.label;
            case TextFormat.ADVANCED_TEXT.value:
                return TextFormat.ADVANCED_TEXT.label;
            case TextFormat.HTML.value:
                return TextFormat.HTML.label;
        }
    }

    // getValue() {
    //     let model = this.model;
    //     let property = this.props.field.property;
    //     let value = model.get(property);
    //     value = this.format !== TextFormat.HTML.value ? objectUtils.textToHtml(value) : value
    //     return value;
    // }

    // setValue(editorContents) {
    //     let value = editorContents === this.emptyEditorValue ? null : editorContents;
    //     if (_.isFunction(this.props.onChange))
    //         this.props.onChange(value);
    //     else {
    //         let props = this.props;
    //         let model = props.model;
    //         let property = props.field.property;
    //
    //         if (this.format === TextFormat.SIMPLE_TEXT.value) {
    //             value = objectUtils.stripHtml(value);
    //         }
    //         model.set(property, value);
    //     }
    // }

    generateComponentId() {
        return this.props.field.property + "_editor_" + this.randomId;
    }

    getComponentId() {
        return "#" + this.props.field.property + "_editor_" + this.randomId;
    }

    updateEditor(modelValue) {
        let target = this.getEditorTarget();
        let editorDOMElement = this.getEditorDOMElement();
        let editorValue = target.getEditorValue();
        //if necessary, strip code of HTML tags. Otherwise handle updates
        if (modelValue != null && !_.isArray(modelValue) && modelValue !== editorValue) {
            target.setEditorValue(modelValue);
        }

        target.setMode(this.format === TextFormat.HTML.value ? Jodit.MODE_SOURCE : Jodit.MODE_WYSIWYG);
    }

    destroyEditor() {
        let target = this.getEditorTarget();
        if (target)
            target.destruct();
    }

    reloadEditor() {
        try {
            this.destroyEditor();
            this.initEditor();
        } catch (e) {

        }
    }

    manageFormat(callback = null) {
        let modelFormat = this.getFormat();
        let currentFormat = this.format;
        //se format non è presente o è un valore non valido inizializzo a default
        if (
            (_.isNull(modelFormat) || _.isUndefined(modelFormat) || _.isEmpty(modelFormat.toString())) ||
            !_.contains(
                _.map(this.formatDatasource.data.rows, r => r.value.toString()),
                modelFormat.toString()
            )
        ) {
            this.setFormat(TextFormat.SIMPLE_TEXT.value);
        } else if (modelFormat !== currentFormat) { //se l'editor non è allineato al formato corrente
            this.format = modelFormat;
            this.reloadEditor();
        } else {
            //eseguo eventuali callback
            if (_.isFunction(callback)) {
                callback();
            }
        }
    }

    onHidden() {
        if (this.state.submit) {
            this.setState(
                {
                    submit: false,
                    showFormatModal: false,
                },
                function () {
                    this.setFormat(TextFormat.SIMPLE_TEXT.value);
                }
            );
        } else {
            this.setState(
                {
                    submit: false,
                    showFormatModal: false,
                }
            )
        }
    }

    hide(e) {
        if (e != null)
            e.preventDefault();
        // $(ReactDOM.findDOMNode(this)).find('[role="dialog"]').modal("hide");
        this.onHidden()
    }

    submit(e) {
        if (e != null)
            e.preventDefault();
        this.setState({submit: true}, function () {
            this.hide();
        })
    }

    componentWillUnmount() {
        notificationCenter.removeObserver("refreshEditor:clicked", this.reloadEditor.bind(this))
        this.destroyEditor()
    }

    render() {
        let id = this.generateComponentId();

        return (
            <div key={id} className="html-editor">
                <div id={id}/>
                {this.state.showFormatModal &&
                <Dialog
                    noPadding={true}
                    backdrop={false}
                    keyboard={false}
                    headerHidden={true}
                    footerHidden={true}
                    className={"areYouSureModal modal-p-0"}
                    onHidden={this.onHidden.bind(this)}
                >
                    <div className="p-l-30 p-r-30 p-b-30">
                        <div className="p-t-30 ff-roboto fs-18 fw-medium color-primary-active">
                            <div className="wrapper-zmdi-24 m-r-10"><i className="zmdi zmdi-alert-circle-o"></i></div>
                            {M("areYouSure")}
                        </div>
                        <div className="p-t-30">
                            {M("allFormattingWillBeLost")}
                        </div>
                    </div>
                    <div className="wizard-footer bradius-b p-30">
                        <div className="row">
                            <div className="col-sm-6 text-center text-left-sm">
                                <button
                                    className="btn btn-primary-invert btn-w-medium waves-effect"
                                    onClick={this.hide.bind(this)}
                                >
                                    {M("cancel")}
                                </button>
                            </div>
                            <div className="m-b-16 visible-xs-block"/>
                            <div className="col-sm-6 text-center text-right-sm">
                                <button
                                    className="btn btn-primary btn-w-medium btn-shadow waves-effect"
                                    onClick={this.submit.bind(this)}>
                                    {M("confirm")}
                                </button>
                            </div>
                        </div>
                    </div>
                </Dialog>
                }
            </div>
        )
    }
}

export class NewComment extends React.Component {
    constructor(props) {
        super(props);
    }

    onChange(newValue) {
        if (_.isFunction(this.props.onChange))
            this.props.onChange(newValue)
    }

    toggleEditor() {
        if (_.isFunction(this.props.toggleEditor))
            this.props.toggleEditor();
    }

    onSave(e) {
        if (e != null) {
            e.preventDefault();
        }
        if (_.isFunction(this.props.onSave))
            this.props.onSave()
    }

    onCancel(e) {
        if (e != null) {
            e.preventDefault();
        }
        if (_.isFunction(this.props.onCancel))
            this.props.onCancel()
    }

    isDisabled() {
        return optional(this.props.loading, false)
    }

    render() {
        let field = this.props.field;
        let showCancelButton = optional(this.props.showCancelButton, false);
        let showSaveButton = optional(this.props.showSaveButton, true);
        return (
            <div style={{width: "100%"}}>
                {!this.props.showEditor ?
                    <div className="fake-comment-input" onClick={this.toggleEditor.bind(this)}>
                        <span>{M("writeCommentHere")}</span>
                    </div>
                    :
                    <div className="edit-comment-container">
                        <AdvancedTextEditor content={this.props.content} field={field}
                                            onChange={this.onChange.bind(this)}/>
                        {showSaveButton && <button key="save" disabled={this.isDisabled()} type="button"
                                                   className={"float-right btn-link btn waves-effect ok-button m-t-8 m-l-16"}
                                                   onClick={this.onSave.bind(this)}>{M("save")}</button>
                        }
                        {showCancelButton && <button key="cancel" type="button"
                                                     className={"float-right btn btn-outline-grey btn-link waves-effect m-r-0 m-t-8 "}
                                                     onClick={this.onCancel.bind(this)}>{M("cancel")}</button>
                        }
                    </div>
                }
            </div>
        )
    }
}
