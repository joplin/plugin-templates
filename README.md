<h1 align="center">
    Templates Plugin
    <br/>
    <center>
        <img src="https://github.com/joplin/plugin-templates/actions/workflows/ci.yml/badge.svg">
        <a href="https://npmjs.com/package/joplin-plugin-templates"><img src="https://badge.fury.io/js/joplin-plugin-templates.svg" alt="npm version"></a>
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
    - [Special variables](#special-variables)
  - [Default Templates](#default-templates)
- [Changelog](#changelog)
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

## Features

### Template variables

#### Built in variables
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

#### Custom variables
You can also define custom variables in your template that prompt you to enter a value when you use the template. For example in the following example the name and color variables will prompt you each time you use the template:

```markdown
---
name: text
color: enum(Red, Yellow, Green)

---

Hi there, {{ name }}. Your favorite color is {{ color }}. This note/to-do was created on {{ datetime }}.
```

The currently supported custom variable types are:

| Type | Example |
| --- | --- |
| `text` | name: text |
| `number` | count: number |
| `boolean` | show_summary: boolean |
| `enum` (dropdown list) | color: enum(Red, Yellow) |

**Points to note**
- You can't use special characters ("@", ",", "#", "+", "(", etc.) or spaces in variable names. However, you can use "_" in variable names.
- If you declare a custom variable with same name as the built-in variables, the custom variable value will be used.
- Internally, [Handlebars.Js](https://handlebarsjs.com/) is used to compile the templates. You can write templates to be compatible with `Handlebars`.

#### Special variables

These are the variables that have a specific purpose other than being used in templates. Some of the important features of these special variables are

- Both built-in and custom variables can be used while defining these variables.
- The values of these variables can be used in the template body just like built-in and custom variables.

Currently there are two special variables.

| Variable | Purpose | Example |
| --- | --- | --- |
| `template_title` | Title of the note/to-do created using this template. | template_title: Standup - {{ date }} |
| `template_tags` | Comma separated tags to be applied to the note/to-do created  using this template. | template_tags: spec, {{ project }} |

**Points to note**
- If `template_title` is not provided, the title of the template will be used as a fallback value.
- If a tag specified in `template_tags` doesn't exist already, it will be created.
- You can't use these variable names i.e. `template_title` and `template_tags` for custom varaibles. In general, please avoid defining custom variables with `template_` prefix.

**Example of a template using special variables**

```markdown
---
project: enum(project 1, project 2)
template_title: Weekly Meet - {{ project }} - {{ date }}
template_tags: meeting notes, {{ project }}

---

## {{ template_title }}

This note contains the meeting minutes of the weekly meet held on {{ datetime }} for {{ project }}.
```

### Default Templates
You can define the templates you use the most as default templates. Currently you can have two default templates. One for `notes` and one for `to-dos`. You can also assign keyboard shortcuts to these defaults, so that you can quickly create a new note/to-do with the respective default template.

## Changelog
See [CHANGELOG.md](https://github.com/joplin/plugin-templates/blob/master/CHANGELOG.md).

## Contributing
Contributions to this plugin are most welcome. Feel free to open a pull request or an issue. Make sure to use [conventional commit messages](https://www.conventionalcommits.org/en/v1.0.0/) if you're creating a pull request.
