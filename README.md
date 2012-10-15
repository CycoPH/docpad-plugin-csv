# CSV Plugin for DocPad
This plugin provides [DocPad](https://github.com/bevry/docpad) with CSV data mapping. CSV are numbers that represent the cost of an item or a mapping from one value to another.


## Install

```
npm install --save docpad-plugin-csv
```


## Usage

### Setup

To use, first create the `src/csv` directory, and place any set of config files you want to use in there.

Then in our templates we will be exposed with the `@csv(config_file,data_point)` function. The `data_point` argument is NOT optional, and is used to send custom data to the csv's `templateData`.

The following options are available:
csvPath - [csv] directory name under `src' where the csv files are loaded from
currency - [''] What currency symbol you want to use if you are outputting prices
decimal - [2] How many decimal places are displayed
decimalPoint - ['.'] What symbol is used to represent the decimal point
thausandSep - [','] What symbol is used to represent the thousand seperator in numbers. Use '' if you dont want any.
defExtension - ['csv'] This is added to each of the data filenames used into the commands.  Just makes it shorter to type.
zeroIs - ['TBD'] When a price is created and the value is 0 then this is used to represent the 0.

### Example
Create a file called `test.csv` in the `src/csv` folder.
Add the following two lines:
ABC, 1559
DEF, 12.99
XYZ, Hello there

This basically is a mapping from `ABC` to `1559` and from `DEF` to `12`.

Inside a test document we can use this command to replace `ABC` entries with the value from the csv file.
`<%- @csv('test', 'ABC') %>` will produce `559`
`<%- @csv('test', 'DEF') %>` will produce `12.99`
`<%- @csv('test', 'XYZ') %>` will produce `Hello there`

If you are working with numbers then you can also do this:
`<%- @csvPrice('test', 'ABC') %>` will produce `1,559.00`
`<%- @csvPrice('test', 'DEF') %>` will produce `12.99`

or if you want numbers but no decimals:
`<%- @csvPriceNoDec('test', 'ABC') %>` will produce `1,559`
`<%- @csvPriceNoDec('test', 'DEF') %>` will produce `12`


## History
You can discover the history inside the `History.md` file


## License
Licensed under the incredibly [permissive](http://en.wikipedia.org/wiki/Permissive_free_software_licence) [MIT License](http://creativecommons.org/licenses/MIT/)
<br/>Copyright &copy; 2012 [Cerebus Software CC](http://cerebus.co.za)