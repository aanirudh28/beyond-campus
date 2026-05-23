'use client'

import { useState, useEffect, useCallback } from 'react'

// ──────────────────────── TYPES ────────────────────────
type Difficulty = 'Basic' | 'Intermediate' | 'Advanced'

type Question = {
  id: number
  category: string
  difficulty: Difficulty
  question: string
  answer: string
  formula_example?: string
  tip?: string
}

type CheatEntry = {
  fn: string
  syntax: string
  use: string
}

// ──────────────────────── DATA ────────────────────────
const CATEGORIES = [
  'All',
  'Excel Basics',
  'Lookup & Reference',
  'IF & Logic',
  'Text Functions',
  'Date & Numbers',
  'Pivot Tables',
  'Shortcuts & Productivity',
  'Data Cleaning',
]

const questions: Question[] = [
  // ── Lookup & Reference ──
  {
    id: 1,
    category: 'Lookup & Reference',
    difficulty: 'Basic',
    question: 'What is VLOOKUP and when do you use it?',
    answer: 'VLOOKUP (Vertical Lookup) searches for a value in the first column of a range and returns a value in the same row from a specified column. Use it when your lookup value is in the leftmost column of your data.',
    formula_example: '=VLOOKUP(A2, $D$2:$F$100, 2, FALSE)',
    tip: 'Always use FALSE for exact match in interviews — using TRUE (approximate) is a common mistake that produces wrong results on unsorted data.',
  },
  {
    id: 2,
    category: 'Lookup & Reference',
    difficulty: 'Intermediate',
    question: 'What is XLOOKUP and how is it better than VLOOKUP?',
    answer: 'XLOOKUP is the modern replacement for VLOOKUP. Key advantages: (1) can look left — no need for lookup column to be leftmost, (2) returns a range not just one column, (3) has built-in error handling via the [if_not_found] argument, (4) defaults to exact match.',
    formula_example: '=XLOOKUP(A2, B:B, C:C, "Not found")',
    tip: 'If your company uses Office 365 / Excel 2021+, always prefer XLOOKUP over VLOOKUP. Mentioning this in interviews shows you are up to date.',
  },
  {
    id: 3,
    category: 'Lookup & Reference',
    difficulty: 'Basic',
    question: 'What is HLOOKUP?',
    answer: 'HLOOKUP (Horizontal Lookup) is like VLOOKUP but searches across rows instead of columns. It looks for a value in the first row of a range and returns a value from the same column in a specified row.',
    formula_example: '=HLOOKUP(lookup_value, table_array, row_index_num, FALSE)',
    tip: 'Rarely used in practice since data is usually vertical. Knowing it exists and how it differs from VLOOKUP is enough for entry-level roles.',
  },
  {
    id: 4,
    category: 'Lookup & Reference',
    difficulty: 'Intermediate',
    question: 'What is INDEX-MATCH and why do analysts prefer it over VLOOKUP?',
    answer: 'INDEX-MATCH combines two functions for a more flexible lookup. INDEX returns the value of a cell at a given row/column intersection. MATCH returns the position of a value in a range. Together they can look in any direction and are unaffected by column insertions — VLOOKUP breaks if you add a column to your table.',
    formula_example: '=INDEX(C:C, MATCH(A2, B:B, 0))',
    tip: 'The "0" in MATCH means exact match — always use this. In interviews, calling out that VLOOKUP breaks when columns are inserted shows real-world awareness.',
  },
  {
    id: 5,
    category: 'Lookup & Reference',
    difficulty: 'Basic',
    question: 'What happens when VLOOKUP cannot find a value?',
    answer: 'It returns a #N/A error. Handle this with IFERROR to show a cleaner result: =IFERROR(VLOOKUP(...), "Not Found"). IFNA is more precise — it only catches #N/A errors, while IFERROR catches all errors including #VALUE! and #REF!. Prefer IFNA so real formula errors still surface.',
    formula_example: '=IFNA(VLOOKUP(A2, $D$2:$F$100, 2, FALSE), "Not Found")',
    tip: 'Using IFNA instead of IFERROR is a subtle signal that you understand the difference. Mention it if asked.',
  },

  // ── IF & Logic ──
  {
    id: 6,
    category: 'IF & Logic',
    difficulty: 'Basic',
    question: 'What is the IF function?',
    answer: 'IF checks a logical condition and returns one value if TRUE and another if FALSE. It is the foundation of conditional logic in Excel.',
    formula_example: '=IF(A2>50, "Pass", "Fail")',
    tip: 'The structure is always: =IF(condition, what to do if true, what to do if false). Getting this order right is the most common interview stumble.',
  },
  {
    id: 7,
    category: 'IF & Logic',
    difficulty: 'Intermediate',
    question: 'What are nested IFs and what is a cleaner alternative?',
    answer: 'Nested IFs are IF functions inside other IF functions to handle multiple conditions. Excel allows up to 64 levels of nesting, but more than 3–4 becomes unreadable. Use IFS() for cleaner multi-condition logic — it lists each condition and result in sequence without nesting.',
    formula_example: '=IFS(A2>90,"A", A2>75,"B", A2>60,"C", TRUE,"D")',
    tip: 'Always show the IFS alternative when asked about nested IFs — it signals you know modern Excel, not just legacy formulas.',
  },
  {
    id: 8,
    category: 'IF & Logic',
    difficulty: 'Basic',
    question: 'What is IFERROR and when do you use it?',
    answer: 'IFERROR wraps a formula and returns a custom value if the formula produces any error, instead of showing error codes like #N/A, #DIV/0!, or #VALUE!. Use it to make spreadsheets readable for non-technical stakeholders.',
    formula_example: '=IFERROR(A2/B2, 0)',
    tip: 'A common interview question: "What is the difference between IFERROR and IFNA?" — IFNA only catches #N/A; IFERROR catches everything.',
  },
  {
    id: 9,
    category: 'IF & Logic',
    difficulty: 'Basic',
    question: 'What are AND and OR functions?',
    answer: 'AND returns TRUE only if ALL conditions are true. OR returns TRUE if AT LEAST ONE condition is true. Both are typically used inside IF statements to combine multiple conditions.',
    formula_example: '=IF(AND(A2>18, B2="Yes"), "Eligible", "Not Eligible")',
    tip: 'You can also write =IF(OR(A2="Delhi", A2="Mumbai"), "Metro", "Non-Metro"). These two are almost always tested together in interviews.',
  },
  {
    id: 10,
    category: 'IF & Logic',
    difficulty: 'Intermediate',
    question: 'What is SUMIF and how does it differ from SUMIFS?',
    answer: 'SUMIF adds values in a range based on ONE condition. SUMIFS adds values based on MULTIPLE conditions. The key gotcha: in SUMIFS, the sum_range comes FIRST — opposite of SUMIF. This trips people up every time.',
    formula_example: '=SUMIFS(C:C, A:A, "Delhi", B:B, ">50000")',
    tip: 'In SUMIFS, sum_range is the first argument. In SUMIF, it is the third. Memorise this — it is a classic interview trick question.',
  },
  {
    id: 11,
    category: 'IF & Logic',
    difficulty: 'Basic',
    question: 'What is COUNTIF and COUNTIFS?',
    answer: 'COUNTIF counts cells that meet ONE condition. COUNTIFS counts cells meeting MULTIPLE conditions. Both are used constantly for data analysis — counting how many times a value appears, how many rows meet criteria, etc.',
    formula_example: '=COUNTIF(A:A, "Delhi")',
    tip: '=COUNTIF(A:A, "Delhi") counts how many times "Delhi" appears in column A. =COUNTIFS(A:A, "Delhi", B:B, ">50000") adds a second condition.',
  },

  // ── Text Functions ──
  {
    id: 12,
    category: 'Text Functions',
    difficulty: 'Basic',
    question: 'What does CONCATENATE do? What is the modern alternative?',
    answer: 'CONCATENATE joins multiple text strings into one. The modern alternatives are the & operator or TEXTJOIN. CONCAT (Excel 2019+) also works and accepts ranges. TEXTJOIN is the most powerful — it adds a separator between values and can ignore empty cells.',
    formula_example: '=TEXTJOIN(", ", TRUE, A2:A10)',
    tip: 'Show you know the evolution: CONCATENATE → CONCAT → TEXTJOIN. Using & is fine for 2–3 strings, but TEXTJOIN for ranges.',
  },
  {
    id: 13,
    category: 'Text Functions',
    difficulty: 'Basic',
    question: 'What are LEFT, RIGHT, and MID functions?',
    answer: 'These extract characters from text. LEFT extracts from the start. RIGHT extracts from the end. MID extracts from any position in the middle. All three take the text and number of characters as arguments; MID also takes the start position.',
    formula_example: '=MID("INV-2024-001", 5, 4)',
    tip: 'If A2 = "INV-2024-001", =MID(A2, 5, 4) returns "2024". =LEFT(A2, 3) returns "INV". These are asked in data cleaning scenarios.',
  },
  {
    id: 14,
    category: 'Text Functions',
    difficulty: 'Basic',
    question: 'What does TRIM do?',
    answer: 'TRIM removes extra spaces from text — leading spaces, trailing spaces, and multiple spaces between words (keeping single spaces between words). Essential when cleaning data imported from other systems, databases, or copy-pasted content.',
    formula_example: '=TRIM("  Hello   World  ")',
    tip: 'TRIM is always in the first step of any data cleaning workflow. Interviewers in ops and analytics roles will definitely ask about it.',
  },
  {
    id: 15,
    category: 'Text Functions',
    difficulty: 'Basic',
    question: 'What is the LEN function used for?',
    answer: 'LEN returns the number of characters in a text string, including spaces. Common uses: validating data (checking if phone numbers are 10 digits), finding entries that are too long, or as a helper inside other formulas.',
    formula_example: '=LEN(A2)',
    tip: '=IF(LEN(A2)<>10, "Invalid", "Valid") is a classic data validation pattern for phone numbers.',
  },
  {
    id: 16,
    category: 'Text Functions',
    difficulty: 'Basic',
    question: 'How do you convert text to upper, lower, or proper case?',
    answer: 'UPPER("text") converts to ALL CAPS. LOWER("text") converts to all lowercase. PROPER("text") Capitalizes The First Letter Of Each Word. All three take a single text argument.',
    formula_example: '=PROPER(A2)',
    tip: 'PROPER is your best friend for cleaning name columns with inconsistent capitalisation — a very common real-world task.',
  },

  // ── Date & Numbers ──
  {
    id: 17,
    category: 'Date & Numbers',
    difficulty: 'Basic',
    question: 'What is TODAY() and NOW()?',
    answer: 'TODAY() returns today\'s date only. NOW() returns the current date and time. Both update automatically every time the spreadsheet recalculates. They take no arguments — written as TODAY() not TODAY.',
    formula_example: '=TODAY()',
    tip: 'TODAY() and NOW() are volatile functions — they recalculate on every sheet change, which can slow large workbooks. Worth mentioning in interviews.',
  },
  {
    id: 18,
    category: 'Date & Numbers',
    difficulty: 'Basic',
    question: 'How do you calculate the number of days between two dates?',
    answer: 'Simply subtract: =B2-A2 where B2 is the end date and A2 is the start date. Format the result as a number. For working days only (excluding weekends), use NETWORKDAYS(start_date, end_date). Add a holidays range as the third argument to also exclude public holidays.',
    formula_example: '=NETWORKDAYS(A2, B2)',
    tip: 'Always mention NETWORKDAYS when this question comes up — it shows you know the practical business version, not just the basic subtraction.',
  },
  {
    id: 19,
    category: 'Date & Numbers',
    difficulty: 'Advanced',
    question: 'What is DATEDIF?',
    answer: 'DATEDIF calculates the difference between two dates in complete years, months, or days. It is a hidden/undocumented function in Excel — does not appear in autocomplete — but works reliably. Used for calculating employee tenure, age from date of birth, subscription duration, etc.',
    formula_example: '=DATEDIF(A2, TODAY(), "Y")',
    tip: 'Units: "Y" = full years, "M" = full months, "D" = days. Mentioning that it is an undocumented function impresses interviewers because it shows hands-on experience.',
  },
  {
    id: 20,
    category: 'Date & Numbers',
    difficulty: 'Basic',
    question: 'What does ROUND do and how is it different from INT?',
    answer: 'ROUND rounds a number to a specified number of decimal places — it can round up or down. INT truncates to the nearest integer by always rounding down (towards zero for positive numbers). Also know: ROUNDUP always rounds away from zero, ROUNDDOWN always rounds toward zero.',
    formula_example: '=ROUND(3.567, 2)',
    tip: '=ROUND(3.567, 2) gives 3.57. =INT(3.9) gives 3 (not 4). This distinction comes up in financial calculations — INT is not the same as rounding to zero decimals.',
  },
  {
    id: 21,
    category: 'Date & Numbers',
    difficulty: 'Intermediate',
    question: 'What is the difference between AVERAGE, AVERAGEIF, and AVERAGEIFS?',
    answer: 'AVERAGE calculates the mean of all values in a range. AVERAGEIF calculates the mean of values meeting ONE condition. AVERAGEIFS calculates the mean of values meeting MULTIPLE conditions. The argument order in AVERAGEIFS follows the SUMIFS pattern — average_range first.',
    formula_example: '=AVERAGEIFS(C:C, A:A, "Delhi", B:B, ">50000")',
    tip: 'The pattern SUMIF/SUMIFS/AVERAGEIF/AVERAGEIFS/COUNTIF/COUNTIFS all follow the same logic. Learn one, you know them all.',
  },

  // ── Pivot Tables ──
  {
    id: 22,
    category: 'Pivot Tables',
    difficulty: 'Basic',
    question: 'What is a Pivot Table and what is it used for?',
    answer: 'A Pivot Table is an interactive summary tool that lets you quickly group, count, sum, and analyse large datasets without writing formulas. You drag fields into Rows, Columns, Values, and Filters to slice data different ways. Common uses: sales by region, headcount by department, revenue by month.',
    tip: 'The classic interview answer: "Pivot Tables let you summarise thousands of rows into a meaningful view in seconds." Always give a use case.',
  },
  {
    id: 23,
    category: 'Pivot Tables',
    difficulty: 'Intermediate',
    question: 'What is the difference between a Pivot Table and regular formulas?',
    answer: 'Formulas like SUMIFS update dynamically as data changes. Pivot Tables must be manually refreshed (right-click → Refresh or Alt+F5) when source data changes. Formulas are better for live dashboards; Pivot Tables are better for ad-hoc analysis and presentations where you need to explore data quickly.',
    tip: 'Always mention the refresh limitation — it is a real operational issue that interviewers in ops/finance roles will appreciate you knowing.',
  },
  {
    id: 24,
    category: 'Pivot Tables',
    difficulty: 'Intermediate',
    question: 'What is a slicer in a Pivot Table?',
    answer: 'A slicer is a visual filter button panel connected to a Pivot Table. Instead of using the dropdown filter in the table header, you click buttons to filter — more intuitive for dashboards and presentations shared with non-technical stakeholders.',
    tip: 'One slicer can be connected to multiple Pivot Tables simultaneously. Mentioning this shows you have used slicers in real dashboard-building scenarios.',
  },
  {
    id: 25,
    category: 'Pivot Tables',
    difficulty: 'Intermediate',
    question: 'What is "Value Field Settings" in a Pivot Table?',
    answer: 'Value Field Settings controls how values are aggregated in the Values area — Sum, Count, Average, Max, Min, % of Total, etc. Right-click any value cell → "Value Field Settings" to change it. "% of Grand Total" and "% of Column Total" are especially useful for reporting.',
    tip: 'Changing the default Sum to Count is one of the most common things people forget about. Mentioning it shows you have actually built Pivot Tables, not just heard about them.',
  },

  // ── Shortcuts & Productivity ──
  {
    id: 26,
    category: 'Shortcuts & Productivity',
    difficulty: 'Basic',
    question: 'What are the most important Excel keyboard shortcuts?',
    answer: 'Must-know shortcuts: Ctrl+C/V (Copy/Paste), Ctrl+Z/Y (Undo/Redo), Ctrl+Shift+L (Toggle Filters), Ctrl+T (Create Table), Ctrl+End (Last used cell), Alt+= (AutoSum), F4 (Toggle absolute reference / repeat last action), Ctrl+` (Show all formulas), Ctrl+Shift+$ (Currency format), Ctrl+Shift+% (Percentage format).',
    tip: 'F4 is the single most underused shortcut. It cycles through relative → absolute → mixed references. Knowing this earns instant credibility in interviews.',
  },
  {
    id: 27,
    category: 'Shortcuts & Productivity',
    difficulty: 'Intermediate',
    question: 'What is the difference between absolute, relative, and mixed cell references?',
    answer: 'Relative (A1): row and column both adjust when you copy the formula — great for repeating the same calculation down a column. Absolute ($A$1): both row and column are locked — stays fixed when copied. Mixed ($A1 or A$1): only row OR column is locked. Use F4 to cycle through all four options.',
    formula_example: '=$B$2*A2',
    tip: 'Use F4 immediately after typing a cell reference to toggle. Getting this wrong is the #1 reason formulas break when copied — very common interview test.',
  },
  {
    id: 28,
    category: 'Shortcuts & Productivity',
    difficulty: 'Advanced',
    question: 'What does Ctrl+Shift+Enter do in Excel?',
    answer: 'It enters an array formula in older Excel versions (pre-365). Array formulas perform calculations on multiple values at once and are enclosed in curly braces {}. In Excel 365/2021, most array operations work automatically without Ctrl+Shift+Enter — this is called dynamic arrays and functions like FILTER, SORT, and UNIQUE leverage it.',
    tip: 'If asked, explain the legacy Ctrl+Shift+Enter method AND mention that dynamic arrays in Excel 365 have mostly replaced the need for it.',
  },
  {
    id: 29,
    category: 'Shortcuts & Productivity',
    difficulty: 'Basic',
    question: 'How do you freeze panes and why would you use them?',
    answer: 'Freeze panes locks specific rows or columns so they stay visible while you scroll. Go to View → Freeze Panes. Most commonly used to freeze the header row so column names always show when scrolling down a long dataset.',
    tip: 'Click cell B2 and then freeze panes to lock both the top row AND the left column simultaneously — a quick tip that impresses interviewers who expect you to know only the basic row-freeze.',
  },

  // ── Data Cleaning ──
  {
    id: 30,
    category: 'Data Cleaning',
    difficulty: 'Basic',
    question: 'How do you remove duplicates in Excel?',
    answer: 'Data tab → Remove Duplicates → select which columns to check for duplicates. Excel removes duplicate rows and tells you how many were removed and how many unique rows remain. Alternative: use COUNTIF to flag duplicates first before removing — gives you visibility before destructive action.',
    formula_example: '=COUNTIF($A$2:$A$100, A2)',
    tip: 'Before using Remove Duplicates, always use COUNTIF to preview which rows are duplicates. Deleting data without reviewing first is a real-world mistake.',
  },
  {
    id: 31,
    category: 'Data Cleaning',
    difficulty: 'Basic',
    question: 'What is Conditional Formatting?',
    answer: 'Conditional Formatting automatically applies colours, data bars, icons, or scales to cells based on their values or formulas. Common uses: highlight values above a threshold in green, flag negative values in red, show data bars for quick visual comparison. Found under Home → Conditional Formatting.',
    tip: 'Interviewers love "highlight top 10%" or "highlight cells containing a keyword" as test scenarios. Know how to set up a custom formula-based rule.',
  },
  {
    id: 32,
    category: 'Data Cleaning',
    difficulty: 'Intermediate',
    question: 'What is Data Validation in Excel?',
    answer: 'Data Validation restricts what a user can enter in a cell — dropdown lists from a range, number ranges, date ranges, text length limits, or custom formula-based rules. Found under Data → Data Validation. Prevents incorrect data entry before it happens.',
    tip: 'Dropdown lists using Data Validation are used in almost every ops dashboard. Know how to create a dropdown from a named range.',
  },
  {
    id: 33,
    category: 'Data Cleaning',
    difficulty: 'Intermediate',
    question: 'What is the difference between Paste and Paste Special?',
    answer: 'Regular Paste pastes everything — formulas, formatting, cell size. Paste Special (Ctrl+Alt+V) lets you choose exactly what to paste: Values only (result of the formula, not the formula itself), Formats only, Transpose (flip rows and columns), Multiply/Add (arithmetic on pasted values), etc.',
    tip: '"Paste as Values" (Ctrl+Alt+V → V → Enter) is one of the most-used operations in real data work. If you hard-code a value and someone wants to remove formula dependencies, this is your tool.',
  },

  // ── Excel Basics ──
  {
    id: 34,
    category: 'Excel Basics',
    difficulty: 'Basic',
    question: 'What are the most common business uses of Excel in analyst and ops roles?',
    answer: 'Excel is used for: (1) Data organisation — storing and structuring raw data in rows and columns. (2) Calculations and formulas — automating repetitive maths across thousands of rows. (3) Reporting and dashboards — summarising data with charts, Pivot Tables, and conditional formatting. (4) Data cleaning — removing duplicates, trimming spaces, standardising formats. (5) Tracking — budgets, project plans, pipelines, inventories. Most entry-level analyst and ops tasks at Indian startups and corporates are done entirely in Excel or Google Sheets.',
    tip: 'In interviews, frame your Excel experience around real outputs: "I built a budget tracker" or "I cleaned a 5,000-row dataset using VLOOKUP and TRIM." Vague answers like "I know Excel well" do not impress.',
  },
  {
    id: 35,
    category: 'Excel Basics',
    difficulty: 'Intermediate',
    question: 'What is an Excel Table (Ctrl+T) and why use it instead of a plain range?',
    answer: 'An Excel Table is a structured data container created with Ctrl+T. Benefits over a plain range: (1) Formulas auto-expand when you add new rows — no dragging down. (2) Structured references like =Table1[Revenue] are readable. (3) Built-in filter dropdowns on every column header. (4) Pivot Tables connected to a Table automatically pick up new data on refresh — no need to update the source range. (5) Works seamlessly with Power Query for data transformation.',
    formula_example: '=SUM(Table1[Revenue])',
    tip: 'Convert raw data to a Table before building any formulas or Pivot Tables on top of it. This one habit eliminates a whole class of errors when data grows.',
  },
  {
    id: 36,
    category: 'Excel Basics',
    difficulty: 'Basic',
    question: 'How do you sort data in Excel?',
    answer: 'Three ways: (1) Quick sort — click any cell in the column to sort by, then use Data → Sort A to Z / Sort Z to A. (2) Custom sort — Data → Sort → Add Levels lets you sort by multiple columns in order (e.g. sort by Region first, then by Revenue descending within each region). (3) Filter dropdown — with filters on (Ctrl+Shift+L), click any column\'s dropdown arrow and choose sort from there.',
    tip: 'Always use Custom Sort when you need multi-level sorting. Quick-sorting a single column on a multi-column dataset can misalign rows if the data is not in a Table.',
  },
  {
    id: 37,
    category: 'Excel Basics',
    difficulty: 'Basic',
    question: 'How do you use AutoFilter and what can you do with it?',
    answer: 'AutoFilter adds dropdown arrows to column headers so you can show only rows matching certain values. Enable with Ctrl+Shift+L or Data → Filter. You can: filter by specific values (tick/untick from a list), use number filters (greater than, top 10, between), use text filters (contains, begins with), or filter by cell colour. To clear all filters: Ctrl+Shift+L twice, or Data → Clear.',
    tip: 'Ctrl+Shift+L is one of the most-used shortcuts in ops and analytics roles. You toggle filters constantly — know it cold.',
  },
  {
    id: 38,
    category: 'Excel Basics',
    difficulty: 'Intermediate',
    question: 'What is a Named Range and why is it useful?',
    answer: 'A Named Range assigns a label to a cell or range. Instead of =VLOOKUP(A2, $D$2:$F$100, 2, FALSE) you write =VLOOKUP(A2, ProductList, 2, FALSE). Benefits: (1) Formulas become readable — the name explains what the range contains. (2) Named ranges are absolute by default — no $ signs needed. (3) If the data range shifts, you update the name definition once and all formulas referencing it update automatically.',
    formula_example: '=VLOOKUP(A2, ProductList, 2, FALSE)',
    tip: 'Create named ranges via Formulas → Define Name, or type the name directly in the Name Box (top-left corner of the formula bar). A well-structured spreadsheet uses named ranges for every key lookup table.',
  },
  {
    id: 39,
    category: 'Excel Basics',
    difficulty: 'Intermediate',
    question: 'What features do you combine to build an Excel dashboard?',
    answer: 'A solid Excel dashboard uses: (1) Pivot Tables for dynamic data summaries. (2) Charts linked to Pivot Tables for visualisation. (3) Slicers for interactive one-click filtering. (4) SUMIFS / COUNTIFS for standalone KPI numbers. (5) Conditional Formatting to flag exceptions. (6) Named Ranges or Excel Tables so formulas stay stable. (7) A separate "Data" sheet and a separate "Dashboard" sheet — never mix raw data and visuals on the same sheet.',
    tip: 'The most important dashboard principle: separate your data layer from your display layer. Raw data on Sheet 1, dashboard on Sheet 2. This makes maintenance easy and prevents accidental overwrites.',
  },
  {
    id: 40,
    category: 'Excel Basics',
    difficulty: 'Intermediate',
    question: 'What is a sparkline in Excel?',
    answer: 'A sparkline is a miniature chart that fits inside a single cell — it shows a trend at a glance without taking up chart space. Three types: Line (trend over time), Column (bar comparison), Win/Loss (positive vs negative). Insert via Insert → Sparklines. Commonly used in dashboards next to monthly totals to show direction without a full chart.',
    tip: 'Mentioning sparklines when talking about dashboards signals you have actually built them, not just described them. They are a finishing touch that separates clean dashboards from basic ones.',
  },

  // ── Pivot Tables (additional) ──
  {
    id: 41,
    category: 'Pivot Tables',
    difficulty: 'Basic',
    question: 'How do you create a Pivot Table from scratch?',
    answer: 'Click any cell inside your data → Insert → PivotTable → choose to place it on a new sheet (cleaner). In the field list on the right: drag dimension fields (e.g. Region, Category) to Rows or Columns, drag numeric fields (e.g. Revenue, Units Sold) to Values. The summary builds instantly. Your source data must have column headers, no blank rows, and one record per row.',
    tip: 'Before inserting a Pivot Table, convert your data to an Excel Table first (Ctrl+T). The Pivot Table will then automatically include new rows when you refresh — no need to update the source range manually.',
  },
  {
    id: 42,
    category: 'Pivot Tables',
    difficulty: 'Intermediate',
    question: 'How do you group dates by month or quarter in a Pivot Table?',
    answer: 'Drag a date field into Rows. Right-click any date value → Group → select the grouping you want: Days, Months, Quarters, Years (you can select multiple). In Excel 365, date grouping often happens automatically. To remove grouping, right-click → Ungroup.',
    tip: 'Grouping is greyed out? The source column contains text that looks like dates, not actual date values. Fix with =DATEVALUE(A2) or use Data → Text to Columns to convert the column.',
  },
  {
    id: 43,
    category: 'Pivot Tables',
    difficulty: 'Advanced',
    question: 'What is a Calculated Field in a Pivot Table?',
    answer: 'A Calculated Field lets you create a new metric inside the Pivot Table using a formula based on existing fields — without touching the source data. Example: if your data has Revenue and Cost, create a Calculated Field "Margin" = Revenue - Cost. Access via PivotTable Analyze → Fields, Items & Sets → Calculated Field.',
    tip: 'Calculated Fields use the SUM of the field, not individual row values — this produces wrong results for ratios like % margin. For precise ratio calculations, add a column to the source data instead and use that field in the Pivot Table.',
  },
  {
    id: 44,
    category: 'Pivot Tables',
    difficulty: 'Intermediate',
    question: 'How do you connect one slicer to multiple Pivot Tables?',
    answer: 'Insert a slicer via PivotTable Analyze → Insert Slicer → select the field. To connect it to additional Pivot Tables: right-click the slicer → Report Connections → tick every Pivot Table you want it to control. Now clicking any slicer button filters all connected tables and their linked charts simultaneously — this is the standard way to build interactive dashboards.',
    tip: 'Right-click the slicer → Size and Properties → set "Don\'t move or size with cells." This keeps the slicer in place when Pivot Tables expand. Always do this on a dashboard.',
  },

  // ── Shortcuts (additional) ──
  {
    id: 45,
    category: 'Shortcuts & Productivity',
    difficulty: 'Basic',
    question: 'How do you sort data quickly using keyboard shortcuts?',
    answer: 'Fastest methods: (1) Alt+A+S+A sorts the current column A to Z. (2) Alt+A+S+D sorts Z to A. (3) Alt+D+S opens the full Sort dialog for multi-level sorting. In practice, most analysts turn on filters (Ctrl+Shift+L) and use the column dropdown arrow to sort — it is quicker and gives you the multi-level option in context.',
    tip: 'Multi-level sort (sort by Region, then by Revenue) is almost always what real data work requires. Get comfortable with Data → Sort → Add Level.',
  },
  {
    id: 46,
    category: 'Shortcuts & Productivity',
    difficulty: 'Basic',
    question: 'What does Ctrl+Shift+Arrow do, and why is it useful?',
    answer: 'Ctrl+Shift+Arrow selects all continuous cells from the current cell to the last non-empty cell in that direction. Ctrl+Arrow alone just moves the cursor there without selecting. These shortcuts are essential for navigating large datasets — Ctrl+Shift+Down selects an entire column of data in one keystroke, no mouse scrolling needed.',
    tip: 'Ctrl+Shift+End selects from your current cell to the very last used cell on the sheet — a fast way to select your entire dataset to copy, format, or delete.',
  },
  {
    id: 47,
    category: 'Shortcuts & Productivity',
    difficulty: 'Basic',
    question: 'What are the most useful shortcuts for navigating and working with large datasets?',
    answer: 'Must-know navigation shortcuts: Ctrl+End (jump to last used cell — shows dataset size), Ctrl+Home (go to A1), Ctrl+Arrow (jump to last non-empty cell), Ctrl+Shift+Arrow (select to last non-empty cell), F5 / Ctrl+G (Go To — jump to a cell or find blanks). Selection shortcuts: Shift+Space (select entire row), Ctrl+Space (select entire column), Ctrl+A (select all used cells). Workflow shortcut: Ctrl+G → Special → Blanks highlights all empty cells in one step.',
    tip: 'Ctrl+G → Special → Blanks is the fastest way to find missing data in an imported dataset. Select the blanks, right-click → Delete → Shift cells up to clean gaps without looping through thousands of rows.',
  },
]

