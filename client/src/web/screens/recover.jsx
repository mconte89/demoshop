import React from "react";
import ReactDOM from "react-dom";
import {AccountStore} from "../../stores/account";
import M from "../../strings";
import {connect} from "../utils/aj";
import {FullScreenLayout, Screen} from "../components/layout";
import * as ui from "../utils/ui";
import {requestRecoveryCode, resetPassword, resetPasswordChange, validateRecoveryCode} from "../../actions/account";
import * as forms from "../utils/forms";
import {safeGet} from "../../utils/lang";
import _ from "underscore";
import {PasswordRecoveryStore} from "../../stores/passwordRecovery";

export default class Recover extends Screen {
    constructor(props) {
        super(props);
        connect(this, [AccountStore, PasswordRecoveryStore]);
    }

    requestCode(data) {
        requestRecoveryCode(data);
        return false;
    }

    requestNewCode() {
        let data = {
            mail: this.state.mail,
        };
        this.requestCode(data);
        return false;
    }

    validateCode(data) {
        data.mail = this.state.mail;
        validateRecoveryCode(data);
        return false;
    }

    resetPassword(data) {
        _.assign(data,{mail: this.state.mail, code: this.state.code});
        resetPassword(data);
        return false;
    }

    componentDidMount() {
        const me = ReactDOM.findDOMNode(this)
        $(me).find(".form-control").change(function () {
            var x = $(this).val();

            if(!x.length == 0) {
                $(this).addClass("form-control--active");
            }
        }).change();

        $(me).on("blur input", ".form-group--float .form-control", function(){
            var i = $(this).val();

            if (i.length == 0) {
                $(this).removeClass("form-control--active");
            }
            else {
                $(this).addClass("form-control--active");
            }
        });

    }

    componentWillUpdate(props, state) {
        if (state.recovered) {
            // ui.navigate("/")
        }
    }

    componentWillUnmount(props, state) {
        resetPasswordChange();
    }


    getContent(){
        let recoveryStep = safeGet(this.state,"recoveryStep", 1);
        switch (recoveryStep) {
            case 1:
                return <CodeRequestForm
                    onSubmit = {this.requestCode.bind(this)}
                />;
            case 2:
                return <CodeValidationForm
                    onSubmit = {this.validateCode.bind(this)}
                    onTryAgain = {this.requestNewCode.bind(this)}
                />;
            case 3:
                return <PasswordChangeForm
                    onSubmit = {this.resetPassword.bind(this)}
                />;
            case 4:
                return ui.navigate("/");
            default:
                return "";
        }
    }

    render() {

        let content = this.getContent();
        return (
            <FullScreenLayout>
                <div className="login">
                    <div className="login__block active" id="l-forget-password">
                        <div className="login__block__header palette-Purple bg">
                            <i className="zmdi zmdi-account-circle"></i>
                            Recupera password

                            <div className="actions actions--inverse login__block__actions">
                                <div className="dropdown">
                                    <i data-toggle="dropdown" className="zmdi zmdi-more-vert actions__item"></i>

                                    <div className="dropdown-menu dropdown-menu-right">
                                        <a className="dropdown-item" href="/#/login">Torna a login</a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="login__block__body">
                            {content}
                        </div>
                    </div>
                </div>
            </FullScreenLayout>
        )
    }

}

class CodeRequestForm extends React.Component {
    constructor(props) {
        super(props);
    }

    onSubmit() {
        let data = forms.serialize(this.refs.recover_form);
        if (_.isFunction(this.props.onSubmit)) {
            this.props.onSubmit(data);
        }
    }

    render() {
        return (
            <form onSubmit={this.onSubmit.bind(this)} action="javascript:;" className="lcb-form" ref="recover_form">
                <p className="text-left">{M("accountRecoverText")}</p>

                <div className="form-group form-group--float form-group--centered">
                    <input type="text" name="mail" className="form-control" />
                    <label>Email</label>
                    <i className="form-group__bar"></i>
                </div>

                <button title="Conferma" type="submit" className="btn btn--icon login__block__btn"><i
                    className="zmdi zmdi-check"></i></button>
            </form>
        )

    }
}

class CodeValidationForm extends React.Component {
    constructor(props){
        super(props);
    }

    onSubmit() {
        let data = forms.serialize(this.refs.validate_code_form);
        if (_.isFunction(this.props.onSubmit)) {
            this.props.onSubmit(data);
        }
    }

    onTryAgain() {
        if (_.isFunction(this.props.onTryAgain)) {
            this.props.onTryAgain();
        }
    }

    render(){
        return(
            <form action="javascript:;" className="lcb-form" onSubmit={this.onSubmit.bind(this)}
                  ref="validate_code_form">
                <p className="text-left">{M("codeValidationText")}</p>

                <div className="form-group form-group--float form-group--centered">
                    <input type="text" name="code" className="form-control" />
                    <label>Codice di validazione</label>
                    <i className="form-group__bar"></i>
                </div>

                <button
                    type="button"
                    className = "btn btn--icon login__block__btn"
                    onClick = {this.onTryAgain.bind(this)}>
                    <i title="Invia nuovo codice" className = "zmdi zmdi-refresh"/>

                </button>

                <button title="Conferma" type="submit" className="btn btn--icon login__block__btn"><i
                    className="zmdi zmdi-check"></i></button>


            </form>
        )
    }
}

class PasswordChangeForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    onSubmit(){
        let data = {
            password: this.state.password,
            passwordConfirm: this.state.passwordConfirm,
        };
        if (_.isFunction(this.props.onSubmit)) {
            this.props.onSubmit(data);
        }
    }

    updatePassword(e){
        this.setState({password: e.target.value});
    }

    updatePasswordConfirm(e){

        this.setState({passwordConfirm: e.target.value});
    }

    render(){
        return(
            <form action="javascript:;" className="lcb-form" onSubmit={this.onSubmit.bind(this)}
                  ref="validate_code_form">
                <p className="text-left">{M("newPasswordText")}</p>


                <div className="form-group form-group--float form-group--centered">
                    <input type="password" name="password" className="form-control" onChange={this.updatePassword.bind(this)}/>
                    <label>Password</label>
                    <i className="form-group__bar"></i>
                </div>
                <div className="form-group form-group--float form-group--centered">
                    <input type="password" name="passwordConfirm" className="form-control" onChange={this.updatePasswordConfirm.bind(this)}/>
                    <label>Conferma password</label>
                    <i className="form-group__bar"></i>
                </div>

                <button title="Conferma" type="submit" className="btn btn--icon login__block__btn"><i
                    className="zmdi zmdi-check"></i></button>

            </form>
        )
    }
}


