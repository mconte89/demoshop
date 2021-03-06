import React from "react";
import ReactDOM from "react-dom";
import {MenuStore} from "../../stores/menu";
import {SessionStore} from "../../stores/session";
import {UIStore} from "../../stores/ui";
import {expandMenuItem, setActiveMenuItem} from "../../actions/menu";
import {logout} from "../../actions/session";
import * as ui from "../utils/ui";
import {GlobalLoader, PageLoader, UnobtrusiveLoader} from "./loader";
import {connect} from "../utils/aj";
import {optional, parseBoolean} from "../../utils/lang";
import M from "../../strings";
import _ from "underscore"
import {SystemStore} from "../../stores/system";
import {systemInformation} from "../../actions/system";
import HeaderExtra from "./extra/headerExtra"
import globalComponents from "./extra/globalComponents"
import { isControlPressed } from "../utils/keyboard";

function showPageLoader() {
    $(".page-loader").show()
}

function hidePageLoader() {
    $(".page-loader").fadeOut(500)
}

class Header extends React.Component {
    render() {
        return (
            <header id="header" className="header clearfix">
                <div className={"navigation-trigger " + (this.props.sideBarHidden ? "" : "hidden-xl-up")} data-ma-action="aside-open" data-ma-target=".sidebar">
                    <div className="navigation-trigger__inner">
                        <i className="navigation-trigger__line"></i>
                        <i className="navigation-trigger__line"></i>
                        <i className="navigation-trigger__line"></i>
                    </div>
                </div>

                <div className="header__logo hidden-sm-down">
                    <h1><a href="#"><img src="resources/images/logo.png" style={{height: 36, paddingTop: 4}} /></a></h1>
                </div>
                {/*<HeaderExtra />*/}
            </header>
        )
    }
}

class ProfileBox extends React.Component {

    constructor(props) {
        super(props)

        connect(this, [SessionStore, UIStore])

        this.state = {}
    }

    logout() {
        logout()
        ui.navigate("/login")
    }

    render() {
        return (
            <div className="user">
                <div className="user__info" data-toggle="dropdown">
                        {this.state.profileImage ?
                            <img className="user__img" src={this.state.profileImage} alt="" />
                            :
                            <img className="user__img" src="resources/images/ic_perm_identity.png" alt="" />
                        }
                    <div>
                        <div className="user__name">{optional(() => this.state.user.name, "NA")}</div>
                        <div className="user__email">{optional(() => this.state.user.mail, "NA")}</div>
                    </div>
                </div>

                <div className="dropdown-menu">
                    <a className="dropdown-item" onClick={this.logout.bind(this)}><i className="zmdi zmdi-time-restore"></i> Logout</a>
                </div>
            </div>
        )
    }
}

class MenuLevel extends React.Component {
    onSelect(item, e) {
        if (item.href) {
            if (isControlPressed()) {
                window.open(item.href)
            }else {
                location.href = item.href
            }
        }

        if (_.isFunction(this.props.onSelect)) {
            this.props.onSelect(item, e)
        }

        let hasChildren = !_.isEmpty(item.children)
        if (hasChildren) {
            this.onExpand(item)
        }

        e.preventDefault();
    }

    onExpand(item) {
        if (_.isFunction(this.props.onExpand)) {
            this.props.onExpand(item)
        }
    }

    render() {
        let menu = optional(this.props.menu, [])
        let isMainMenu = optional(parseBoolean(this.props.isMainMenu), false)

        let key = 1
        let items = menu.map(i => {
            let className = ""
            if (i.active) { className += "navigation__active" }
            let hasChildren = !_.isEmpty(i.children)
            if (hasChildren) { className += " navigation__sub" }
            if (i.expanded) { className += " toggled" }

            return (
                <li key={key++} className={className}>
                    <a onClick={this.onSelect.bind(this, i)} data-ma-action={hasChildren ? "submenu-toggle" : undefined} >
                        <i className={i.icon}></i> {i.text}
                    </a>

                    {hasChildren &&
                        <MenuLevel parent={i} menu={i.children} onExpand={this.onExpand.bind(this, i)}  />
                    }
                </li>
            )
        })

        let expanded = !isMainMenu && this.props.parent.expanded === true
        let style = {}
        if (expanded) {
            style.display = "block"
        }
        let className = ""
        if (isMainMenu) {
            className += "navigation"
        } else {
            className = "navigation__sub"
        }

        return (
            <ul className={className} style={style}>
                {items}
            </ul>
        )
    }
}

