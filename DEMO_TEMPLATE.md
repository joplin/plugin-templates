# Complete Feature Demonstration Template

This template demonstrates **all features** of the Joplin Templates plugin. Use this as a reference or test template.

## Expected Behavior When Using This Template

### What Will Happen:
1. **Variable Input Dialog** will appear prompting you to enter values for all custom variables
2. After submitting the form, a new note/to-do will be created with:
   - A dynamic title based on your inputs
   - All variables replaced with actual values
   - All helpers executed and showing their results
   - Tags automatically applied
   - (Optional) Placed in the target notebook if you specify one

### Variable Input Form Will Show:
- **Project Name** (text input)
- **Priority Level** (dropdown: Low, Medium, High, Critical)
- **Budget** (number input)
- **Team Size** (number input)
- **Deadline Date** (date picker)
- **Meeting Time** (time picker)
- **Include Summary** (checkbox)
- **Send Notifications** (checkbox)

### Expected Output:
The created note will contain:
- Current date/time stamps
- Your custom variable values
- Conditional content based on checkboxes
- Mathematical calculations (budget per person)
- Text transformations (uppercase/lowercase)
- Comparison results (budget alerts, priority warnings)
- Repeated checklist items
- Advanced date calculations (future dates)

---

## The Template

Copy everything below this line to create your demonstration template:

---

