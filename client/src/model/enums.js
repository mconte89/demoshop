import { EQ, GT, GTE, LIKE, LT, LTE} from "../framework/query";

export const FilterTypeMap = new Map([
    [GTE, "	≥"],
    [GT, ">"],
    [LTE, "≤"],
    [LT, "<"],
    [EQ, "="],
    [LIKE, "≈"]
])