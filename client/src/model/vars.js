import M from "../strings";
import _ from "underscore"
import * as datasource from "../utils/datasource";


export const TextFormat = {
    SIMPLE_TEXT: {
        value: 0,
        label: M("simpleText"),
    },
    ADVANCED_TEXT: {
        value: 1,
        label: M("advancedText"),
    },
    HTML: {
        value: 2,
        label: M("html"),
    },
};
export const TextFormatDatasource = datasource.fixed(
    _.map(TextFormat,f=>f)
);
