import { DateAndTimeUtils } from "../utils/dateAndTime";

export class HelperContext {
    public dateAndTimeUtils: DateAndTimeUtils;

    constructor(dateUtils: DateAndTimeUtils) {
        this.dateAndTimeUtils = dateUtils;
    }
}
