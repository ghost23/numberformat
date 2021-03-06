# numberformat
Port from jquery.numberformatter, without parsing function and without dependency on jquery or jshashtable.

Originally written by
Michael Abernethy (mike@abernethysoft.com),
Andrew Parry (aparry0@gmail.com)

Licensed under the MIT (MIT-LICENSE.txt)

### Dependencies

lodash.assign

#### Generic functions:

formatNumber(numberString, options) - Takes a plain number as a string (e.g. '1002.0123') and returns
a string of the given format options.

To achieve the old way of combining parsing and formatting to keep say a input field always formatted
to a given format after it has lost focus you'd simply use a combination of the functions.

e.g.
```
$("#salary").blur(function(){
     $(this).parseNumber({format:"#,###.00", locale:"us"});
     $(this).formatNumber({format:"#,###.00", locale:"us"});
});
```

```
The syntax for the formatting is:
0 = Digit
# = Digit, zero shows as absent
. = Decimal separator
- = Negative sign
, = Grouping Separator
% = Percent (multiplies the number by 100)
```

For example, a format of "#,###.00" and text of 4500.20 will
display as "4.500,20" with a locale of "de", and "4,500.20" with a locale of "us"


### As of now, the only acceptable locales are

* Arab Emirates -> "ae"
* Australia -> "au"
* Austria -> "at"
* Brazil -> "br"
* Canada -> "ca"
* China -> "cn"
* Czech -> "cz"
* Denmark -> "dk"
* Egypt -> "eg"
* Finland -> "fi"
* France  -> "fr"
* Germany -> "de"
* Greece -> "gr"
* Great Britain -> "gb"
* Hong Kong -> "hk"
* India -> "in"
* Israel -> "il"
* Japan -> "jp"
* Russia -> "ru"
* South Korea -> "kr"
* Spain -> "es"
* Sweden -> "se"
* Switzerland -> "ch"
* Taiwan -> "tw"
* Thailand -> "th"
* United States -> "us"
* Vietnam -> "vn"