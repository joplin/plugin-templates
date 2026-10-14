import { DateAndTimeUtils } from "@templates/utils/dateAndTime";
import { encode } from "html-entities";
import * as moment from "moment";
import { CustomVariable } from "./base";

export class DateCustomVariable extends CustomVariable {
    static definitionName = "date";

    public processInput(input: string, dateAndTimeUtils: DateAndTimeUtils): string {
        if (!input || input.trim() === "") {
            return "";
        }

        const dateFormat = dateAndTimeUtils.getDateFormat();

        try {
            return dateAndTimeUtils.formatMsToLocal(
                dateAndTimeUtils.formatLocalToJoplinCompatibleUnixTime(input, dateFormat),
                dateFormat
            );
        } catch {
            // If the user typed an ISO date (e.g. YYYY-MM-DD), try parsing as ISO
            const isoParsed = moment(input, moment.ISO_8601, true);
            if (isoParsed.isValid()) {
                return dateAndTimeUtils.formatMsToLocal(isoParsed.valueOf(), dateFormat);
            }

            // Fall back to raw input rather than throwing, preventing the template dialog from crashing
            return input;
        }
    }

    protected inputHTML(dateAndTimeUtils?: DateAndTimeUtils): string {
        const dateFormat = dateAndTimeUtils ? dateAndTimeUtils.getDateFormat() : "YYYY-MM-DD";
        // Use type="text" so flatpickr (loaded in the dialog webview) can
        // attach its custom calendar UI. The data-datepicker-format attribute
        // tells datepicker.js which Joplin format to use (fixes issue #112).
        return `<input name="${encode(this.name)}" type="text" data-datepicker-format="${encode(dateFormat)}" placeholder="${encode(dateFormat)}" autocomplete="off" aria-label="${encode(this.label)}"></input>`;
    }
}
