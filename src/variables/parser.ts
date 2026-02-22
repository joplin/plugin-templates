import { CustomVariable, InvalidDefinitionError } from "./types/base";
import { BooleanCustomVariable } from "./types/boolean";
import { DateCustomVariable } from "./types/date";
import { EnumCustomVariable } from "./types/enum";
import { InvalidCustomVariable } from "./types/invalid";
import { NumberCustomVariable } from "./types/number";
import { TextCustomVariable } from "./types/text";
import { TimeCustomVariable } from "./types/time";
import { SearchCustomVariable } from "./types/search";

// NOTE - InvalidCustomVariable should be at the last of the list
// because it accepts any definition.
const VARIABLE_TYPES = [
    TextCustomVariable,
    NumberCustomVariable,
    BooleanCustomVariable,
    DateCustomVariable,
    TimeCustomVariable,
    EnumCustomVariable,
    SearchCustomVariable,
    InvalidCustomVariable
];

export const getVariableFromDefinition = (name: string, definition: unknown): CustomVariable => {
    for (const variableType of VARIABLE_TYPES) {
        try {
            const variable = variableType.createFromDefinition(name, definition);
            return variable;
        } catch (err) {
            if (err instanceof InvalidDefinitionError) {
                continue;
            }

            throw err;
        }
    }

    // This ideally should never happen. "InvalidCustomVariable" accepts
    // all definitions.
    throw Error("No valid definition for variable: " + name);
}
