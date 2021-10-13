import _ from "underscore";
import { EQ, GTE, LTE } from "../framework/query";
import M from "../strings";
import { DateTime, Select } from "../web/components/forms";
import * as datasource from "../utils/datasource";

export const SEARCH_FORM_DATE_DESCRIPTOR = (propertyName) => _.assign({}, {
    showInCard: false,
    fields: [
        {
            property: propertyName,
            label: M("value"),
            control: DateTime,
        },
        {
            property: "_filterType",
            label: M("filterType"),
            control: Select,
            props: {
                allowNull: false,
                datasource: datasource.fixed([
                    {label: M("FILTER_GTE"), value: GTE},
                    {label: M("FILTER_LTE"), value: LTE}
                ])
            }
        }
    ]
})

export const SEARCH_FORM_NUMBER_DESCRIPTOR = (propertyName) => _.assign({}, {
    showInCard: false,
    fields: [
        {
            property: propertyName,
            label: M("value"),
            control: Number,
        },
        {
            property: "_filterType",
            label: M("filterType"),
            control: Select,
            props: {
                allowNull: false,
                datasource: datasource.fixed([
                    {label: M("FILTER_EQ"), value: EQ},
                    {label: M("FILTER_GTE"), value: GTE},
                    {label: M("FILTER_LTE"), value: LTE}
                ])
            }
        }
    ]
})

