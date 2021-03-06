import React from "react";
import ReactDOM from "react-dom";
import {forceBoolean, optional, parseBoolean} from "../../utils/lang";
import _ from "underscore";

export const DIALOG_RESULT_OK = 0
export const DIALOG_RESULT_CANCEL = 1

export class Dialog extends React.Component {

    constructor(props) {
        super(props)

        this.opened = false
        this.dialogResult = DIALOG_RESULT_CANCEL
    }

    componentDidMount() {
        let me = ReactDOM.findDOMNode(this)
        $(me)
            .modal({show: false})
            .on("show.bs.modal", () => {
                this.opened = true
                if (_.isFunction(this.props.onShow)) {
                    this.props.onShow()
                }
            })
            .on("hide.bs.modal", (e) => {
                if (forceBoolean(this.props.notHide)) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }else {
                    this.opened = false
                    if (_.isFunction(this.props.onClose)) {
                        this.props.onClose(this.dialogResult)
                    }
                }
            })
            
        if (!this.props.hidden) {
            if (!this.opened) {
                this.opened = true
                this.show()
            }
        } else {
            if (this.opened) {
                this.opened = false
                this.hide()
            }
        }
    }

    componentDidUpdate() {
        if (!this.props.hidden) {
            if (!this.opened) {
                this.opened = true
                this.show()
            }
        } else {
            if (this.opened) {
                this.opened = false
                this.hide()
            }
        }
    }

    show() {
        let me = ReactDOM.findDOMNode(this)
        $(me).modal("show")
    }

    hide() {
        let me = ReactDOM.findDOMNode(this)
        $(me).modal("hide")
    }

    runButtonAction(button) {
        this.dialogResult = optional(button.dialogResult, DIALOG_RESULT_CANCEL)
        button.action(this)
    }

    render() {
        let buttons = optional(this.props.buttons, []).map(b => <button key={b.text} type="button" className={"btn btn-link " + optional(b.extraClassName, "")} onClick={this.runButtonAction.bind(this, b)}>{b.text}</button>)
        let style = {
            //display: this.props.hidden ? "none" : "block"
        }

        let headerHidden = parseBoolean(optional(this.props.headerHidden, false))
        let bodyStyle = {
            padding: this.props.noPadding ? "0px" : undefined
        }

        let modalDialogClassName = "modal-dialog"
        modalDialogClassName += parseBoolean(this.props.large) ? " modal-lg" : ""

        return (
            <div className="modal fade" role="dialog" tabIndex="-1" style={style}>
                <div className={modalDialogClassName}>
                    <div className="modal-content">
                        {!headerHidden &&
                            <div className="modal-header">
                                <h5 className="modal-title">{this.props.title}</h5>
                            </div>
                        }
                        <div className="modal-body" style={bodyStyle}>
                            {this.props.children}
                        </div>
                        <div className="modal-footer">
                            {buttons}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}