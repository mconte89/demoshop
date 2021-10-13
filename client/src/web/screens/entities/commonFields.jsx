
import {TextCell} from "../../components/grids";
import {isSuperuser} from "../../../api/session";
import {Select} from "../../components/forms";
import {EntitiesSelectContainer, ValuesSelectContainer} from "../../components/containers";
import * as _ from "underscore";
import M from "../../../strings";
import {fixed} from "../../../utils/datasource";

export const originCell = {
    property: "originEntityId",
    header: M("origin"),
    cell: TextCell,
    sortable: true,
    searchable: true,
    visibility: () => {
        return !isSuperuser();
    },
    props: {
        formatter: (v) => {
            return v ? M("cloudCatalogue") : M("customized")
        }
    }
}

//
// export const originField = {
//     property: "originEntityId",
//     control: ReadOnlySimpleText,
//     size: "col-sm-12 no-minheight no-margin",
//     visibility: (model) => {
//         return  !isSuperuser() && model.get("id");
//     },
//     props: {
//         formatter: (v, model) => {
//             let texts = ["Origine: " + (v ? M("cloudCatalogue") : M("customized"))];
//
//
//             if (model.get("revisionInfos")) {
//
//                 let creation = model.get("revisionInfos").creation;
//                 let lastEdit = model.get("revisionInfos").lastEdit;
//
//
//                 if (creation) {
//                     texts.push("Creato il " + formatDate(creation.date) + (creation.creator ? (" da " + creation.creator) : ""))
//                 }
//
//                 if (lastEdit) {
//                     texts.push("Ultima modifica il " + formatDate(lastEdit.date) + (lastEdit.creator ? (" da " + lastEdit.creator) : ""))
//                 }
//
//
//             }
//
//             return texts.join(", ")
//         }
//     }
// };


export const activeSearchForm = {
    showInCard: false,
    fields: [
        {
            property: "active",
            label: M("active"),
            control: Select,
            filterType: "eq",
            props: {
                allowNull: true,
                datasource: fixed([
                    {label: M("active"), value: true},
                    {label: M("notActive"), value: false},
                ]),
            }
        }
    ]
};


export function entitySelectContainerField(options = {}) {

    let property = options.property;
    let label = options.label || options.property;
    let filterType = options.filterType;
    let singleItemLabelName = options.itemLabel || "fullDescription";
    let singleItemValueName = options.itemValue || "id";
    let entity = options.entity;
    let mode = options.mode || "single";
    let allowNull = options.allowNull || true;
    let isRequired = options.isRequired || false;
    let size = options.size || "col-sm-12";

    return {
        property: property,
        label: M(label),
        control: EntitiesSelectContainer,
        filterType: filterType,
        size: size,
        props: {
            id: property + new Date().getTime(),
            mode: mode,
            allowNull: allowNull,
            searchEnabled: true,
            entity: entity,
            isRequired: isRequired,
            getSingleItemLabel: (value) => {
                return value[singleItemLabelName]
            },
            getSingleItemValue: (value) => {
                return value[singleItemValueName]
            },
            formatter: v => {
                return v[singleItemLabelName]
            }
        }
    }
}

export function valuesSelectContainerField(options = {}) {

    let property = options.property;
    let label = options.label || options.property;
    let filterType = options.filterType;
    let singleItemLabelName = options.itemLabel || "fullDescription";
    let singleItemValueName = options.itemValue || "id";
    let collection = options.collection;
    let mode = options.mode || "single";
    let allowNull = options.allowNull || true;
    let isRequired = options.isRequired || false;
    let size = options.size || "col-sm-12";

    let control = _.isFunction(options.getControl) ? options.getControl(options.model) : ValuesSelectContainer;

    return {
        property: property,
        label: M(label),
        control: control,
        filterType: filterType,
        size: size,
        props: {
            id: property + new Date().getTime(),
            multiple: mode === "multiple",
            allowNull: allowNull,
            searchEnabled: true,
            collection: collection,
            isRequired: isRequired,
            getSingleItemLabel: (value) => {
                return value[singleItemLabelName]
            },
            getSingleItemValue: (value) => {
                return value[singleItemValueName]
            },
            formatter: v => {
                return v[singleItemLabelName]
            }
        }
    }
}