```markdown
---
# Custom Variables - Simple Syntax
project_name: text
priority: dropdown(Low, Medium, High, Critical)
budget: number
team_size: number

# Custom Variables - Advanced Syntax with Labels
deadline:
  label: Project Deadline
  type: date

meeting_time:
  label: Preferred Meeting Time
  type: time

include_summary:
  label: Include executive summary?
  type: boolean

send_notifications:
  label: Enable email notifications?
  type: boolean

# Special Variables
template_title: '{{case "upper" project_name}} - Project Plan [{{date}}]'
template_tags: project, {{project_name}}, {{priority}}
# template_notebook: YOUR_NOTEBOOK_ID_HERE  # Uncomment and add notebook ID to auto-assign
template_todo_alarm: '{{datetime delta_days=7 set_time="09:00" format="YYYY-MM-DD HH:mm"}}'

---

# {{template_title}}

---

## 📋 Project Information

**Project Name:** {{case "upper" project_name}}  
**Priority Level:** {{priority}}  
**Total Budget:** ${{budget}}  
**Team Size:** {{team_size}} members  
**Budget per Person:** ${{math budget "/" team_size}}  
**Deadline:** {{deadline}}  
**Meeting Time:** {{meeting_time}}  

---

## 📅 Timeline & Dates

**Created:** {{datetime format="MMMM Do, YYYY [at] h:mm A"}}  
**Today:** {{date}}  
**Current Time:** {{time}}  
**Full DateTime:** {{datetime}}  
**Start of Week (Monday):** {{bowm}}  
**Start of Week (Sunday):** {{bows}}  

**Important Dates:**
- **Kickoff Meeting:** {{datetime delta_days=1 format="YYYY-MM-DD"}}
- **First Milestone:** {{datetime delta_days=14 format="YYYY-MM-DD"}}
- **Mid-Project Review:** {{datetime set_date=deadline delta_days=-14 format="YYYY-MM-DD"}}
- **Final Deadline:** {{deadline}}
- **Project Closure:** {{datetime set_date=deadline delta_days=7 format="YYYY-MM-DD"}}

---

## 🎯 Priority & Budget Analysis

{{#if (compare priority "==" "Critical")}}
### ⚠️ CRITICAL PRIORITY ALERT
This is a **CRITICAL** priority project requiring immediate attention and daily monitoring.

**Required Actions:**
- Daily status updates mandatory
- Executive oversight required
- Accelerated timeline in effect
{{else if (compare priority "==" "High")}}
### 🔴 High Priority Notice
This project requires close monitoring and weekly status updates.
{{else}}
### ✅ Standard Priority
Regular monitoring and bi-weekly updates are sufficient.
{{/if}}

---

### Budget Assessment

{{#if (compare budget ">" 100000)}}
💰 **Large Budget Project** (${{budget}})
- Requires executive approval for expenditures > $10,000
- Monthly financial reviews mandatory
- Risk management plan required
{{else if (compare budget ">" 50000)}}
💵 **Medium Budget Project** (${{budget}})
- Standard approval process
- Quarterly financial reviews
{{else}}
💸 **Small Budget Project** (${{budget}})
- Simplified approval process
- Budget tracking recommended
{{/if}}

**Per-Person Allocation:** ${{math budget "/" team_size}}

{{#if (compare (math budget "/" team_size) ">" 10000)}}
⚠️ High per-person budget detected. Consider resource optimization.
{{/if}}

---

## 👥 Team Composition

**Total Team Members:** {{team_size}}

{{#if (compare team_size ">" 10)}}
📊 **Large Team** - Consider sub-teams and delegation strategy:
- Recommended sub-teams: {{math team_size "/" 5}} (assuming 5 members per sub-team)
- Management overhead: ~20% of total effort
{{else if (compare team_size ">" 5)}}
👨‍👩‍👧‍👦 **Medium Team** - Direct management feasible
{{else}}
👥 **Small Team** - Agile approach recommended
{{/if}}

---

## 🔄 Logical Conditions Demo

### Condition Helper Examples

{{#if (condition include_summary "and" send_notifications)}}
✅ **Both features enabled:** Summary will be included AND notifications will be sent.
{{/if}}

{{#if (condition include_summary "or" send_notifications)}}
📧 **At least one feature enabled:** Either summary or notifications (or both) are active.
{{/if}}

{{#unless send_notifications}}
🔕 **Notifications disabled:** Team will not receive email updates.
{{/unless}}

{{#if (condition (compare priority "==" "Critical") "and" (compare budget ">" 100000))}}
🚨 **CRITICAL & HIGH BUDGET:** This project requires C-level oversight!
{{/if}}

---

## 📝 Executive Summary

{{#if include_summary}}
### Executive Summary

**Project:** {{case "upper" project_name}}  
**Status:** Initiated on {{date}}  
**Investment:** ${{budget}} across {{team_size}} team members  
**Timeline:** Due by {{deadline}}  
**Priority:** {{priority}}  

**Key Metrics:**
- Cost per team member: ${{math budget "/" team_size}}
- Days until deadline: *[To be calculated at project start]*
- Expected ROI: *[To be determined]*

**Strategic Alignment:**
This project aligns with organizational goals and requires {{#if (compare priority "==" "Critical")}}immediate{{else}}standard{{/if}} resource allocation.

{{else}}
*Executive summary not requested for this project.*
{{/if}}

---

## 🔤 Text Transformation Demo

**Original Project Name:** {{project_name}}  
**UPPERCASE:** {{case "upper" project_name}}  
**lowercase:** {{case "lower" project_name}}  

**Email Contacts:**
- Project Lead: {{case "lower" project_name}}.lead@company.com
- Team: {{case "lower" project_name}}.team@company.com

---

## 🔢 Mathematical Operations

### Budget Calculations

- **Total Budget:** ${{budget}}
- **Team Size:** {{team_size}}
- **Per Person:** ${{math budget "/" team_size}}
- **With 10% Overhead:** ${{math budget "*" 1.1}}
- **Monthly (12 months):** ${{math budget "/" 12}}
- **Quarterly (4 quarters):** ${{math budget "/" 4}}
- **Reserve (20%):** ${{math budget "*" 0.2}}
- **Available:** ${{math budget "-" (math budget "*" 0.2)}}

### Team Expansion Scenarios

- **Double the team:** {{math team_size "*" 2}} members
- **Add 3 members:** {{math team_size "+" 3}} members
- **Remove 1 member:** {{math team_size "-" 1}} members
- **Team squared:** {{math team_size "**" 2}} (growth factor calculation)

---

## 🔁 Repeat Helper Demo

### Daily Task Checklist (7 days)

{{#repeat 7}}
#### Day {{math repeat_index "+" 1}} - {{datetime delta_days=repeat_index format="MMMM Do (dddd)"}}

- [ ] Morning standup
- [ ] Review priorities
- [ ] Update task board
- [ ] End-of-day summary

**Focus for Day {{math repeat_index "+" 1}}:** *[To be determined]*

---

{{/repeat}}

### Weekly Goals (4 weeks)

{{#repeat 4}}
**Week {{math repeat_index "+" 1}}** (Starting {{datetime delta_days=(math repeat_index "*" 7) format="YYYY-MM-DD"}})
- [ ] Weekly goal 1
- [ ] Weekly goal 2
- [ ] Weekly goal 3
- [ ] Week {{math repeat_index "+" 1}} retrospective

{{/repeat}}

### Team Member Assignments

{{#repeat team_size}}
**Team Member #{{math repeat_index "+" 1}}**
- Role: *[Assign role]*
- Responsibilities: *[Define responsibilities]*
- Budget allocation: ${{math (math budget "/" team_size) "*" 1}} 

{{/repeat}}

---

## 📆 Advanced DateTime Examples

### Standard Date/Time Variables

- **date:** {{date}}
- **time:** {{time}}
- **datetime:** {{datetime}}
- **bowm:** {{bowm}} (Beginning of Week - Monday)
- **bows:** {{bows}} (Beginning of Week - Sunday)

### Custom DateTime Formatting

- **ISO Format:** {{datetime format="YYYY-MM-DD HH:mm:ss"}}
- **Readable:** {{datetime format="dddd, MMMM Do YYYY"}}
- **12-hour:** {{datetime format="h:mm A"}}
- **24-hour:** {{datetime format="HH:mm"}}
- **Month/Year:** {{datetime format="MMMM YYYY"}}
- **Short:** {{datetime format="MM/DD/YY"}}

### Date Calculations

**Future Dates:**
- Tomorrow: {{datetime delta_days=1 format="YYYY-MM-DD"}}
- Next week: {{datetime delta_days=7 format="YYYY-MM-DD"}}
- Next month: {{datetime delta_months=1 format="YYYY-MM-DD"}}
- Next quarter: {{datetime delta_months=3 format="YYYY-MM-DD"}}
- Next year: {{datetime delta_years=1 format="YYYY-MM-DD"}}

**Past Dates:**
- Yesterday: {{datetime delta_days=-1 format="YYYY-MM-DD"}}
- Last week: {{datetime delta_days=-7 format="YYYY-MM-DD"}}
- Last month: {{datetime delta_months=-1 format="YYYY-MM-DD"}}

**Time Calculations:**
- In 2 hours: {{datetime delta_hours=2 format="HH:mm"}}
- In 30 minutes: {{datetime delta_minutes=30 format="HH:mm"}}
- Meeting tomorrow at 2 PM: {{datetime delta_days=1 set_time="14:00" format="YYYY-MM-DD HH:mm"}}

### Custom Datetime (Moment.js format)

- **Custom 1:** {{#custom_datetime}}YYYY-MM-DD{{/custom_datetime}}
- **Custom 2:** {{#custom_datetime}}dddd, MMMM Do{{/custom_datetime}}
- **Custom 3:** {{#custom_datetime}}[Today is] dddd [and the time is] HH:mm{{/custom_datetime}}

---

## 📞 Notifications Settings

{{#if send_notifications}}
### ✅ Email Notifications ENABLED

**Notification Schedule:**
- Daily digest: {{datetime set_time="09:00" format="HH:mm"}}
- Weekly summary: Every Monday at 09:00
- Critical alerts: Immediate
- Deadline reminders: 7 days, 3 days, 1 day before

**Recipients:**
- Project Lead
- Team Members ({{team_size}})
- Stakeholders
- Management (for {{priority}} priority)

{{else}}
### 🔕 Email Notifications DISABLED

Team members should check the project dashboard regularly for updates.
{{/if}}

---

## 📊 Comparison & Logic Summary

### All Comparison Tests

**Priority Checks:**
{{#if (compare priority "eq" "Critical")}}✅{{else}}❌{{/if}} Is Critical  
{{#if (compare priority "eq" "High")}}✅{{else}}❌{{/if}} Is High  
{{#if (compare priority "eq" "Medium")}}✅{{else}}❌{{/if}} Is Medium  
{{#if (compare priority "eq" "Low")}}✅{{else}}❌{{/if}} Is Low  

**Budget Checks:**
{{#if (compare budget ">" 100000)}}✅{{else}}❌{{/if}} Budget > $100,000  
{{#if (compare budget ">" 50000)}}✅{{else}}❌{{/if}} Budget > $50,000  
{{#if (compare budget "<=" 50000)}}✅{{else}}❌{{/if}} Budget ≤ $50,000  

**Team Checks:**
{{#if (compare team_size ">" 10)}}✅{{else}}❌{{/if}} Large team (> 10)  
{{#if (compare team_size ">=" 5)}}✅{{else}}❌{{/if}} Medium+ team (≥ 5)  
{{#if (compare team_size "<" 5)}}✅{{else}}❌{{/if}} Small team (< 5)  

**Boolean Checks:**
{{#if include_summary}}✅{{else}}❌{{/if}} Include Summary  
{{#if send_notifications}}✅{{else}}❌{{/if}} Send Notifications  

---

## 📝 Notes & Next Steps

### Immediate Actions
1. [ ] Review and approve project plan
2. [ ] Assign team members
3. [ ] Set up project tracking tools
4. [ ] Schedule kickoff meeting for {{datetime delta_days=1 format="YYYY-MM-DD"}}

### Resources Required
- Budget: ${{budget}}
- Team: {{team_size}} members
- Timeline: Until {{deadline}}
- Tools: *[Specify required tools]*

### Risk Assessment
{{#if (condition (compare priority "==" "Critical") "and" (compare team_size "<" 5))}}
⚠️ **HIGH RISK:** Critical project with small team may face resource constraints.
{{else if (compare priority "==" "Critical")}}
⚠️ **MEDIUM RISK:** Critical priority requires careful monitoring.
{{else}}
✅ **LOW-MEDIUM RISK:** Standard project risk profile.
{{/if}}

---

## 🏷️ Tags & Metadata

**Applied Tags:** {{template_tags}}  
**Project ID:** *[Auto-generated on creation]*  
**Created:** {{datetime format="YYYY-MM-DD HH:mm:ss"}}  
**Last Updated:** *[To be updated on modification]*  

---

**Template Version:** 1.0 - Complete Feature Demonstration  
**Plugin Features Demonstrated:** 
✅ All built-in variables  
✅ All custom variable types  
✅ All special variables  
✅ Compare helper  
✅ Condition helper  
✅ Math helper  
✅ Case helper  
✅ Repeat helper  
✅ DateTime helper  
✅ Custom datetime helper  
✅ Nested helpers  
✅ Conditional logic  

---

*This template demonstrates every feature of the Joplin Templates plugin. Modify as needed for your actual projects.*
```

