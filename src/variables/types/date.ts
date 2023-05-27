import { DateAndTimeUtils } from "@templates/utils/dateAndTime";
import { encode } from "html-entities";
import { CustomVariable } from "./base";

export class DateCustomVariable extends CustomVariable {
    static definitionName = "date";

    public processInput(input: string, dateAndTimeUtils: DateAndTimeUtils): string {
        const inputDate = new Date(input);
        return dateAndTimeUtils.formatMsToLocal(inputDate.getTime(), dateAndTimeUtils.getDateFormat());
    }

    protected inputHTML(): string {
        return `<input name="${encode(this.name)}" type="date"></input>`;
    }
}
