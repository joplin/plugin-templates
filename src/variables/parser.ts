import { CustomVariable, InvalidDefinitionError } from "./types/base";
import { BooleanCustomVariable } from "./types/boolean";
import { EnumCustomVariable } from "./types/enum";
import { InvalidCustomVariable } from "./types/invalid";
import { NumberCustomVariable } from "./types/number";
import { TextCustomVariable } from "./types/text";

// NOTE - InvalidCustomVariable should be at the last of the list
// because it accepts any definition.
const VARIABLE_TYPES = [
    TextCustomVariable,
    NumberCustomVariable,
    BooleanCustomVariable,
    EnumCustomVariable,
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
}
