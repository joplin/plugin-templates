import { DateAndTimeUtils } from "@templates/utils/dateAndTime";
import { encode } from "html-entities";
import { CustomVariable } from "./base";

export class TimeCustomVariable extends CustomVariable {
    static definitionName = "time";

    public processInput(input: string, dateAndTimeUtils: DateAndTimeUtils): string {
        const [hours, minutes] = input.split(":");
        const now = new Date();
        now.setHours(Number.parseInt(hours));
        now.setMinutes(Number.parseInt(minutes));
        return dateAndTimeUtils.formatMsToLocal(now.getTime(), dateAndTimeUtils.getTimeFormat());
    }

    protected inputHTML(): string {
        return `<input name="${encode(this.name)}" type="time" aria-label="${encode(this.label)}"></input>`;
    }
}
