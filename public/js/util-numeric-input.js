ready(function () {
    if (!Modernizr.input.pattern) {
        toHtmlNumericInput('amount');
    }
});

// call this function with the id of the input textbox you want to be html-numeric-input
// by default, decimal separator is '.', you can force to use comma with the second parameter = true
function toHtmlNumericInput(inputElementId, useCommaAsDecimalSeparator) {
    var textbox = document.getElementById(inputElementId);
    // called when key is pressed
    // in keydown, we get the keyCode
    // in keyup, we get the input.value (including the charactor we've just typed
    textbox.addEventListener("keydown", function _OnNumericInputKeyDown(e) {
        var key = e.which || e.keyCode; // http://keycode.info/
        if (!e.shiftKey && !e.altKey && !e.ctrlKey &&
            // alphabet
            key >= 65 && key <= 90 ||
            // spacebar
            key == 32) {
            e.preventDefault();
            return false;
        }
        if (!e.shiftKey && !e.altKey && !e.ctrlKey &&
            // numbers
            key >= 48 && key <= 57 ||
            // Numeric keypad
            key >= 96 && key <= 105 ||
            // allow: Ctrl+A
            (e.keyCode == 65 && e.ctrlKey === true) ||
            // allow: Ctrl+C
            (key == 67 && e.ctrlKey === true) ||
            // Allow: Ctrl+X
            (key == 88 && e.ctrlKey === true) ||
            // allow: home, end, left, right
            (key >= 35 && key <= 39) ||
            // Backspace and Tab and Enter
            key == 8 || key == 9 || key == 13 ||
            // Del and Ins
            key == 46 || key == 45) {
            return true;
        }
        var v = this.value; // v can be null, in case textbox is number and does not valid
        // if minus, dash 
        if (key == 109 || key == 189) {
            // if already has -, ignore the new one
            if (v[0] === '-') {
                // console.log('return, already has - in the beginning');
                return false;
            }
        }
        if (!e.shiftKey && !e.altKey && !e.ctrlKey &&
            // comma, period and numpad.dot
            key == 190 || key == 188 || key == 110) {
            // console.log('already having comma, period, dot', key);
            if (/[\.,]/.test(v)) {
                // console.log('return, already has , . somewhere');
                return false;
            }
        }
    });
    textbox.addEventListener("keyup", function _OnNumericInputKeyUp(e) {
        var v = this.value;
        if(false) {
        // if (+v) { 
            // this condition check if convert to number success, let it be
            // put this condition will have better performance
            // but I haven't test it with cultureInfo = comma decimal separator, so, to support both . and , as decimalSeparator, I remove this condition
            //                      "1000"  "10.9"  "1,000.9"   "011"   "10c"   "$10"
            //+str, str*1, str-0    1000    10.9    NaN         11      NaN     NaN
        } else if (v) {
            // refine the value
            
            // this replace also remove the -, we add it again if needed
            v = (v[0] === '-' ? '-' : '') + 
                (useCommaAsDecimalSeparator ? 
                    v.replace(/[^0-9\,]/g, '') : 
                    v.replace(/[^0-9\.]/g, ''));
            
            // remove all decimalSeparator that have other decimalSeparator following. After this processing, only the last decimalSeparator is kept.
            if(useCommaAsDecimalSeparator){
                v = v.replace(/,(?=(.*),)+/g, '');
            } else {
                v = v.replace(/\.(?=(.*)\.)+/g, '');
            }
            this.value = v; // update value only if we changed it
        }
    });
}