import React from "react";
import ReactDOM from "react-dom";
import {FullScreenLayout, Screen} from "../components/layout";
import {login} from "../../actions/session";
import * as forms from "../utils/forms";
import {SessionStore} from "../../stores/session";
import {connect} from "../utils/aj";

export default class Login extends Screen {

    constructor(props) {
        super(props)

        connect(this, SessionStore)
    }

    login(e) {
        e.preventDefault()
        let data = forms.serialize(this.refs.login_form)
        login(data)
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

    componentDidUpdate() {
        if (this.state.isLoggedIn) {
            if (location.href.indexOf("login") !== -1) {
                location.href =  "/#/"
            }
        }

        const me = ReactDOM.findDOMNode(this)
        $(me).find(".form-control").change();
    }

    render() {
        return (
            <FullScreenLayout>
                <div className="login">
                    <div className="login__block active" id="l-login">
                        <div className="login__block__header">
                            <i className="zmdi zmdi-account-circle"></i>
                            Benvenuto, si prega di inserire le credenziali

                            <div className="actions actions--inverse login__block__actions">
                                <div className="dropdown">
                                    <i data-toggle="dropdown" className="zmdi zmdi-more-vert actions__item"></i>

                                    <div className="dropdown-menu dropdown-menu-right">
                                        <a className="dropdown-item" href="/#/recover">Recupera password</a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <form action="" className="lcb-form" onSubmit={this.login.bind(this)} ref="login_form">
                            <div className="login__block__body">
                                <div className="form-group form-group--centered">
                                    <label>Email</label>
                                    <input type="email" name="mail" className="form-control" autoComplete="username"/>
                                    <i className="form-group__bar"></i>
                                </div>

                                <div className="form-group form-group--centered">
                                    <label>Password</label>
                                    <input type="password" name="password" className="form-control" autoComplete="current-password" />
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