const cheatSheet: CheatEntry[] = [
  { fn: 'VLOOKUP', syntax: '=VLOOKUP(lookup, range, col, FALSE)', use: 'Find value in leftmost column, return from same row' },
  { fn: 'XLOOKUP', syntax: '=XLOOKUP(lookup, lookup_arr, return_arr, "N/A")', use: 'Modern lookup — works in any direction' },
  { fn: 'INDEX-MATCH', syntax: '=INDEX(col, MATCH(val, lookup_col, 0))', use: 'Flexible two-way lookup, unaffected by column inserts' },
  { fn: 'IF', syntax: '=IF(condition, true_val, false_val)', use: 'Return different values based on a condition' },
  { fn: 'IFS', syntax: '=IFS(cond1, val1, cond2, val2, TRUE, default)', use: 'Multiple conditions without deep nesting' },
  { fn: 'IFERROR', syntax: '=IFERROR(formula, fallback)', use: 'Suppress all error types with a fallback value' },
  { fn: 'IFNA', syntax: '=IFNA(formula, fallback)', use: 'Suppress only #N/A errors (safer than IFERROR)' },
  { fn: 'AND / OR', syntax: '=AND(cond1, cond2) / =OR(cond1, cond2)', use: 'Combine multiple conditions inside IF' },
  { fn: 'SUMIF', syntax: '=SUMIF(range, criteria, sum_range)', use: 'Sum values meeting ONE condition' },
  { fn: 'SUMIFS', syntax: '=SUMIFS(sum_range, range1, crit1, ...)', use: 'Sum values meeting MULTIPLE conditions' },
  { fn: 'COUNTIF', syntax: '=COUNTIF(range, criteria)', use: 'Count cells meeting ONE condition' },
  { fn: 'AVERAGEIFS', syntax: '=AVERAGEIFS(avg_range, range1, crit1, ...)', use: 'Average values meeting MULTIPLE conditions' },
  { fn: 'TRIM', syntax: '=TRIM(text)', use: 'Remove leading/trailing/extra spaces' },
  { fn: 'LEFT / RIGHT / MID', syntax: '=MID(text, start, chars)', use: 'Extract characters from text' },
  { fn: 'LEN', syntax: '=LEN(text)', use: 'Count characters in a string' },
  { fn: 'UPPER / LOWER / PROPER', syntax: '=PROPER(text)', use: 'Normalise text case' },
  { fn: 'TEXTJOIN', syntax: '=TEXTJOIN(", ", TRUE, A2:A10)', use: 'Join a range of cells with a separator' },
  { fn: 'TODAY / NOW', syntax: '=TODAY() / =NOW()', use: 'Current date / current date+time (auto-updates)' },
  { fn: 'DATEDIF', syntax: '=DATEDIF(start, end, "Y")', use: 'Date difference in years, months, or days' },
  { fn: 'NETWORKDAYS', syntax: '=NETWORKDAYS(start, end)', use: 'Working days between two dates' },
  { fn: 'ROUND', syntax: '=ROUND(number, digits)', use: 'Round to N decimal places' },
  { fn: 'INT', syntax: '=INT(number)', use: 'Round down to nearest integer' },
]

