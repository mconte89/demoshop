import React from "react";
import {optional} from "../../utils/lang";
import {isEnter} from "../utils/keyboard";
import * as ui from "../utils/ui";
import _ from "underscore";
import ReactDOM from "react-dom";
import {hasPermission} from "../../api/session";

export class ComponentWithTooltips extends React.Component {

    constructor(props) {
        super(props);
    }

    initTooltip() {
        _.each(this.getAllTooltipItems(), i => $(i).tooltip({trigger: "hover"}))
    }

    getAllTooltipItems() {
        const me = ReactDOM.findDOMNode(this)
        let items = []
        $(me).find("[data-toggle=\"tooltip\"]").each(function() {
            items.push(this);
        })
        return items;
    }

    destroyAllTooltips() {
        _.each(this.getAllTooltipItems(), i => $(i).tooltip("dispose"))
    }

    componentDidMount() {
        this.initTooltip()
    }

    componentDidUpdate() {
        this.destroyAllTooltips();
        this.initTooltip()
    }

    componentWillUnmount() {
        this.destroyAllTooltips()
    }
}

export class DropdownActionButton extends React.Component {
    componentDidMount() {
        let button = this.refs.button
        $(button).dropdown()
    }

    onItemClick(item) {
        if (_.isFunction(item.action)) {
            item.action.apply(this, this.props.arguments)
        }
    }

    render() {
        let index = 0
        let dropdownItems = _.map(this.props.action.items, i =>             
            <li key={index++}>
                <a role="menuitem" tabIndex="-1" onClick={this.onItemClick.bind(this, i)}>
                    {!_.isEmpty(i.icon) &&
                        <i className={i.icon} />
                    }

                    {i.label}
                </a>
            </li>            
        )

        let dropdownMenuClass = "dropdown-menu pull-left"
        let align = optional(this.props.action.align, "left")
        if (align === "right") {
            dropdownMenuClass = "dropdown-menu pull-right"
        }

        return (
            <div className="dropdown">
                <a  
                    ref="button"
                    href="#"
                    className={this.props.className}
                    data-toggle="dropdown"
                    data-placement="bottom"
                    title={this.props.action.tooltip}>

                    <i className={this.props.action.icon}></i>
                </a>
                <ul className={dropdownMenuClass}>
                    {dropdownItems}
                </ul>
            </div>
        )
    }
}

export class ActionButton extends React.Component {
    onClick() {
        let action = this.props.action
        if (_.isFunction(action.action)) {
            action.action.apply(this, this.props.arguments)
        }
    }

    componentDidMount() {
        $(this.refs.button).tooltip({trigger: "hover"});
    }

    componentWillUnmount() {
        $(this.refs.button).tooltip("dispose");
    }

    render() {
        let className = "actions__item"
        if (this.props.className) {
            className += " " + this.props.className
        }

        return (
            <a  
                ref="button" 
                
                className={className}
                data-toggle="tooltip" 
                data-placement="bottom" 
                title={this.props.action.tooltip} 
                onClick={this.onClick.bind(this)}>
                <i className={this.props.action.icon}></i>
            </a>
        )
    }
}
export class Actions extends React.Component {

    getPermittedActions() {
        return _.filter(this.props.actions, a => hasPermission(a.permissions) === true)
    }

    render() {
        let actionKey = 1
        let actions = this.getPermittedActions()

        return (
            !_.isEmpty(actions) &&
            <div className="actions">
                {actions.map(a => React.createElement(Actions.getButtonClass(a), {key: actionKey++, action: a}))}
            </div>

        )
    }
}

Actions.getButtonClass = function(action) {
    switch (action.type) {
        case "dropdown":
            return DropdownActionButton
        default:
            return ActionButton
    }
}

export class HeaderBlock extends React.Component {
    render() {
        return (
            <header className="content__title">
                {(!_.isEmpty(this.props.title)) &&
                    <h1>{this.props.title}</h1>
                }

                {!_.isEmpty(this.props.subtitle) &&
                    <small>{this.props.subtitle}</small>
                }

                {(!_.isEmpty(this.props.actions)) &&
                    <Actions actions={this.props.actions} />
                }
            </header>
        )
    }
}

