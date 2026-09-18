// datepicker.js — initializes flatpickr on all date inputs in the template dialog.
// Runs inside Joplin's dialog webview (Electron/Chromium).

(function () {
    /**
     * Converts a Joplin/moment.js date format string to a flatpickr format string.
     * Only covers the date formats supported by Joplin's settings.
     */
    function momentToFlatpickr(momentFormat) {
        return momentFormat
            .replace(/YYYY/g, 'Y')  // 4-digit year
            .replace(/YY/g, 'y')  // 2-digit year
            .replace(/MM/g, 'm')  // 2-digit month
            .replace(/M/g, 'n')  // 1-digit month (no leading zero)
            .replace(/DD/g, 'd')  // 2-digit day
            .replace(/D/g, 'j'); // 1-digit day (no leading zero)
    }

    /**
     * Replaces the flatpickr year <input> with a <select> dropdown so the
     * user can jump to any year without having to click the tiny arrows.
     * Range: 10 years before and 10 years after the current year.
     */
    function addYearDropdown(fp) {
        var yearInput = fp.calendarContainer.querySelector('input.cur-year');
        if (!yearInput) return;

        var currentYear = new Date().getFullYear();
        var startYear = currentYear - 10;
        var endYear = currentYear + 10;

        var select = document.createElement('select');
        select.className = 'year-select';

        for (var y = startYear; y <= endYear; y++) {
            var option = document.createElement('option');
            option.value = y;
            option.textContent = y;
            if (y === parseInt(yearInput.value, 10)) {
                option.selected = true;
            }
            select.appendChild(option);
        }

        // When user picks a year, jump flatpickr to that year.
        select.addEventListener('change', function () {
            fp.changeYear(parseInt(select.value, 10));
        });

        // Keep the dropdown in sync when flatpickr navigates months.
        fp.config.onMonthChange.push(function () {
            select.value = fp.currentYear;
        });
        fp.config.onYearChange.push(function () {
            select.value = fp.currentYear;
        });

        // Replace the number input (and its wrapper) with our dropdown.
        var wrapper = yearInput.closest('.numInputWrapper') || yearInput.parentNode;
        wrapper.parentNode.replaceChild(select, wrapper);
    }

    function initDatePickers() {
        var inputs = document.querySelectorAll('input[data-datepicker-format]');
        inputs.forEach(function (input) {
            var momentFormat = input.getAttribute('data-datepicker-format');
            var fpFormat = momentToFlatpickr(momentFormat);

            var fp = flatpickr(input, {
                dateFormat: fpFormat,
                allowInput: true,   // user can also type manually
                disableMobile: true,   // always use the custom picker
                static: true,   // render inline below the input to avoid
                // overflow clipping in the Joplin dialog
                onReady: function () {
                    addYearDropdown(fp);
                },
            });
        });
    }

    // Run once the DOM is ready.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDatePickers);
    } else {
        initDatePickers();
    }
})();