---

## How to Use This Demo Template

### Setup Steps:

1. **Create the Template:**
   - Create a new note in Joplin
   - Copy the entire template markdown above (from "---" to the end)
   - Tag it with `template` (or place in "Templates" notebook, depending on your settings)
   - Name it something like "DEMO - Complete Feature Showcase"

2. **Optional - Set Target Notebook:**
   - If you want the template to auto-create notes in a specific notebook, uncomment the `template_notebook` line
   - Right-click your target notebook → "Copy notebook ID"
   - Paste the ID in the template

3. **Test the Template:**
   - Go to Tools → Templates → Create note from template
   - Select "DEMO - Complete Feature Showcase"
   - Fill in the form with test values:
     - Project Name: "Phoenix Initiative" 
     - Priority: "High"
     - Budget: 75000
     - Team Size: 8
     - Deadline: [Pick a date 30 days from now]
     - Meeting Time: 14:00
     - Include Summary: ✓ (checked)
     - Send Notifications: ✓ (checked)

### Expected Results:

✅ **Title:** "PHOENIX INITIATIVE - Project Plan [2024-10-25]" (with current date)  
✅ **Tags:** project, Phoenix Initiative, High  
✅ **Content:** All sections filled with calculated values, conditional content shown, repeated sections generated  
✅ **For To-Do:** Alarm set for 7 days from now at 9:00 AM  

---

**This template serves as:**
- 📚 **Complete documentation** of all features
- 🧪 **Test case** for plugin functionality
- 📖 **Learning resource** for new users
- ✅ **Validation tool** for plugin updates

