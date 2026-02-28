import joplin from "api";
import { SettingItemType } from "api/types";
import { PluginSetting } from "./base";

export interface KeyboardShortcutEntry {
  /** The Joplin Note ID of the template to use */
  templateId: string;
  /** The action to perform: "newNote", "newTodo", or "insertText" */
  action: "newNote" | "newTodo" | "insertText";
  /** Human-readable label shown in the menu */
  label: string;
  /** Optional accelerator string, e.g. "Ctrl+Alt+1". Leave empty to have no shortcut key. */
  accelerator: string;
}

export const KEYBOARD_SHORTCUT_SLOTS = 10;

/**
 * Stores an array of keyboard shortcut entries serialised as a JSON string.
 * Each entry maps a template (by ID) + action to an accelerator.
 *
 * Example value (displayed in Joplin settings as a multi-line text area):
 * [
 *   { "templateId": "abc123", "action": "newNote", "label": "Daily note", "accelerator": "Ctrl+Alt+1" },
 *   { "templateId": "def456", "action": "insertText", "label": "Meeting notes", "accelerator": "Ctrl+Alt+2" }
 * ]
 */
export const KeyboardShortcutsSetting: PluginSetting<KeyboardShortcutEntry[]> =
  class {
    static id = "templateKeyboardShortcuts";
    static manifest = {
      public: true,
      type: SettingItemType.String,
      value: "[]",
      label: "Template keyboard shortcuts (JSON)",
      description:
        "Define custom keyboard shortcuts for templates. " +
        "Provide a JSON array where each item has: " +
        '"templateId" (note ID of the template), ' +
        '"action" ("newNote", "newTodo", or "insertText"), ' +
        '"label" (menu label), and ' +
        '"accelerator" (e.g. "Ctrl+Alt+1" — leave empty for no shortcut). ' +
        "You can add up to " +
        KEYBOARD_SHORTCUT_SLOTS +
        " entries. " +
        "Restart Joplin after saving.",
      section: "templatesPlugin",
    };

    static async get(): Promise<KeyboardShortcutEntry[]> {
      const raw: string = await joplin.settings.value(
        KeyboardShortcutsSetting.id,
      );
      try {
        const parsed = JSON.parse(raw || "[]");
        if (!Array.isArray(parsed)) return [];
        return parsed.slice(0, KEYBOARD_SHORTCUT_SLOTS);
      } catch {
        return [];
      }
    }

    static async set(newValue: KeyboardShortcutEntry[]): Promise<void> {
      await joplin.settings.setValue(
        KeyboardShortcutsSetting.id,
        JSON.stringify(newValue),
      );
    }
  };
