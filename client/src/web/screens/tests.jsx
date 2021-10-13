import React from "react"
import {Layout} from "../components/layout"
import Secure from "../components/secure"
import { connect } from "../../utils/aj-react"
import { EntitiesStore } from "../../stores/entities"
import { discriminated } from "../../utils/ajex"
import { loadEntities, saveEntity, deleteEntities } from "../../actions/entities"
import ProfileImage from "../components/covid/profileImage"
import moment from "moment"
import { optional } from "../../utils/lang"
import * as query from "../../framework/query"
import M from "../../strings"
import { confirm } from "../../plugins"
import { getResultColor, getResultText } from "../../model/test"

const TestItem = (props) => {
    const test = props.test;
    const profile = test.profile;

    function setResult(result) {
        confirm("Vuoi modificare il risultato del test?").then(() => {
            test.result = result;
            saveEntity({entity: "test", discriminator: "tests", data: test}).then(() => {
                loadEntities({entity: "test", discriminator: "tests", query: query.create()})
            })            
        }).catch(e => console.error(e))
    }

    function deleteTest() {
        confirm("Eliminare il test?").then(() => {
            deleteEntities({entity: "test", discriminator: "tests", ids: [test.id]}).then(() => {
                loadEntities({entity: "test", discriminator: "tests", query: query.create()})
            })            
        }).catch(e => console.error(e))
    }

    return (
        <div key={test.id} className="listview__item">
            <ProfileImage profile={profile} size={50} fontSize={16} />

            <div className="listview__content text-truncate text-truncate" style={{paddingLeft: 16}}>
                <a className="listview__heading" href="">Tampone con risultato {M(test.type)} di <b>{profile.firstName} {profile.lastName}</b></a>
                <p>{profile.address.address}, {profile.address.city} ({profile.address.province}), {profile.fiscalCode}, {profile.phoneNumber}</p>
            </div>

            <div className="issue-tracker__item hidden-sm-down">
                <span className="issue-tracker__tag" style={{backgroundColor: getResultColor(test)}}>{getResultText(test)}</span>
            </div>

            <div className="issue-tracker__item hidden-md-down">
                <i className="zmdi zmdi-time"></i>{moment(test.date).format("YYYY/MM/DD hh:mm")}
            </div>

            <div className="issue-tracker__item actions">
                <div className="dropdown actions__item">
                    <i className="zmdi zmdi-more-vert" data-toggle="dropdown"></i>

                    <div className="dropdown-menu dropdown-menu-right dropdown-menu--active dropdown-menu--icon">
                        <a onClick={() => setResult("positive")} className="dropdown-item"><i className="zmdi zmdi-check"></i>Imposta esito positivo</a>
                        <a onClick={() => setResult("negative")} className="dropdown-item"><i className="zmdi zmdi-close"></i>Imposta esito negativo</a>
                        <a onClick={() => deleteTest()} className="dropdown-item"><i className="zmdi zmdi-delete"></i>Elimina test</a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export const TestsScreen = (props) => {

    const tests = optional(props.tests, []).map(t => <TestItem test={t} />)

    return (
        <Secure>
            <Layout>
                <header className="content__title">
                    <h1>Tamponi</h1>
                </header>
                
                <div className="card issue-tracker">
                    <div className="toolbar toolbar--inner">
                        <div className="toolbar__nav">
                            <a className="active" onClick={props.onInit}>Tutti</a>
                            <a onClick={props.onLoadPositive}>Positivi</a>
                            <a onClick={props.onLoadNegative}>Negativi</a>
                            <a onClick={props.onLoadUnknown}>In attesa</a>
                        </div>
                    </div>

                    <div className="listview listview--bordered">
                        {tests}
                        <div className="clearfix m-4"></div>
                    </div>
                </div>

            </Layout>
        </Secure>
        
    )
}


const stateMapper = (state) => ({
    tests: optional(() => discriminated(state, "tests").result.rows, []),
})

const actionsMapper = () => ({
    onInit: () => loadEntities({entity: "test", discriminator: "tests", query: query.create().setPage(1).setRowsPerPage(200)}),
    onLoadPositive: () => loadEntities({entity: "test", discriminator: "tests", query: query.create().eq("result", "positive").setPage(1).setRowsPerPage(200)}),
    onLoadNegative: () => loadEntities({entity: "test", discriminator: "tests", query: query.create().eq("result", "negative").setPage(1).setRowsPerPage(200)}),
    onLoadUnknown: () => loadEntities({entity: "test", discriminator: "tests", query: query.create().eq("result", "unknown").setPage(1).setRowsPerPage(200)}),
})


const TestsScreenContainer =  connect(TestsScreen).to(EntitiesStore, stateMapper, actionsMapper)

export default TestsScreenContainer