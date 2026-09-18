import { DateAndTimeUtils } from "@templates/utils/dateAndTime";
import { encode } from "html-entities";
import { CustomVariable } from "./base";

export class DateCustomVariable extends CustomVariable {
    static definitionName = "date";


    public processInput(input: string, dateAndTimeUtils: DateAndTimeUtils): string {
        // Parse the typed/picked date using Joplin's date format, then
        // re-format it consistently with the same format.
        return dateAndTimeUtils.formatMsToLocal(
            dateAndTimeUtils.formatLocalToJoplinCompatibleUnixTime(input, dateAndTimeUtils.getDateFormat()),
            dateAndTimeUtils.getDateFormat()
        );
    }

    protected inputHTML(dateAndTimeUtils?: DateAndTimeUtils): string {
        const dateFormat = dateAndTimeUtils ? dateAndTimeUtils.getDateFormat() : "YYYY-MM-DD";
        // Use type="text" so flatpickr (loaded in the dialog webview) can
        // attach its custom calendar UI. The data-datepicker-format attribute
        // tells datepicker.js which Joplin format to use (fixes issue #112).
        return `<input name="${encode(this.name)}" type="text" data-datepicker-format="${encode(dateFormat)}" placeholder="${encode(dateFormat)}" autocomplete="off" aria-label="${encode(this.label)}"></input>`;
    }
}
