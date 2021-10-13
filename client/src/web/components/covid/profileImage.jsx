import React from "react"
import { optional } from "../../../utils/lang";

const ProfileImage = (props) => {

    function getInitials() {
        var firstName = optional(props.profile.firstName, "?").toUpperCase();
        var lastName = optional(props.profile.lastName, "?").toUpperCase();
        let initials = firstName.substring(0, 1) + lastName.substring(0, 1);
        return initials;
    }

    function getRandomBackgrund() {
        return `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
    }

    const width = optional(props.size, 80);
    const height = optional(props.size, 80);
    const fontSize = optional(props.fontSize, 36);

    return <>
        <div className={"profile-image " + optional(props.className, "")} style={{backgroundColor: getRandomBackgrund(), height, width, fontSize}}>{getInitials()}</div>
    </>
}

export default ProfileImage