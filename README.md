<h1 align="center">
    Templates Plugin
    <br/>
    <center>
        <img src="https://github.com/joplin/plugin-templates/actions/workflows/ci.yml/badge.svg">
        <a href="https://npmjs.com/package/joplin-plugin-templates"><img src="https://badge.fury.io/js/joplin-plugin-templates.svg" alt="npm version"></a>
        <img src="https://img.shields.io/badge/dynamic/json?color=brightgreen&label=downloads&query=%24.totalDownloads&url=https%3A%2F%2Fjoplin-plugin-downloads.vercel.app%2Fapi%3Fplugin%3Djoplin.plugin.templates">
    </center>
</h1>

This plugin allows you to create templates in Joplin and use them to create new notes and to-dos.

> **📚 New to the plugin?** Check out the [Complete Feature Demonstration Template](DEMO_TEMPLATE.md) to see all features in action with examples and expected outputs.

## Table of contents

- [Installing Plugin](#installing-plugin)
- [Importing Legacy Templates](#importing-legacy-templates)
- [Using the Template Plugin](#using-the-template-plugin)
  - [Adding a new template](#adding-a-new-template)
  - [Using templates](#using-templates)
- [Features](#features)
  - [Template variables](#template-variables)
    - [Built in variables](#built-in-variables)
    - [Custom variables](#custom-variables)
      - [Advanced Usage](#advanced-usage)
    - [Special variables](#special-variables)
  - [Advanced Template Features (Helpers)](#advanced-template-features-helpers)
    - [Compare Helper](#compare-helper)
    - [Condition Helper](#condition-helper)
    - [Math Helper](#math-helper)
    - [Case Helper](#case-helper)
    - [Repeat Helper](#repeat-helper)
    - [DateTime Helper](#datetime-helper)
  - [Default Templates](#default-templates)
    - [Global Default Templates](#global-default-templates)
    - [Notebook-Specific Default Templates](#notebook-specific-default-templates)
  - [Using notebooks to store templates](#using-notebooks-to-store-templates)
- [Changelog](#changelog)
- [Supporting](#supporting)
- [Contributing](#contributing)

## Installing Plugin
- Open Joplin
- Go to Tools > Options > Plugins
- Search for `Templates`
- Click Install plugin
- Restart Joplin to enable the plugin

## Importing Legacy Templates
- If you were already using the legacy version of templates, your templates will be automatically imported once you install the plugin. They will appear in an `Imported Templates - dd/mm/yyyy` notebook. See the `README` note in that notebook for more details.

- Your existing templates will still be present in the templates directory but will be renamed from `.md` to `.md.old`. You can safely delete these old templates once you verify that they've been imported correctly in Joplin.

## Using the Template Plugin

### Adding a new template
Create templates by creating a new note or to-do in any notebook that:
- Includes your template content
- Is tagged with `template`

### Using templates
You can access the templates options in `Tools` > `Templates`.

# Features

## Template variables

### Built in variables
Built in variables are inserted automatically, without interaction from you. For example, in the following template, the date will be automatically added:

```markdown
Date: {{date}}
Hours:
Details:
```

The currently supported built in template variables are:

| Variable | Description | Example |
| --- | --- | --- |
| `{{date}}` | Today's date  | 2019-01-01 |
| `{{time}}` | Current time  | 13:00 |
| `{{datetime}}` | Current date and time  | 01/01/19 1:00 PM |
| `{{#custom_datetime}}` | Current date and/or time formatted based on a supplied string (using [moment.js](https://momentjs.com/) formatting) | `{{#custom_datetime}}M d{{/custom_datetime}}` |
| `{{bowm}}` | Date of the beginning of the week (when week starts on Monday) | |
| `{{bows}}` | Date of the beginning of the week (when week starts on Sunday) | |

> **NOTE**: All dates are formatted based on your Joplin settings in `General > Date Format`

### Custom variables
You can also define custom variables in your template that prompt you to enter a value when you use the template. For example in the following example the name and color variables will prompt you each time you use the template:

```markdown
---
name: text
color: dropdown(Red, Yellow, Green)

---

Hi there, {{ name }}. Your favorite color is {{ color }}. This note/to-do was created on {{ datetime }}.
```

The currently supported custom variable types are:

| Type | Example |
| --- | --- |
| `text` | name: text |
| `number` | count: number |
| `boolean` | show_summary: boolean |
| `date` | meeting_date: date |
| `time` | meeting_time: time |
| `dropdown` | color: dropdown(Red, Yellow) |

**Points to note**
- You can't use special characters ("@", ",", "#", "+", "(", etc.) or spaces in variable names. However, you can use "_" in variable names.
- If you declare a custom variable with same name as the built-in variables, the custom variable value will be used.
- Internally, [Handlebars.Js](https://handlebarsjs.com/) is used to compile the templates. You can write templates to be compatible with `Handlebars`.

#### Advanced Usage
You can also define a `label` for each custom variable. Label is something that appears instead of the variable name in the variables input dialog. You can use the following syntax to do so.

```markdown
---
name: text
project:
  label: Select a project
  type: dropdown(project 1, project 2, project 3)
show_summary:
  label: Add summary in note?
  type: boolean

---

Hi {{ name }},
This is a report for {{ project }}.

{{#if show_summary}}
## Summary
> Enter the summary here.
{{/if}}


```

**Points to note**
- The indentation should be `2 spaces` exactly. Don't use tabs for indentation otherwise it can result in errors.

### Special variables

These are the variables that have a specific purpose other than being used in templates. Some of the important features of these special variables are

- Both built-in and custom variables can be used while defining these variables.
- The values of these variables can be used in the template body just like built-in and custom variables.

Currently there are four special variables.

| Variable | Purpose | Example |
| --- | --- | --- |
| `template_title` | Title of the note/to-do created using this template. | template_title: Standup - {{ date }} |
| `template_tags` | Comma separated tags to be applied to the note/to-do created  using this template. | template_tags: spec, {{ project }} |
| `template_notebook` | The ID of the target notebook for this template. Whenever a new note/to-do will be created by this template, it will be created in this target notebook. | template_notebook: 82d2384b025f44588e4d3851a1237028 |
| `template_todo_alarm` | The date and time for a to-do alarm/reminder. Only applies when creating to-dos from templates. | template_todo_alarm: {{ datetime delta_days=1 format="YYYY-MM-DD HH:mm" }} |

**Points to note**
- If `template_title` is not provided, the title of the template will be used as a fallback value.
- If a tag specified in `template_tags` doesn't exist already, it will be created.
- You can't use these variable names i.e. `template_title`, `template_tags`, `template_notebook`, and `template_todo_alarm` for custom variables. In general, please avoid defining custom variables with `template_` prefix.
- To get the ID of a notebook, you can right click on that notebook and click on `Copy notebook ID`.
- While you are inserting the template in an existing note/to-do, `template_tags` variable is used to apply those tags to the note the template is inserted in. However, you can disable using `template_tags` while inserting templates from the plugin settings.
- The `template_todo_alarm` variable expects a date-time string in the format "YYYY-MM-DD HH:mm" (without seconds). You can use the `datetime` helper to generate properly formatted timestamps.

**Example of a template using special variables**

```markdown
---
project: dropdown(project 1, project 2)
template_title: Weekly Meet - {{ project }} - {{ date }}
template_tags: meeting notes, {{ project }}

---

## {{ template_title }}

This note contains the meeting minutes of the weekly meet held on {{ datetime }} for {{ project }}.
```

## Advanced Template Features (Helpers)

The plugin uses [Handlebars.js](https://handlebarsjs.com/) as its templating engine, which provides powerful helpers for advanced template logic. These helpers allow you to perform comparisons, mathematical operations, text transformations, loops, and complex date/time manipulations.

> **💡 Tip:** See the [Complete Feature Demonstration Template](DEMO_TEMPLATE.md) for a comprehensive example using all helpers together in a real-world scenario.

### Compare Helper

The `compare` helper allows you to compare two values using various operators. This is useful for conditional logic in your templates.

**Syntax**: `{{#if (compare value1 operator value2)}}...{{/if}}`

**Supported operators**:
| Operator | Alternative Names | Description |
| --- | --- | --- |
| `==` | `eq`, `equals` | Equal (type coercion) |
| `===` | `seq`, `strictly-equals` | Strictly equal (no type coercion) |
| `!=` | `ne`, `not-equals` | Not equal |
| `!==` | `sne`, `strictly-not-equals` | Strictly not equal |
| `<` | `lt`, `less-than` | Less than |
| `<=` | `lte`, `less-than-equals` | Less than or equal |
| `>` | `gt`, `greater-than` | Greater than |
| `>=` | `gte`, `greater-than-equals` | Greater than or equal |

**Example**:
```markdown
---
age: number
temperature: number

---

{{#if (compare age ">" 18)}}
You are an adult.
{{else}}
You are a minor.
{{/if}}

{{#if (compare temperature ">=" 30)}}
It's hot outside! 🌞
{{else if (compare temperature "<" 10)}}
It's cold outside! ❄️
{{else}}
The weather is pleasant.
{{/if}}
```

### Condition Helper

The `condition` helper provides logical operators for combining multiple conditions.

**Syntax**: `{{#if (condition value1 operator value2)}}...{{/if}}`

**Supported operators**:
| Operator | Alternative Names | Description |
| --- | --- | --- |
| `&&` | `and` | Logical AND |
| `\|\|` | `or` | Logical OR |

**Example**:
```markdown
---
show_summary: boolean
has_data: boolean
is_weekend: boolean

---

{{#if (condition show_summary "and" has_data)}}
## Summary
Data is available and summary display is enabled.
{{/if}}

{{#if (condition is_weekend "or" (compare temperature ">" 25))}}
Perfect day for outdoor activities!
{{/if}}

{{! For negation, use Handlebars' built-in unless helper }}
{{#unless show_summary}}
Summary is hidden.
{{/unless}}
```

**Note**: For simple boolean negation, use Handlebars' built-in `{{#unless variable}}` helper instead of the condition helper.

### Math Helper

The `math` helper performs mathematical operations on numbers.

**Syntax**: `{{math value1 operator value2}}`

**Supported operators**:
| Operator | Description |
| --- | --- |
| `+` | Addition |
| `-` | Subtraction |
| `*` | Multiplication |
| `/` | Division |
| `**` | Exponentiation (power) |
| `%` | Modulo (remainder) |

**Example**:
```markdown
---
price: number
quantity: number
tax_rate: number

---

# Invoice

Price per item: ${{price}}
Quantity: {{quantity}}
Subtotal: ${{math price "*" quantity}}
Tax ({{math tax_rate "*" 100}}%): ${{math (math price "*" quantity) "*" tax_rate}}
**Total: ${{math (math price "*" quantity) "*" (math 1 "+" tax_rate)}}**

---

Area of circle with radius 5: {{math (math 5 "**" 2) "*" 3.14159}}
```

### Case Helper

The `case` helper transforms text to different cases.

**Syntax**: `{{case type text}}`

**Supported types**:
| Type | Description |
| --- | --- |
| `upper` | Convert to UPPERCASE |
| `lower` | Convert to lowercase |

**Example**:
```markdown
---
name: text
company: text

---

# Welcome {{case "upper" name}}!

Company: {{case "upper" company}}
Email: {{case "lower" name}}@{{case "lower" company}}.com
```

### Repeat Helper

The `repeat` helper repeats a block of content a specified number of times. Inside the block, you have access to a `repeat_index` variable (0-based).

**Syntax**: `{{#repeat count}}...{{/repeat}}`

**Example**:
```markdown
---
num_items: number

---

# Checklist

{{#repeat num_items}}
- [ ] Item {{math repeat_index "+" 1}}: 
{{/repeat}}

---

# Weekly Goals

{{#repeat 7}}
## Day {{math repeat_index "+" 1}}
- Morning: 
- Afternoon: 
- Evening: 

{{/repeat}}
```

### DateTime Helper

The `datetime` helper provides advanced date and time manipulation capabilities. It allows you to set specific dates/times, add/subtract time intervals, and format the output.

**Syntax**: `{{datetime attribute1=value1 attribute2=value2 ...}}`

**Supported attributes**:
| Attribute | Type | Description | Example |
| --- | --- | --- | --- |
| `format` | string | Output format (moment.js format) | `"YYYY-MM-DD"` |
| `set_date` | string | Set a specific date | `"2024-12-31"` |
| `set_time` | string | Set a specific time | `"09:00:00"` |
| `delta_years` | number | Add/subtract years | `1` or `-1` |
| `delta_months` | number | Add/subtract months | `3` or `-2` |
| `delta_days` | number | Add/subtract days | `7` or `-14` |
| `delta_hours` | number | Add/subtract hours | `2` or `-3` |
| `delta_minutes` | number | Add/subtract minutes | `30` or `-15` |
| `delta_seconds` | number | Add/subtract seconds | `45` or `-10` |

**Examples**:
```markdown
# Date Manipulation Examples

Today: {{datetime}}
Tomorrow: {{datetime delta_days=1}}
Next week: {{datetime delta_days=7}}
One month from now: {{datetime delta_months=1}}
Last year: {{datetime delta_years=-1}}

# Specific Date/Time
New Year: {{datetime set_date="2024-01-01" set_time="00:00:00"}}
Project deadline: {{datetime set_date="2024-12-31" set_time="23:59:59"}}

# Custom Formatting
ISO format: {{datetime format="YYYY-MM-DD HH:mm:ss"}}
Readable: {{datetime format="MMMM Do, YYYY [at] h:mm A"}}
Short: {{datetime format="MM/DD/YY"}}

# Combined Operations
Meeting in 2 days at 2 PM: {{datetime delta_days=2 set_time="14:00" format="YYYY-MM-DD HH:mm"}}
```

**Using with template_todo_alarm**:
```markdown
---
days_until_due: number
template_title: Task due in {{days_until_due}} days
template_todo_alarm: {{datetime delta_days=days_until_due set_time="09:00" format="YYYY-MM-DD HH:mm"}}

---

This task is due on {{datetime delta_days=days_until_due format="MMMM Do, YYYY"}}.
```

**Points to note**:
- All date/time operations start from the current date and time
- When using `set_date`, the format should match your Joplin date format settings (found in Preferences > General)
- When using `set_time`, the format should match your Joplin time format settings (typically "HH:mm" for 24-hour or "h:mm A" for 12-hour format, without seconds)
- Delta operations are applied after any set operations
- The default output format matches your Joplin date/time format settings
- For more format options, see [moment.js format documentation](https://momentjs.com/docs/#/displaying/format/)


## Default Templates

You can define templates you use frequently as default templates, allowing you to quickly create notes and to-dos without selecting a template each time. The plugin supports both global default templates and notebook-specific default templates.

### Global Default Templates

Global default templates apply across all notebooks unless overridden by notebook-specific defaults.

**Setting global defaults:**
1. Go to `Tools` > `Templates` > `Default templates` > `Set default template`
2. Select your desired template
3. Choose the type:
   - **Note**: Sets the default for notes only
   - **To-do**: Sets the default for to-dos only
   - **Both**: Sets the same template as default for both notes and to-dos

**Using global defaults:**
- Use the command "Create note from default template" (`Alt+Shift+N` by default)
- Use the command "Create to-do from default template" (`Alt+Shift+T` by default)

You can customize these keyboard shortcuts in Joplin's keyboard shortcut settings.

### Notebook-Specific Default Templates

Notebook-specific default templates allow you to set different default templates for different notebooks. These take precedence over global defaults when you're working in a specific notebook.

**Setting notebook-specific defaults:**
1. Go to `Tools` > `Templates` > `Default templates` > `Set default template for notebook`
2. Select the target notebook
3. Select your desired template
4. Choose the type (Note, To-do, or Both)

**Example use cases:**
- **Work notebook**: Use a professional meeting notes template by default
- **Personal notebook**: Use a daily journal template by default
- **Projects notebook**: Use a project task template by default

**Viewing all default templates:**
Go to `Tools` > `Templates` > `Default templates` > `Show default templates` to see:
- Your global default templates (for notes and to-dos)
- All notebook-specific default templates

**Clearing notebook-specific defaults:**
If you want to remove the default templates for a specific notebook (reverting to global defaults):
1. Go to `Tools` > `Templates` > `Default templates` > `Clear default templates for notebook`
2. Select the notebook
3. Confirm the action

**Precedence rules:**
When you create a note/to-do from the default template:
1. If the current notebook has a specific default template → use it
2. Otherwise → use the global default template
3. If no default is set → show an error message


## Using notebooks to store templates
The plugin also supports using notebooks to store templates instead of tags. You can start using notebooks to store your templates by going to the plugin settings and selecting `Notebook` instead of `Tag`.

Now, any note or todo placed in a notebook titled "Templates" will be considered a template.

## Changelog
See [CHANGELOG.md](https://github.com/joplin/plugin-templates/blob/master/CHANGELOG.md).

## Supporting
You can support the development of this plugin through [PayPal](https://paypal.me/nishantwrp). Also, do consider supporting the development of the main Joplin app through the official [donate page](https://joplinapp.org/donate/).

## Contributing
Contributions to this plugin are most welcome. Feel free to open a pull request or an issue. Make sure to use [conventional commit messages](https://www.conventionalcommits.org/en/v1.0.0/) if you're creating a pull request.