class MainMenu extends React.Component {
    onExpand(item) {
        if (_.isFunction(this.props.onExpand)) {
            this.props.onExpand(item)
        }
    }

    onSelect(item) {
        if (_.isFunction(this.props.onSelect)) {
            this.props.onSelect(item)
        }
    }


    render() {
        let menu = this.props.menu

        return (
            <MenuLevel menu={menu} isMainMenu="true" onExpand={this.onExpand.bind(this)} onSelect={this.onSelect.bind(this)}/>
        )
    }
}

class SideBar extends React.Component {
    render() {
        return (
            <aside id="sidebar" className={"sidebar " + (this.props.hidden ? "sidebar--hidden" : "")}>
                <div className="scroll-wrapper scrollbar-inner">
                    <ProfileBox />
                    <MainMenuContainer />
                </div>
            </aside>
        )
    }
}

class MainMenuContainer extends React.Component {
    constructor(props) {
        super(props)

        connect(this, MenuStore, {menu: []})
    }

    onSelect(item) {
        setActiveMenuItem({item})
    }

    onExpand(item) {
        expandMenuItem({item})
    }

    render() {
        return <MainMenu menu={this.state.menu} onExpand={this.onExpand.bind(this)} onSelect={this.onSelect.bind(this)} />
    }
}


class Footer extends React.Component {

    constructor(props) {
        super(props)
        connect(this, SystemStore, {})
    }

    componentDidMount() {
        systemInformation()
    }

    render() {
        let backendVersion = this.state.backendVersion;
        let apiVersion = this.state.apiVersion;
        let copyrightInfos = this.state.copyrightInfos;

        return (
            <footer className="footer hidden-xs-down">
                <p className="nav footer__nav">
                    {backendVersion && <span> Web: v{backendVersion}&nbsp; </span> }
                    -&nbsp;
                    {apiVersion && <span>API: v{apiVersion}&nbsp; </span>}
                    -&nbsp;
                    {copyrightInfos && <span>Copyright: {copyrightInfos}&nbsp; </span>}
                </p>
            </footer>
        )
    }
}

let GlobalTransitionTimer = null;

class LayoutTransition extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            __screen_animating: true
        }
    }

    componentDidMount() {
        if (GlobalTransitionTimer) {
            clearTimeout(GlobalTransitionTimer);
        }

        GlobalTransitionTimer = setTimeout(() => this.setState({__screen_animating: false}), 250);
    }

    render() {
        const transition = "animated animated-fast " + (this.props.transition || "fadeIn");
        let className = (this.props.className || "") + " " + (this.state.__screen_animating ? transition : "");

        return (
            <div className={className}>
                {this.props.children}
            </div>
        );
    }
}

class Layout extends React.Component {
    render() {
        return (
            <div>
                <Header/>
                <SideBar/>

                <section className="content">
                    <LayoutTransition className={this.props.layoutTransitionClassName}>
                        {this.props.children}
                    </LayoutTransition>                    
                </section>

                <Footer />
            </div>
        )
    }
}

class LayoutNoMenu extends React.Component {
    render() {
        return (
            <div>
                <Header sideBarHidden="true" />
                <SideBar hidden="true" />


                <section className="content content--full">
                    <LayoutTransition className={this.props.layoutTransitionClassName}>
                        {this.props.children}
                    </LayoutTransition>                    
                </section>

                <Footer />
            </div>
        )
    }
}


class FullScreenLayout extends React.Component {
    render() {
        return <div>{this.props.children}</div>
    }
}


class ScreenContainer extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            currentScreen: null
        }
    }

    componentDidMount()??{
        ui.addScreenChangeListener(screen => {
            //showPageLoader()
            this.setState(_.assign(this.state, {currentScreen: screen}))
            //hidePageLoader()
        })
    }

    render() {
        if (_.isEmpty(this.state.currentScreen)) {
            return <div />
        }
        return this.state.currentScreen
    }
}


class Screen extends React.Component {

}


class Index extends React.Component {
    constructor(props) {
        super(props)

        this.state = {}
    }

    render() {
        return (
            <div>
                <GlobalLoader />
                <UnobtrusiveLoader />
                <ScreenContainer />
                {globalComponents()}
            </div>
        )
    }
}

exports.Index = Index
exports.Screen = Screen
exports.FullScreenLayout = FullScreenLayout
exports.Layout = Layout
exports.LayoutNoMenu = LayoutNoMenu
exports.Header = Header
exports.Footer = Footer
