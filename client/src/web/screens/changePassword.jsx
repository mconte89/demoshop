import React from "react";
import {FullScreenLayout, Screen} from "../components/layout";
import M from "../../strings";
import {changePassword} from "../../actions/account";

export default class ChangePassword extends Screen {

    constructor(props) {
        super(props)

        this.state = {};
    }

    changePassword(e) {
        e.preventDefault()
        changePassword({password: this.state.password, passwordConfirm: this.state.passwordConfirm, currentPassword: this.state.currentPassword})
    }

    updatePassword(value) {
        this.state.password = value.target.value;
    }

    updatePasswordConfirm(value) {
        this.state.passwordConfirm = value.target.value;
    }

    updateCurrentPassword(value) {
        this.state.currentPassword = value.target.value;
    }

    render() {
        return (
            <FullScreenLayout>
                <div className="login">
                    <div className="login__block active" id="l-login">
                        <div className="login__block__header">
                            <i className="zmdi zmdi-account-circle"></i>
                            {M("changePasswordDescription")}
                        </div>

                        <form action="" className="lcb-form"  onSubmit={this.changePassword.bind(this)} ref="changePassword_form">
                            <div className="login__block__body">
                                <div className="form-group form-group--float form-group--centered">
                                    <input type="password" onChange={this.updateCurrentPassword.bind(this)} name="password" className="form-control" placeholder={M("currentPassword")}/>
                                    <i className="form-group__bar"></i>
                                </div>
                                <div className="form-group form-group--float form-group--centered">
                                    <input type="password" onChange={this.updatePassword.bind(this)} name="password" className="form-control" placeholder={M("password")}/>
                                    <i className="form-group__bar"></i>
                                </div>

                                <div className="form-group form-group--float form-group--centered">
                                    <input type="password" name="confirmPassword"  onChange={this.updatePasswordConfirm.bind(this)} className="form-control" placeholder={M("passwordConfirm")}/>
                                    <i className="form-group__bar"></i>
                                </div>


                                <button type="submit" className="btn btn--icon login__block__btn"><i className="zmdi zmdi-long-arrow-right"></i></button>
                            </div>
                        </form>
                    </div>
                </div>
            </FullScreenLayout>
        )
    }


}


