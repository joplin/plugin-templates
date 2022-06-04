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
  - [Default Templates](#default-templates)
  - [Using Notebooks or Tags for Templates](#using-notebooks-or-tags-for-templates)
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

Currently there are two special variables.

| Variable | Purpose | Example |
| --- | --- | --- |
| `template_title` | Title of the note/to-do created using this template. | template_title: Standup - {{ date }} |
| `template_tags` | Comma separated tags to be applied to the note/to-do created  using this template. | template_tags: spec, {{ project }} |
| `template_notebook` | The ID of the target notebook for this template. Whenever a new note/to-do will be created by this template, it will be created in this target notebook. | template_notebook: 82d2384b025f44588e4d3851a1237028 |

**Points to note**
- If `template_title` is not provided, the title of the template will be used as a fallback value.
- If a tag specified in `template_tags` doesn't exist already, it will be created.
- You can't use these variable names i.e. `template_title` and `template_tags` for custom variables. In general, please avoid defining custom variables with `template_` prefix.
- To get the ID of a notebook, you can right click on that notebook and click on `Copy notebook ID`.
- While you are inserting the template in an existing note/to-do, `template_tags` variable is used to apply those tags to the note the template is inserted in. However, you can disable using `template_tags` while inserting templates from the plugin settings.

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

## Default Templates
You can define the templates you use the most as default templates. Currently you can have two default templates. One for `notes` and one for `to-dos`. You can also assign keyboard shortcuts to these defaults, so that you can quickly create a new note/to-do with the respective default template.

## Using Notebooks to store templates
Now, the plugin also supports using notebooks to store templates instead of tags. You can start using notebooks to store your templates by going to the plugin settings and selecting `Notebook` instead of `Tag`.

Now, any note or todo placed in a notebook titled "Templates" will be considered a template.

## Changelog
See [CHANGELOG.md](https://github.com/joplin/plugin-templates/blob/master/CHANGELOG.md).

## Supporting
You can support the development of this plugin through [PayPal](https://paypal.me/nishantwrp). Also, do consider supporting the development of the main Joplin app through the official [donate page](https://joplinapp.org/donate/).

## Contributing
Contributions to this plugin are most welcome. Feel free to open a pull request or an issue. Make sure to use [conventional commit messages](https://www.conventionalcommits.org/en/v1.0.0/) if you're creating a pull request.
