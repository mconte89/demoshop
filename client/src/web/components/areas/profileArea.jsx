import React from "react"
import {Area, Image} from "../forms"
import M from "../../../strings"
import * as ui from "../../utils/ui"

class ProfileArea extends Area {
    onRequestCT() {
        const model = this.props.model;
        const id = model.get("id");

        ui.navigate("/ct/" + id);
    }

    render() {
        const field = {
            property: "_picture",
            label: M("image")
        };

        const model = this.props.model;

        return (
            <div className="card profile">
                <div className="profile__img">
                    <Image model={model} field={field} />
                </div>

                <div className="profile__info">
                    <h1>{model.get("firstName")} {model.get("lastName")}</h1>

                    <ul className="icon-list">
                        <li><i className="zmdi zmdi-phone"></i>{model.get("phoneNumber")}</li>
                        <li><i className="zmdi zmdi-home"></i>{model.get("address.address")}</li>
                        <li><i className="zmdi zmdi-my-location"></i>{model.get("address.municipality")}</li>
                    </ul>
                </div>

                <div className="card-buttons">
                    <button className="btn btn-primary" type="button" onClick={this.onRequestCT.bind(this)}><i className="zmdi zmdi-link" /> Ricostruisci catena dei contatti</button>
                </div>
            </div>
        )
    }
}

export default ProfileArea;