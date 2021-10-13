import React from "react"
import {Area, Image} from "../forms"
import M from "../../../strings"
import { optional } from "../../../utils/lang"
import ProfileImage from "../covid/profileImage"
import * as ui from "../../utils/ui"

class FamilyArea extends Area {

    onDetails(profile) {
        ui.navigate("/entities/profile/" + profile.id);
        location.reload();
    }

    render() {
        const field = {
            property: "_picture",
            label: M("image")
        };

        const model = this.props.model;
        const family = model.get("_family");
        const members = optional(family, []).map(m => 
            <div key={m.id} className="col-xl-2 col-lg-3 col-sm-4 col-6">
                <div className="contacts__item family__member">
                    <ProfileImage profile={m} />

                    <div className="contacts__info">
                        <strong>{m.firstName} {m.lastName}</strong>
                        <small>{m.phoneNumber}</small>
                    </div>

                    <button className="contacts__btn" onClick={this.onDetails.bind(this, m)}>{M("details")}</button>
                </div>
            </div>
        )

        return (
            <div className="card profile">
                <div className="card-body">
                    <div className="card-title">{M("family")}</div>

                    <div className="row contacts family">
                        {members}
                    </div>
                </div>
                
            </div>
        )
    }
}

export default FamilyArea;