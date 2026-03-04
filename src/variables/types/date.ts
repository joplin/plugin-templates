import { DateAndTimeUtils } from "@templates/utils/dateAndTime";
import { encode } from "html-entities";
import { CustomVariable } from "./base";

export class DateCustomVariable extends CustomVariable {
    static definitionName = "date";

    // The Joplin date format (e.g. "YYYY-MM-DD"), injected by parser.ts before rendering.
    private dateFormat = "YYYY-MM-DD";

    /**
     * Called by parser.ts before the dialog is rendered so the flatpickr
     * date picker can use the user's configured Joplin date format.
     */
    public setDateFormat(format: string): void {
        this.dateFormat = format;
    }

    public processInput(input: string, dateAndTimeUtils: DateAndTimeUtils): string {
        // Parse the typed/picked date using Joplin's date format, then
        // re-format it consistently with the same format.
        return dateAndTimeUtils.formatMsToLocal(
            dateAndTimeUtils.formatLocalToJoplinCompatibleUnixTime(input, dateAndTimeUtils.getDateFormat()),
            dateAndTimeUtils.getDateFormat()
        );
    }

    protected inputHTML(): string {
        // Use type="text" so flatpickr (loaded in the dialog webview) can
        // attach its custom calendar UI. The data-datepicker-format attribute
        // tells datepicker.js which Joplin format to use (fixes issue #112).
        return `<input name="${encode(this.name)}" type="text" data-datepicker-format="${encode(this.dateFormat)}" placeholder="${encode(this.dateFormat)}" autocomplete="off"></input>`;
    }
}
