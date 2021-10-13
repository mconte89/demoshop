import React, { useEffect, useState } from "react"
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
import Services from "../../api/genericApi"
import {Network, DataSet} from "vis"
import * as ui from "../utils/ui"

function flatten(parent, nodes, edges) {
    
    nodes.add({
        id: parent.id,
        profileId: parent.profile.id,
        label: parent.profile.firstName + " " + parent.profile.lastName,
        group: parent.test.result,
        shape: "circle",
        color: getResultColor(parent.test),
    });

    function inner(p, nodes, edges, shape) {
        p.children.forEach(child => {
            nodes.add({
                id: child.id,
                profileId: child.profile.id,
                label: child.profile.firstName + " " + child.profile.lastName,
                shape: shape,
                color: getResultColor(child.test),
            });
    
            edges.add({
                from: p.id,
                to: child.id
            });

            inner(child, nodes, edges, "box");
        });
    }

    inner(parent, nodes, edges, "triangle");
    
}



export const ContactTracing = (props) => {
    const [title, setTitle] = useState("");    

    useEffect(() => {
        Services.get("ct/" + props.profileId)
            .then(response => {

                const trace = response.value;

                setTitle(trace.profile.firstName + " " + trace.profile.lastName);
                
                var nodes = new DataSet();
                var edges = new DataSet();

                flatten(trace, nodes, edges);

                console.log(nodes, edges);

                // create a network
                var container = document.getElementById('ct_network');
                var data = {
                    nodes: nodes,
                    edges: edges
                };

                var options = {
                    nodes: {
                        borderWidth: 4,
                        color: {
                          border: '#222222',
                        },
                        font:{}
                      },
                };

                const network = new Network(container, data, options);

                network.on("doubleClick", (params) => {
                    const id = params.nodes[0];
                    const node = nodes.get(id);
                    
                    ui.navigate("/entities/profile/" + node.profileId, true);
                });

            })
            .catch(e => alert(e));
    }, []);

    return (
        <Secure>
            <Layout>
                <header className="content__title">
                    <h1>Catena dei contatti di {title}</h1>
                </header>
                
                <div className="card issue-tracker">
                    <div id="ct_network" style={{height: $(window).height() - 200}}></div>
                </div>
            </Layout>
        </Secure>
        
    )
}

export default ContactTracing;