// ──────────────────────── HELPERS ────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const DIFF_STYLE: Record<Difficulty, { bg: string; border: string; color: string }> = {
  Basic: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', color: '#6ee7b7' },
  Intermediate: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.35)', color: '#fcd34d' },
  Advanced: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', color: '#f87171' },
}

const CAT_SHORT: Record<string, string> = {
  'All': 'All',
  'Excel Basics': 'Excel Basics',
  'Lookup & Reference': 'Lookups',
  'IF & Logic': 'IF & Logic',
  'Text Functions': 'Text',
  'Date & Numbers': 'Dates',
  'Pivot Tables': 'Pivot Tables',
  'Shortcuts & Productivity': 'Shortcuts',
  'Data Cleaning': 'Data Cleaning',
}

// ──────────────────────── COMPONENT ────────────────────────
export default function ExcelInterviewPrep() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [cheatOpen, setCheatOpen] = useState(false)

  // Quiz state
  const [quizMode, setQuizMode] = useState(false)
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([])
  const [quizIndex, setQuizIndex] = useState(0)
  const [quizAnswerShown, setQuizAnswerShown] = useState(false)
  const [quizScore, setQuizScore] = useState(0)
  const [quizComplete, setQuizComplete] = useState(false)
  const [quizTotal] = useState(10)

  const filteredQuestions = activeCategory === 'All'
    ? questions
    : questions.filter(q => q.category === activeCategory)

  const startQuiz = useCallback(() => {
    setQuizQuestions(shuffle(questions).slice(0, quizTotal))
    setQuizIndex(0)
    setQuizAnswerShown(false)
    setQuizScore(0)
    setQuizComplete(false)
    setQuizMode(true)
  }, [quizTotal])

  const handleCopy = (text: string, id: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  const handleQuizAnswer = (correct: boolean) => {
    if (correct) setQuizScore(s => s + 1)
    const next = quizIndex + 1
    if (next >= quizTotal) {
      setQuizComplete(true)
    } else {
      setQuizIndex(next)
      setQuizAnswerShown(false)
    }
  }

  const currentQ = quizQuestions[quizIndex]

  const statsText = `${CATEGORIES.length - 1} categories · ${questions.length} questions · Free forever`

  return (
    <main style={{ background: '#0B0B0F', color: '#fff', minHeight: '100vh', fontFamily: "'DM Sans','Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        a{text-decoration:none;color:inherit}

        .q-card{
          background:#111827;
          border:1px solid rgba(255,255,255,0.07);
          border-radius:16px;
          overflow:hidden;
          transition:border-color 0.2s;
        }
        .q-card:hover{border-color:rgba(79,124,255,0.25)}

        .q-header{
          display:flex;align-items:flex-start;justify-content:space-between;
          padding:20px 22px;cursor:pointer;gap:12px;
        }
        .q-header:hover .q-question{color:#e2e8f0}

        .q-question{
          font-size:15px;font-weight:600;line-height:1.5;
          color:rgba(255,255,255,0.85);flex:1;
          transition:color 0.15s;
        }

        .q-chevron{
          flex-shrink:0;width:20px;height:20px;
          display:flex;align-items:center;justify-content:center;
          color:rgba(255,255,255,0.3);
          transition:transform 0.2s,color 0.2s;
          margin-top:2px;
        }
        .q-chevron.open{transform:rotate(180deg);color:#4F7CFF}

        .q-body{
          padding:0 22px 20px;
          border-top:1px solid rgba(255,255,255,0.05);
        }

        .q-answer{
          font-size:14px;line-height:1.75;
          color:rgba(255,255,255,0.65);
          padding-top:18px;
        }

        .code-block{
          background:#12121a;
          border:1px solid rgba(79,124,255,0.2);
          border-radius:10px;
          padding:14px 18px;
          margin-top:14px;
          font-family:'Courier New',monospace;
          font-size:13px;
          color:#93BBFF;
          position:relative;
          overflow-x:auto;
          white-space:pre-wrap;
          word-break:break-all;
        }

        .copy-btn{
          position:absolute;top:10px;right:10px;
          background:rgba(79,124,255,0.15);
          border:1px solid rgba(79,124,255,0.3);
          color:#93BBFF;
          border-radius:6px;
          padding:4px 10px;
          font-size:11px;font-weight:700;
          cursor:pointer;font-family:'DM Sans',sans-serif;
          transition:background 0.2s;
        }
        .copy-btn:hover{background:rgba(79,124,255,0.3)}

        .tip-box{
          background:rgba(245,158,11,0.06);
          border:1px solid rgba(245,158,11,0.2);
          border-radius:10px;
          padding:12px 16px;
          margin-top:14px;
          font-size:13px;
          color:rgba(255,220,100,0.8);
          line-height:1.6;
        }
        .tip-label{
          font-weight:700;font-size:11px;letter-spacing:0.8px;
          text-transform:uppercase;color:#fcd34d;margin-bottom:4px;
        }

        .filter-bar{
          position:sticky;top:52px;z-index:90;
          background:rgba(11,11,15,0.97);
          backdrop-filter:blur(16px);
          border-bottom:1px solid rgba(255,255,255,0.05);
          padding:12px 24px;
        }

        .filter-pills{
          display:flex;gap:8px;overflow-x:auto;
          scrollbar-width:none;-ms-overflow-style:none;
          padding-bottom:2px;
        }
        .filter-pills::-webkit-scrollbar{display:none}

        .pill{
          flex-shrink:0;
          padding:6px 14px;border-radius:100px;
          font-size:13px;font-weight:600;
          cursor:pointer;border:1px solid rgba(255,255,255,0.12);
          color:rgba(255,255,255,0.5);
          background:transparent;
          font-family:'DM Sans',sans-serif;
          transition:all 0.15s;
          white-space:nowrap;
        }
        .pill:hover{border-color:rgba(79,124,255,0.4);color:#93BBFF}
        .pill.active{
          background:rgba(79,124,255,0.2);
          border-color:rgba(79,124,255,0.6);
          color:#93BBFF;
        }

        .cheat-table{
          width:100%;border-collapse:collapse;
          font-size:13px;
        }
        .cheat-table th{
          text-align:left;padding:10px 14px;
          background:rgba(79,124,255,0.08);
          color:rgba(255,255,255,0.5);
          font-size:11px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;
          border-bottom:1px solid rgba(255,255,255,0.07);
        }
        .cheat-table td{
          padding:10px 14px;
          color:rgba(255,255,255,0.7);
          border-bottom:1px solid rgba(255,255,255,0.04);
          vertical-align:top;
        }
        .cheat-table tr:last-child td{border-bottom:none}
        .cheat-table tr:hover td{background:rgba(79,124,255,0.04)}

        .fn-name{
          font-family:'Courier New',monospace;
          color:#93BBFF;font-weight:700;
        }
        .syntax-cell{
          font-family:'Courier New',monospace;
          color:rgba(147,187,255,0.7);font-size:12px;
        }

        .quiz-card{
          background:#111827;
          border:1px solid rgba(79,124,255,0.25);
          border-radius:20px;
          padding:36px 32px;
        }

        .quiz-btn{
          display:inline-flex;align-items:center;justify-content:center;
          padding:13px 28px;border-radius:12px;
          font-family:'DM Sans',sans-serif;font-weight:700;font-size:14px;
          cursor:pointer;border:none;transition:opacity 0.2s;
        }
        .quiz-btn-primary{
          background:linear-gradient(135deg,#4F7CFF,#7B61FF);
          color:#fff;
          box-shadow:0 4px 20px rgba(79,124,255,0.3);
        }
        .quiz-btn-primary:hover{opacity:0.9}
        .quiz-btn-secondary{
          background:rgba(255,255,255,0.07);
          border:1px solid rgba(255,255,255,0.12) !important;
          color:rgba(255,255,255,0.7);
        }
        .quiz-btn-secondary:hover{background:rgba(255,255,255,0.1)}
        .quiz-btn-correct{
          background:rgba(16,185,129,0.15);
          border:1px solid rgba(16,185,129,0.4) !important;
          color:#6ee7b7;
        }
        .quiz-btn-wrong{
          background:rgba(239,68,68,0.12);
          border:1px solid rgba(239,68,68,0.35) !important;
          color:#f87171;
        }

        .progress-bar-bg{
          height:4px;background:rgba(255,255,255,0.07);
          border-radius:2px;overflow:hidden;
        }
        .progress-bar-fill{
          height:100%;background:linear-gradient(90deg,#4F7CFF,#7B61FF);
          border-radius:2px;transition:width 0.3s;
        }

        @media(max-width:640px){
          .q-header{padding:16px 16px}
          .q-body{padding:0 16px 16px}
          .quiz-card{padding:24px 18px}
          .cheat-table td,.cheat-table th{padding:8px 10px}
          .syntax-cell{display:none}
        }
      `}</style>

      {/* ── TOP BAR ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(11,11,15,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: 18, letterSpacing: -0.5 }}>
          Beyond<span style={{ color: '#4F7CFF' }}>Campus</span>
        </a>
        <a href="/free" style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 6 }}>
          ← Free Resources
        </a>
      </div>

      {/* ── HERO ── */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '52px 24px 0' }}>
        <div style={{ marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', padding: '5px 14px', borderRadius: 100, background: 'rgba(79,124,255,0.12)', border: '1px solid rgba(79,124,255,0.35)', color: '#93BBFF' }}>
            FREE · NO SIGN-UP
          </span>
        </div>
        <h1 style={{ fontSize: 'clamp(28px,5vw,44px)', fontWeight: 800, letterSpacing: -1, lineHeight: 1.15, marginBottom: 14 }}>
          Excel Interview Prep
        </h1>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 24, maxWidth: 580 }}>
          The most asked Excel questions for analyst, ops, and finance roles — with formulas, examples, and interviewer tips. Free, no sign-up.
        </p>

        {/* Stats bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 28px', marginBottom: 36 }}>
          {statsText.split(' · ').map(s => (
            <span key={s} style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4F7CFF', display: 'inline-block' }} />
              {s}
            </span>
          ))}
        </div>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 52 }}>
          <button
            className="quiz-btn quiz-btn-primary"
            onClick={startQuiz}
            style={{ padding: '13px 24px' }}
          >
            Test Yourself → 10 Questions
          </button>
          <button
            className="quiz-btn quiz-btn-secondary"
            onClick={() => setCheatOpen(o => !o)}
            style={{ padding: '13px 24px', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            {cheatOpen ? 'Hide' : 'Show'} Formula Cheat Sheet
          </button>
        </div>

        {/* ── CHEAT SHEET ── */}
        {cheatOpen && (
          <div style={{ marginBottom: 48, background: '#111827', border: '1px solid rgba(79,124,255,0.2)', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>Formula Cheat Sheet</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>{cheatSheet.length} functions</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="cheat-table">
                <thead>
                  <tr>
                    <th>Function</th>
                    <th className="syntax-cell">Syntax</th>
                    <th>Use case</th>
                  </tr>
                </thead>
                <tbody>
                  {cheatSheet.map(row => (
                    <tr key={row.fn}>
                      <td><span className="fn-name">{row.fn}</span></td>
                      <td className="syntax-cell"><span style={{ fontFamily: 'Courier New,monospace', color: 'rgba(147,187,255,0.7)', fontSize: 12 }}>{row.syntax}</span></td>
                      <td>{row.use}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── QUIZ MODE ── */}
        {quizMode && (
          <div className="quiz-card" style={{ marginBottom: 52 }}>
            {quizComplete ? (
              // End screen
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>
                  {quizScore >= 8 ? '🏆' : quizScore >= 5 ? '👍' : '📚'}
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5, marginBottom: 8 }}>
                  {quizScore}/{quizTotal}
                </div>
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>
                  {quizScore >= 8 ? 'Excellent — you are interview-ready.' : quizScore >= 5 ? 'Good progress — keep practising the ones you missed.' : 'Keep reviewing the question bank below — you will get there.'}
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
                  <button className="quiz-btn quiz-btn-primary" onClick={startQuiz}>Try Again</button>
                  <button className="quiz-btn quiz-btn-secondary" onClick={() => setQuizMode(false)} style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
                    Back to Browse
                  </button>
                </div>
              </div>
            ) : currentQ ? (
              // Active quiz question
              <div>
                {/* Progress */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: 0.5 }}>
                    QUESTION {quizIndex + 1}/{quizTotal}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#6ee7b7' }}>
                    Score: {quizScore}
                  </span>
                </div>
                <div className="progress-bar-bg" style={{ marginBottom: 24 }}>
                  <div className="progress-bar-fill" style={{ width: `${((quizIndex) / quizTotal) * 100}%` }} />
                </div>

                {/* Meta */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: 'rgba(79,124,255,0.1)', border: '1px solid rgba(79,124,255,0.25)', color: '#93BBFF', fontWeight: 600 }}>
                    {currentQ.category}
                  </span>
                  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: DIFF_STYLE[currentQ.difficulty].bg, border: `1px solid ${DIFF_STYLE[currentQ.difficulty].border}`, color: DIFF_STYLE[currentQ.difficulty].color, fontWeight: 700 }}>
                    {currentQ.difficulty}
                  </span>
                </div>

                {/* Question */}
                <p style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.5, marginBottom: 24, color: '#fff' }}>
                  {currentQ.question}
                </p>

                {/* Answer area */}
                {!quizAnswerShown ? (
                  <button className="quiz-btn quiz-btn-primary" style={{ width: '100%' }} onClick={() => setQuizAnswerShown(true)}>
                    Reveal Answer
                  </button>
                ) : (
                  <div>
                    <div style={{ background: 'rgba(79,124,255,0.06)', border: '1px solid rgba(79,124,255,0.18)', borderRadius: 12, padding: '18px 20px', marginBottom: 16 }}>
                      <p style={{ fontSize: 14, lineHeight: 1.75, color: 'rgba(255,255,255,0.75)', marginBottom: currentQ.formula_example ? 12 : 0 }}>
                        {currentQ.answer}
                      </p>
                      {currentQ.formula_example && (
                        <div style={{ fontFamily: 'Courier New,monospace', fontSize: 13, color: '#93BBFF', background: '#12121a', border: '1px solid rgba(79,124,255,0.2)', borderRadius: 8, padding: '10px 14px', marginTop: 10 }}>
                          {currentQ.formula_example}
                        </div>
                      )}
                      {currentQ.tip && (
                        <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, fontSize: 13, color: 'rgba(255,220,100,0.8)', lineHeight: 1.6 }}>
                          <span style={{ fontWeight: 700, color: '#fcd34d' }}>Tip: </span>{currentQ.tip}
                        </div>
                      )}
                    </div>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 14, textAlign: 'center' }}>
                      How did you do?
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <button className="quiz-btn quiz-btn-correct" onClick={() => handleQuizAnswer(true)} style={{ border: '1px solid rgba(16,185,129,0.4)' }}>
                        Got it ✓
                      </button>
                      <button className="quiz-btn quiz-btn-wrong" onClick={() => handleQuizAnswer(false)} style={{ border: '1px solid rgba(239,68,68,0.35)' }}>
                        Missed it ✗
                      </button>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setQuizMode(false)}
                  style={{ display: 'block', marginTop: 20, marginLeft: 'auto', fontSize: 13, color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}
                >
                  Exit quiz
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* ── CATEGORY FILTER BAR ── */}
      {!quizMode && (
        <div className="filter-bar">
          <div style={{ maxWidth: 860, margin: '0 auto' }}>
            <div className="filter-pills">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={`pill${activeCategory === cat ? ' active' : ''}`}
                  onClick={() => { setActiveCategory(cat); setExpandedId(null) }}
                >
                  {CAT_SHORT[cat]}
                  {cat !== 'All' && (
                    <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.6 }}>
                      {questions.filter(q => q.category === cat).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── QUESTION CARDS ── */}
      {!quizMode && (
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 24px 100px' }}>
          <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.3)' }}>
              {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''}
              {activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
            </span>
            {expandedId !== null && (
              <button
                onClick={() => setExpandedId(null)}
                style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}
              >
                Collapse all
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredQuestions.map(q => {
              const isOpen = expandedId === q.id
              return (
                <div key={q.id} className="q-card">
                  <div
                    className="q-header"
                    onClick={() => setExpandedId(isOpen ? null : q.id)}
                    role="button"
                    aria-expanded={isOpen}
                  >
                    <div style={{ flex: 1 }}>
                      {/* Badges row */}
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                        <span style={{ fontSize: 10, padding: '2px 9px', borderRadius: 100, background: 'rgba(79,124,255,0.1)', border: '1px solid rgba(79,124,255,0.2)', color: '#93BBFF', fontWeight: 700 }}>
                          {q.category}
                        </span>
                        <span style={{ fontSize: 10, padding: '2px 9px', borderRadius: 100, background: DIFF_STYLE[q.difficulty].bg, border: `1px solid ${DIFF_STYLE[q.difficulty].border}`, color: DIFF_STYLE[q.difficulty].color, fontWeight: 700 }}>
                          {q.difficulty}
                        </span>
                      </div>
                      <p className="q-question">{q.question}</p>
                    </div>
                    <span className={`q-chevron${isOpen ? ' open' : ''}`}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>

                  {isOpen && (
                    <div className="q-body">
                      <p className="q-answer">{q.answer}</p>

                      {q.formula_example && (
                        <div className="code-block">
                          {q.formula_example}
                          <button
                            className="copy-btn"
                            onClick={e => { e.stopPropagation(); handleCopy(q.formula_example!, q.id) }}
                          >
                            {copiedId === q.id ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      )}

                      {q.tip && (
                        <div className="tip-box">
                          <div className="tip-label">Interviewer tip</div>
                          {q.tip}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Footer CTA */}
          <div style={{ marginTop: 64, padding: '32px', background: '#111827', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, textAlign: 'center' }}>
            <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Found this useful?</p>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 22, lineHeight: 1.7 }}>
              Check the full Career Toolkit — skill maps, project playbooks, and resume bullets for 15 analyst roles.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a
                href="/resources/career-toolkit"
                style={{ padding: '12px 24px', borderRadius: 12, background: 'linear-gradient(135deg,rgba(79,124,255,0.2),rgba(123,97,255,0.15))', border: '1.5px solid rgba(79,124,255,0.4)', color: '#93BBFF', fontWeight: 700, fontSize: 14, display: 'inline-block' }}
              >
                Career Toolkit →
              </a>
              <a
                href="/free"
                style={{ padding: '12px 24px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.55)', fontWeight: 600, fontSize: 14, display: 'inline-block' }}
              >
                All Free Resources
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