export class Card extends React.Component {
    render() {
        let actionKey = 1
        let cardClass = optional(this.props.className, "card");
        let bodyClass = "card-body"
        if (this.props.padding) {
            bodyClass += " card-padding"
        }
        let titleClass = "card-title"
        if (this.props.inverseHeader) {
            titleClass += " card-title-inverse"
        }
        let subtitleClass = "card-subtitle"
        if (this.props.inverseHeader) {
            subtitleClass += " card-subtitle-inverse"
        }
        return (
            <div className={cardClass}>
                <div className={bodyClass}>
                    {!_.isEmpty(this.props.title) &&
                        <h4 className={titleClass}>{this.props.title}</h4>
                    }

                    {!_.isEmpty(this.props.subtitle) &&
                        <h6 className={subtitleClass}>{this.props.subtitle}</h6>
                    }

                    {!_.isEmpty(this.props.actions) &&
                        <Actions actions={this.props.actions} />
                    }

                    {this.props.children}
                </div>
            </div>
        )
    }
}

export class FloatingButton extends React.Component {
    onClick() {
        if (_.isFunction(this.props.onClick)) {
            this.props.onClick()
        }
    }

    render() {
        return (
            <button type="button" className="btn btn--action btn-primary" onClick={this.onClick.bind(this)}><i className={this.props.icon}></i></button>
        )
    }
}


export class ActionsMatcher {
    constructor(defaultActions) {
        this.defaultActions = defaultActions
    }

    match(userActions) {
        let actions = []

        if (userActions) {
            if (!_.isArray(userActions)) {
                throw new Error("grid.actions must be an array but is " + userActions)
            }

            _.each(userActions, a => {
                if (_.isObject(a)) {
                    actions.push(a)
                } else if (typeof a === "string") {
                    let defaultAction = _.find(this.defaultActions, d => d.id === a)
                    if (!_.isEmpty(defaultAction)) {
                        actions.push(defaultAction)
                    } else {
                        logger.w("Default action not found: " + a)
                    }
                }
            })
        } else {
            actions = this.defaultActions
        }

        return actions;
    }
}


export class EditableText extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            editing: _.isEmpty(props.value),
            value: props.value
        }
    }

    componentWillReceiveProps(newProps) {
        this.setState({
            editing: _.isEmpty(newProps.value),
            value: newProps.value
        })
    }

    onBlur() {
        this.setState({editing: false, value: this.state.lastValue})
    }

    onValueChange(e) {
        e.preventDefault()
        e.stopPropagation()

        this.setState(_.assign(this.state, {editing: true, value: e.target.value}))
    }

    onKeyDown(e) {
        if (isEnter(e.which)) {
            e.preventDefault()
            e.stopPropagation()

            this.setState(_.assign(this.state, {editing: false, lastValue: this.state.value}))

            if (_.isFunction(this.props.onChange)) {
                this.props.onChange(this.state.value)
            }
        }
    }

    edit() {
        this.setState(_.assign(this.state, {editing: true, lastValue: this.state.value}))
    }

    render() {
        let className = this.props.className
        return (
            (this.state.editing || _.isEmpty(this.state.value))  ?
                <div className={"fg-line editable-text " + optional(className, "")}>
                    <input
                        ref="name"
                        type="text"
                        className="form-control"
                        onKeyDown={this.onKeyDown.bind(this)}
                        onChange={this.onValueChange.bind(this)}
                        value={optional(this.state.value, "")}
                        placeholder={this.props.placeholder}
                        autoFocus="autoFocus"
                        onBlur={this.onBlur.bind(this)}/>
                </div>
                :
                <span className={optional(className, "")} onClick={this.edit.bind(this)}>{this.state.value}</span>
        )
    }
}


export class HeaderBlockWithBreadcrumbs extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {

        let title;
        if (_.isArray(this.props.title)) {
            title = this.props.title.map((item, i) => <BreadcrumbItem key={i} title={item.title} url={item.url} first={i == 0} last={i < this.props.title.length -1} />);

        } else {
            title = <span dangerouslySetInnerHTML={{__html: this.props.title}}></span>
        }

        return (
            <header className="content__title">
                {(!_.isEmpty(title)) &&
                <h1>{title}</h1>
                }

                {!_.isEmpty(this.props.subtitle) &&
                <small>{this.props.subtitle}</small>
                }

                {(!_.isEmpty(this.props.actions)) &&
                <Actions actions={this.props.actions} />
                }
            </header>
        )
    }
}

class BreadcrumbItem extends React.Component {
    constructor(props) {
        super(props)
    }

    onClick() {
        if (this.props.url) {
            ui.navigate(this.props.url)
        }
    }

    render() {
        

        let style = { marginLeft:  !this.props.first ? "10px" : "px"}
        if (this.props.url)
            style.cursor = "pointer";

        let iconStyle= {
            marginLeft: "10px"
        }
        return (
            <span onClick={this.onClick.bind(this)} style={style}>
                <span dangerouslySetInnerHTML={{__html: this.props.title}}></span>
                {this.props.last && <i style={iconStyle} className="zmdi zmdi-caret-right"/>}
            </span>
        )
    }


}
