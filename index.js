/**
 * jquery.numberformatter - Formatting/Parsing Numbers in jQuery
 *
 * Written by
 * Michael Abernethy (mike@abernethysoft.com),
 * Andrew Parry (aparry0@gmail.com)
 *
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * @author Michael Abernethy, Andrew Parry
 * @version 1.2.4-RELEASE ($Id: $)
 *
 * Dependencies
 *
 * jshashtable (http://www.timdown.co.uk/jshashtable)
 *
 **/

var _assign = require("lodash.assign");

function NumberFormatter() {

    this.defaults = {
        format: "#,###.00",
        locale: "us",
        decimalSeparatorAlwaysShown: false,
        nanForceZero: true,
        round: true,
        isFullLocale: false,
        overrideGroupSep: null,
        overrideDecSep: null,
        overrideNegSign: null,
        isPercentage: false,            // treats the input as a percentage (i.e. input multiplied by 100)
        autoDetectPercentage: true      // will search if the format string ends with '%', if it does then the above option is implicitly set
    };

    var nfLocales = {initialized: false};

    var nfLocalesLikeUS = ['ae', 'ar', 'au', 'ca', 'cn', 'eg', 'gb', 'hk', 'il', 'in', 'jp', 'mx', 'sa', 'sk', 'th', 'tw', 'us', 'za'];
    var nfLocalesLikeDE = ['at', 'be', 'br', 'de', 'dk', 'ee', 'es', 'gr', 'it', 'lt', 'lv', 'nl', 'pt', 'tr', 'vn'];
    var nfLocalesLikeFR = ['bg', 'cz', 'fi', 'fr', 'no', 'pl', 'ro', 'ru', 'se'];
    var nfLocalesLikeCH = ['ch'];

    var nfLocaleFormatting = [[".", ","], [",", "."], [",", " "], [".", "'"]];
    var nfAllLocales = [nfLocalesLikeUS, nfLocalesLikeDE, nfLocalesLikeFR, nfLocalesLikeCH];

    function init() {
        // write the arrays into the hashtable
        for (var localeGroupIdx = 0; localeGroupIdx < nfAllLocales.length; localeGroupIdx++) {
            var localeGroup = nfAllLocales[localeGroupIdx];
            for (var i = 0; i < localeGroup.length; i++) {
                nfLocales[localeGroup[i]] = localeGroupIdx;
            }
        }

        nfLocales.initialized = true;
    }

    function formatCodes(locale, isFullLocale) {
        if (!nfLocales.initialized)
            init();

        // default values
        var dec = ".";
        var group = ",";
        var neg = "-";

        if (isFullLocale == false) {
            // Extract and convert to lower-case any language code from a real 'locale' formatted string, if not use as-is
            // (To prevent locale format like : "fr_FR", "en_US", "de_DE", "fr_FR", "en-US", "de-DE")
            if (locale.indexOf('_') != -1)
                locale = locale.split('_')[1].toLowerCase();
            else if (locale.indexOf('-') != -1)
                locale = locale.split('-')[1].toLowerCase();
        }

        // hashtable lookup to match locale with codes
        var codesIndex = nfLocales[locale];
        if (codesIndex) {
            var codes = nfLocaleFormatting[codesIndex];
            if (codes) {
                dec = codes[0];
                group = codes[1];
            }
        }
        return {dec: dec, group: group, neg: neg};
    }


    /*  Formatting Methods  */

    /**
     * First parses a string and reformats it with the given options.
     *
     * @param {Object} numberString
     * @param {Object} options
     */
    this.formatNumber = function (numberString, options) {
        options = _assign({}, this.defaults, options);
        var formatData = formatCodes(options.locale.toLowerCase(), options.isFullLocale);

        var dec = formatData.dec;
        var group = formatData.group;
        var neg = formatData.neg;

        var validFormat = "0#-,.";

        // in the prefix & suffix part of the format string, characters can be escaped
        // by surrounding them in single quotes, so they are not intepreted as formatting placeholders
        var singleQuote = '\'';
        var nextCharIsQuoted = false;

        // strip all the invalid characters at the beginning and the end
        // of the format, and we'll stick them back on at the end
        // make a special case for the negative sign "-" though, so
        // we can have formats like -$23.32
        var prefix = "";
        var negativeInFront = false;
        for (var i = 0; i < options.format.length; i++) {
            if (options.format.charAt(i) == singleQuote) {
                if (options.format.charAt(i + 1) == singleQuote) {
                    prefix = prefix + singleQuote;
                }
                nextCharIsQuoted = !nextCharIsQuoted && options.format.charAt(i + 2) == singleQuote;
            } else if (validFormat.indexOf(options.format.charAt(i)) == -1 || nextCharIsQuoted) {
                prefix = prefix + options.format.charAt(i);
            } else {
                if (i == 0 && options.format.charAt(i) == '-') {
                    negativeInFront = true;
                } else {
                    // end of prefix has been reached, remove it from format string
                    options.format = options.format.substring(i, options.format.length);
                    break;
                }
            }
        }
        var suffix = "";
        for (i = options.format.length - 1; i >= 0; i--) {
            if (options.format.charAt(i) == singleQuote) {
                if (options.format.charAt(i - 1) == singleQuote) {
                    suffix = singleQuote + suffix;
                }
                nextCharIsQuoted = !nextCharIsQuoted && options.format.charAt(i - 2) == singleQuote;
            } else if (validFormat.indexOf(options.format.charAt(i)) == -1 || nextCharIsQuoted) {
                suffix = options.format.charAt(i) + suffix;
            } else {
                // beginning of suffix has been reached, remove it from format string
                options.format = options.format.substring(0, i + 1);
                break;
            }
        }

        // now we need to convert it into a number
        //while (numberString.indexOf(group) > -1)
        //  numberString = numberString.replace(group, '');
        //var number = new Number(numberString.replace(dec, ".").replace(neg, "-"));
        var number = Number(numberString);

        return this._formatNumber(number, options, suffix, prefix, negativeInFront);
    };

    /**
     * Formats a Number object into a string, using the given formatting options
     *
     * @param {Object} numberString
     * @param {Object} options
     */
    this._formatNumber = function (number, options, suffix, prefix, negativeInFront) {
        options = _assign({}, this.defaults, options);
        var formatData = formatCodes(options.locale.toLowerCase(), options.isFullLocale);

        var dec = formatData.dec;
        var group = formatData.group;
        var neg = formatData.neg;

        // check overrides
        if (options.overrideGroupSep != null) {
            group = options.overrideGroupSep;
        }
        if (options.overrideDecSep != null) {
            dec = options.overrideDecSep;
        }
        if (options.overrideNegSign != null) {
            neg = options.overrideNegSign;
        }

        // Check NAN handling
        var forcedToZero = false;
        if (isNaN(number)) {
            if (options.nanForceZero == true) {
                number = 0;
                forcedToZero = true;
            } else {
                return '';
            }
        }

        // special case for percentages
        if (options.isPercentage == true || (options.autoDetectPercentage && suffix.charAt(suffix.length - 1) == '%')) {
            number = number * 100;
        }

        var returnString = "";
        if (options.format.indexOf(".") > -1) {
            var decimalPortion = dec;
            var decimalFormat = options.format.substring(options.format.lastIndexOf(".") + 1);

            // round or truncate number as needed
            if (options.round == true)
                number = Number(this._roundNumber(number, decimalFormat.length));
            else {
                var numStr = number.toString();
                if (numStr.lastIndexOf('.') > 0) {
                    numStr = numStr.substring(0, numStr.lastIndexOf('.') + decimalFormat.length + 1);
                }
                number = Number(numStr);
            }

            var decimalValue = Number(number.toString().substring(number.toString().indexOf('.')));
            var decimalString = String(this._roundNumber(decimalValue, decimalFormat.length));
            decimalString = decimalString.substring(decimalString.lastIndexOf('.') + 1);
            for (var i = 0; i < decimalFormat.length; i++) {
                if (decimalFormat.charAt(i) == '#' && decimalString.charAt(i) != '0') {
                    decimalPortion += decimalString.charAt(i);
                } else if (decimalFormat.charAt(i) == '#' && decimalString.charAt(i) == '0') {
                    var notParsed = decimalString.substring(i);
                    if (notParsed.match('[1-9]')) {
                        decimalPortion += decimalString.charAt(i);
                    } else
                        break;
                } else if (decimalFormat.charAt(i) == "0")
                    decimalPortion += decimalString.charAt(i);
            }
            returnString += decimalPortion
        } else
            number = Math.round(number);

        var ones = Math.floor(number);
        if (number < 0)
            ones = Math.ceil(number);

        var onesFormat = "";
        if (options.format.indexOf(".") == -1)
            onesFormat = options.format;
        else
            onesFormat = options.format.substring(0, options.format.indexOf("."));

        var onePortion = "";
        if (!(ones == 0 && onesFormat.substr(onesFormat.length - 1) == '#') || forcedToZero) {
            // find how many digits are in the group
            var oneText = String(Math.abs(ones));
            var groupLength = 9999;
            if (onesFormat.lastIndexOf(",") != -1)
                groupLength = onesFormat.length - onesFormat.lastIndexOf(",") - 1;
            var groupCount = 0;
            for (i = oneText.length - 1; i > -1; i--) {
                onePortion = oneText.charAt(i) + onePortion;
                groupCount++;
                if (groupCount == groupLength && i != 0) {
                    onePortion = group + onePortion;
                    groupCount = 0;
                }
            }

            // account for any pre-data padding
            if (onesFormat.length > onePortion.length) {
                var padStart = onesFormat.indexOf('0');
                if (padStart != -1) {
                    var padLen = onesFormat.length - padStart;

                    // pad to left with 0's or group char
                    var pos = onesFormat.length - onePortion.length - 1;
                    while (onePortion.length < padLen) {
                        var padChar = onesFormat.charAt(pos);
                        // replace with real group char if needed
                        if (padChar == ',')
                            padChar = group;
                        onePortion = padChar + onePortion;
                        pos--;
                    }
                }
            }
        }

        if (!onePortion && onesFormat.indexOf('0', onesFormat.length - 1) !== -1)
            onePortion = '0';

        returnString = onePortion + returnString;

        // handle special case where negative is in front of the invalid characters
        if (number < 0 && negativeInFront && prefix.length > 0)
            prefix = neg + prefix;
        else if (number < 0)
            returnString = neg + returnString;

        if (!options.decimalSeparatorAlwaysShown) {
            if (returnString.lastIndexOf(dec) == returnString.length - 1) {
                returnString = returnString.substring(0, returnString.length - 1);
            }
        }
        returnString = prefix + returnString + suffix;
        return returnString;
    };

    this._roundNumber = function (number, decimalPlaces) {
        var power = Math.pow(10, decimalPlaces || 0);
        var value = String(Math.round(number * power) / power);

        // ensure the decimal places are there
        if (decimalPlaces > 0) {
            var dp = value.indexOf(".");
            if (dp == -1) {
                value += '.';
                dp = 0;
            } else {
                dp = value.length - (dp + 1);
            }

            while (dp < decimalPlaces) {
                value += '0';
                dp++;
            }
        }
        return value;
    };
}

module.exports = NumberFormatter;