//#region resources/js/shared/constants/moments.ts
/**
* Shared constants for moment-related UI.
* Used by ScheduleFields, ColorPicker, MomentForm, ConfigForm.
*/
var MOMENT_COLOR_PALETTE = [
	"#3B82F6",
	"#8B5CF6",
	"#10B981",
	"#EF4444",
	"#F59E0B",
	"#EC4899",
	"#06B6D4",
	"#84CC16",
	"#6366F1",
	"#F97316"
];
var WEEK_DAYS = [
	{
		label: "M",
		value: 1,
		full: "Monday"
	},
	{
		label: "T",
		value: 2,
		full: "Tuesday"
	},
	{
		label: "W",
		value: 3,
		full: "Wednesday"
	},
	{
		label: "T",
		value: 4,
		full: "Thursday"
	},
	{
		label: "F",
		value: 5,
		full: "Friday"
	},
	{
		label: "S",
		value: 6,
		full: "Saturday"
	},
	{
		label: "S",
		value: 7,
		full: "Sunday"
	}
];
var SCHEDULE_FREQUENCIES = [
	{
		label: "Daily",
		value: "daily"
	},
	{
		label: "Weekly",
		value: "weekly"
	},
	{
		label: "Custom",
		value: "custom"
	}
];
var MOMENT_FORM_SECTIONS = [
	{
		id: "basics",
		label: "Basics",
		emoji: "✏️"
	},
	{
		id: "schedule",
		label: "Schedule",
		emoji: "📅"
	},
	{
		id: "cue",
		label: "Cue",
		emoji: "🔔"
	},
	{
		id: "reward",
		label: "Reward",
		emoji: "🏆"
	}
];
//#endregion
export { WEEK_DAYS as i, MOMENT_FORM_SECTIONS as n, SCHEDULE_FREQUENCIES as r, MOMENT_COLOR_PALETTE as t };
