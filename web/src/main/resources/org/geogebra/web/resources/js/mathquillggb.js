/**
 * MathQuillGGB is a fork of MathQuill used and incorporated in
 * the mobile, touch and web versions of GeoGebra.
 * 
 * 
 * Information on the original license of MathQuill:
 * Mozilla Public License, v. 2.0: http://mozilla.org/MPL/2.0/
 * Project Website: http://mathquill.com
 *
 *
 * Information on MathQuillGGB:
 * This file was modified by the colleagues at GeoGebra Inc.
 * The file became part of the web version of the software GeoGebra.
 * Appropriate license terms apply.
 */

$ggbQuery = jQuery;

(function() {

var $ = $ggbQuery;
  undefined,
  mqCmdId = 'mathquillggb-command-id',
  mqBlockId = 'mathquillggb-block-id',
  min = Math.min,
  max = Math.max;

function noop() {}

function hangulJamo(str) {
  var ret = "";
  for (var ii = 0; ii < str.length; ii++) {
    ret += toHangulJamoChars(str.charAt(ii));
  }
  return ret;
}

function toHangulJamoChars(kuc) {
  switch (kuc) {
    case '\u3131': return '\u1100';
    case '\u3132': return '\u1101';
    case '\u3134': return '\u1102';
    case '\u3137': return '\u1103';
    case '\u3138': return '\u1104';
    case '\u3139': return '\u1105';
    case '\u3141': return '\u1106';
    case '\u3142': return '\u1107';
    case '\u3143': return '\u1108';
    case '\u3145': return '\u1109';
    case '\u3146': return '\u110A';
    case '\u3147': return '\u110B';
    case '\u3148': return '\u110C';
    case '\u3149': return '\u110D';
    case '\u314A': return '\u110E';
    case '\u314B': return '\u110F';
    case '\u314C': return '\u1110';
    case '\u314D': return '\u1111';
    case '\u314E': return '\u1112';
    case '\u314F': return '\u1161';
    case '\u3150': return '\u1162';
    case '\u3151': return '\u1163';
    case '\u3152': return '\u1164';
    case '\u3153': return '\u1165';
    case '\u3154': return '\u1166';
    case '\u3155': return '\u1167';
    case '\u3156': return '\u1168';
    case '\u3157': return '\u1169';
    case '\u3158': return '\u116A';
    case '\u3159': return '\u116B';
    case '\u315A': return '\u116C';
    case '\u315B': return '\u116D';
    case '\u315C': return '\u116E';
    case '\u315D': return '\u116F';
    case '\u315E': return '\u1170';
    case '\u315F': return '\u1171';
    case '\u3160': return '\u1172';
    case '\u3161': return '\u1173';
    case '\u3162': return '\u1174';
    case '\u3163': return '\u1175';
    //(a lot of duplicates after here, ignore the repeats)
    // \u3131 \u11A8 NOTE: different mapping?
    // \u3132 \u11A9 NOTE: different mapping?
    case '\u3133': return '\u11AA';
    // \u3134 \u11AB NOTE: different mapping?
    case '\u3135': return '\u11AC';
    case '\u3136': return '\u11AD';
    // \u3137 \u11AE NOTE: different mapping?
    // \u3139 \u11AF NOTE: different mapping?
    case '\u313A': return '\u11B0';
    case '\u313B': return '\u11B1';
    case '\u313C': return '\u11B2';
    case '\u313D': return '\u11B3';
    case '\u313E': return '\u11B4';
    case '\u313F': return '\u11B5';
    case '\u3140': return '\u11B6';
    // \u3141 \u11B7 NOTE: different mapping?
    // \u3142 \u11B8 NOTE: different mapping?
    case '\u3144': return '\u11B9';
    // \u3145 \u11BA NOTE: different mapping?
    // \u3146 \u11BB NOTE: different mapping?
    // \u3147 \u11BC NOTE: different mapping?
    // \u3148 \u11BD NOTE: different mapping?
    // \u314A \u11BE NOTE: different mapping?
    // \u314B \u11BF NOTE: different mapping?
    // \u314C \u11C0 NOTE: different mapping?
    // \u314D \u11C1 NOTE: different mapping?
    // \u314E \u11C2 NOTE: different mapping?
    default: return kuc;
  }
}

function adjustFixedTextarea(rootJQ) {
  // it would be good to call GWT's Element.getAbsoluteLeft,
  // Element.getAbsoluteTop from here! But documentation says
  // DOM element.getBoundingClientRect is pretty cross-browser,
  // so it can be used for our needs in modern browsers... 
  if ((rootJQ === undefined) || (rootJQ === noop)) {
    return;
  }
  var rel = rootJQ.parents('.NewRadioButtonTreeItem');
  var taa = rootJQ.find('.textarea')[0];
  if ((rel[0] !== undefined) && (taa !== undefined)) {
	// taa is position: fixed, and this way it will be hopefully on-screen
    taa.style.left = (rel[0].scrollLeft + (rel[0].offsetWidth / 2)) + 'px';
  }
}

/**
 * A utility higher-order function that makes defining variadic
 * functions more convenient by letting you essentially define functions
 * with the last argument as a splat, i.e. the last argument "gathers up"
 * remaining arguments to the function:
 *   var doStuff = variadic(function(first, rest) { return rest; });
 *   doStuff(1, 2, 3); // => [2, 3]
 */
var __slice = [].slice;
function variadic(fn) {
  var numFixedArgs = fn.length - 1;
  return function() {
    var args = __slice.call(arguments, 0, numFixedArgs);
    var varArg = __slice.call(arguments, numFixedArgs);
    return fn.apply(this, args.concat([ varArg ]));
  };
}

/**
 * A utility higher-order function that makes combining object-oriented
 * programming and functional programming techniques more convenient:
 * given a method name and any number of arguments to be bound, returns
 * a function that calls it's first argument's method of that name (if
 * it exists) with the bound arguments and any additional arguments that
 * are passed:
 *   var sendMethod = send('method', 1, 2);
 *   var obj = { method: function() { return Array.apply(this, arguments); } };
 *   sendMethod(obj, 3, 4); // => [1, 2, 3, 4]
 *   // or more specifically,
 *   var obj2 = { method: function(one, two, three) { return one*two + three; } };
 *   sendMethod(obj2, 3); // => 5
 *   sendMethod(obj2, 4); // => 6
 */
var send = variadic(function(method, args) {
  return variadic(function(obj, moreArgs) {
    if (method in obj) return obj[method].apply(obj, args.concat(moreArgs));
  });
});

/**
 * A utility higher-order function that creates "implicit iterators"
 * from "generators": given a function that takes in a sole argument,
 * a "yield" function, that calls "yield" repeatedly with an object as
 * a sole argument (presumably objects being iterated over), returns
 * a function that calls it's first argument on each of those objects
 * (if the first argument is a function, it is called repeatedly with
 * each object as the first argument, otherwise it is stringified and
 * the method of that name is called on each object (if such a method
 * exists)), passing along all additional arguments:
 *   var a = [
 *     { method: function(list) { list.push(1); } },
 *     { method: function(list) { list.push(2); } },
 *     { method: function(list) { list.push(3); } }
 *   ];
 *   a.each = iterator(function(yield) {
 *     for (var i in this) yield(this[i]);
 *   });
 *   var list = [];
 *   a.each('method', list);
 *   list; // => [1, 2, 3]
 *   // Note that the for-in loop will yield 'each', but 'each' maps to
 *   // the function object created by iterator() which does not have a
 *   // .method() method, so that just fails silently.
 */
function iterator(generator) {
  return variadic(function(fn, args) {
    if (typeof fn !== 'function') fn = send(fn);
    var yield = function(obj) { return fn.apply(obj, [ obj ].concat(args)); };
    return generator.call(this, yield);
  });
}

/**
 * sugar to make defining lots of commands easier.
 * TODO: rethink this.
 */
function bind(cons /*, args... */) {
  var args = __slice.call(arguments, 1);
  return function() {
    return cons.apply(this, args);
  };
}

var P = (function(prototype, ownProperty, undefined) {
  // helper functions that also help minification
  function isObject(o) { return typeof o === 'object'; }
  function isFunction(f) { return typeof f === 'function'; }

  function P(_superclass /* = Object */, definition) {
    // handle the case where no superclass is given
    if (definition === undefined) {
      definition = _superclass;
      _superclass = Object;
    }

    // C is the class to be returned.
    // There are three ways C will be called:
    //
    // 1) We call `new C` to create a new uninitialized object.
    //    The behavior is similar to Object.create, where the prototype
    //    relationship is set up, but the ::init method is not run.
    //    Note that in this case we have `this instanceof C`, so we don't
    //    spring the first trap. Also, `args` is undefined, so the initializer
    //    doesn't get run.
    //
    // 2) A user will simply call C(a, b, c, ...) to create a new object with
    //    initialization.  This allows the user to create objects without `new`,
    //    and in particular to initialize objects with variable arguments, which
    //    is impossible with the `new` keyword.  Note that in this case,
    //    !(this instanceof C) springs the return trap at the beginning, and
    //    C is called with the `new` keyword and one argument, which is the
    //    Arguments object passed in.
    //
    // 3) For internal use only, if new C(args) is called, where args is an
    //    Arguments object.  In this case, the presence of `new` means the
    //    return trap is not sprung, but the initializer is called if present.
    //
    //    You can also call `new C([a, b, c])`, which is equivalent to `C(a, b, c)`.
    //
    //  TODO: the Chrome inspector shows all created objects as `C` rather than `Object`.
    //        Setting the .name property seems to have no effect.  Is there a way to override
    //        this behavior?
    function C(args) {
      var self = this;
      if (!(self instanceof C)) return new C(arguments);
      if (args && isFunction(self.init)) self.init.apply(self, args);
    }

    // set up the prototype of the new class
    // note that this resolves to `new Object`
    // if the superclass isn't given
    var proto = C[prototype] = new _superclass();

    // other variables, as a minifier optimization
    var _super = _superclass[prototype];
    var extensions;

    // set the constructor property on the prototype, for convenience
    proto.constructor = C;

    C.mixin = function(def) {
      C[prototype] = P(C, def)[prototype];
      return C;
    }

    return (C.open = function(def) {
      extensions = {};

      if (isFunction(def)) {
        // call the defining function with all the arguments you need
        // extensions captures the return value.
        extensions = def.call(C, proto, _super, C, _superclass);
      }
      else if (isObject(def)) {
        // if you passed an object instead, we'll take it
        extensions = def;
      }

      // ...and extend it
      if (isObject(extensions)) {
        for (var ext in extensions) {
          if (ownProperty.call(extensions, ext)) {
            proto[ext] = extensions[ext];
          }
        }
      }

      // if there's no init, we assume we're inheriting a non-pjs class, so
      // we default to applying the superclass's constructor.
      if (!isFunction(proto.init)) {
        proto.init = function() { _superclass.apply(this, arguments); };
      }

      return C;
    })(definition);
  }

  // ship it
  return P;

  // as a minifier optimization, we've closured in a few helper functions
  // and the string 'prototype' (C[p] is much shorter than C.prototype)
})('prototype', ({}).hasOwnProperty);
/*************************************************
 * Textarea Manager
 *
 * An abstraction layer wrapping the textarea in
 * an object with methods to manipulate and listen
 * to events on, that hides all the nasty cross-
 * browser incompatibilities behind a uniform API.
 *
 * Design goal: This is a *HARD* internal
 * abstraction barrier. Cross-browser
 * inconsistencies are not allowed to leak through
 * and be dealt with by event handlers. All future
 * cross-browser issues that arise must be dealt
 * with here, and if necessary, the API updated.
 *
 * Organization:
 * - key values map and stringify()
 * - manageTextarea()
 *    + defer() and flush()
 *    + event handler logic
 *    + attach event handlers and export methods
 ************************************************/

var manageTextarea = (function() {
  // The following [key values][1] map was compiled from the
  // [DOM3 Events appendix section on key codes][2] and
  // [a widely cited report on cross-browser tests of key codes][3],
  // except for 10: 'Enter', which I've empirically observed in Safari on iOS
  // and doesn't appear to conflict with any other known key codes.
  //
  // [1]: http://www.w3.org/TR/2012/WD-DOM-Level-3-Events-20120614/#keys-keyvalues
  // [2]: http://www.w3.org/TR/2012/WD-DOM-Level-3-Events-20120614/#fixed-virtual-key-codes
  // [3]: http://unixpapa.com/js/key.html
  var KEY_VALUES = {
    8: 'Backspace',
    9: 'Tab',

    10: 'Enter', // for Safari on iOS

    13: 'Enter',

    16: 'Shift',
    17: 'Control',
    18: 'Alt',
    20: 'CapsLock',

    27: 'Esc',

    32: 'Spacebar',

    33: 'PageUp',
    34: 'PageDown',
    35: 'End',
    36: 'Home',

    37: 'Left',
    38: 'Up',
    39: 'Right',
    40: 'Down',

    45: 'Insert',

    46: 'Del',

    86: 'V',

    112: 'F1',
    144: 'NumLock'
  };

  // To the extent possible, create a normalized string representation
  // of the key combo (i.e., key code and modifier keys).
  function stringify(evt) {
    var which = evt.which || evt.keyCode;
    var keyVal = KEY_VALUES[which];
    var key;
    var modifiers = [];

    if (evt.ctrlKey) modifiers.push('Ctrl');
    if (evt.originalEvent && evt.originalEvent.metaKey) modifiers.push('Meta');
    if (evt.altKey) modifiers.push('Alt');
    if (evt.shiftKey) modifiers.push('Shift');

    // for alphanumeric characters, String.fromCharCode will
    // give the character, although it is a keyCode not charCode
    // so "A" will be "Shift-A" and "a" will be simple "A"
    key = keyVal || String.fromCharCode(which);

    if (!modifiers.length && !keyVal) return key;

    modifiers.push(key);
    return modifiers.join('-');
  }

  // create a textarea manager that calls callbacks at useful times
  // and exports useful public methods
  return function manageTextarea(el, opts) {
    var keydown = null;
    var keypress = null;

    if (!opts) opts = {};
    var textCallback = opts.text || noop;
    var keyCallback = opts.key || noop;
    var pasteCallback = opts.paste || noop;
    var onCut = opts.cut || noop;
    var onCopy = opts.copy || noop;
    var rootJQ = opts.rootJQ || noop;
    var cursorMoveLeft = opts.moveLeft || noop;

    var textarea = $(el);
    var target = $(opts.container || textarea);

    // checkTextareaFor() is called after keypress or paste events to
    // say "Hey, I think something was just typed" or "pasted" (resp.),
    // so that at all subsequent opportune times (next event or timeout),
    // will check for expected typed or pasted text.
    // Need to check repeatedly because #135: in Safari 5.1 (at least),
    // after selecting something and then typing, the textarea is
    // incorrectly reported as selected during the input event (but not
    // subsequently).
    var checkTextarea = noop;
    var checkTextarea2 = noop;

    function checkTextareaFor(checker) {
      if (checkTextarea2 === noop) {
        checkTextarea = checker;
        setTimeout(checker);
      } else {
    	checkTextarea = noop;
      }
    }

    function checkTextareaFor2(checker) {
      checkTextarea2 = function() {
    	  setTimeout(checker, 200);
      }
      checkTextarea2();
    }

    // TODO: Wondering why there is a target.bind both here and at the end...
    // It would be good to revise hard-to-understand MathQuillGGB code!
    // but key events may be necessary to remain for the ^ hat character in IE
    target.bind('keydown keypress keyup', function() {
      checkTextarea();
    });

    //working on the paste event while commenting this out, Okay
    //target.bind('paste', function() { checkTextarea2(); });

    // the input event does not fire (maybe the paste event is prevented),
    // otherwise leaving it here, maybe necessary for the ^ hat character to work
    // focusout: I don't know, but now I'm commenting it out
    // as the textarea should keep its focus, as far as I know,
    // and if not, then "focusout" should not be called before "paste" anyway
    //target.bind('input focusout', function() { checkTextarea2(); checkTextarea(); });
    target.bind('input', function() {
      // does this need some more waiting in case of Korean characters?
      checkTextareaFor(typedText);
    });


    // -*- public methods -*- //
    function select(text) {
      checkTextarea2();

      textarea.val(text);
      if (text) textarea[0].select();
    }

    // -*- helper subroutines -*- //

    // Determine whether there's a selection in the textarea.
    // This will always return false in IE < 9, which don't support
    // HTMLTextareaElement::selection{Start,End}.
    function hasSelection() {
      var dom = textarea[0];

      if (!('selectionStart' in dom)) return false;
      return dom.selectionStart !== dom.selectionEnd;
    }

    function popTextForPaste(callback) {
      var text = textarea.val();
      textarea.val('');
      if (text) callback(text);
      checkTextarea2 = noop;
    }

    function popText(callback) {
      var text = textarea.val();

      // is this too early, e.g. in case of Korean?
      if ((text !== undefined) && (text !== '')) {
    	// something really entered
    	//if (text === '^') {
    	  // in IE the two hats come separately
    	  // in Firefox keypress will contain hat-prefix
    	  // even if textarea.val('') was called,
    	  // so in Firefox, onehat is undefined
    	  // Edit: but not if Firefox is used with the
    	  // on-screen keyboard! By the way, as two
    	  // ^^ are not allowed now anyway, we can get
    	  // rid of this hacking now...
    	  //if (textarea.onehat !== undefined) {
    	  //  delete textarea.onehat;
          //  textarea.val('');
    	  //} else {
    	  //  textarea.onehat = true;
          //  textarea.val('');
          //  callback('^');
    	  //}
    	//} else {
        //  if (textarea.onehat !== undefined) {
        //	delete textarea.onehat;
        //  }
          // no ^ hat character, do the general case
    	  // or even in case of ^2 this is the way to go
    	  // to be cross-browser...
          textarea.val('');
          callback(text);
    	//}
      }
      // else textarea.val(''); do not do it to avoid deleting one hat
      if (textarea[0] && textarea[0].simulatedKeypressMore) {
        textarea[0].simulatedKeypressMore = false;
    	if (text.charAt(0) === '(') {
    		callback(')');
    		cursorMoveLeft();
    	} else if (text.charAt(0) === '|') {
    		callback('|');
    		cursorMoveLeft();
    	} else if (text.charAt(0) === '"') {
    		callback('"');
    		cursorMoveLeft();
    	}
      }
    }

    function handleKey() {
      keyCallback(stringify(keydown), keydown);
    }

    // -*- event handlers -*- //
    function onKeydown(e) {
      keydown = e;
      keypress = null;

      adjustFixedTextarea(rootJQ);

      handleKey();

      if (e.keyCode) {
    	if (e.keyCode === 229) {
    	  // this means some kind of a Korean or other special key, they say
    	  // for which keypress might not fire, so let's do its action
    	  // earlier, and make sure keypress will really not fire, for
    	  // more deterministic code...
          checkTextareaFor(typedText);

          // with preventDefault it's not good
          //e.preventDefault();
    	}
      }

      if (textarea[0] && textarea[0].disabledTextarea) {
    	// this can only happen in scenarios when
    	// stopPropagation is useful here
    	e.stopPropagation();
    	// but preventDefault is not useful!
      }
    }

    function onKeypress(e) {
      // windower is like noop: are they visible here?
      if (textarea[0] && textarea[0].simulatedKeypress) {
        // of course, this case do not handleKey,
    	// maybe we could set keypress to null,
    	// after the keypress had effect,
    	// but it is not that important...
    	keydown = null;
        textarea[0].simulatedKeypress = false;
      } else {
          // they do it in a different way
          //if (e.charCode) {
              // (why) does this matter?
              //keydown = null;

              // Korean characters need this, for imperfect
              // implementation of Windows native keyboard,
    		  // or also it's build-in on-screen keyboard

    		  //var cstr = String.fromCharCode(e.charCode);
    		  //cstr = hangulJamo(cstr);
    		  //var code = cstr.charCodeAt(0);
    	      //if ((code >= 0x1100) && (code <= 0x1112)) {
    	      //  textarea.val(cstr);
    	      //} else if ((code >= 0x1161) && (code <= 0x1175)) {
    	      //  textarea.val(cstr);
              //} else if ((code >= 0x11a8) && (code <= 0x11c2)) {
              //  textarea.val(cstr);
              //} else if ((code >= 0xac00) && (code <= 0xd7af)) {
              //  textarea.val(cstr);
              //}
    	  //}

    	  if (keydown && keypress) {

    		  // call the key handler for repeated keypresses.
    		  // This excludes keypresses that happen directly
    		  // after keydown.  In that case, there will be
    		  // no previous keypress, so we skip it here
    		  handleKey();
    	  }
      }

      keypress = e;

      checkTextareaFor(typedText);

      if (textarea[0] && textarea[0].disabledTextarea) {
      	// this can only happen in scenarios when
      	// stopPropagation is useful here
      	e.stopPropagation();
      	// but preventDefault is not useful!
      }
    }
    function onKeypressParent(e) {
      // it is not harmful to call stopPropagation
      // more times... here and in DrawEquationWeb
      // note that this is NOT stopImmediatePropagation
      e.stopPropagation();

      if (textarea[0] && textarea[0].disabledTextarea) {
    	// bluetooth keyboard case for mobile devices!
        // let's not bother with default actions either!
        e.preventDefault();

		// this will tell MathQuillGGB not to do keydown / handleKey
		// as well, for a different key pressed earlier, BUT:
        // when we simulate keydown as well as keypress,
        // then we probably don't need simulatedKeypress
		//textarea[0].simulatedKeypress = true;
        // what about event order here? TODO: make sure it's perfect
        
        var code = e.charCode || e.which || 0;
        textarea[0].lastPressCode = code;
        if(code == 13){
        	return;
        }
        // #5398 probably does not mind these lines being here
        // as it's mobile, disabled textarea case only, but still,
        // TODO you might want to check whether:
        // - these two lines are required generally to fill textarea
        // - these two lines are valid with all (e.g. Korean) chars
        // ... the second point is probably not the case when we fill
        // the textarea by program code, because we have textarea hacks
        // just for this reason! to be more perfect than e.charCode/which!
        // search for "unixpapa key" but if these two lines will be
        // removed, maybe it will just work out-of-the-box, as we
        // also have a keydown event, which might change things
        textarea.val(String.fromCharCode(code));
        textarea[0].simulatedKeypress = true;

        // but instead recreate the same event once again!
        //var e2 = $.Event(e.type, e);
        // and make sure not to clone preventDefault state,
        // so maybe it's better to just clone some props
        var e2 = $.Event(e.type, {
        	keyCode : e.keyCode,
			charCode : e.charCode,
			which : e.which,
			altKey : e.altKey,
			ctrlKey : e.ctrlKey,
			shiftKey : e.shiftKey
        });
        // and pass it to the textarea!
        textarea.trigger(e2);
        // because in theory the textarea is able to
        // convert the event object to real key values
        // especially in keypress, to real characters
      }
    }

    function onKeydownParent(e) {
      // it is not harmful to call stopPropagation
      // more times... here and in DrawEquationWeb
      // note that this is NOT stopImmediatePropagation
      e.stopPropagation();
      // in normal case, there is nothing more to do!
      if (textarea[0] && textarea[0].disabledTextarea) {
    	// but in Android case this means bluetooth keyboard!
        // let's not bother with default actions either!
    	var code = e.keyCode || e.which || 0;
    	if(code == 8 || code == 37 || code == 39){
    		e.preventDefault();
    	}
        // but instead recreate the same event once again!
        //var e2 = $.Event(e.type, e);
        // and make sure not to clone preventDefault state,
        // so maybe it's better to just clone some props
        var e2 = $.Event(e.type, {
        	keyCode : e.keyCode,
			charCode : e.charCode,
			which : e.which,
			altKey : e.altKey,
			ctrlKey : e.ctrlKey,
			shiftKey : e.shiftKey
        });
        // and pass it to the textarea!
        textarea.trigger(e2);
        // because in theory the textarea is able to
        // convert the event object to real key values
        // especially in keypress, to real characters
      }
    }
    function typedText() {
      if (checkTextarea2 !== noop) return;
      // If there is a selection, the contents of the textarea couldn't
      // possibly have just been typed in.
      // This happens in browsers like Firefox and Opera that fire
      // keypress for keystrokes that are not text entry and leave the
      // selection in the textarea alone, such as Ctrl-C.
      // Note: we assume that browsers that don't support hasSelection()
      // also never fire keypress on keystrokes that are not text entry.
      // This seems reasonably safe because:
      // - all modern browsers including IE 9+ support hasSelection(),
      //   making it extremely unlikely any browser besides IE < 9 won't
      // - as far as we know IE < 9 never fires keypress on keystrokes
      //   that aren't text entry, which is only as reliable as our
      //   tests are comprehensive, but the IE < 9 way to do
      //   hasSelection() is poorly documented and is also only as
      //   reliable as our tests are comprehensive
      // If anything like #40 or #71 is reported in IE < 9, see
      // b1318e5349160b665003e36d4eedd64101ceacd8
      if (hasSelection()) return;

      popText(textCallback);
    }

    function onBlur() { keydown = keypress = null; }

    function onPaste(e) {
      // browsers are dumb.
      //
      // In Linux, middle-click pasting causes onPaste to be called,
      // when the textarea is not necessarily focused.  We focus it
      // here to ensure that the pasted text actually ends up in the
      // textarea.
      //
      // It's pretty nifty that by changing focus in this handler,
      // we can change the target of the default action.  (This works
      // on keydown too, FWIW).
      //
      // And by nifty, we mean dumb (but useful sometimes).
      textarea.focus();
      // TODO: disabledTextarea case!

      // checkTextareaFor2 because it might clash with
      // the onText event or something like that otherwise
      checkTextareaFor2(pastedText);
      //checkTextareaFor(pastedText);

      // target is textarea itself, innermost element!
      e.stopPropagation();
      // so that preventDefault should not be called later!
      return true;
    }

    function pastedText() {
      popTextForPaste(pasteCallback);
    }

    // -*- attach event handlers -*- //
    target.bind({
      keydown: onKeydown,
      keypress: onKeypress,
      focusout: onBlur,
      cut: onCut,
      copy: onCopy,
      paste: onPaste
    });

    if (rootJQ !== noop) {
      rootJQ.bind({
        keydown: onKeydownParent,
        keypress: onKeypressParent
      });
    }

    // -*- export public methods -*- //
    return {
      select: select
    };
  };
}());

var Parser = P(function(_, _super, Parser) {
  // The Parser object is a wrapper for a parser function.
  // Externally, you use one to parse a string by calling
  //   var result = SomeParser.parse('Me Me Me! Parse Me!');
  // You should never call the constructor, rather you should
  // construct your Parser from the base parsers and the
  // parser combinator methods.

  function parseError(stream, message) {
    if (stream) {
      stream = "'"+stream+"'";
    }
    else {
      stream = 'EOF';
    }

    throw 'Parse Error: '+message+' at '+stream;
  }

  _.init = function(body) { this._ = body; };

  _.parse = function(stream) {
    return this.skip(eof)._(stream, success, parseError);

    function success(stream, result) { return result; }
  };

  // -*- primitive combinators -*- //
  _.or = function(alternative) {
    var self = this;

    return Parser(function(stream, onSuccess, onFailure) {
      return self._(stream, onSuccess, failure);

      function failure(newStream) {
        return alternative._(stream, onSuccess, onFailure);
      }
    });
  };

  _.then = function(next) {
    var self = this;

    return Parser(function(stream, onSuccess, onFailure) {
      return self._(stream, success, onFailure);

      function success(newStream, result) {
        var nextParser = (next instanceof Parser ? next : next(result));
        return nextParser._(newStream, onSuccess, onFailure);
      }
    });
  };

  // -*- optimized iterative combinators -*- //
  _.many = function() {
    var self = this;

    return Parser(function(stream, onSuccess, onFailure) {
      var xs = [];
      while (self._(stream, success, failure));
      return onSuccess(stream, xs);

      function success(newStream, x) {
        stream = newStream;
        xs.push(x);
        return true;
      }

      function failure() {
        return false;
      }
    });
  };

  _.times = function(min, max) {
    if (arguments.length < 2) max = min;
    var self = this;

    return Parser(function(stream, onSuccess, onFailure) {
      var xs = [];
      var result = true;
      var failure;

      for (var i = 0; i < min; i += 1) {
        result = self._(stream, success, firstFailure);
        if (!result) return onFailure(stream, failure);
      }

      for (; i < max && result; i += 1) {
        result = self._(stream, success, secondFailure);
      }

      return onSuccess(stream, xs);

      function success(newStream, x) {
        xs.push(x);
        stream = newStream;
        return true;
      }

      function firstFailure(newStream, msg) {
        failure = msg;
        stream = newStream;
        return false;
      }

      function secondFailure(newStream, msg) {
        return false;
      }
    });
  };

  // -*- higher-level combinators -*- //
  _.result = function(res) { return this.then(succeed(res)); };
  _.atMost = function(n) { return this.times(0, n); };
  _.atLeast = function(n) {
    var self = this;
    return self.times(n).then(function(start) {
      return self.many().map(function(end) {
        return start.concat(end);
      });
    });
  };

  _.map = function(fn) {
    return this.then(function(result) { return succeed(fn(result)); });
  };

  _.skip = function(two) {
    return this.then(function(result) { return two.result(result); });
  };

  // -*- primitive parsers -*- //
  var string = this.string = function(str) {
    var len = str.length;
    var expected = "expected '"+str+"'";

    return Parser(function(stream, onSuccess, onFailure) {
      var head = stream.slice(0, len);

      if (head === str) {
        return onSuccess(stream.slice(len), head);
      }
      else {
        return onFailure(stream, expected);
      }
    });
  };

  var regex = this.regex = function(re) {
    var expected = 'expected '+re;

    return Parser(function(stream, onSuccess, onFailure) {
      var match = re.exec(stream);

      if (match) {
        var result = match[0];
        return onSuccess(stream.slice(result.length), result);
      }
      else {
        return onFailure(stream, expected);
      }
    });
  };

  var succeed = Parser.succeed = function(result) {
    return Parser(function(stream, onSuccess) {
      return onSuccess(stream, result);
    });
  };

  var fail = Parser.fail = function(msg) {
    return Parser(function(stream, _, onFailure) {
      return onFailure(stream, msg);
    });
  };

  var letter = Parser.letter = regex(/^[a-z]/i);
  var letters = Parser.letters = regex(/^[a-z]*/i);
  var digit = Parser.digit = regex(/^[0-9]/);
  var digits = Parser.digits = regex(/^[0-9]*/);
  var whitespace = Parser.whitespace = regex(/^\s+/);
  var optWhitespace = Parser.optWhitespace = regex(/^\s*/);

  var any = Parser.any = Parser(function(stream, onSuccess, onFailure) {
    if (!stream) return onFailure(stream, 'expected any character');

    return onSuccess(stream.slice(1), stream.charAt(0));
  });

  var all = Parser.all = Parser(function(stream, onSuccess, onFailure) {
    return onSuccess('', stream);
  });

  var eof = Parser.eof = Parser(function(stream, onSuccess, onFailure) {
    if (stream) return onFailure(stream, 'expected EOF');

    return onSuccess(stream, stream);
  });
});
/*************************************************
 * Base classes of the MathQuillGGB virtual DOM tree
 *
 * Only doing tree node manipulation via these
 * adopt/ disown methods guarantees well-formedness
 * of the tree.
 ************************************************/

// L = 'left'
// R = 'right'
//
// the contract is that they can be used as object properties
// and (-L) === R, and (-R) === L.
var L = -1;
var R = 1;

// directionalizable versions of common jQuery traversals
function jQinsertAdjacent(dir, el, target) {
  return (
    dir === L ?
    el.insertBefore(target) :
    el.insertAfter(target)
  );
}

function jQappendDir(dir, el, target) {
  return (
    dir === L ?
    el.prependTo(target) :
    el.appendTo(target)
  );
}

function jQgetExtreme(dir, el) {
  return (
    dir === L ?
    el.first() :
    el.last()
  )
}

var Point = P(function(_) {
  _.parent = 0;
  _[L] = 0;
  _[R] = 0;

  _.init = function(parent, prev, next) {
    this.parent = parent;
    this[L] = prev;
    this[R] = next;
  };
});

/**
 * MathQuillGGB virtual-DOM tree-node abstract base class
 */
var Node = P(function(_) {
  _[L] = 0;
  _[R] = 0;
  _.parent = 0;
  _.textTemplate = [''];
  //_.text = function() { return ''; };// dummy default (maybe for bugfix)

  var id = 0;
  function uniqueNodeId() { return id += 1; }
  this.byId = {};

  _.init = function() {
    this.id = uniqueNodeId();
    Node.byId[this.id] = this;

    this.ch = {};
    this.ch[L] = 0;
    this.ch[R] = 0;
  };

  _.dispose = function() { delete Node.byId[this.id]; };

  _.toString = function() { return '{{ MathQuillGGB Node #'+this.id+' }}'; };

  _.jQ = $();
  _.jQadd = function(jQ) { this.jQ = this.jQ.add(jQ); };
  _.jQize = function() {
    // jQuery-ifies this.html() and links up the .jQ of all corresponding Nodes
    var jQ = $(this.html());
    jQ.find('*').andSelf().each(function() {
      var jQ = $(this),
        cmdId = jQ.attr('mathquillggb-command-id'),
        blockId = jQ.attr('mathquillggb-block-id');
      if (cmdId) Node.byId[cmdId].jQadd(jQ);
      if (blockId) Node.byId[blockId].jQadd(jQ);
    });
    return jQ;
  };

  _.createDir = function(dir, cursor) {
    var node = this;
    node.jQize();
    jQinsertAdjacent(dir, node.jQ, cursor.jQ);
    cursor[dir] = node.adopt(cursor.parent, cursor[L], cursor[R]);
    return node;
  };
  _.createBefore = function(el) { return this.createDir(L, el); };

  _.respace = noop;

  _.bubble = iterator(function(yield) {
    for (var ancestor = this; ancestor; ancestor = ancestor.parent) {
      var result = yield(ancestor);
      if (result === false) break;
    }

    return this;
  });

  _.postOrder = iterator(function(yield) {
    (function recurse(descendant) {
      descendant.eachChild(recurse);
      yield(descendant);
    })(this);

    return this;
  });

  _.preOrder = iterator(function(yield) {
    (function recurse(descendant) {
       yield(descendant);
       descendant.eachChild(recurse);
    })(this);
    return this;
  });

  _.children = function() {
    return Fragment(this.ch[L], this.ch[R]);
  };

  _.eachChild = function() {
    var children = this.children();
    children.each.apply(children, arguments);
    return this;
  };

  _.foldChildren = function(fold, fn) {
    return this.children().fold(fold, fn);
  };

  _.adopt = function(parent, prev, next) {
    Fragment(this, this).adopt(parent, prev, next);
    return this;
  };

  _.disown = function() {
    Fragment(this, this).disown();
    return this;
  };

  _.remove = function() {
    this.jQ.remove();
    this.postOrder('dispose');
    return this.disown();
  };
});

/**
 * An entity outside the virtual tree with one-way pointers (so it's only a
 * "view" of part of the tree, not an actual node/entity in the tree) that
 * delimits a doubly-linked list of sibling nodes.
 * It's like a fanfic love-child between HTML DOM DocumentFragment and the Range
 * classes: like DocumentFragment, its contents must be sibling nodes
 * (unlike Range, whose contents are arbitrary contiguous pieces of subtrees),
 * but like Range, it has only one-way pointers to its contents, its contents
 * have no reference to it and in fact may still be in the visible tree (unlike
 * DocumentFragment, whose contents must be detached from the visible tree
 * and have their 'parent' pointers set to the DocumentFragment).
 */
var Fragment = P(function(_) {
  //_.text = function() { return ''; };// dummy default (maybe for bugfix)
  _.init = function(first, last) {
    this.ends = {};

    if (!first) return;

    this.ends[L] = first;
    this.ends[R] = last;

    this.jQ = this.fold(this.jQ, function(jQ, el) { return jQ.add(el.jQ); });
  };
  _.jQ = $();

  _.adopt = function(parent, prev, next) {
    var self = this;
    self.disowned = false;

    var first = self.ends[L];
    if (!first) return this;

    var last = self.ends[R];

    if (prev) {
      // NB: this is handled in the ::each() block
      // prev[R] = first
    } else {
      parent.ch[L] = first;
    }

    if (next) {
      next[L] = last;
    } else {
      parent.ch[R] = last;
    }

    self.ends[R][R] = next;

    self.each(function(el) {
      el[L] = prev;
      el.parent = parent;
      if (prev) prev[R] = el;

      prev = el;
    });

    return self;
  };

  _.disown = function() {
    var self = this;
    var first = self.ends[L];

    // guard for empty and already-disowned fragments
    if (!first || self.disowned) return self;

    self.disowned = true;

    var last = self.ends[R]
    var parent = first.parent;

    if (first[L]) {
      first[L][R] = last[R];
    } else {
      parent.ch[L] = last[R];
    }

    if (last[R]) {
      last[R][L] = first[L];
    } else {
      parent.ch[R] = first[L];
    }

    return self;
  };

  _.remove = function() {
    this.jQ.remove();
    this.each('postOrder', 'dispose');
    return this.disown();
  };

  _.each = iterator(function(yield) {
    var self = this;
    var el = self.ends[L];
    if (!el) return self;

    for (; el !== self.ends[R][R]; el = el[R]) {
      var result = yield(el);
      if (result === false) break;
    }

    return self;
  });

  _.fold = function(fold, fn) {
    this.each(function(el) {
      fold = fn.call(this, fold, el);
    });

    return fold;
  };

  // create and return the Fragment between Point A and Point B, or if they
  // don't share a parent, between the ancestor of A and the ancestor of B
  // who share a common parent (which would be the lowest common ancestor (LCA)
  // of A and B)
  // There must exist an LCA, i.e., A and B must be in the same tree, and A
  // and B must not be the same Point.
  this.between = function(A, B) {
    // TextPiece and TextBlock selection is still not
    // implemented well, but at least let's do a quick
	// fix for the arising bug! #5291 second part
    if (A.parent instanceof TextPiece) {
      A = A.parent;
    }
    if (A.parent instanceof TextBlock) {
      A = A.parent;
      if (A.parent instanceof Quotation) {
    	A = A.parent;
      }
    }
    if (B.parent instanceof TextPiece) {
      B = B.parent;
    }
    if (B.parent instanceof TextBlock) {
      B = B.parent;
      if (B.parent instanceof Quotation) {
    	B = B.parent;
      }
    }

    var ancA = A; // an ancestor of A
    var ancB = B; // an ancestor of B
    var ancMapA = {}; // a map from the id of each ancestor of A visited
    // so far, to the child of that ancestor who is also an ancestor of B, e.g.
    // the LCA's id maps to the ancestor of the cursor whose parent is the LCA
    var ancMapB = {}; // a map of the castle and school grounds magically
    // displaying the current location of everyone within the covered area,
    // activated by pointing one's wand at it and saying "I solemnly swear
    // that I am up to no good".
    // What do you mean, you expected it to be the same as ancMapA, but
    // ancestors of B instead? That's a complete non sequitur.

    do {
      ancMapA[ancA.parent.id] = ancA;
      ancMapB[ancB.parent.id] = ancB;

      if (ancB.parent.id in ancMapA) {
        ancA = ancMapA[ancB.parent.id];
        break;
      }
      if (ancA.parent.id in ancMapB) {
        ancB = ancMapB[ancA.parent.id];
        break;
      }

      if (ancA.parent) ancA = ancA.parent;
      if (ancB.parent) ancB = ancB.parent;
    } while (ancA.parent || ancB.parent);
    // the only way for this condition to fail is if A and B are in separate
    // trees, which should be impossible, but infinite loops must never happen,
    // even under error conditions.

    // Now we have two either Nodes or Points, guaranteed to have a common
    // parent and guaranteed that if both are Points, they are not the same,
    // and we have to figure out which is on the left and which on the right
    // of the selection.
    var left, right;

    // This is an extremely subtle algorithm.
    // As a special case, ancA could be a Point and ancB a Node immediately
    // to ancA's left.
    // In all other cases,
    // - both Nodes
    // - ancA a Point and ancB a Node
    // - ancA a Node and ancB a Point
    // ancB[R] === next[R] for some next that is ancA or to its right if and
    // only if anticursorA is to the right of cursorA.
    if (ancA[L] !== ancB) {
      for (var next = ancA; next; next = next[R]) {
        if (next[R] === ancB[R]) {
          left = ancA;
          right = ancB;
          break;
        }
      }
    }
    if (!left) {
      left = ancB;
      right = ancA;
    }

    // only want to select Nodes up to Points, can't select Points themselves
    if (left instanceof Point) left = left[R];
    if (right instanceof Point) right = right[L];

    return Fragment(left, right);
  };
});
/*************************************************
 * Abstract classes of math blocks and commands.
 ************************************************/

/**
 * Math tree node base class.
 * Some math-tree-specific extensions to Node.
 * Both MathBlock's and MathCommand's descend from it.
 */
var MathElement = P(Node, function(_, _super) {
  _.finalizeInsert = function() {
    var self = this;
    self.postOrder('finalizeTree');

    // note: this order is important.
    // empty elements need the empty box provided by blur to
    // be present in order for their dimensions to be measured
    // correctly in redraw.
    self.postOrder('blur');

    // adjust context-sensitive spacing
    self.postOrder('respace');
    if (self[R].respace) self[R].respace();
    if (self[L].respace) self[L].respace();

    self.postOrder('redraw');
    self.bubble('redraw');
  };
});

/**
 * Commands and operators, like subscripts, exponents, or fractions.
 * Descendant commands are organized into blocks.
 */
var MathCommand = P(MathElement, function(_, _super) {
  _.init = function(ctrlSeq, htmlTemplate, textTemplate) {
    var cmd = this;
    _super.init.call(cmd);

    if (!cmd.ctrlSeq) cmd.ctrlSeq = ctrlSeq;
    if (htmlTemplate) cmd.htmlTemplate = htmlTemplate;
    if (textTemplate) cmd.textTemplate = textTemplate;
  };

  // obvious methods
  _.replaces = function(replacedFragment) {
    replacedFragment.disown();
    this.replacedFragment = replacedFragment;
  };
  _.isEmpty = function() {
    return this.foldChildren(true, function(isEmpty, child) {
      return isEmpty && child.isEmpty();
    });
  };

  _.parser = function() {
    var block = latexMathParser.block;
    var self = this;

    return block.times(self.numBlocks()).map(function(blocks) {
      self.blocks = blocks;

      for (var i = 0; i < blocks.length; i += 1) {
        blocks[i].adopt(self, self.ch[R], 0);
      }

      return self;
    });
  };

  // createBefore(cursor) and the methods it calls
  _.createBefore = function(cursor) {
    var cmd = this;
    var replacedFragment = cmd.replacedFragment;

    cmd.createBlocks();
    _super.createBefore.call(cmd, cursor);
    if (replacedFragment) {
      replacedFragment.adopt(cmd.ch[L], 0, 0);
      replacedFragment.jQ.appendTo(cmd.ch[L].jQ);
    }
    cmd.finalizeInsert(cursor);
    cmd.placeCursor(cursor);
  };
  _.createBlocks = function() {
    var cmd = this,
      numBlocks = cmd.numBlocks(),
      blocks = cmd.blocks = Array(numBlocks);

    for (var i = 0; i < numBlocks; i += 1) {
      var newBlock = blocks[i] = MathBlock();
      newBlock.adopt(cmd, cmd.ch[R], 0);
    }
  };
  _.placeCursor = function(cursor) {
    //append the cursor to the first empty child, or if none empty, the last one
    cursor.appendTo(this.foldChildren(this.ch[L], function(prev, child) {
      return prev.isEmpty() ? prev : child;
    }));
  };

  // editability methods: called by the cursor for editing, cursor movements,
  // and selection of the MathQuillGGB tree, these all take in a direction and
  // the cursor
  _.moveTowards = function(dir, cursor) { cursor.appendDir(-dir, this.ch[-dir]); };

  function placeCursorInDir(self, dir, cursor) {
    cursor[-dir] = self;
    cursor[dir] = self[dir];
  }

  _.createSelection = function(dir, cursor) {
    placeCursorInDir(this, dir, cursor);
    cursor.hide().selection = Selection(this);
  }

  _.expandSelection = function(dir, cursor) {
    placeCursorInDir(this, dir, cursor);
    cursor.selection.ends[dir] = this;
    jQappendDir(dir, this.jQ, cursor.selection.jQ);
  };

  _.clearSelection = function(dir, cursor) {
    placeCursorInDir(this, dir, cursor);
    cursor.clearSelection().show();
  };

  _.retractSelection = function(dir, cursor) {
    var self = this, seln = cursor.selection;

    placeCursorInDir(self, dir, cursor);
    jQinsertAdjacent(-dir, self.jQ, seln.jQ);
    seln.ends[-dir] = self[dir];
  };

  _.deleteTowards = _.createSelection;
  _.selectChildren = function(cursor) {
    cursor.selection = Selection(this);
    cursor.insertAfter(this);
  };
  _.seek = function(pageX, cursor) {
	if (this.parent) {
	  var blockofthis = this.parent;
	  if (blockofthis instanceof RootMathBlock) {
		var maybestyle = blockofthis.maybeThisMaybeStyle();
		if (maybestyle !== blockofthis) {
		  // this MathCommand seems to be the Style itself!
		  // then let's just appendTo instead!
          cursor.appendTo(maybestyle).seekHoriz(pageX, maybestyle);
          return;
		}
	  }
      cursor.insertAfter(this).seekHoriz(pageX, blockofthis);
	}
  };

  // methods involved in creating and cross-linking with HTML DOM nodes
  /*
    They all expect an .htmlTemplate like
      '<span>&0</span>'
    or
      '<span><span>&0</span><span>&1</span></span>'

    See html.test.js for more examples.

    Requirements:
    - For each block of the command, there must be exactly one "block content
      marker" of the form '&<number>' where <number> is the 0-based index of the
      block. (Like the LaTeX \newcommand syntax, but with a 0-based rather than
      1-based index, because JavaScript because C because Dijkstra.)
    - The block content marker must be the sole contents of the containing
      element, there can't even be surrounding whitespace, or else we can't
      guarantee sticking to within the bounds of the block content marker when
      mucking with the HTML DOM.
    - The HTML not only must be well-formed HTML (of course), but also must
      conform to the XHTML requirements on tags, specifically all tags must
      either be self-closing (like '<br/>') or come in matching pairs.
      Close tags are never optional.

    Note that &<number> isn't well-formed HTML; if you wanted a literal '&123',
    your HTML template would have to have '&amp;123'.
  */
  _.numBlocks = function() {
    var matches = this.htmlTemplate.match(/&\d+/g);
    return matches ? matches.length : 0;
  };
  _.html = function() {
    // Render the entire math subtree rooted at this command, as HTML.
    // Expects .createBlocks() to have been called already, since it uses the
    // .blocks array of child blocks.
    //
    // See html.test.js for example templates and intended outputs.
    //
    // Given an .htmlTemplate as described above,
    // - insert the mathquillggb-command-id attribute into all top-level tags,
    //   which will be used to set this.jQ in .jQize().
    //   This is straightforward:
    //     * tokenize into tags and non-tags
    //     * loop through top-level tokens:
    //         * add #cmdId attribute macro to top-level self-closing tags
    //         * else add #cmdId attribute macro to top-level open tags
    //             * skip the matching top-level close tag and all tag pairs
    //               in between
    // - for each block content marker,
    //     + replace it with the contents of the corresponding block,
    //       rendered as HTML
    //     + insert the mathquillggb-block-id attribute into the containing tag
    //   This is even easier, a quick regex replace, since block tags cannot
    //   contain anything besides the block content marker.
    //
    // Two notes:
    // - The outermost loop through top-level tokens should never encounter any
    //   top-level close tags, because we should have first encountered a
    //   matching top-level open tag, all inner tags should have appeared in
    //   matching pairs and been skipped, and then we should have skipped the
    //   close tag in question.
    // - All open tags should have matching close tags, which means our inner
    //   loop should always encounter a close tag and drop nesting to 0. If
    //   a close tag is missing, the loop will continue until i >= tokens.length
    //   and token becomes undefined. This will not infinite loop, even in
    //   production without pray(), because it will then TypeError on .slice().

    var cmd = this;
    var blocks = cmd.blocks;
    var cmdId = ' mathquillggb-command-id=' + cmd.id;
    var tokens = cmd.htmlTemplate.match(/<[^<>]+>|[^<>]+/g);

    // add cmdId to all top-level tags
    for (var i = 0, token = tokens[0]; token; i += 1, token = tokens[i]) {
      // top-level self-closing tags
      if (token.slice(-2) === '/>') {
        tokens[i] = token.slice(0,-2) + cmdId + '/>';
      }
      // top-level open tags
      else if (token.charAt(0) === '<') {
        tokens[i] = token.slice(0,-1) + cmdId + '>';

        // skip matching top-level close tag and all tag pairs in between
        var nesting = 1;
        do {
          i += 1, token = tokens[i];
          // close tags
          if (token.slice(0,2) === '</') {
            nesting -= 1;
          }
          // non-self-closing open tags
          else if (token.charAt(0) === '<' && token.slice(-2) !== '/>') {
            nesting += 1;
          }
        } while (nesting > 0);
      }
    }
    return tokens.join('').replace(/>&(\d+)/g, function($0, $1) {
      return ' mathquillggb-block-id=' + blocks[$1].id + '>' + blocks[$1].join('html');
    });
  };

  // methods to export a string representation of the math tree
  _.latex = function() {
    return this.foldChildren(this.ctrlSeq, function(latex, child) {
      return latex + '{' + (child.latex() || ' ') + '}';
    });
  };
  _.textTemplate = [''];
  _.text = function() {
    var i = 0;
    var thisMathCommand = this;
    return this.foldChildren(this.textTemplate[i], function(text, child) {
      i += 1;
      var child_text = child.text();
      if (text && child_text[0] === '(' && child_text.slice(-1) === ')' &&
   		  (thisMathCommand.textTemplate[i] === '(' || // no () inside parentheses (orientation?)
            (thisMathCommand.textTemplate[i] === ')' &&
             thisMathCommand.textTemplate[i-1] !== '/') || // sin((?)), sqrt((7x)), etc.

            (thisMathCommand.textTemplate[i] === ']' && // no () inside square brackets
   		     !(child.ch[L] === child.ch[R] &&
   		       child.ch[L] instanceof Bracket)) ||
   		// except if child is about intentional brackets, e.g. Vector[(1,2)]
   		// noting that child is a MathBlock, so "(" usually comes from it

   	      thisMathCommand.textTemplate[i] === '}')) // no () inside curly braces
    	// maybe we should have used (i-1) and left parentheses/brackets/braces
        return text + child_text.slice(1, -1) + thisMathCommand.textTemplate[i];
      return text + child.text() + (thisMathCommand.textTemplate[i] || '');
    });
  };
});

/**
 * Lightweight command without blocks or children.
 */
var Symbol = P(MathCommand, function(_, _super) {
  _.init = function(ctrlSeq, html, text) {
    if (!text) text = ctrlSeq && ctrlSeq.length > 1 ? ctrlSeq.slice(1) : ctrlSeq;

    _super.init.call(this, ctrlSeq, html, [ text ]);
  };

  _.parser = function() { return Parser.succeed(this); };
  _.numBlocks = function() { return 0; };

  _.replaces = function(replacedFragment) {
    replacedFragment.remove();
  };
  _.createBlocks = noop;

  _.moveTowards = function(dir, cursor) {
    jQinsertAdjacent(dir, cursor.jQ, jQgetExtreme(dir, this.jQ));
    cursor[-dir] = this;
    cursor[dir] = this[dir];
  };
  _.deleteTowards = function(dir, cursor) {
    cursor[dir] = this.remove()[dir];
  };
  _.seek = function(pageX, cursor) {
    // insert at whichever side the click was closer to
    if (pageX - this.jQ.offset().left < this.jQ.outerWidth()/2)
      cursor.insertBefore(this);
    else
      cursor.insertAfter(this);
  };

  _.latex = function(){ return this.ctrlSeq; };
  _.text = function() {
	  return this.textTemplate[0];
  };
  _.placeCursor = noop;
  _.isEmpty = function(){ return true; };
});

/**
 * Children and parent of MathCommand's. Basically partitions all the
 * symbols and operators that descend (in the Math DOM tree) from
 * ancestor operators.
 */
var MathBlock = P(MathElement, function(_) {
  _.close = function() {
    this.closed = true;
  };
  _.join = function(methodName) {
    return this.foldChildren('', function(fold, child) {
      return fold + child[methodName]();
    });
  };
  _.html = function() { return this.join('html'); };
  _.latex = function() { return this.join('latex'); };
  _.text = function() {
    if (this.isEmpty()) {
      // For GeoGebraWeb in case of e.g. || sign, it's better
      // to return with an empty string! In other cases,
      // e.g. (), {}, sin(), sqrt(), x^(), etc. this
      // will be syntactically incorrect in theory, anyway
      return '';
    } else if (this.parent.ctrlSeq.substring(0,9) === '\\ggbtable' ||
    		   this.parent.pwtable || this.parent.prtable ||
    		   this.parent.ctrlSeq.substring(0,6) === '\\ggbtr' ||
    	       this.parent.ctrlSeq.substring(0,6) === '\\ggbtd') {
      var ret = this.ch[L].text();
      if (this.ch[L] !== this.ch[R]) {
        ret = this.join('text');
      }
      if ((ret !== undefined) && (ret.length > 0) && (ret[ret.length - 1] === ',')) {
        ret = ret.substring(0, ret.length - 1);
      }
      return ret;
    }
    return this.ch[L] === this.ch[R] ?
      this.ch[L].text() :
      '(' + this.join('text') + ')';
  };
  _.isEmpty = function() {
    return this.ch[L] === 0 && this.ch[R] === 0;
  };

  _.whetherRootStyleBlock = function() {
    if (this.parent instanceof Style) {
      var parentblock = this.parent.parent;
      if (parentblock) {
        if (parentblock instanceof RootMathBlock) {
          if (parentblock.ch[L] === parentblock.ch[R]) {
            // if the Style is the only child of MathBlock,
            // then do not do it!
            return true;
          }
        }
      }
    }
    return false;
  };
  // editability methods: called by the cursor for editing, cursor movements,
  // and selection of the MathQuillGGB tree, these all take in a direction and
  // the cursor
  _.moveOutOf = function(dir, cursor) {
	// note that appendDir waits for MathBlock,
	// while insertAdjacent waits for MathCommand!
	var thisthis = this;
    if (this[dir]) {
      // this is actually not a move out of,
      // but move to a sibling MathBlock e.g. &0 &1
      cursor.appendDir(-dir, this[dir]);
    } else {
      // in case this is a block of a Style mathcommand,
      // which is the only child of RootMathBlock, then
      // we shall not support moving out of this block!
      if (this.whetherRootStyleBlock()) {
    	return;
      }


      // this would move out of the block to
      // put the cursor beside the parent command;
      // however, we want more in case of \\ggbtd and \\ggbtr
      // \\prtable, \\pwtable, \\prcondition, \\parametric,
      // but NOT in case of \\piecewise and \\prcurve
      cursor.insertAdjacent(dir, this.parent);

      // parent block, we're inside a tr block, probably
      thisthis = this.parent.parent;
      // we have already moved out to the block of this.parent!
      if (this.parent.ctrlSeq.indexOf('\\ggbtd') > -1) {
        if (cursor[dir]) {
          // moving out of, and moving into
          // the next element immediately
          // this applies for \\ggbtd
          //cursor[dir].moveTowards(dir, cursor);
          cursor.appendDir(-dir, cursor[dir].ch[-dir]);
        // there are no sibling blocks in case of ggbtd
        //} else if (thisthis[dir]) {
        } else {
          // we probably encounter the end of a \\ggbtr,
          // so we should move out of it!
          if (thisthis.parent) {
            cursor.insertAdjacent(dir, thisthis.parent);
            // just moved inside a table block, tr's are children

            if (thisthis.parent.ctrlSeq.indexOf('\\ggbtr') > -1) {
              // child of thisthis.parent.parent
              if (cursor[dir]) {
                // moving into the next "tr"
                //cursor[dir].moveTowards(dir, cursor);
                cursor.appendDir(-dir, cursor[dir].ch[-dir]);
                // moving into its first "td"
                if (cursor[dir]) {
                  //cursor[dir].moveTowards(dir, cursor);
                  cursor.appendDir(-dir, cursor[dir].ch[-dir]);
                } //else unexpected end!
              } else if (thisthis.parent.parent) {
            	// end of \\ggbtable, probably!
            	thisthis = thisthis.parent.parent;
            	// later thisthis: child of ggbtable, parent of ggbtr
            	if (thisthis.parent) {//ggbtable
            	  // expected end!
                  cursor.insertAdjacent(dir, thisthis.parent);
                  // AND... this is still not the finish in case of:
                  // \\prtable, \\pwtable...
                  if (thisthis.parent.prtable || thisthis.parent.pwtable) {
                    // we're inside \\parametric after the operation
                	// let's move out of this by a recursive call...
                	// and later decide whether it needs anything else
                	if (thisthis.parent.parent) {
                	  // it is a MathBlock, child of \\parametric
                	  // in case of piecewise, this does no harm either
                	  var thisthis = thisthis.parent.parent;
                	  thisthis.moveOutOf(dir, cursor);
                	}
                  }
            	} // else unexpected end!
              } // else unexpected end!
            } // else unexpected end!
          }
        }
        // there are more possible cases!!!
        // TODO: can the user click between two ggbtr, for example?
        // probably not, as I did not manage to do it
      } else if (this.parent.ctrlSeq === '\\prcondition') {
        // in these cases, we've jumped out to the block of \\prcurve
        // so let's jump either outside of it, or in the other child
        // depending on the direction (same comment for \\parametric)
    	// can the user click between \\prcondition and \\parametric?
    	// probably not, as I did not manage to do it
        if (dir === L) {
          // as \\prcondition is R, move inside \\parametric,
          // also inside \\prtable, \\ggbtr, \\ggbtd
          if (cursor[dir]) {// cursor[dir] is \\parametric
            var thisthis = cursor[dir];
            cursor.appendDir(-dir, thisthis.ch[-dir]);
            // it's Okay that we're in \\parametric, but...
            thisthis = cursor[dir];//different!
            thisthis.moveTowards(dir, cursor);
          }
        } else if (dir === R) {
          if (thisthis.parent) {
       	    cursor.insertAdjacent(dir, thisthis.parent);
          }
        }
      } else if (this.parent.ctrlSeq === '\\parametric') {
        if (dir === R) {
          // as \\parametric is L, move inside \\prcondition,
          if (cursor[dir]) {// cursor[dir] is \\prcondition
            cursor.appendDir(-dir, cursor[dir].ch[-dir]);
          }
        } else if (dir === L) {
          if (thisthis.parent) {
            cursor.insertAdjacent(dir, thisthis.parent);
          }
        }
      }
    }
  };
  _.selectOutOf = function(dir, cursor) {
    // in case this is a block of a Style mathcommand,
    // which is the only child of RootMathBlock, then
    // we shall not support moving out of this block!
    if (this.whetherRootStyleBlock()) {
      return;
    }


    var cmd = this.parent;
    // for simplicity, select the whole matrix
    // in every case! thus cmd should be
    // changed in case it's matrix command:
    if (cmd.ctrlSeq.indexOf('\\ggbtd') > -1) {
      if (cmd.parent.parent) {
        cmd = cmd.parent.parent;
      }
    }
    if (cmd.ctrlSeq.indexOf('\\ggbtr') > -1) {
      if (cmd.parent.parent) {
    	cmd = cmd.parent.parent;
      }
    }
    cursor.insertAdjacent(dir, cmd);

    var seln = cursor.selection;
    // no selection, create one
    if (!seln) cursor.hide().selection = Selection(cmd);
    // else "level up" selection
    else {
      seln.ends[L] = seln.ends[R] = cmd;
      seln.clear().jQwrap(cmd.jQ);
    }
  };
  _.deleteOutOf = function(dir, cursor) {
    // in case this is a block of a Style mathcommand,
    // which is the only child of RootMathBlock, then
    // we shall not support moving out of this block!
    if (this.whetherRootStyleBlock()) {
      return;
    }


	// in case we are in ggbtable, don't allow
	// deleting out of this mathblock!
	var cmd = this.parent;
    if (cmd.ctrlSeq.indexOf('\\ggbtd') > -1) {
      // do nothing!
      return;
    }
    if (cmd.ctrlSeq.indexOf('\\ggbtr') > -1) {
      // do nothing!
      return;
    }
    if (cmd.ctrlSeq === '\\ggbtable' ||
   		cmd.ctrlSeq === '\\parametric' ||
   		cmd.ctrlSeq === '\\prcondition' ||
    	cmd.ctrlSeq === '\\piecewise' ||
    	cmd.ctrlSeq === '\\prcurve') {
      // do nothing! ?? question: should we do
      // the same with \\piecewise and \\prcurve,
      // as top-level blocks? maybe it's better
      // to let them to be deleted? I think no,
      // because all of these will be associated
      // with SpecialRadioButtonTreeItem, and
      // it will be good to keep the structure.
      return;
    }
    if (cmd.pwtable || cmd.prtable) {
    	// do nothing!
    	return;
    }
	// old behaviour
    cursor.unwrapGramp();
  };
  _.selectChildren = function(cursor, first, last) {
    cursor.selection = Selection(first, last);
    cursor.insertAfter(last);
  };
  _.seek = function(pageX, cursor) {
	var thisMod = this;
	//if (cursor.root === this) {
	if (this instanceof RootMathBlock) {
      thisMod = this.maybeThisMaybeStyle();
	}
	//}
    cursor.appendTo(thisMod).seekHoriz(pageX, thisMod);
  };
  _.write = function(cursor, ch, replacedFragment) {
    var cmd;

    // first of all, if the cursor is after a Style,
    // and its parent is the root block, move into it,
    // because the style is that of the root!
    if (cursor[L]) {
      if (cursor[L] instanceof Style) {
        if (cursor.parent === cursor.root) {
          //var cl = cursor[L];// does not work
          //cursor.prepareMove().appendTo(cl);

          cursor.moveLeft(); // invisible!
        }
      }
    }

    //if (ch.match(/^[a-eg-zA-Z]$/)) //exclude f because want florin
    if (ch.match(/^[a-zA-Z]$/)) {//GeoGebra probably doesn't want florin
      cmd = Variable(ch);
    } else if (cmd = CharCmds[ch] || LatexCmds[ch]) {
      // old code
      cmd = cmd(ch);

      // Now there may be some exceptions like subscript
      // entered after a subscript, etc. SupSub
      if (cursor.parent) {
        if (cursor.parent.parent) {
          if (cursor.parent.parent instanceof SupSub) {
            if (ch === '_' || ch === '^') {
              // in this case, do not write anything but return
              if (cursor[L]) {
            	// I did not meant to return when cursor[L] exists
            	// unless both SubSub are actually "_"
            	if (ch === '_' && cursor.parent.parent.ctrlSeq === '_') {
                  // maybe ch === '_' is not necessary?
            	  return;
            	}
              } else {
                return;
              }
            } else if (cursor.parent.parent.ctrlSeq === '_') {
              if (cmd instanceof BinaryOperator || ch === '/') {
            	// this shall move out of this SupSub,
            	// ignoring replacedFragment...
                cursor.moveRight();
                cmd.createBefore(cursor);
                return;
              }
            } else if (ch === '=') {
              // at least the equal operation should not be
              // there in powers (exponentiation) either
              cursor.moveRight();
              cmd.createBefore(cursor);
              return;
            }
          }
        }
      }
    } else {
      cmd = VanillaSymbol(ch);
    }

    if (replacedFragment) {
      // maybe the MathQuill guys were not aware that
      // this is harmful! Surely harmful in case of " marks,
      // in other cases there can be more errors...
      // so instead of calling this:
      //cmd.replaces(replacedFragment);
      // let's just get rid of replacedFragment,
      // just like in case of prepareEdit instead of prepareWrite,
      // or the replaces method of Symbol 
      replacedFragment.remove();
    } else if (cursor.selection) {
      // by the way, I would do it this way,
      // not calling this method with replacedFragment
      cursor.deleteSelection();
    }
    cmd.createBefore(cursor);
  };

  _.focus = function() {
    this.jQ.addClass('hasCursor');
    this.jQ.removeClass('empty');
    return this;
  };
  _.blur = function() {
    this.jQ.removeClass('hasCursor');
    if (this.closed) {
    } else if (this.isEmpty()) {
      this.jQ.addClass('empty');
    }
    return this;
  };
});
/*********************************************
 * Root math elements with event delegation.
 ********************************************/

function createRoot(jQ, root, textbox, editable) {
  var contents = jQ.contents().detach();

  if (!textbox) {
    jQ.addClass('mathquillggb-rendered-math');
  }

  // Node is accessible from almost everywhere inside
  // MathQuillGGB, as it is defined first, we could use it
  // but it's not Okay, since there may be more formulas
  // on the page with different root blocks!
  //Node.root = root;

  root.common = jQ[0];

  root.jQ = jQ.attr(mqBlockId, root.id);
  root.revert = function() {
    jQ.empty().unbind('.mathquillggb')
      .removeClass('mathquillggb-rendered-math mathquillggb-editable mathquillggb-textbox')
      .append(contents);
  };

  // this might be an imperfect solution of updating the revert function
  // without evaluating the formula by GeoGebraWeb, and recreating it...
  // but maybe root.latex() is invalid, which might make things wrong,
  // so the other way is chosen instead, i.e. evaluating and recreating
  //root.updateRevert = function() {
  //  var newContents = root.latex();
  //  root.revert = function() {
  //    jQ.empty().unbind('.mathquillggb')
  //      .removeClass('mathquillggb-rendered-math mathquillggb-editable mathquillggb-textbox')
  //      .append(newContents);
  //  }
  //};

  var cursor = root.cursor = Cursor(root);

  root.renderLatex(contents.text());

  if (root instanceof RootMathBlock) {
	var quasiRoot = root.maybeThisMaybeStyle();
	if (quasiRoot !== root) {
	  cursor.appendTo(quasiRoot);
	}
  }

  //textarea stuff
  var textareaHtmlString = '<textarea tabindex="-1"></textarea>';
  var disabledTextarea = false;
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
				.test(window.navigator.userAgent)) {
	textareaHtmlString = '<textarea disabled="disabled"></textarea>';
	disabledTextarea = true;
  }
  var textareaSpan = root.textarea = $('<span class="textarea">' + textareaHtmlString + '</span>'),
  textarea = textareaSpan.children();
  var textareaDOM = textarea[0];
  textareaDOM.disabledTextarea = disabledTextarea;

  /******
   * TODO [Han]: Document this
   */
  var textareaSelectionTimeout;
  root.selectionChanged = function() {
    if (textareaSelectionTimeout === undefined) {
      textareaSelectionTimeout = setTimeout(setTextareaSelection);
    }
    forceIERedraw(jQ[0]);
  };
  function setTextareaSelection() {
    textareaSelectionTimeout = undefined;
    var latex = '';
    if (cursor.selection) {
      latex = cursor.selection.fold('', function(latex, el) {
        //return latex + el.latex();
    	// new policy was asked in GeoGebra JIRA's TRAC-5058
        return latex + el.text();
      });
      //latex = '$' + latex + '$';
      // this latex is actually text that can be interpreted
      // as LaTeX as well, ideally (to paste it back)
    }
    textareaManager.select(latex);
  }

  //prevent native selection except textarea
  jQ.bind('selectstart.mathquillggb', function(e) {
    if (e.target !== textarea[0]) e.preventDefault();
    e.stopPropagation();
  });

  //drag-to-select event handling
  var anticursor, blink = cursor.blink;
  jQ.bind('mousedown.mathquillggb', function(e) {
    function mousemove(e) {
      var etarget;
      if (e.target) {
    	// mousemove
    	etarget = $(e.target);
      } else {
    	// docmousemove
    	etarget = $([]);
      }
      cursor.seek(etarget, e.pageX, e.pageY);

      if (anticursor) {
    	// I don't understand, why anticursor is not really
    	// updated? Maybe something was deleted unintentionally?
        if (cursor[L] !== anticursor[L]
            || cursor.parent !== anticursor.parent) {
          cursor.selectFrom(anticursor);
        }
      }

      // mousemove has no default action according to Mozilla
      // so it's Okay to remove this, return false,
      // because it would prevent RadioButtonTreeItem.onMouseMove
      // which is for highlighting-related code...
      // also, it would be good not to return false
      // on mouse move in the whole document just for MathQuillGGB!
      // return false;

      // although we can make things more efficient in
      // the editing case:
      if (editable)
    	  return false;

      // but again, this would also prevent touch events maybe...
      // so maybe it's right to prevent default in every case,
      // and also assign touch events!
      e.preventDefault();
    }

    // docmousemove is attached to the document, so that
    // selection still works when the mouse leaves the window.
    function docmousemove(e) {
      // [Han]: i delete the target because of the way seek works.
      // it will not move the mouse to the target, but will instead
      // just seek those X and Y coordinates.  If there is a target,
      // it will try to move the cursor to document, which will not work.
      // cursor.seek needs to be refactored.
      delete e.target;

      mousemove(e);
    }

    function mouseup(e) {
      anticursor = undefined;
      cursor.blink = blink;
      if (!cursor.selection) {
        if (editable) {
          cursor.show();
        }
        else {
          textareaSpan.detach();
        }
      }

      // delete the mouse handlers now that we're not dragging anymore
      jQ.unbind('mousemove', mousemove).unbind('mouseup', mouseup);
      if ((e) && (e.target) && (e.target.ownerDocument)) {
        $(e.target.ownerDocument).unbind('mousemove', docmousemove).unbind('mouseup', mouseup);
      }

      // preventDefault + touchend needed here!
      e.preventDefault();
    }

    // TODO: revise this
    setTimeout(function() { jQ[0].focusMathQuillGGB(); });

      // preventDefault won't prevent focus on mousedown in IE<9
      // that means immediately after this mousedown, whatever was
      // mousedown-ed will receive focus
      // http://bugs.jquery.com/ticket/10345

    cursor.blink = noop;
    cursor.seek($(e.target), e.pageX, e.pageY);

    anticursor = Point(cursor.parent, cursor[L], cursor[R]);

    if (!editable) jQ.prepend(textareaSpan);

    jQ.mousemove(mousemove).mouseup(mouseup);
    if ((e) && (e.target) && (e.target.ownerDocument)) {
      $(e.target.ownerDocument).mousemove(docmousemove).mouseup(mouseup);
    }

    if (!editable) {
      return false;
    }

    // return false would mean stopPropagation & preventDefault,
    // but in case of editing mode, we actually want this to
    // propagate, so that the actions of the whole input bar shall
    // also execute on this part of it! preventDefault is Okay
    // however, because it is like clicking at a neutral place
    // AND maybe it's important for something in MathQuillGGB!
    e.preventDefault();

    // note: but this will prevent the touchstart event from firing!!!
    // so at least we should bind the touchstart event as well,
    // which is probably Okay from JQuery 1.7+, it seems...
  });

  jQ.bind('touchstart.mathquillggb', function(e) {
    function touchmove(e) {
      var ourtarget;
      var origevt = e.originalEvent;
      if (origevt) {
        if (origevt.changedTouches) {
          if (origevt.changedTouches[0]) {
            // please, do not move more touching fingers :-)
            ourtarget = origevt.changedTouches[0];
          }
        }
      }

      if (ourtarget) {
        var etarget;
        if (e.docmousemoveMathQuillGGB) {
          etarget = $([]);
        } else if (ourtarget.target) {
	      // mousemove
	      etarget = $(ourtarget.target);
	    } else {
	      // docmousemove
	      etarget = $([]);
	    }
        cursor.seek(etarget, ourtarget.pageX, ourtarget.pageY);

	    if (anticursor) {
	      // I don't understand, why anticursor is not really
	      // updated? Maybe something was deleted unintentionally?
	      if (cursor[L] !== anticursor[L] || cursor.parent !== anticursor.parent) {
	        cursor.selectFrom(anticursor);
	      }
	    }
      }

	  // although we can make things more efficient in
	  // the editing case:
	  if (editable)
	    return false;

      // but again, this would also prevent touch events maybe...
	  // so maybe it's right to prevent default in every case,
	  // and also assign touch events!
	  e.preventDefault();
    } 

    function doctouchmove(e) {
      e.doctouchmoveMathQuillGGB = true;
      touchmove(e);
    }

    function touchend(e) {
      anticursor = undefined;
      cursor.blink = blink;
      if (!cursor.selection) {
        if (editable) {
          cursor.show();
        } else {
          textareaSpan.detach();
        }
      }

      // delete the mouse handlers now that we're not dragging anymore
      jQ.unbind('touchmove', touchmove).unbind('touchend', touchend);

      var ourtarget = e;
      var origevt = e.originalEvent;
      if (origevt) {
        if (origevt.changedTouches) {
          if (origevt.changedTouches[0]) {
            // please, do not move more touching fingers :-)
            ourtarget = origevt.changedTouches[0];
          }
        }
      }

      if ((ourtarget) && (ourtarget.target) && (ourtarget.target.ownerDocument)) {
        $(ourtarget.target.ownerDocument).unbind('touchmove', doctouchmove).unbind('touchend', touchend);
      } else if ((e) && (e.target) && (e.target.ownerDocument)) {
    	// I think here we can use e.target, as it is only used to get the ownerDocument!
        $(e.target.ownerDocument).unbind('touchmove', doctouchmove).unbind('touchend', touchend);
      }

      // preventDefault + touchend needed here!
      e.preventDefault();
    }

    // TODO: revise this
    setTimeout(function() { jQ[0].focusMathQuillGGB(); });

      // preventDefault won't prevent focus on mousedown in IE<9
      // that means immediately after this mousedown, whatever was
      // mousedown-ed will receive focus
      // http://bugs.jquery.com/ticket/10345

    cursor.blink = noop;

    // Note that we also need to change the code here! Although it may
    // seem to work, but e.target is not a standard way of getting
    // touch event target, so using the same approach as in touchmove
    //cursor.seek($(e.target), e.pageX, e.pageY);

    // and use the "e" only for a fallback
    var ourtarget = e;
    var origevt = e.originalEvent;
    if (origevt) {
      if (origevt.changedTouches) {
        if (origevt.changedTouches[0]) {
          // please, do not move more touching fingers :-)
          ourtarget = origevt.changedTouches[0];
        }
      }
    }
    cursor.seek($(ourtarget.target), ourtarget.pageX, ourtarget.pageY);

    anticursor = Point(cursor.parent, cursor[L], cursor[R]);

    if (!editable) jQ.prepend(textareaSpan);

    jQ.bind('touchmove', touchmove).bind('touchend', touchend);
    if ((ourtarget) && (ourtarget.target) && (ourtarget.target.ownerDocument)) {
      $(ourtarget.target.ownerDocument).bind('touchmove', doctouchmove).bind('touchend', touchend);
    } else if ((e) && (e.target) && (e.target.ownerDocument)) {
      // I think here we can use e.target, as it is only used to get the ownerDocument!
      $(e.target.ownerDocument).bind('touchmove', doctouchmove).bind('touchend', touchend);
    }

    if (!editable) {
      return false;
    }

    // return false would mean stopPropagation & preventDefault,
    // but in case of editing mode, we actually want this to
    // propagate, so that the actions of the whole input bar shall
    // also execute on this part of it! preventDefault is Okay
    // however, because it is like clicking at a neutral place
    // AND maybe it's important for something in MathQuillGGB!
    e.preventDefault();

    // note: but this will prevent the touchstart event from firing!!!
    // so at least we should bind the touchstart event as well,
    // which is probably Okay from JQuery 1.7+, it seems...
  });

  if (!editable) {
    var textareaManager = manageTextarea(textarea, { container: jQ, rootJQ: jQ });
    jQ.bind('cut paste', false).bind('copy', setTextareaSelection)
      .prepend('<span class="selectable">$'+root.latex()+'$</span>');
    textarea.blur(function() {
      cursor.clearSelection();
      setTimeout(detach); //detaching during blur explodes in WebKit
    });
    function detach() {
      textareaSpan.detach();
    }
    return;
  }

  var textareaManager = manageTextarea(textarea, {
    //container: jQ,
    container: textarea,
    rootJQ: jQ,
    moveLeft: function() {
      cursor.moveLeft();
    },
    key: function(key, evt) {
      cursor.parent.bubble('onKey', cursor, key, evt);
    },
    text: function(text) {
      cursor.parent.bubble('onText', cursor, text);
    },
    cut: function(e) {
      if (cursor.selection) {
        setTimeout(function() {
          cursor.prepareEdit();
          cursor.parent.bubble('redraw');
        });
      }

      e.stopPropagation();
    },
    copy: function(e) {
      if (cursor.selection) {
        setTimeout(function() {
          cursor.prepareMove();
          cursor.parent.bubble('redraw');
        });
      }

      e.stopPropagation();
    },
    paste: function(text) {
      // FIXME HACK the parser in RootTextBlock needs to be moved to
      // Cursor::writeLatex or something so this'll work with
      // MathQuillGGB textboxes
      if ((text.slice(0,1) === '$') && (text.slice(-1) === '$')) {
        text = text.slice(1, -1);
      } else {
        // We almost never want to paste TextBlock into MathQuillGGB,
    	// but when we do, it will look the same way without \\text too!
        //text = '\\text{' + text + '}';
      }

      //console.log('paste 1:'+text);
      var text3 = text;

      // in theory GeoGebraWeb handles the \" output from Quotation
      // and after some other operation it converts it to simple "
      // but it is not done here after copying, so we need to
      // simply change \" to "; although neither is really perfect!
      // BUT this must be done before substQuotations otherwise
      // there is nothing to replace...
      //text3 = text3.split('\\"').join('"');
      // but after this part of the substQuotations perfection is gone!
      // so it's probably better to add this to the substQuotations
      // method itself, implemented at the right places only...

      // before solving this method in a better way, we shall
      // note that the input syntax can be quite different:
      // output from MathQuillGGB actually has \" signs for the
      // Quotation class and simple " signs for characters inside
      // the quoted string. However, intuitively just the opposite
      // shall be right, i.e. " signs for Quotation class and
      // escaped \" characters for the characters inside the
      // quoted string. Thus I think, it would be better to rethink
      // the entire thing in connection with Quotations, also
      // for JIRA ticket GGB-80, and this one TRAC-5058
      text3 = cursor.substQuotations(text3);

      //console.log('paste 2:'+text3);

      // this is not good, e.g. in Quotation we shall leave
      // space intact... similarly, we cannot delete " "
      // from anywhere, but just solve this double-space
      // in another way, i.e. do not change it to \u2060
      // if it is after another \space ...
      //text3 = text3.split('\space ').join('\u2060');

      text3 = text3.split(' ').join('\u2060');

      // or it is also okay (and more easy) to change back
      // as we don't want \space\u2060 anyway...
      var text3b = '';
      while (text3b !== text3) {
        text3b = text3;
        text3 = text3.split('\\space\u2060').join('\\space ');
        // maybe these things may also happen
        text3 = text3.split('\u2060\\space').join(' \\space');
        // the same again?
        // NOTE: it's not good to change more characters to less
        // here, e.g. \u2060\u2060 to \u2060 because it would
        // work wrongly in case of inside Quotations
      }

      //console.log('paste 3:'+text3);
     
      //console.log('paste 4:'+text3);

      //text3 = cursor.fix3bug(text3);

      // --- the fix2bug and fixabug methods are not as good as
      // --- the other methods before, but these are complex
      // --- issues, see JIRA TRAC-5058 and GGB-80
      text3 = cursor.fix2bug(text3);
      
      //console.log('paste 5:'+text3);
      
      text3 = cursor.fixabug(text3);

      console.log('paste 6:'+text3);

      cursor.writeLatexSafe(text3);
    }
  });

  jQ.prepend(textareaSpan);

  //root CSS classes
  jQ.addClass('mathquillggb-editable');
  if (textbox)
    jQ.addClass('mathquillggb-textbox');

  textareaDOM.hadFocus = false;

  var textareaFocusFunction = function(e1) {
    if (textareaDOM.hadFocus === false) {
      if (!cursor.parent)
        cursor.appendTo(root);
      cursor.parent.jQ.addClass('hasCursor');
      if (cursor.selection) {
        cursor.selection.jQ.removeClass('blur');
        setTimeout(root.selectionChanged); //re-select textarea contents after tabbing away and back
      } else {
        cursor.show();
      }

      // dirty hack, but effective, as mathquillggb.js is used
      // from GeoGebraWeb anyway (if not, it does no harm)
      if (root.common.newCreationMode) {
        textarea.parents('.algebraPanel').addClass('NoHorizontalScroll');
      }
      textareaDOM.hadFocus = true;
    }
  };

  var textareaBlurFunction = function(e2) {
    if (textareaDOM.hadFocus) {
      if (cursor.parent) {
        cursor.hide().parent.blur();
      }
      if (cursor.selection) {
        cursor.selection.jQ.addClass('blur');
      }

      // dirty hack, but effective, as mathquillggb.js is used
      // from GeoGebraWeb anyway (if not, it does no harm)
      if (root.common.newCreationMode) {
        textarea.parents('.algebraPanel').removeClass('NoHorizontalScroll');
      }
      textareaDOM.hadFocus = false;
    }
  };

  //focus and blur handling
  if (!disabledTextarea) {
    textarea.focus(textareaFocusFunction).blur(textareaBlurFunction);
  }

  // to make things clear:
  // - jQ will have tabindex=1, event orders:
  // A. in case none has focus:
  // jQ.focus, textarea.focusin, jQ.blur, textarea.focus
  // more exactly:
  // jQ.focus, jQ.focusOut, textarea.focusin, jQ.blur, textarea.blur triggered,
  // now which comes first? textarea.focus or textarea.focusout & textarea.blur?

  // there is a bug when TAB moves tabindex back to the same element,
  // so maybe we will need a dummy element with a tabindex 0,
  // which is later than the tab index of the mathquillggb-editable element!
  jQ.prev().attr('tabindex', 2);
  if(document.body.addEventListener){
	  document.body.addEventListener('MSPointerDown',function(e){window.mqTouchEvents = e.pointerType == 2 || e.pointerType == "touch"});
  }
  // That's why a better solution is needed here:
  jQ.attr('tabindex', 1).bind('focus.mathquillggb', function(e1) {
    // the problem is that this might be called when still
    // the textarea is having focus... but actually, the
    // blur method and handler of the textarea might be called earlier,
    // so by this time we do not know how this was called...

    // so the only good solution, I think, is to check this at
    // the time of triggering the focus event by the focus method
    // or in some other way... but then we shall make sure that
    // all these calling methods do that check
    // and we can probably do it by document.activeElement
    // instead of textareaDOM.hadFocus

    // it gets tabindex of 1 to get focus ASAP,
    // and also because the blur event on TAB should
    // really leave this element in case TAB is pressed!

    adjustFixedTextarea(jQ);

    // if jQ just gets focus, why was here jQ.blur???
    // to make this blur before textarea.focus() makes it blur,
    // because it may be too late and trigger textarea.blur()
    // after textarea.focus(), I think, which is too late
    // but still in this case, textarea.blur may be called too
    // late, setTimeout is not the best solution:
    if (window.mqTouchEvents) {
      textarea.attr("disabled","true");
    } else if (window.mqTouchEvents === false) {
      textarea.removeAttr("disabled");
    }

    if (disabledTextarea) {
      textareaFocusFunction(e1);
    } else {
      // I think there is no point in setting more setTimeout
      // when the first one will clear the other ones, so
      // this is the simplest solution so far, but is this
      // the most reliable? Probably not...
      // 100ms is experimental, 0ms does not work with Web.html
      setTimeout(function() { textarea.focus(); }, 100);
	}

    // do this immediately (ATM also happens in timeout, might not be needed)
    if (root.common.newCreationMode) {
      textarea.parents('.algebraPanel').addClass('NoHorizontalScroll');
    }
  }).bind('blur.mathquillggb', function(e3) {
    if (disabledTextarea) {
      textareaBlurFunction(e3);
    }
  }).blur();

  // we need a method that only focuses when the textareaDOM is
  // not yet having focus! 
  jQ[0].focusMathQuillGGB = // the same thing, in theory
  root.common.focusMathQuillGGB = function() {
    if (document.activeElement === textareaDOM) {
      // do no focus!
    } else if (textareaDOM.hadFocus) {
      // do no focus!
    } else {
      this.focus();
    }
  }
}

var RootMathBlock = P(MathBlock, function(_, _super) {
  _.latex = function() {
    return _super.latex.call(this).replace(/(\\[a-z]+) (?![a-z])/ig,'$1');
  };
  _.text = function() {
    return this.foldChildren('', function(text, child) {
      return text + child.text();
    });
  };
  _.renderLatex = function(latex) {
    var jQ = this.jQ;

    jQ.children().slice(1).remove();
    this.ch[L] = this.ch[R] = 0;

    var newCursor = this.cursor.appendTo(this);
    //var latex2 = newCursor.substQuotations(latex);
    // maybe we shall not do this, but do it in
    // GeoGebraWeb instead! Because " can be inside
    // real \\quotation syntax, would be buggy...
    var latex2 = latex;
    newCursor.writeLatex(latex2);
  };
  _.appendKoreanChar = function(lead, vowel, tail) {
	// lead, vowel and tail are char codes
    var lead0 = lead - 0x1100 + 1;
    var vowel0 = vowel - 0x1161 + 1;
    var tail0 = ((tail == 0) ? 0 : (tail - 0x11a8 + 1));
    var unicode = (tail0 + (vowel0 - 1) * 28 + (lead0 - 1) * 588 + 44032);
    // return is actual character
    return String.fromCharCode(unicode);
  };
  _.flattenKorean = function(s) {
	// init!
    var sb = "";
    var lastWasVowel = false;
    var koreanLeadToTail = new Object();
    koreanLeadToTail['\u1100'] = '\u11a8';
    koreanLeadToTail['\u1101'] = '\u11a9';
    koreanLeadToTail['\u1102'] = '\u11ab';
    koreanLeadToTail['\u1103'] = '\u11ae';
    koreanLeadToTail['\u1104'] = '\u1104';
    koreanLeadToTail['\u1105'] = '\u11af';
    koreanLeadToTail['\u1106'] = '\u11b7';
    koreanLeadToTail['\u1107'] = '\u11b8';
    koreanLeadToTail['\u1108'] = '\u1108';
    koreanLeadToTail['\u1109'] = '\u11ba';
    koreanLeadToTail['\u110a'] = '\u11bb';
    koreanLeadToTail['\u110b'] = '\u11bc';
    koreanLeadToTail['\u110c'] = '\u11bd';
    koreanLeadToTail['\u110d'] = '\u110d';
    koreanLeadToTail['\u110e'] = '\u11be';
    koreanLeadToTail['\u110f'] = '\u11bf';
    koreanLeadToTail['\u1110'] = '\u11c0';
    koreanLeadToTail['\u1111'] = '\u11c1';
    koreanLeadToTail['\u1112'] = '\u11c2';

    for (var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      if ((c >= 0xac00) && (c <= 0xd7af)) {
      //if (isKoreanMultiChar(c))
        var tail = 0x11a7 + (c - 44032) % 28;
        var tailstr = String.fromCharCode(tail);
        var vowelstr = String.fromCharCode(0x1161 + Math.floor(((c - 44032 - (tail - 0x11a7)) % 588) / 28));
        var leadstr = String.fromCharCode(0x1100 + Math.floor((c - 44032) / 588));
		sb += leadstr;
		sb += vowelstr;
		if (!this.isKoreanLeadPlusVowelChar(c)) {
			sb += tailstr;
		}
      } else {
        // if a "lead char" follows a vowel, turn into a "tail char"
        if (lastWasVowel && (c >= 0x1100) && (c <= 0x1112)) {
          var charac = String.fromCharCode(c);
          charac = koreanLeadToTail[charac];
          sb += charac;
        } else {
          sb += String.fromCharCode(c);
        }
      }
      if (sb.length) {
        var testc = sb.charCodeAt(sb.length - 1);
        lastWasVowel = false;
        if ((testc >= 0x1161) && (testc <= 0x1175)) {
          lastWasVowel = true;
        }
      }
    }
    return sb;
  };
  _.isKoreanLeadPlusVowelChar = function(c) {
    if ((c >= 0xac00) && (c <= 0xd7af)) {
      var ch = c - 0xac00;
      if ((ch % 28) === 0) {
        return true;
      }
    }
    return false;
  };
  _.unflattenKorean = function(str) {
    var ret = "";
    var lead = 0;
    var vowel = 0;
    var tail = 0;
    // ONLY merge really lead-vowel-tail combos!
    for (var i = 0; i < str.length; i++) {
      var c = str.charCodeAt(i);
      if ((c >= 0x1100) && (c <= 0x1112)) {
        //if (isKoreanLeadChar(c)) {
  	    if ((lead == 0) && (vowel == 0) && (tail == 0)) {
          lead = c;
    	} else {
    	  // in theory, it cannot happen that either
    	  // vowel and tail are filled, while
    	  // at the same time, lead is not!

    	  // but it can happen that
    	  // - only lead is filled:
    	  if ((lead != 0) && (vowel == 0) && (tail == 0)) {
    		ret += String.fromCharCode(lead);
    		lead = c;
    	  } else
    	  // - lead & vowel is filled:
    	  if ((lead != 0) && (vowel != 0) && (tail == 0)) {
      		ret += String.fromCharCode(lead);
      		ret += String.fromCharCode(vowel);
      		lead = c;
      		vowel = 0;
      	  } else {
      		// in other cases, we might need to flush c...
      		// but in theory, there are no other cases!
      	  }
    	}
      } else if ((c >= 0x1161) && (c <= 0x1175)) {
      //if (isKoreanVowelChar(c)) {
    	if (lead == 0) {
    	  // comes in the wrong time, flush immediately
    	  // as in theory it cannot happen that vowel or tail
          // are there when lead is not...
    	  ret += String.fromCharCode(c);
    	} else if (vowel != 0) {
    	  // comes in the wrong time, flush immediately everything!
      	  ret += String.fromCharCode(lead);
    	  ret += String.fromCharCode(vowel);
    	  ret += String.fromCharCode(c);
    	  lead = 0;
    	  vowel = 0;
    	  // tail is always 0
    	} else {
    	  // in this case, tail should be 0 in theory!
          vowel = c;
    	}
      } else if ((c >= 0x11a8) && (c <= 0x11c2)) {
      //if (isKoreanTailChar(c)) {
    	// "tail always flushes"
    	if ((lead != 0) && (vowel != 0)) {
    	  tail = c;
    	  ret += this.appendKoreanChar(lead, vowel, tail);
    	  lead = 0;
    	  vowel = 0;
    	  tail = 0;
    	} else if (lead == 0) {
    	  // in this case, no vowel either, no tail
    	  ret += String.fromCharCode(c);
    	} else if (vowel == 0) {
    	  // there is lead, so need to make it null
    	  ret += String.fromCharCode(lead);
    	  lead = 0;
    	  ret += String.fromCharCode(c);
    	}
      } else {
    	// ordinary character comes, flush!
    	if (lead != 0) {
    	  if (vowel != 0) {
          	ret += String.fromCharCode(lead);
            ret += String.fromCharCode(vowel);
            lead = 0;
            vowel = 0;
    	  } else {
          	ret += String.fromCharCode(lead);
          	lead = 0;
    	  }
   	    }
    	// if lead is 0, vowel and tail are also 0
        ret += String.fromCharCode(c);
      }
    }

    // make sure last char done!
    if (lead != 0) {
      if (vowel != 0) {
        ret += String.fromCharCode(lead);
        ret += String.fromCharCode(vowel);
      } else {
    	ret += String.fromCharCode(lead);
      }
      // old school
      //ret += this.appendKoreanChar(lead, vowel, tail);
    }
    return ret;
  };
  _.mergeKoreanDoubles = function(str2) {
	var str = str2;
    // ported to JavaScript from Java: GeoGebra/common...
    // Korean.java / Korean.mergeDoubleCharacters(String)

    if (str.length) {
      var str = hangulJamo(str);
      if (str.length) {
        if (str.length < 2) {
          return str;
        }
      } else {
    	return str;
      }
    } else {
      return str;
    }

    // flattenKorean makes more characters from less,
    // and without it, the 3-character test case does
    // not seem to work! so put here, even if it seems
    // different order than in the Desktop case...
    str2 = this.flattenKorean(str);
    if (str2.length) {
      str = str2;
    }

    var sb = "", c, c2;
    for (var i = 0; i < str.length - 1; i++) {
      var offset = 1;
      c = str.charCodeAt(i);
      switch (str.charAt(i)) {
        case '\u1161':
        case '\u1162':
        case '\u1165':
        case '\u1166':
          offset++;
        case '\u1103':
        case '\u1109':
        case '\u110c':
        case '\u11a8':
        case '\u11ba':
          if (str.charCodeAt(i + 1) === c) {
            sb += String.fromCharCode(c + offset);
            // eg \u1101 ie doubled char
            i++;
          } else {
            sb += String.fromCharCode(c);
          }
          break;
        case '\u1169':
          c2 = str.charAt(i + 1);
          if (c2 === '\u1161') {
            sb += '\u116a';
            i++;
          } else if (c2 === '\u1162') {
            sb += '\u116b';
            i++;
          } else if (c2 === '\u1175') {
            sb += '\u116c';
            i++;
          } else if (c2 === '\u1169') {
            sb += '\u116d';
            i++;
          } else {
            sb += String.fromCharCode(c);
          }
          break;
        case '\u1105':
          c2 = str.charAt(i + 1);
          if (c2 === '\u1100') {
            sb += '\u11b0'; // eg \u1101 ie doubled char
            i++;
          } else if (c2 === '\u1106') {
            sb += '\u11b1'; // eg \u1101 ie doubled char
            i++;
          } else if (c2 === '\u1107') {
            sb += '\u11b2'; // eg \u1101 ie doubled char
            i++;
          } else if (c2 === '\u1109') {
            sb += '\u11b3'; // eg \u1101 ie doubled char
            i++;
          } else if (c2 === '\u1110') {
            sb += '\u11b4'; // eg \u1101 ie doubled char
            i++;
          } else if (c2 === '\u1112') {
            sb += '\u11b6'; // eg \u1101 ie doubled char
            i++;
          } else {
            sb += String.fromCharCode(c);
          }
          break;
        case '\u116e':
          c2 = str.charAt(i + 1);
          if (c2 === '\u1165') {
            sb += '\u116f'; // eg \u1101 ie doubled char
            i++;
          } else if (c2 === '\u1166') {
            sb += '\u1170'; // eg \u1101 ie doubled char
            i++;
          } else if (c2 === '\u1175') {
            sb += '\u1171'; // eg \u1101 ie doubled char
            i++;
          } else if (c2 === '\u116e') {
            sb += '\u1172'; // eg \u1101 ie doubled char
            i++;
          } else {
            sb += String.fromCharCode(c);
          }
          break;
        case '\u1173':
          c2 = str.charAt(i + 1);
          if (c2 === '\u1175') {
            sb += '\u1174'; // eg \u1101 ie doubled char
            i++;
          } else {
            sb += String.fromCharCode(c);
          }
          break;
        case '\u1100':
          c2 = str.charAt(i + 1);
          if (c2 === '\u1100') {
            sb += '\u11a9'; // eg \u1101 ie doubled char
            i++;
          } else if (c2 === '\u1109') {
            sb += '\u11aa'; // eg \u1101 ie doubled char
            i++;
          } else {
            sb += String.fromCharCode(c);
          }
          break;
        case '\u1102':
          c2 = str.charAt(i + 1);
          if (c2 === '\u110c') {
            sb += '\u11ac'; // eg \u1101 ie doubled char
            i++;
          } else if (c2 === '\u1112') {
            sb += '\u11ad'; // eg \u1101 ie doubled char
            i++;
          } else {
            sb += String.fromCharCode(c);
          }
          break;
        case '\u1111':
          c2 = str.charAt(i + 1);
          if (c2 === '\u1111') {
            sb += '\u11b5'; // eg \u1101 ie doubled char
            i++;
          } else {
            sb += String.fromCharCode(c);
          }
          break;
		case '\u1107':
          c2 = str.charAt(i + 1);
          if (c2 === '\u1109') {
            sb += '\u11b9'; // eg \u1101 ie doubled char
            i++;
          } else if (c2 === '\u1107') {
            sb += '\u1108'; // eg \u1101 ie doubled char
            i++;
          } else {
            sb += String.fromCharCode(c);
          }
          break;
        default:
          sb += String.fromCharCode(c);
      }
      if (i === str.length - 2) {
        sb += str.charAt(str.length - 1);
      }
    }
    str = sb;
    if (str.length) {
      if (str.length < 2) {
        return str;
      }
    } else {
      return str;
    }
    str = this.unflattenKorean(str);
    return str;
  };
  _.maybeThisMaybeStyle = function() {
    var root = this;
    // maybe there is no need for so much checks,
    // but who knows? what error might arise,
    // exceptions shall be avoided in any case!
    if (root.ch[L]) {
      if (root.ch[L] instanceof MathCommand) {
        if (root.ch[L].ch[L]) {
          if (root.ch[L].ch[L] instanceof MathBlock) {
            if (root.ch[L].ch[L].whetherRootStyleBlock()) {
              return root.ch[L].ch[L];
            }
          }
        }
      }
    }
    return root;
  };
  _.onKey = function(curs, key, e) {
	var quasiRoot = this.maybeThisMaybeStyle();
    switch (key) {
    case 'Ctrl-Shift-Backspace':
    case 'Ctrl-Backspace':
      while (this.cursor[L] || this.cursor.selection) {
        this.cursor.backspace();
      }
      break;

    case 'Shift-Backspace':
    case 'Backspace':
      this.cursor.backspace();
      break;

    // Tab or Esc -> go one block right if it exists, else escape right.
    case 'Esc':
      this.cursor.escapeDir(R, key, e);
      return;

    case 'Tab':
      var cursorLeft = this.cursor[L];
      if (this.cursor.selection) {
    	// in any case, clear the previous selection
    	// so that new selection may happen, even if
    	// it will be the same selection as this one
        this.cursor.clearSelection();

        // in order not to select the same thing again,
        // move right if possible, otherwise move to
        // the beginning of the formula!
        if (this.cursor[R]) {
          this.cursor.moveRight();
        } else {
          this.cursor.insertBefore(this.ch[L]);
        }
        if (this.cursor[R]) {
          // Okay, can call method later
        } else {
          // make it possible to have cursor[R]
          this.cursor.insertBefore(this.ch[L]);
        }
      }
      if (this.cursor[R]) {
    	// now this means we have something
        this.selectNextSyntaxHelp();
        if (this.cursor.selection) {
          // success!
        } else if (this.cursor[L]) {
          // we can still try to go to the left,
          // and try again!
          //var cursorLeft = this.cursor[L];
          this.cursor.insertBefore(this.ch[L]);
          this.selectNextSyntaxHelp();
          if (this.cursor.selection) {
        	  // success, keep cursor position!
          } else {
        	  // fail, revert to previous cursor pos
        	  this.cursor.insertAfter(cursorLeft);
          }
        }
      }
      break;

    // Shift-Tab -> go one block left if it exists, else escape left.
    case 'Shift-Tab':
    case 'Shift-Esc':
    case 'Shift-Spacebar':
      this.cursor.escapeDir(L, key, e);
      return;

    // Prevent newlines from showing up
    case 'Enter': break;


    // End -> move to the end of the current block.
    case 'End':
      this.cursor.prepareMove().appendTo(this.cursor.parent);
      break;

    // Ctrl-End -> move all the way to the end of the root block.
    case 'Ctrl-End':
      this.cursor.prepareMove().appendTo(quasiRoot);
      break;

    // Shift-End -> select to the end of the current block.
    case 'Shift-End':
      while (this.cursor[R]) {
        this.cursor.selectRight();
      }
      break;

    // Ctrl-Shift-End -> select to the end of the root block.
    case 'Ctrl-Shift-End':
      while (this.cursor[R] ||
    		 ((this.cursor.parent !== this) &&
    		  (this.cursor.parent !== quasiRoot))) {
        this.cursor.selectRight();
      }
      break;

    // Home -> move to the start of the root block or the current block.
    case 'Home':
      this.cursor.prepareMove().prependTo(this.cursor.parent);
      break;

    // Ctrl-Home -> move to the start of the current block.
    case 'Ctrl-Home':
      this.cursor.prepareMove().prependTo(quasiRoot);
      break;

    // Shift-Home -> select to the start of the current block.
    case 'Shift-Home':
      while (this.cursor[L]) {
        this.cursor.selectLeft();
      }
      break;

    // Ctrl-Shift-Home -> move to the start of the root block.
    case 'Ctrl-Shift-Home':
      while (this.cursor[L] ||
    		 ((this.cursor.parent !== this) &&
    		  (this.cursor.parent !== quasiRoot))) {
        this.cursor.selectLeft();
      }
      break;

    case 'Left': this.cursor.moveLeft(); break;
    case 'Shift-Left': this.cursor.selectLeft(); break;
    case 'Ctrl-Left': break;

    case 'Right': this.cursor.moveRight(); break;
    case 'Shift-Right': this.cursor.selectRight(); break;
    case 'Ctrl-Right': break;

    // Up and Down will not run in newCreationMode as they are
    // handled in GeoGebraWeb in the event capturing phase
    case 'Up': this.cursor.moveUp(); break;
    case 'Down': this.cursor.moveDown(); break;

    case 'Shift-Up':
      if (this.cursor[L]) {
        while (this.cursor[L]) this.cursor.selectLeft();
      } else {
        this.cursor.selectLeft();
      }
      // was no break??
      break;

    case 'Shift-Down':
      if (this.cursor[R]) {
        while (this.cursor[R]) this.cursor.selectRight();
      }
      else {
        this.cursor.selectRight();
      }
      // was no break??
      break;

    case 'Ctrl-Up': break;
    case 'Ctrl-Down': break;

    case 'Ctrl-Shift-Del':
    case 'Ctrl-Del':
      while (this.cursor[R] || this.cursor.selection) {
        this.cursor.deleteForward();
      }
      break;

    case 'Shift-Del':
    case 'Del':
      this.cursor.deleteForward();
      break;

    case 'Meta-A':
    case 'Ctrl-A':
      //so not stopPropagation'd at RootMathCommand
      if (this !== this.cursor.root) return;

      this.cursor.prepareMove().appendTo(quasiRoot);
      while (this.cursor[L]) this.cursor.selectLeft();
      break;

    case 'F1':
    default:
      if (this.common !== undefined) {
    	if (this.common.forceGeoGebraSuggestionPopupCanShow === true) {
    	  delete this.common.forceGeoGebraSuggestionPopupCanShow;
    	} else {
    	  // by default, this shall be overwritten
          this.common.GeoGebraSuggestionPopupCanShow = false;

    	  // Change: We should only allow the suggestion popup
          // for alphanumeric characters! "sqrt(" showing was a bug
    	  var key2 = key;
    	  if ((key2 !== undefined) && (key2.length > 0)) {
    		  if ((key2.length === 7) && (key2.substring(0,6) === "Shift-")) {
    			  key2 = key2.substring(6);
    		  }
    		  if (key2.length === 1) {
    			  var cc = key2.charCodeAt(0);
    			  this.geogebraAutocompleteSuggestionCheck(cc);
    		  }
    	  }
    	  // note: something like the above method shall be called in
    	  // case the mathquillggb replace command happens!!! But in that
    	  // case, we can take the character directly (its character code)
    	}
      }
      return false;
    }

    if (this.common !== undefined) {
      // but note that in case of Up and Down, we should not hide them!
      if (this.common.forceGeoGebraSuggestionPopupCanShow === true) {
        delete this.common.forceGeoGebraSuggestionPopupCanShow;
      } else {
        this.common.GeoGebraSuggestionPopupCanShow = false;
      }
  	}

    e.preventDefault();
    return false;
  };
  _.geogebraAutocompleteSuggestionCheck = function(cc) {
	// cc is charCode
    if (cc >= 65 && cc <= 90) {
      // ASCII A-Z OK
      this.common.GeoGebraSuggestionPopupCanShow = true;
    } else if (cc >= 97 && cc <= 122) {
      // we shall also accept lowercase, as this method
      // is also called from somewhere else!
      this.common.GeoGebraSuggestionPopupCanShow = true;
    } else if (cc >= 48 && cc <= 57) {
      // ASCII 0-9 maybe OK (?)
      this.common.GeoGebraSuggestionPopupCanShow = true;
    } else {
      // Korean characters also need checks for #5398
      if ((cc >= 0x1100) && (cc <= 0x1112)) {
    	// Korean lead char
    	this.common.GeoGebraSuggestionPopupCanShow = true;
      } else if ((cc >= 0x1161) && (cc <= 0x1175)) {
    	// Korean vowel char
    	this.common.GeoGebraSuggestionPopupCanShow = true;
      } else if ((cc >= 0x11a8) && (cc <= 0x11c2)) {
    	// Korean tail char
    	this.common.GeoGebraSuggestionPopupCanShow = true;
      } else if ((cc >= 0xac00) && (cc <= 0xd7af)) {
    	// Korean multi char
    	this.common.GeoGebraSuggestionPopupCanShow = true;
      }
    }
  };
  _.onText = function(curs, ch) {
	if (ch === ',') {
      if (this.cursor[R]) {
        if ((this.cursor[R] instanceof VanillaSymbol) && (this.cursor[R].ctrlSeq === ',')) {
          // TODO: it would be good to make a heuristic whether
          // this.selectNextSyntaxHelp will work or not, e.g. by searching
          // in this.text()... however, in the GeoGebraWeb command case it further slows it down
          var successful = this.selectNextSyntaxHelp();
          if (successful) {
            if (this.common !== undefined) {
              this.common.GeoGebraSuggestionPopupCanShow = false; // or undefined;
            }
            return false;
          }
          // if not successful we should just continue with the default case
          // for the same reason, this.selectNextSyntaxHelp() should not have
          // any ill effect on the formula in case it is unsuccessful!
        }
      }
      this.cursor.write(ch);
	} else if (ch === ' ') {
      this.cursor.write('\u00d7');
	} else {
      // now look back 3 characters, and check whether they are Korean
      // characters that can be merged...
      var mrt = ch;
      var triple = ch;
      var numadded = 0;
      if (this.cursor[L] && (this.cursor[L] instanceof Symbol)) {
        if (this.cursor[L].ctrlSeq) {
          if (this.cursor[L].ctrlSeq.length === 1) {
            triple = this.cursor[L].ctrlSeq + triple;
            numadded++;
            if (this.cursor[L][L] && (this.cursor[L][L] instanceof Symbol)) {
              if (this.cursor[L][L].ctrlSeq) {
                if (this.cursor[L][L].ctrlSeq.length === 1) {
                  triple = this.cursor[L][L].ctrlSeq + triple;
                  numadded++;
                }
              }
            }
          }
        }
      }
      var tripleL = triple.length;
      // this may be 0-1-2 characters more than mort.length
      // but in case it's really more, try to merge!
      // moreover, merge ANYWAY, if (tripleL > 1)!
      if (tripleL > 1) {
        triple = this.mergeKoreanDoubles(triple);
        // write mrt instead of the triple is good,
        // and delete numadded chars... but maybe
        // it's not the best, since delete-add the same,
        // however, the other solution is more difficult
        // and in case numadded is really added by this
        // way, i.e. Symbols, then it shall be Okay

        //ch = mrt[mrt.length - 1];

        if (tripleL != triple.length) {
          mrt = triple;

          // if mrt is more characters long,
          // probably only keep its last character,
          // this is important!!! at least if ch.length was 1
          var numsub = 0;
          if (ch.length === 1) {
        	numsub = mrt.length - 1;
            mrt = mrt[mrt.length - 1];
          }
          for (var cv = 0; cv < numadded - numsub; cv++) {
            this.cursor.backspace();
          }

          // in this case mergeKoreanDoubles really did something
          // so we have to find out
          // - how many backspaces we will need
          // ...
          // this is the difference of the result of:
          //var triple3 = triple;
          //if (tripleL > numadded + 1) {
          //  triple3 = triple.substring(0, numadded + 1);
          //}
          //var triple3b = this.root.mergeKoreanDoubles(triple3);
          //var result3 = triple3.length - triple3b.length;

          //var triple4 = triple;
          //if (tripleL > numadded + 2) {
          //  triple4 = triple.substring(0, numadded + 2);
          //}
          //var triple4b = this.root.mergeKoreanDoubles(triple4);
          //var result4 = triple4.length - triple4b.length;
          //if (result3 === result4) {
          //  for (var cv = 0; cv < result3.length; cv++) {
          //	  this.cursor.backspace();
          //  }
          //} else {
        	  // this means that a merge also happened at the
        	  // 1st and 2nd characters of "mort", but it is
        	  // a good question whether the previous char
        	  // was included or not... 1234 might be:
        	  // (12)(34): result3: 1, result4: 2, backspace:
        	  // 12(34): result3: 0, result4: 1
        	  // 1(234): result3: 0, result4: 2
        	  //
          //  for (var cv = 0; cv < result3.length; cv++) {
          //	  this.cursor.backspace();
          //  }
          //}
        }
      }
      this.cursor.write(mrt);
    }
    return false;
  };
  _.selectNextSyntaxHelp = function() {
    var numberOfMoveRights = 0;// at the end, the cursor should move left this many times
	var numberOfSelectRights = 0;
	var cursor = this.cursor;
	var checkpoint1 = false;
	var undoEverything = false;
	while(cursor[R]) {
	  // the ] sign in the end is actually a pair of another,
	  // and these make the parent of the parent (this.cursor.parent.parent)
	  // so we only need to check for (cursor[R])
	  if ((cursor[R] instanceof BinaryOperator) &&
	      (cursor[R].ctrlSeq === '<')) {
	   	if (checkpoint1) {
	   	  // wrong syntax, let's undo everything!
	      undoEverything = true;
	      break;
	  	} else {
	   	  // in theory, selectRight will also move the cursor
	   	  // to the right... but it should not go out of the
	      // block because we check (cursor[R]) in this loop
	      cursor.selectRight();
	      numberOfSelectRights++;
	 	  checkpoint1 = true;
	    }
	  } else if ((cursor[R] instanceof BinaryOperator) &&
	             (cursor[R].ctrlSeq === '>')) {
	  	if (checkpoint1) {
	   	  // the only way to finish this without undo!
	      cursor.selectRight();
	      numberOfSelectRights++;
	      if (cursor[R]) {
	       	break;
	      } else {
	       	// if (cursor[R]) is false in the end,
	       	// then undoEverything should mean its opposite
	       	undoEverything = true;
	       	//break;// although it can be omitted
	      }
	  	} else {
	   	  // wrong syntax, let's undo everything!
	   	  undoEverything = true;
	  	  break;
	   	}
	  } else {
	  	if (checkpoint1) {
	   	  cursor.selectRight();
	   	  numberOfSelectRights++;
	  	} else {
	      cursor.moveRight();
	      numberOfMoveRights++;
	 	}
	  }
	}
	if (cursor[R]) {
	  // as undefined or null would give run-time-error
      // on (!cursor[R]) in theory, let's put code in else branch
	} else {
	  undoEverything = !undoEverything;
	}
	if (undoEverything) {
      cursor.clearSelection();
      while(numberOfMoveRights) {
    	cursor.moveLeft();
    	numberOfMoveRights--;
      }
      return false;
	}
	return true;
  };
});

var RootEqnArray = P(RootMathBlock, function(_) {
  _.renderLatex = function(latex) {
    var jQ = this.jQ;
    var cursor = this.cursor;

    jQ.children().slice(1).remove();

    var lines = latex.split('\\\\');
    var table = $('<table>').appendTo(jQ);

    for (var i = 0, li = lines.length; i < li; i += 1) {
      var pieces = lines[i].replace(/\\&/, '\\amp ').split('&');

      var tr = $('<tr>').appendTo(table);

      for (var j = 0, lj = pieces.length; j < lj; j += 1) {
        var td = $('<td>').appendTo(tr);

        var cell = MathBlock();
        cell.jQ = td;
        cell.adopt(this, this.ch[R], 0);

        cursor.appendTo(cell).writeLatex(pieces[j]);
      }
    }
  };
});

var RootMathCommand = P(MathCommand, function(_, _super) {
  _.init = function(cursor) {
    _super.init.call(this, '$');
    this.cursor = cursor;
  };
  _.htmlTemplate = '<span class="mathquillggb-rendered-math">&0</span>';
  _.createBlocks = function() {
    this.ch[L] =
    this.ch[R] =
      RootMathBlock();

    this.blocks = [ this.ch[L] ];

    this.ch[L].parent = this;

    this.ch[L].cursor = this.cursor;
    this.ch[L].write = function(cursor, ch, replacedFragment) {
      // in GeoGebraWeb, we do not call RootMathCommand from
      // RootTextBlock, and this means $ should always mean the same
      // thing as that of MathBlock's!

      //if (ch !== '$')
        MathBlock.prototype.write.call(this, cursor, ch, replacedFragment);
      //else if (this.isEmpty()) {
      //  cursor.insertAfter(this.parent).backspace().show();
      //  VanillaSymbol('\\$','$').createBefore(cursor);
      //}
      //else if (!cursor[R])
      //  cursor.insertAfter(this.parent);
      //else if (!cursor[L])
      //  cursor.insertBefore(this.parent);
      //else
      //  MathBlock.prototype.write.call(this, cursor, ch, replacedFragment);
    };
  };
  _.latex = function() {
    return '$' + this.ch[L].latex() + '$';
  };
});

var RootTextBlock = P(MathBlock, function(_) {
  _.renderLatex = function(latex) {
    var self = this;
    var cursor = self.cursor;
    self.jQ.children().slice(1).remove();
    self.ch[L] = self.ch[R] = 0;
    cursor.show().appendTo(self);

    var regex = Parser.regex;
    var string = Parser.string;
    var eof = Parser.eof;
    var all = Parser.all;

    // Parser RootMathCommand
    var mathMode = string('$').then(latexMathParser)
      // because TeX is insane, math mode doesn't necessarily
      // have to end.  So we allow for the case that math mode
      // continues to the end of the stream.
      .skip(string('$').or(eof))
      .map(function(block) {
        // HACK FIXME: this shouldn't have to have access to cursor
        var rootMathCommand = RootMathCommand(cursor);

        rootMathCommand.createBlocks();
        var rootMathBlock = rootMathCommand.ch[L];
        block.children().adopt(rootMathBlock, 0, 0);

        return rootMathCommand;
      })
    ;

    var escapedDollar = string('\\$').result('$');
    var textChar = escapedDollar.or(regex(/^[^$]/)).map(VanillaSymbol);
    var latexText = mathMode.or(textChar).many();
    var commands = latexText.skip(eof).or(all.result(false)).parse(latex);

    if (commands) {
      for (var i = 0; i < commands.length; i += 1) {
        commands[i].adopt(self, self.ch[R], 0);
      }

      self.jQize().appendTo(self.jQ);

      self.finalizeInsert();
    }
  };
  _.onKey = function(curs, key) {
    if (key === 'Spacebar' || key === 'Shift-Spacebar') return;
    RootMathBlock.prototype.onKey.apply(this, arguments);
  };
  _.onText = function(curs, ch) {
	this.cursor.write(ch);
    return false;
  };
  _.write = function(cursor, ch, replacedFragment) {
    if (replacedFragment) replacedFragment.remove();
    if (ch === '$')
      RootMathCommand(cursor).createBefore(cursor);
    else
      VanillaSymbol(ch).createBefore(cursor);
  };
});
/***************************
 * Commands and Operators.
 **************************/

var CharCmds = {}, LatexCmds = {}; //single character commands, LaTeX commands

var scale, // = function(jQ, x, y) { ... }
//will use a CSS 2D transform to scale the jQuery-wrapped HTML elements,
//or the filter matrix transform fallback for IE 5.5-8, or gracefully degrade to
//increasing the fontSize to match the vertical Y scaling factor.

//ideas from http://github.com/louisremi/jquery.transform.js
//see also http://msdn.microsoft.com/en-us/library/ms533014(v=vs.85).aspx

  forceIERedraw = noop,
  div = document.createElement('div'),
  div_style = div.style,
  transformPropNames = {
    transform:1,
    WebkitTransform:1,
    MozTransform:1,
    OTransform:1,
    msTransform:1
  },
  transformPropName;

for (var prop in transformPropNames) {
  if (prop in div_style) {
    transformPropName = prop;
    break;
  }
}

if (transformPropName) {
  scale = function(jQ, x, y) {
    jQ.css(transformPropName, 'scale('+x+','+y+')');
  };
}
else {
  scale = function(jQ, x, y) {
    jQ.css('fontSize', y + 'em');
  };
}

var Style = P(MathCommand, function(_, _super) {
  _.init = function(ctrlSeq, tagName, attrs) {
    _super.init.call(this, ctrlSeq, '<'+tagName+' '+attrs+'>&0</'+tagName+'>');
  };
  _.text = function() {
    var i = 0;
    var thisMathCommand = this;
    return this.foldChildren(this.textTemplate[i], function(text, child) {
      i += 1;
      var child_text = child.text();
      if (child_text[0] === '(' && child_text.slice(-1) === ')') {
    	// There may be cases when the '(' and ')' are harmful!
    	// Only one pair of '(' and ')' should remain,
    	// and this is OK at the parent node of this Style.
    	// But if the parent node of this Style is RootMathBlock,
    	// then there will be no '(' and ')', so OK.
      	child_text = child_text.slice(1, -1);
        //return text + child_text.slice(1, -1) + thisMathCommand.textTemplate[i];
      }
      return text + child_text + (thisMathCommand.textTemplate[i] || '');
    });
  };
});

//fonts
LatexCmds.mathrm = bind(Style, '\\mathrm', 'span', 'class="roman font"');

/*LatexCmds.em = LatexCmds.italic = LatexCmds.italics =
LatexCmds.emph = LatexCmds.textit = LatexCmds.textsl*/
LatexCmds.mathit = bind(Style, '\\mathit', 'i', 'class="font"');
LatexCmds.em = bind(Style, '\\em', 'i', 'class="font"');
LatexCmds.italic = bind(Style, '\\italic', 'i', 'class="font"');
LatexCmds.italics = bind(Style, '\\italics', 'i', 'class="font"');
LatexCmds.textit = bind(Style, '\\textit', 'i', 'class="font"');
LatexCmds.textsl = bind(Style, '\\textsl', 'i', 'class="font"');

LatexCmds.mathbf = bind(Style, '\\mathbf', 'b', 'class="font"');
LatexCmds.bold = bind(Style, '\\bold', 'b', 'class="font"');
LatexCmds.strong = bind(Style, '\\strong', 'b', 'class="font"');
LatexCmds.textbf = bind(Style, '\\textbf', 'b', 'class="font"');

LatexCmds.mathsf = bind(Style, '\\mathsf', 'span', 'class="sans-serif font"');
LatexCmds.mathtt = bind(Style, '\\mathtt', 'span', 'class="monospace font"');
//text-decoration
LatexCmds.underline = bind(Style, '\\underline', 'span', 'class="non-leaf underline"');
LatexCmds.overline = LatexCmds.bar = bind(Style, '\\overline', 'span', 'class="non-leaf overline"');

// colors
LatexCmds.lightviolet = bind(Style, '\\lightviolet', 'span', 'style="color:#E0B0FF"');
LatexCmds.lightyellow = bind(Style, '\\lightyellow', 'span', 'style="color:#FFFACD"');
LatexCmds.lightgreen = bind(Style, '\\lightgreen', 'span', 'style="color:#D0F0C0"');
LatexCmds.lightorange = bind(Style, '\\lightorange', 'span', 'style="color:#FFEFD5"');
LatexCmds.yellow = bind(Style, '\\yellow', 'span', 'style="color:#FFFF00"');
LatexCmds.darkblue = bind(Style, '\\darkblue', 'span', 'style="color:#1C39BB"');
LatexCmds.lightpurple = bind(Style, '\\lightpurple', 'span', 'style="color:#CCCCFF"');
LatexCmds.lightblue = bind(Style, '\\lightblue', 'span', 'style="color:#7D7DFF"');
LatexCmds.maroon = bind(Style, '\\maroon', 'span', 'style="color:#800000"');
LatexCmds.lightgray = bind(Style, '\\lightgray', 'span', 'style="color:#A0A0A0"');
LatexCmds.pink = bind(Style, '\\pink', 'span', 'style="color:#FFC0CB"');
LatexCmds.gold = bind(Style, '\\gold', 'span', 'style="color:#FFD700"');
LatexCmds.black = bind(Style, '\\black', 'span', 'style="color:#000000"');
LatexCmds.orange = bind(Style, '\\orange', 'span', 'style="color:#FF7F00"');
LatexCmds.indigo = bind(Style, '\\indigo', 'span', 'style="color:#4B0082"');
LatexCmds.purple = bind(Style, '\\purple', 'span', 'style="color:#800080"');
LatexCmds.darkgray = bind(Style, '\\darkgray', 'span', 'style="color:#202020"');
LatexCmds.green = bind(Style, '\\green', 'span', 'style="color:#00FF00"');
LatexCmds.silver = bind(Style, '\\silver', 'span', 'style="color:#404040"');
LatexCmds.white = bind(Style, '\\white', 'span', 'style="color:#FFFFFF"');
LatexCmds.lime = bind(Style, '\\lime', 'span', 'style="color:#BFFF00"');
LatexCmds.gray = bind(Style, '\\gray', 'span', 'style="color:#808080"');
LatexCmds.darkgreen = bind(Style, '\\darkgreen', 'span', 'style="color:#006400"');
LatexCmds.magenta = bind(Style, '\\magenta', 'span', 'style="color:#FF00FF"');
LatexCmds.cyan = bind(Style, '\\cyan', 'span', 'style="color:#00FFFF"');
LatexCmds.red = bind(Style, '\\red', 'span', 'style="color:#FF0000"');
LatexCmds.crimson = bind(Style, '\\crimson', 'span', 'style="color:#DC143C"');
LatexCmds.turquoise = bind(Style, '\\turquoise', 'span', 'style="color:#AFEEEE"');
LatexCmds.blue = bind(Style, '\\blue', 'span', 'style="color:#0000FF"');
LatexCmds.violet = bind(Style, '\\violet', 'span', 'style="color:#7F00FF"');
LatexCmds.brown = bind(Style, '\\brown', 'span', 'style="color:#993300"');
LatexCmds.aqua = bind(Style, '\\aqua', 'span', 'style="color:#BCD4E6"');

var SomethingHTML = P(MathCommand, function(_, _super) {
  _.init = function(ctrlSeq, HTML, texttemp) {
    _super.init.call(this, ctrlSeq, HTML, texttemp);
    if (ctrlSeq === '\\pwtable') {
	  // boolean is quicker than string comparison every time
	  // TODO: maybe do this for other ctrlSeq as well!
	  this.pwtable = true;
    } else {
	  this.pwtable = false;
    }
    if (ctrlSeq === '\\prtable') {
  	  // boolean is quicker than string comparison every time
  	  // TODO: maybe do this for other ctrlSeq as well!
  	  this.prtable = true;
    } else {
  	  this.prtable = false;
    }
    if (ctrlSeq === '\\ggbtable' || this.pwtable || this.prtable) {
      // let's make a matrix of elements we can refer to
      // from upInto, downInto, upOutOf, downOutOf
      this['tableMatrix'] = [[]];
      this['tableRow'] = 0;
      this['tableCol'] = 0;
      // this will be a 2-dimensional matrix to be filled
      // on-the-fly at the same time as filling upInto etc
    }
  };
  _.finalizeTree = function() {
    if (this.ctrlSeq === '\\ggbtable' || this.pwtable || this.prtable) {
      this.preOrder('lateInit');
    }
  };
  _.lateInit = function() {
	// good question when should lateInit be called?
	// of course, after everything is ready... maybe
	// finalizeTree method is for that? OK, lateInit renamed
    var thisthis = this;
    if (this.ctrlSeq.indexOf('\\ggbtd') > -1) {
      if (this.parent) {
        thisthis = this.parent;
        if (thisthis.parent) {
          thisthis = thisthis.parent;
        } else {
          return;
        }
      } else {
        return;
      }
    }
    if (thisthis.ctrlSeq.indexOf('\\ggbtr') > -1) {
      if (thisthis.parent) {
        thisthis = thisthis.parent;
        if (thisthis.parent) {
          thisthis = thisthis.parent;
        } else {
          return;
        }
      } else {
        return;
      }
    }
    // this.maint is the \\ggbtable or \\pwtable, ideally
    this.maint = thisthis;

    if (thisthis.ctrlSeq !== '\\ggbtable' && !thisthis.pwtable && !thisthis.prtable) {
      return;
    }

    // in theory, the ggbtd and ggbtr elements should come
    // in preorder order, but still wondering why this does not
    // seem to work well... maybe we're too late?

    // but only for these kinds of elements: 
    if (this.ctrlSeq.indexOf('\\ggbtr') > -1) {
      // now let's add a new row to tableMatrix too!
	  // nothing else should be done in this step
	  if ('tableMatrix' in thisthis) {
		thisthis['tableMatrix'][thisthis['tableRow']] = [];
        thisthis['tableMatrix'][thisthis['tableRow']][0] = 0;
        thisthis['tableRow']++;
        thisthis['tableCol'] = 0;
      }
    } else if (this.ctrlSeq.indexOf('\\ggbtd') > -1) {
      // now fill the tableMatrix, everything should be ready
      if (('tableMatrix' in thisthis) && ('tableRow' in thisthis) && (thisthis['tableRow'] > 0)) {
    	thisthis['tableMatrix'][thisthis['tableRow']-1][thisthis['tableCol']] = this;
        thisthis['tableCol']++;
        this.thisRow = thisthis['tableRow']-1;
        this.thisCol = thisthis['tableCol']-1;

        // then comes code what needs blocks
        // but only for these kinds of elements: 
  	    if (thisthis['tableRow'] > 1) {
          // row-1,col-1 gives the last element currently in tableMatrix
          // this "this" will be row-1, col-1 probably,
          // and this.upOutOf will be row-2, col-1,
          // and this.upOutOf.downOutOf will be this
          var that = thisthis['tableMatrix'][this.thisRow-1][this.thisCol];
          // it's important that the events happen in MathBlock's
          // but ch[0] might still not be ready! what to do?
          // call createBlocks earlier! cursor.appendTo needs .ch[L]
          this.upOutOf = that.ch[L];// MathBlock
          that.downOutOf = this.ch[L];// MathBlock
        }
      }
    }
  };
  _.addNewRow = function(cursor) {
    if (this.ctrlSeq === '\\ggbtable') {
      // remember the place of the cursor, because it
      // should go back there after this operation!
      var cursorl = cursor[L];//command
      var cursorr = cursor[R];//command
      var cursorp = cursor.parent;//block

      // adding one simple ggbtr, and so much simple ggbtd
      // that are contained in one ggbtr (i.e. number of cols)
      // luckily, the number of colums is (this.thisCol+1)

      // try to generate latex and then renderLatex or writeLatex!
      var numCols = this['tableCol'];
      var strLatex = '\\ggbtr{ ';
      for (var lv = 0; lv < numCols; lv++) {
    	strLatex += '\\ggbtd{0} ';
      }
      strLatex += '}';
      cursor.appendTo(this.ch[L]);
      //==cursor.appendDir(R, this.ch[L]);
      cursor.writeLatex(strLatex);

      // now we should do something like lateInit does!
      if (this.ch[L] && this.ch[L].ch[R]) {
    	// in theory, this is not the cursor,
    	// but the \\ggbtr element
        this.ch[L].ch[R].preOrder('lateInit');
      }

      // put the cursor back to its original place
      if (cursorl) {
    	cursor.insertAfter(cursorl);
      } else if (cursorr) {
    	cursor.insertBefore(cursorr);
      } else if (cursorp) {
    	cursor.appendDir(L, cursorp);
      }
      cursor.show();
    } else if (this.pwtable) {
      // this case is almost the same as \\ggbtable,
      // but we shall add the new row before the last row
      // in order to keep the \\textotherwise at its place,
      // although this will make it difficult to update up/down

      // remember the place of the cursor, because it
      // should go back there after this operation!
      var cursorl = cursor[L];//command
      var cursorr = cursor[R];//command
      var cursorp = cursor.parent;//block

      // adding one simple ggbtr, and so much simple ggbtd
      // that are contained in one ggbtr (i.e. number of cols)
      // luckily, the number of colums is (this.thisCol+1)

      // try to generate latex and then renderLatex or writeLatex!
      var strLatex = '\\ggbtr{ ';
      strLatex += '\\ggbtdL{0} ';
      strLatex += '\\ggbtdL{ : \\space 0 \\lt x \\lt 0 } ';
      strLatex += '}';
      cursor.appendTo(this.ch[L]);
      cursor.insertBefore(cursor[L]);
      //==cursor.appendDir(R, this.ch[L]);
      cursor.writeLatex(strLatex);

      // now we should do something like lateInit does!
      // TODO: later!
      if (this.ch[L] && this.ch[L].ch[R]) {
        // in theory, this is not the cursor,
        // but the \\ggbtr element
    	if (this.ch[L].ch[R][L]) {
    	  // in theory, redefining up/down links
    	  // can be done by calling it for both rows
          this['tableRow']--;
    	  this.ch[L].ch[R][L].preOrder('lateInit');
    	}
        this.ch[L].ch[R].preOrder('lateInit');
      }

      // put the cursor back to its original place
      if (cursorl) {
        cursor.insertAfter(cursorl);
      } else if (cursorr) {
        cursor.insertBefore(cursorr);
      } else if (cursorp) {
        cursor.appendDir(L, cursorp);
      }
      cursor.show();
    }
  };
  _.removeRow = function(cursor) {
    if (this.ctrlSeq === '\\ggbtable') {
      // remember the place of the cursor, because it
      // should go back there after this operation!
      var cursorl = cursor[L];//command
      var cursorr = cursor[R];//command
      var cursorp = cursor.parent;//block

      var numRows = this['tableRow'];
      var numCols = this['tableCol'];

      if (numRows > 1) {
        if (this.ch[L] && this.ch[L].ch[R]) {
          // removing the last row is easy;
          this.ch[L].ch[R].remove();
          this['tableRow'] = numRows - 1;
          this['tableCol'] = numCols;

          // but it is more difficult to actualize
          // the downOutOf variables, to make them null

          cursor.appendTo(this.ch[L]);
          if (cursor[L] && cursor[L].ch[L]) {
        	// this.ch[L]: block of table
        	// this.ch[L].ch[R]: table row
        	// this.ch[L].ch[R].ch[L]: block of table row
            cursor.prependTo(cursor[L].ch[L]);
          }

          var actual = cursor;
          while (actual[R]) {
            actual = actual[R];
        	if (actual.ctrlSeq && actual.ctrlSeq.indexOf('\\ggbtd') > -1) {
              if (actual.downOutOf !== undefined) {
                delete actual.downOutOf;
              }
        	}
          }
        }

        // put the cursor back to its original place
        if (cursorl) {
          cursor.insertAfter(cursorl);
        } else if (cursorr) {
    	  cursor.insertBefore(cursorr);
        } else if (cursorp) {
          cursor.appendDir(L, cursorp);
        }
        cursor.show();
      }
    }
  };
  _.addNewCol = function(cursor) {
    if (this.ctrlSeq === '\\ggbtable') {
      // remember the place of the cursor, because it
      // should go back there after this operation!
      var cursorl = cursor[L];//command
      var cursorr = cursor[R];//command
      var cursorp = cursor.parent;//block

      var numRows = this['tableRow'];
      var numCols = this['tableCol'];
      this['tableRow'] = 0;

      var strLatex = '\\ggbtd{0}';
      cursor.prependTo(this.ch[L]);
      // now the cursor is in the block of \\ggbtable,
      // and cursor[R] is a \\ggbtr, probably
      var actual = cursor;
      while (actual[R]) {
        actual = actual[R];
    	if (actual.ctrlSeq && actual.ctrlSeq.indexOf('\\ggbtr') > -1) {
    	  cursor.appendTo(actual.ch[L]);
    	  cursor.writeLatex(strLatex);
    	  if (actual.ch[L] && actual.ch[L].ch[R]) {
            this['tableCol'] = numCols;
        	this['tableRow']++;
    	    actual.ch[L].ch[R].preOrder('lateInit');
    	  }
    	}
      }

      this['tableRow'] = numRows;
      this['tableCol'] = numCols + 1;

      // put the cursor back to its original place
      if (cursorl) {
    	cursor.insertAfter(cursorl);
      } else if (cursorr) {
    	cursor.insertBefore(cursorr);
      } else if (cursorp) {
    	cursor.appendDir(L, cursorp);
      }
      cursor.show();
    }
  };
  _.removeCol = function(cursor) {
    if (this.ctrlSeq === '\\ggbtable') {
      // remember the place of the cursor, because it
      // should go back there after this operation!
      var cursorl = cursor[L];//command
      var cursorr = cursor[R];//command
      var cursorp = cursor.parent;//block

      var numRows = this['tableRow'];
      var numCols = this['tableCol'];

      if (numCols > 1) {

        cursor.prependTo(this.ch[L]);
        // now the cursor is in the block of \\ggbtable,
        // and cursor[R] is a \\ggbtr, probably
        var actual = cursor;
        while (actual[R]) {
          actual = actual[R];
    	  if (actual.ctrlSeq && actual.ctrlSeq.indexOf('\\ggbtr') > -1) {
            cursor.appendTo(actual.ch[L]);
    	    if (actual.ch[L] && actual.ch[L].ch[R]) {
              actual.ch[L].ch[R].remove();
              // this['tableMatrix'] will still contain
              // the old elements, but probably it's no problem
    	    }
    	  }
        }

        this['tableRow'] = numRows;
        this['tableCol'] = numCols - 1;

        // put the cursor back to its original place
        if (cursorl) {
          cursor.insertAfter(cursorl);
        } else if (cursorr) {
    	  cursor.insertBefore(cursorr);
        } else if (cursorp) {
          cursor.appendDir(L, cursorp);
        }
        cursor.show();
      }
    }
  };
  _.moveTowards = function(dir, cursor) {
    cursor.appendDir(-dir, this.ch[-dir]);
    // Okay, we've moved into this, but maybe
    // we need more in case of ggbtable & ggbtd
    // e.g. cursor is in ggbtable's MathBlock
    var thisthis = cursor[dir];
    if (this.ctrlSeq === '\\ggbtable' || this.pwtable || this.prtable) {
      cursor.appendDir(-dir, thisthis.ch[-dir]);
      // we're in the ggbtd, but that is also not enough!
      // e.g. cursor is in ggbtr's MathBlock
      if (thisthis.ctrlSeq.indexOf('\\ggbtr') > -1) {
        cursor.appendDir(-dir, cursor[dir].ch[-dir]);
        // e.g. cursor is in ggbtd's MathBlock
      }
    } else if (this.ctrlSeq.indexOf('\\ggbtr') > -1) {
      // in case of ggbtr we only need this once
      cursor.appendDir(-dir, cursor[dir].ch[-dir]);
    } else if (this.ctrlSeq === '\\prcurve') {
      cursor.appendDir(-dir, thisthis.ch[-dir]);
      // now we're either in \\parametric or in \\prcondition
      // or more exactly, their corresponding MathBlock
      if (thisthis.ctrlSeq === '\\parametric') {
    	thisthis = cursor[dir];
    	thisthis.moveTowards(dir, cursor);
      }
    }
    // TODO: deal with \\piecewise and \\parametric elsewhere
  };
  _.createSelection = function(dir, cursor) {
    // we can do things like this because _super class
    // shall be the same as _super class of this.maint
    _super.createSelection.call(this.maint, dir, cursor);
  };
  _.expandSelection = function(dir, cursor) {
    _super.expandSelection.call(this.maint, dir, cursor);
  };
  _.clearSelection = function(dir, cursor) {
    _super.clearSelection.call(this.maint, dir, cursor);
  };
  _.retractSelection = function(dir, cursor) {
    _super.retractSelection.call(this.maint, dir, cursor);
  };
  _.deleteTowards = function(dir, cursor) {
    // in case of \\prcurve, don't allow deleteTowards!
	if (this.ctrlSeq === '\\prcurve' ||
		this.ctrlSeq === '\\prcondition' ||
		this.prtable || this.pwtable) {
      // do nothing!
	  return undefined;
	} else {
      return this.createSelection(dir, cursor);
	}
  };
  _.selectChildren = function(cursor) {
	_super.selectChildren.call(this.maint, cursor);
  };
  _.text = function() {
    // in case of ggbtable/pwtable, we shall do them one by one
    if (this.pwtable) {
      // this just have to append its children to one another
      // with no question
      var brackets = '';
      var i = 0;
      var ret = this.ch[L].foldChildren('', function(text, child) {
    	if (i > 0) {
    	  brackets += ']';
    	}
    	i++;
        return text + child.text();
      });
      ret += brackets;
      // and also, some closing brackets should be appended
      return ret;
    } else if (this.prtable) {
      var ret = this.ch[L].foldChildren('', function(text, child) {
        return text + child.text();
      });
      // and also, some closing brackets should be appended
      return ret;
    } else if (this.ctrlSeq.indexOf('\\ggbtr') > -1) {
      // if this is a descendant of pwtable, do custom algorithm
      // otherwise do the conventional case (end of method)
      if (this.parent && this.parent.parent) {
    	if (this.parent.parent.pwtable) {
          // lucky that there are only 2 columns
          // as "this" is a MathCommand, "this.ch[L]" is its child MathBlock
          // and we're interested in the MathBlock's children, which are ggbtd's
          // but for special cases we might still want to check
          if (this.ch[L] && this.ch[L].ch[L] && this.ch[L].ch[R]) {
            if (this[R]) {
              var ret = "If[";
              ret += this.ch[L].ch[R].text();
              ret += ",";
              ret += this.ch[L].ch[L].text();
              ret += ",";
              // here will come the next If[, or end
              return ret;
            } else {
              // if this is the last row, things should be more simple:
        	  return this.ch[L].ch[L].text();
            }
          }
    	} else if (this.parent.parent.prtable) {
          if (this.ch[L] && this.ch[L].ch[L]) {
        	// in order to prevent possible changes by MathBlock,
        	// call the text() of the child ggbtd directly...
            return this.ch[L].ch[L].text() + ",";
          }
    	}
      }
    } else if (this.ctrlSeq.indexOf('\\ggbtd') > -1) {
      // if this is a descendant of pwtable, do custom algorithm
      // otherwise do the conventional case (end of method)
      if (this.parent && this.parent.parent) {
    	var self = this.parent.parent;
    	if (self.parent && self.parent.parent) {
          if (self.parent.parent.pwtable) {
    	    // remove : and space!
    	    var ret = this.foldChildren('', function(text, child) {
    	      return text + child.text();
            });
    	    ret = ret.replace(':', '');
    	    ret = ret.replace('space ', ' ');
    	    ret = ret.replace(' space', ' ');
    	    ret = ret.replace('space', ' ');
    	    return ret;
          } else if (self.parent.parent.prtable) {
            // chop x=, y=, z=; !!
      	    var ret = this.foldChildren('', function(text, child) {
      	      return text + child.text();
            });
      	    var idd = ret.indexOf('=');
      	    if (idd > -1) {
      	      ret = ret.substring(idd + 1);
      	    }
      	    return ret;
          }
    	}
      }
    } else if (this.ctrlSeq === '\\prcondition') {
      var ret = this.foldChildren('', function(text, child) {
        return text + child.text();
      });
      // MathBlock might put ()s around this, so let's remove it!
      if (ret.charAt(0) === '(') {
    	ret = ret.substring(1);
      }
      if (ret.charAt(ret.length-1) === ')') {
        ret = ret.substring(0, ret.length-1);
      }
      // LaTeX: \\prle, text: \u2264
      var retarr = ret.split('\u2264');
      if (retarr.length > 2) {
        // OK
        var startNum = retarr[0];
        var endNum = retarr[2];
        var variab = retarr[1];
        ret = '';
        ret += variab;
        ret += ',';
        ret += startNum;
        ret += ',';
        ret += endNum;
        return ret;
      }
    }
    // conventional case (e.g. \\vec, \\hat)
    // do the conventional way (also \\ggbtable)
    return _super.text.call(this);
  };
  _.onKey = function(curs, key, e) {
    switch (key) {
      case 'Up':
      case 'Shift-Up':
      case 'Ctrl-Up':
      case 'Ctrl-Shift-Up':
    	curs.moveUp();
    	e.preventDefault();
    	return false;
        break;

      case 'Down':
      case 'Shift-Down':
      case 'Ctrl-Down':
      case 'Ctrl-Shift-Down':
        curs.moveDown();
        e.preventDefault();
        return false;
        break;
      default:
    	break;
    }
  };
});

var scbHTML = '<span><span style="display: none;">&0</span><span>&1</span></span>';
LatexCmds.scalebox = bind(SomethingHTML, '\\scalebox', scbHTML);

var gapHTML = '<span style="visibility: hidden;">&0</span>';
LatexCmds.phantom = bind(SomethingHTML, '\\phantom', gapHTML);

// this is like \\cr but it has an argument that is currently neglected
var brHTML = '<span><span style="display: none;">&0</span><br/></span>';
LatexCmds.vspace = bind(SomethingHTML, '\\vspace', brHTML);

var hatHTML = '<span class="array non-leaf vbottom"><span class="hat">^</span><span>&0</span></span>';
LatexCmds.hat = bind(SomethingHTML, '\\hat', hatHTML);


// MathQuillGGB hacks by GeoGebra
var vecHTML = '<table class="spec" style="display:inline-table;vertical-align:65%;" cellpadding="0" cellspacing="0"><tr><td class="hackedmq"><span class="down">&rarr;</span></td></tr><tr><td class="hackedmq"><span class="up">&0</span></td></tr></table>';
LatexCmds.overrightarrow = bind(SomethingHTML, '\\overrightarrow', vecHTML);
LatexCmds.vec = bind(SomethingHTML, '\\vec', vecHTML);
LatexCmds.cr = bind(Symbol, '\\cr', '<div style="display:block;height:1px;width:1px;"> </div>');
LatexCmds.equals = bind(Symbol, '\\equals', ' <span>=</span> ');// to be different from simple "="

var ggbtableHTML = '<table class="spec spectable" style="display:inline-table;vertical-align:middle;" cellpadding="0" cellspacing="0">&0</table>';
var ggbtrHTML = '<tr>&0</tr>';
var ggbtrlHTML = '<tr style="border-top: black solid 2px; border-bottom: black solid 2px;">&0</tr>';
var ggbtrltHTML = '<tr style="border-top: black solid 2px;">&0</tr>';
var ggbtrlbHTML = '<tr style="border-bottom: black solid 2px;">&0</tr>';

var ggbtdRHTML = '<td style="min-width: 1em; text-align: right; vertical-align: middle; padding-left: 4px; padding-right: 4px;">&0</td>';
var ggbtdlRHTML = '<td style="border-left: black solid 2px; border-right: black solid 2px; min-width: 1em; text-align: right; vertical-align: middle; padding-left: 4px; padding-right: 4px;">&0</td>';
var ggbtdllRHTML = '<td style="border-left: black solid 2px; min-width: 1em; text-align: right; vertical-align: middle; padding-left: 4px; padding-right: 4px;">&0</td>';
var ggbtdlrRHTML = '<td style="border-right: black solid 2px; min-width: 1em; text-align: right; vertical-align: middle; padding-left: 4px; padding-right: 4px;">&0</td>';

var ggbtdCHTML = '<td style="min-width: 1em; text-align: center; vertical-align: middle; padding-left: 4px; padding-right: 4px;">&0</td>';
var ggbtdlCHTML = '<td style="border-left: black solid 2px; border-right: black solid 2px; min-width: 1em; text-align: center; vertical-align: middle; padding-left: 4px; padding-right: 4px;">&0</td>';
var ggbtdllCHTML = '<td style="border-left: black solid 2px; min-width: 1em; text-align: center; vertical-align: middle; padding-left: 4px; padding-right: 4px;">&0</td>';
var ggbtdlrCHTML = '<td style="border-right: black solid 2px; min-width: 1em; text-align: center; vertical-align: middle; padding-left: 4px; padding-right: 4px;">&0</td>';

var ggbtdLHTML = '<td style="min-width: 1em; text-align: left; vertical-align: middle; padding-left: 4px; padding-right: 4px;">&0</td>';
var ggbtdlLHTML = '<td style="border-left: black solid 2px; border-right: black solid 2px; min-width: 1em; text-align: left; vertical-align: middle; padding-left: 4px; padding-right: 4px;">&0</td>';
var ggbtdllLHTML = '<td style="border-left: black solid 2px; min-width: 1em; text-align: left; vertical-align: middle; padding-left: 4px; padding-right: 4px;">&0</td>';
var ggbtdlrLHTML = '<td style="border-right: black solid 2px; min-width: 1em; text-align: left; vertical-align: middle; padding-left: 4px; padding-right: 4px;">&0</td>';

// why bother with differentiating ggbtable from pwtable,
// when we can create them separately?
LatexCmds.pwtable = bind(SomethingHTML, '\\pwtable', ggbtableHTML, ['','']);
LatexCmds.prtable = bind(SomethingHTML, '\\prtable', ggbtableHTML, ['','']);
LatexCmds.prcondition = bind(SomethingHTML, '\\prcondition', '<span>&0</span>&nbsp;&nbsp;', ['','']);
// the parent of prtable and prcondition, for nicer (but more complex) syntax
LatexCmds.prcurve = bind(SomethingHTML, '\\prcurve', '<span>&0</span>', ['Curve[',']']);

LatexCmds.ggbtable = bind(SomethingHTML, '\\ggbtable', ggbtableHTML, ['{','}']);
LatexCmds.ggbtr = bind(SomethingHTML, '\\ggbtr', ggbtrHTML, ['{','},']);
LatexCmds.ggbtrl = bind(SomethingHTML, '\\ggbtrl', ggbtrlHTML, ['{','},']);
LatexCmds.ggbtrlt = bind(SomethingHTML, '\\ggbtrlt', ggbtrltHTML, ['{','},']);
LatexCmds.ggbtrlb = bind(SomethingHTML, '\\ggbtrlb', ggbtrlbHTML, ['{','},']);

LatexCmds.ggbtdR = bind(SomethingHTML, '\\ggbtdR', ggbtdRHTML, ['',',']);
LatexCmds.ggbtdlR = bind(SomethingHTML, '\\ggbtdlR', ggbtdlRHTML, ['',',']);
LatexCmds.ggbtdllR = bind(SomethingHTML, '\\ggbtdllR', ggbtdllRHTML, ['',',']);
LatexCmds.ggbtdlrR = bind(SomethingHTML, '\\ggbtdlrR', ggbtdlrRHTML, ['',',']);

LatexCmds.ggbtd = bind(SomethingHTML, '\\ggbtd', ggbtdCHTML, ['',',']);
LatexCmds.ggbtdl = bind(SomethingHTML, '\\ggbtdl', ggbtdlCHTML, ['',',']);
LatexCmds.ggbtdll = bind(SomethingHTML, '\\ggbtdll', ggbtdllCHTML, ['',',']);
LatexCmds.ggbtdlr = bind(SomethingHTML, '\\ggbtdlr', ggbtdlrCHTML, ['',',']);

LatexCmds.ggbtdL = bind(SomethingHTML, '\\ggbtdL', ggbtdLHTML, ['',',']);
LatexCmds.ggbtdlL = bind(SomethingHTML, '\\ggbtdlL', ggbtdlLHTML, ['',',']);
LatexCmds.ggbtdllL = bind(SomethingHTML, '\\ggbtdllL', ggbtdllLHTML, ['',',']);
LatexCmds.ggbtdlrL = bind(SomethingHTML, '\\ggbtdlrL', ggbtdlrLHTML, ['',',']);

// TextColorGeneric is a template for \textcolor, \fgcolor, \bgcolor
// `\textcolor{color}{math}` will apply a color to the given math content, where
// `color` is any valid CSS Color Value (see [SitePoint docs][] (recommended),
// [Mozilla docs][], or [W3C spec][]).
//
// [SitePoint docs]: http://reference.sitepoint.com/css/colorvalues
// [Mozilla docs]: https://developer.mozilla.org/en-US/docs/CSS/color_value#Values
// [W3C spec]: http://dev.w3.org/csswg/css3-color/#colorunits
var TextColorGeneric = P(MathCommand, function(_, _super) {
  _.htmlTemplate = '<span>&0</span>';
  _.jQadd = function() {
    _super.jQadd.apply(this, arguments);
  };

  _.parser = function() {
    var self = this;
    var optWhitespace = Parser.optWhitespace;
    var string = Parser.string;
    var regex = Parser.regex;

    return optWhitespace
      .then(string('{'))
      .then(regex(/^[^{}]*/))
      .skip(string('}'))
      .then(function(color) {
        self.color = color.length == 6 && /^[0-9a-f]*$/.test(color) ? "#"+color : color;
        return _super.parser.call(self);
      })
    ;
  };
});

var TextColor = LatexCmds.textcolor = P(TextColorGeneric, function(_, _super) {
	  _.jQadd = function() {
	    _super.jQadd.apply(this, arguments);
	    this.jQ.css('color', this.color);
	  };
	});

var ForeGroundColor = LatexCmds.fgcolor = P(TextColorGeneric, function(_, _super) {
  _.jQadd = function() {
    _super.jQadd.apply(this, arguments);
    this.jQ.css('color', this.color);
  };
});

var BackGroundColor = LatexCmds.bgcolor = P(TextColorGeneric, function(_, _super) {
  _.jQadd = function() {
    _super.jQadd.apply(this, arguments);
    this.jQ.css('backgroundColor', this.color);
  };
});

var SupSub = P(MathCommand, function(_, _super) {
  _.init = function(ctrlSeq, tag, text) {
    _super.init.call(this, ctrlSeq, '<'+tag+' class="non-leaf">&0</'+tag+'>', [ text ]);
  };
  _.finalizeTree = function() {
    //TODO: use inheritance

    if (this.ctrlSeq === '_') {
      this.downInto = this.ch[L];
      this.ch[L].upOutOf = insertBeforeUnlessAtEnd;
    }
    else {
      this.upInto = this.ch[L];
      this.ch[L].downOutOf = insertBeforeUnlessAtEnd;
    }
    function insertBeforeUnlessAtEnd(cursor) {
      // cursor.insertBefore(cmd), unless cursor at the end of block, and every
      // ancestor cmd is at the end of every ancestor block
      var cmd = this.parent, ancestorCmd = cursor;
      do {
        if (ancestorCmd[R]) {
          cursor.insertBefore(cmd);
          return false;
        }
        ancestorCmd = ancestorCmd.parent.parent;
      } while (ancestorCmd !== cmd);
      cursor.insertAfter(cmd);
      return false;
    }
  };
  _.latex = function() {
    var latex = this.ch[L].latex();
    if (latex.length === 1)
      return this.ctrlSeq + latex;
    else
      return this.ctrlSeq + '{' + (latex || ' ') + '}';
  };
  _.text = function() {
    var ctr = '';
    if (this.textTemplate[0]) {
      ctr = this.textTemplate[0];
    }
    var tex = this.ch[L].text();
    if (this.ctrlSeq === '_') {
      // only do this for subscripts
      if (tex.length === 1) {
        return ctr + tex;
      } else if (tex[0] === '(' && tex.slice(-1) === ')') {
        return ctr + '{' + (tex.slice(1,-1) || ' ') + '}';
      } else if (tex[0] === '{' && tex.slice(-1) === '}') {
    	// log_{10}(x) case
        return ctr + tex;
      }
      return ctr + '{' + (tex || ' ') + '}';
	}
    var excl = ctr + tex;
    if (excl === '^circ ') {
      // special case: this should mean degree symbol instead!
      return '\u00b0';
    }
    // instead of this:
    return _super.text.call(this);
  };
  _.redraw = function() {
    if (this[L])
      this[L].respace();
    //SupSub::respace recursively calls respace on all the following SupSubs
    //so if prev is a SupSub, no need to call respace on this or following nodes
    if (!(this[L] instanceof SupSub)) {
      this.respace();
      //and if next is a SupSub, then this.respace() will have already called
      //this[R].respace()
      if (this[R] && !(this[R] instanceof SupSub))
        this[R].respace();
    }
  };
  _.respace = function() {
    if (
      this[L].ctrlSeq === '\\int ' || (
        this[L] instanceof SupSub && this[L].ctrlSeq != this.ctrlSeq
        && this[L][L] && this[L][L].ctrlSeq === '\\int '
      )
    ) {
      if (!this.limit) {
        this.limit = true;
        this.jQ.addClass('limit');
      }
    }
    else {
      if (this.limit) {
        this.limit = false;
        this.jQ.removeClass('limit');
      }
    }

    this.respaced = this[L] instanceof SupSub && this[L].ctrlSeq != this.ctrlSeq && !this[L].respaced;
    if (this.respaced) {
      var fontSize = +this.jQ.css('fontSize').slice(0,-2),
        prevWidth = this[L].jQ.outerWidth(),
        thisWidth = this.jQ.outerWidth();
      this.jQ.css({
        left: (this.limit && this.ctrlSeq === '_' ? -.25 : 0) - prevWidth/fontSize + 'em',
        marginRight: .1 - min(thisWidth, prevWidth)/fontSize + 'em'
          //1px extra so it doesn't wrap in retarded browsers (Firefox 2, I think)
      });
    }
    else if (this.limit && this.ctrlSeq === '_') {
      this.jQ.css({
        left: '-.25em',
        marginRight: ''
      });
    }
    else {
      this.jQ.css({
        left: '',
        marginRight: ''
      });
    }

    if (this[R] instanceof SupSub)
      this[R].respace();

    return this;
  };
});

LatexCmds.subscript =
LatexCmds._ = bind(SupSub, '_', 'sub', '_');

LatexCmds.superscript =
LatexCmds.supscript =
LatexCmds['^'] = bind(SupSub, '^', 'sup', '^');

var Fraction =
	LatexCmds.frac =
	LatexCmds.dfrac =
	LatexCmds.cfrac =
	LatexCmds.fraction = P(MathCommand, function(_, _super) {
	  _.ctrlSeq = '\\frac';
	  _.htmlTemplate =
	      '<span class="fraction non-leaf">'
	    +   '<span class="numerator">&0</span>'
	    +   '<span class="denominator">&1</span>'
	    +   '<span style="display:inline-block;width:0">&nbsp;</span>'
	    + '</span>'
	  ;
	  _.textTemplate = ['(', '/', ')'];
	  _.finalizeTree = function() {
	    this.upInto = this.ch[R].upOutOf = this.ch[L];
	    this.downInto = this.ch[L].downOutOf = this.ch[R];
	  };
	});

// eg FormulaText["\lim_{x \to 33} \left( x^2 \right)"]
var Limit =
	LatexCmds.lim =
	LatexCmds.lim_ = P(MathCommand, function(_, _super) {
	  _.ctrlSeq = '\\lim_';
	  _.htmlTemplate =
	      '<span class="limit non-leaf">'
	    +   '<span class="limittop">lim</span>'
	    +   '<span class="limitbottom">&0</span>'
	    +   '<span style="display:inline-block;width:0">&nbsp;</span>'
	    + '</span>'
	  ;
	  _.textTemplate = ['(', '/', ')'];
	  _.finalizeTree = function() {
	    this.upInto = this.ch[R].upOutOf = this.ch[L];
	    this.downInto = this.ch[L].downOutOf = this.ch[R];
	  };
	});

var LiveFraction =
LatexCmds.over =
CharCmds['\u00f7'] =
CharCmds['/'] = P(Fraction, function(_, _super) {
  _.createBefore = function(cursor) {
    if (!this.replacedFragment) {
      var prev = cursor[L];
      while (prev &&
        !(
          prev instanceof BinaryOperator ||
          prev instanceof TextBlock ||
          prev instanceof BigSymbol ||
          (prev instanceof VanillaSymbol && prev.ctrlSeq === ',')
        ) //lookbehind for operator
      )
        prev = prev[L];

      if (prev instanceof BigSymbol && prev[R] instanceof SupSub) {
        prev = prev[R];
        if (prev[R] instanceof SupSub && prev[R].ctrlSeq != prev.ctrlSeq)
          prev = prev[R];
      }

      if (prev !== cursor[L]) {
        this.replaces(Fragment(prev[R] || cursor.parent.ch[L], cursor[L]));
        cursor[L] = prev;
      }
    }
    _super.createBefore.call(this, cursor);
  };
});

var SquareRoot =
LatexCmds.Sqrt =
LatexCmds.sqrt =
LatexCmds['\u221a'] = P(MathCommand, function(_, _super) {
  _.ctrlSeq = '\\sqrt';
  _.htmlTemplate =
      '<span class="non-leaf sqrt-parent">'
    +   '<span class="scaled sqrt-prefix">&radic;</span>'
    +   '<span class="non-leaf sqrt-stem">&0</span>'
    + '</span>'
  ;
  // leaving one space before the sqrt in order to avoid
  // problems like xsqrt(x)... in theory, the space should not
  // do harm in case of + before, either, GeoGebraWeb shall
  // know how to parse it well (sometimes *, sometimes nothing)
  _.textTemplate = [' sqrt(', ')'];
  _.parser = function() {
    return latexMathParser.optBlock.then(function(optBlock) {
      return latexMathParser.block.map(function(block) {
        var nthroot = NthRoot();
        nthroot.blocks = [ optBlock, block ];
        optBlock.adopt(nthroot, 0, 0);
        block.adopt(nthroot, optBlock, 0);
        return nthroot;
      });
    }).or(_super.parser.call(this));
  };
  _.redraw = function() {
    var block = this.ch[R].jQ;
    var bh = block.innerHeight();
    var fs = 0;
    if (block.css('fontSize').length > 2) {
      if (block.css('fontSize').substr(-2) == "px") {
        fs = block.css('fontSize').slice(0,-2);
      }
    }
    if ((fs > 0) && (bh > 0)) {
      scale(block.prev(), 1, bh/fs);
      if (this.tries) {
        delete this.tries;
      }
    } else if (fs > 0) {
      if (this.tries) {
        this.tries--;
      } else {
        this.tries = 20;
      }
      if (this.tries > 0) {
        var thisfunction = this.redraw.bind(this);

        // assume 60 FPS refresh rate; meaning refresh 
        // in every 0.0166 seconds, or 16.6 milliseconds 
        // 60 ms is probably good, almost in every third frame 
        // this way "tries" is no more than 20 
        setTimeout(thisfunction, 60); 
      } else {
        delete this.tries;
      }
    }
  };
});


var NthRoot =
LatexCmds.nroot =
LatexCmds.nthroot = P(SquareRoot, function(_, _super) {
  _.htmlTemplate =
      '<sup class="nthroot non-leaf">&0</sup>'
    + '<span class="scaled sqrt-parent">'
    +   '<span class="sqrt-prefix scaled">&radic;</span>'
    +   '<span class="sqrt-stem non-leaf">&1</span>'
    + '</span>'
  ;
  _.textTemplate = ['nroot(', ',', ')'];
  _.text = function() {
     return 'nroot('+
        this.ch[R].text()+
        ','+
        this.ch[L].text()+
        ')';
  };
  _.latex = function() {
    return '\\sqrt['+this.ch[L].latex()+']{'+this.ch[R].latex()+'}';
  };
});


var HalfBracket = P(MathCommand, function(_, _super) {
  _.init = function(open, close, ctrlSeq, textt) {
    var tex = [open, close];
    if (textt) {
      tex = textt; 
    }
    _super.init.call(this, ctrlSeq,
      '<span class="non-leaf paren-parent">'
      +   '<span class="scaled paren">'+open+'</span>'
      +   '<span class="non-leaf">&0</span>'
      +   '<span class="scaled paren">'+close+'</span>'
      + '</span>', tex);

    // note that either open or close should be empty,
    // or this makes a different syntax to brackets!
    // different syntax was created for making it easier
    // to use different kinds of brackets for opening and closing...
  };

  _.jQadd = function() {
    _super.jQadd.apply(this, arguments);
    var jQ = this.jQ;
    this.bracketjQs = jQ.children(':first').add(jQ.children(':last'));
  };

  _.latex = function() {
    return this.ctrlSeq + "{" + this.ch[L].latex() + "}";
  };

  _.redraw = function() {
	var block = this.ch[L].jQ;
    var bh = block.outerHeight();
    var fs = 0;
    if (block.css('fontSize').length > 2) {
      if (block.css('fontSize').substr(-2) == "px") {
        fs = block.css('fontSize').slice(0,-2);
      }
    }
    if ((fs > 0) && (bh > 0)) {
      var height = bh/+fs;
      scale(this.bracketjQs, min(1 + .2*(height - 1), 1.2), 0.9 * height);
      if (this.tries) {
        delete this.tries;
      }
    } else if (fs > 0) {
      if (this.tries) {
        this.tries--;
      } else {
        this.tries = 20;
      }
      if (this.tries > 0) {
        var thisfunction = this.redraw.bind(this);

        // assume 60 FPS refresh rate; meaning refresh 
        // in every 0.0166 seconds, or 16.6 milliseconds 
        // 60 ms is probably good, almost in every third frame 
        // this way "tries" is no more than 20 
        setTimeout(thisfunction, 60); 
      } else {
        delete this.tries;
      }
    }
  };
  _.deleteTowards = function(dir, cursor) {
    // in case of \\prcurve, don't allow deleteTowards!
    if (this.ctrlSeq === '\\piecewise' ||
        this.ctrlSeq === '\\parametric') {
      // do nothing! these classes should not be deleted
      return undefined;
    } else {
      return this.createSelection(dir, cursor);
    }
  };
  _.moveTowards = function(dir, cursor) {
    // well, this is the code for MathCommand.moveTowards
    cursor.appendDir(-dir, this.ch[-dir]);

    if (this.ctrlSeq === '\\piecewise' ||
        this.ctrlSeq === '\\parametric') {
        var thisthis = cursor[dir];
        thisthis.moveTowards(dir, cursor);
    }
  };
});

// differentiating piecewise functions from openbraceonly of ggbtable
// so that piecewise functions can be identified by this condition
LatexCmds.piecewise = bind(HalfBracket, '{', '', '\\piecewise', ['', '']);
// similarly, differentiating parametric curves from closebraceonly
LatexCmds.parametric = bind(HalfBracket, '', '}', '\\parametric', ['', '']);

LatexCmds.openbraceonly = bind(HalfBracket, '{', '', '\\openbraceonly');
LatexCmds.closebraceonly = bind(HalfBracket, '', '}', '\\closebraceonly');

LatexCmds.openbracketonly = bind(HalfBracket, '[', '', '\\openbracketonly');
LatexCmds.closebracketonly = bind(HalfBracket, '', ']', '\\closebracketonly');

LatexCmds.openparenonly = bind(HalfBracket, '(', '', '\\openparenonly');
LatexCmds.closeparenonly = bind(HalfBracket, '', ')', '\\closeparenonly');

LatexCmds.openlineonly = bind(HalfBracket, '|', '', '\\openlineonly');
LatexCmds.closelineonly = bind(HalfBracket, '', '|', '\\closelineonly');

LatexCmds.opendoubleonly = bind(HalfBracket, '||', '', '\\opendoubleonly');
LatexCmds.closedoubleonly = bind(HalfBracket, '', '||', '\\closedoubleonly');

// In theory, it's possible to add mixed brackets, but why?


// Round/Square/Curly/Angle Brackets (aka Parens/Brackets/Braces)
var Bracket = P(MathCommand, function(_, _super) {
  _.init = function(open, close, ctrlSeq, end, blockClass) {
	if ((blockClass === undefined) || (blockClass !== 'non-leaf text quotationtext')) {
	  blockClass = 'non-leaf';
	}
    _super.init.call(this, '\\left'+ctrlSeq,
        '<span class="non-leaf paren-parent">'
      +   '<span class="scaled paren">'+open+'</span>'
      +   '<span class="'+blockClass+'">&0</span>'
      +   '<span class="scaled paren">'+close+'</span>'
      + '</span>',
      [open, close]);
    this.end = '\\right'+end;
    this.htmlTemplate1 = '<span class="non-leaf paren-parent paren-parent-colored">'
        +   '<span class="scaled paren">'+open+'</span>'
        +   '<span class="'+blockClass+'">&0</span>'
        +   '<span class="scaled paren">'+close+'</span>'
        + '</span>';
    this.htmlTemplate2 = '<span class="non-leaf paren-parent">'
	      +   '<span class="scaled paren">'+open+'</span>'
	      +   '<span class="'+blockClass+'">&0</span>'
	      +   '<span class="scaled paren">'+close+'</span>'
	      + '</span>';
  };
  _.setColoring = function(boo) {
	if (boo === true) {
      this.htmlTemplate = this.htmlTemplate1;
      // in theory, this.jQ is of style "paren-parent",
      // so this should work OK with mathquillggb.css
      this.jQ.addClass('paren-parent-colored');
	} else if (boo === false) {
	  this.htmlTemplate = this.htmlTemplate2;
      // in theory, this.jQ is of style "paren-parent",
      // so this should work OK with mathquillggb.css
	  this.jQ.removeClass('paren-parent-colored');
	}
  };
  _.jQadd = function() {
    _super.jQadd.apply(this, arguments);
    var jQ = this.jQ;
    this.bracketjQs = jQ.children(':first').add(jQ.children(':last'));
  };
  _.latex = function() {
    return this.ctrlSeq + this.ch[L].latex() + this.end;
  };
  _.redraw = function() {
	var block = this.ch[L].jQ;
    var bh = block.outerHeight();
    var fs = 0;
    if (block.css('fontSize').length > 2) {
      if (block.css('fontSize').substr(-2) == "px") {
        fs = block.css('fontSize').slice(0,-2);
      }
    }
    if ((fs > 0) && (bh > 0)) {
      var height = bh/+fs;
      scale(this.bracketjQs, min(1 + .2*(height - 1), 1.2), 0.9 * height);
      if (this.tries) {
        delete this.tries;
      }
    } else if (fs > 0) {
      if (this.tries) {
        this.tries--;
      } else {
        this.tries = 20;
      }
      if (this.tries > 0) {
        var thisfunction = this.redraw.bind(this);

        // assume 60 FPS refresh rate; meaning refresh 
        // in every 0.0166 seconds, or 16.6 milliseconds 
        // 60 ms is probably good, almost in every third frame 
        // this way "tries" is no more than 20 
        setTimeout(thisfunction, 60); 
      } else {
        delete this.tries;
      }
    }
  };
});

var VBracket = P(HalfBracket, function(_, _super) { 
	_.text = function() {
	    return "vectorize("+_super.text.call(this) +")";
	  };
});
LatexCmds.vectorize = bind(VBracket, '(', ')', '\\vectorize');


LatexCmds.left = P(MathCommand, function(_) {
  _.parser = function() {
    var regex = Parser.regex;
    var string = Parser.string;
    var regex = Parser.regex;
    var succeed = Parser.succeed;
    var block = latexMathParser.block;
    var optWhitespace = Parser.optWhitespace;

    return optWhitespace.then(regex(/^(?:[([|]|\\\{)/))
      .then(function(open) {
        if (open.charAt(0) === '\\') open = open.slice(1);

        var cmd = CharCmds[open]();

        return latexMathParser
          .map(function (block) {
            cmd.blocks = [ block ];
            block.adopt(cmd, 0, 0);
          })
          .then(string('\\right'))
          .skip(optWhitespace)
          .then(regex(/^(?:[\])|]|\\\})/))
          .then(function(close) {
            if (close.slice(-1) !== cmd.end.slice(-1)) {
              return Parser.fail('open doesn\'t match close');
            }

            return succeed(cmd);
          })
        ;
      })
    ;
  };
});

LatexCmds.right = P(MathCommand, function(_) {
  _.parser = function() {
    return Parser.fail('unmatched \\right');
  };
});

var Quotation = CharCmds['"'] = LatexCmds.quotation = P(Bracket, function(_, _super) {
  _.init = function() {
    _super.init.call(this, '"', '"', '"', '"', 'non-leaf text quotationtext');
    this.ctrlSeq = '\\quotation';
    this.end = '';
    // in GeoGebraWeb, this needs some changes anyway...
    // it will be easier to change " signs inside the text block,
    // and that's why the textTemplate should be distinguished
    // that can be replaced later! let it be e.g. double ""
    this.textTemplate = ['\\\"', '\\\"'];
  };
  _.createBlocks = function() {
    var cmd = this,
	numBlocks = cmd.numBlocks(),
	blocks = cmd.blocks = Array(numBlocks);

    for (var i = 0; i < numBlocks; i += 1) {
      var newBlock = blocks[i] = makeQuotationText()();
	  newBlock.adopt(cmd, cmd.ch[R], 0);

	  // this should work as htmlTemplate contains only one &0,
	  // or in other words, numBlocks is always 1 in theory,
	  // I not not even understand why there is a loop
	  this.lasttextblock = newBlock;
	}
  };
  _.seek = function(pageX, cursor) {
    this.lasttextblock.seek(pageX, cursor);
  };
  _.parser = function() {
	// this code is almost the same as MathCommand.parse, except...
    var self = this,
    blocks = self.blocks = Array(1);
    //var block = latexMathParser.block;

    var newBlock = blocks[0] = makeQuotationText()();
    newBlock.adopt(self, self.ch[R], 0);// or adopt later?
  	self.lasttextblock = newBlock;

    // this method is almost the same as createBlocks,
    // except it also parses the content of TextBlock here,
    // or more appropriately, it returns a parser which we
  	// should combine them, here we use the information
  	// that (numBlocks === 1)! otherwise it would be harder
    return newBlock.parser().map(function(blockk) {
      // everything is already done, just the return
      // value matters, we should return this instead of TextBlock
      return self;
    });
  };
  _.latex = function() {
	// well, GeoGebraWeb cannot parse the \\quotation syntax anyway,
    // and this is just for output, I think...
	// so let's help the copy operation instead!
	var cont = this.ch[L].latex();
	// cont might have {} around, so let's remove them!
	// or we could remove them in TextBlock, but maybe harmful

	// ... we BELIEVE that cont has {} signs around,
	// no need for checking... just a little
	if (cont.length >= 2) {
	  cont = cont.substring(1, cont.length - 1);
	}
    return '"' + cont + '"';
  };
});

LatexCmds.lbrace =
//LatexCmds['{'] =// this line would be harmful for matrices!
CharCmds['{'] = bind(Bracket, '{', '}', '\\{', '\\}');
LatexCmds.langle =
LatexCmds.lang = bind(Bracket, '&lang;','&rang;','\\langle ','\\rangle ');

// Closing bracket matching opening bracket above
var CloseBracket = P(Bracket, function(_, _super) {
  _.createBefore = function(cursor) {
    // if I'm at the end of my parent who is a matching open-paren,
    // and I am not replacing a selection fragment, don't create me,
    // just put cursor after my parent
    if (!cursor[R] && cursor.parent.parent && cursor.parent.parent.end === this.end && !this.replacedFragment)
      cursor.insertAfter(cursor.parent.parent);
    else
      _super.createBefore.call(this, cursor);
  };
  _.placeCursor = function(cursor) {
    this.ch[L].blur();
    cursor.insertAfter(this);
  };
});

LatexCmds.rbrace =
//LatexCmds['}'] =// this line would be harmful for matrices!
CharCmds['}'] = bind(CloseBracket, '{','}','\\{','\\}');
LatexCmds.rangle =
LatexCmds.rang = bind(CloseBracket, '&lang;','&rang;','\\langle ','\\rangle ');

var parenMixin = function(_, _super) {
  _.init = function(open, close) {
    _super.init.call(this, open, close, open, close);
  };
};

var Paren = P(Bracket, parenMixin);

LatexCmds.lparen =
CharCmds['('] = bind(Paren, '(', ')');
LatexCmds.lbrack =
LatexCmds.lbracket =
CharCmds['['] = bind(Paren, '[', ']');

var CloseParen = P(CloseBracket, parenMixin);

LatexCmds.rparen =
CharCmds[')'] = bind(CloseParen, '(', ')');
LatexCmds.rbrack =
LatexCmds.rbracket =
CharCmds[']'] = bind(CloseParen, '[', ']');

var Pipes =
LatexCmds.lpipe =
LatexCmds.rpipe =
CharCmds['|'] = P(Paren, function(_, _super) {
  _.init = function() {
    _super.init.call(this, '|', '|');
    this.textTemplate = ['abs(', ')'];
  }

  _.createBefore = function(cursor) {
      if (!cursor[R] && cursor.parent.parent && cursor.parent.parent.end === this.end && !this.replacedFragment) {
    	if (cursor.parent instanceof MathBlock) {
    	  cursor.parent.close();
    	}
        cursor.insertAfter(cursor.parent.parent);
      } else {
	    CloseBracket.prototype.createBefore.call(this, cursor);
      }
  }
});

// input box to type a variety of LaTeX commands beginning with a backslash
var LatexCommandInput =
CharCmds['\\'] = P(MathCommand, function(_, _super) {
  _.ctrlSeq = '\\';
  _.replaces = function(replacedFragment) {
    this._replacedFragment = replacedFragment.disown();
    this.isEmpty = function() { return false; };
  };
  _.htmlTemplate = '<span class="latex-command-input non-leaf">\\<span>&0</span></span>';
  _.textTemplate = ['\\'];
  _.createBlocks = function() {
    _super.createBlocks.call(this);
    this.ch[L].focus = function() {
      this.parent.jQ.addClass('hasCursor');
      if (this.isEmpty())
        this.parent.jQ.removeClass('empty');

      return this;
    };
    this.ch[L].blur = function() {
      this.parent.jQ.removeClass('hasCursor');
      if (this.isEmpty())
        this.parent.jQ.addClass('empty');

      return this;
    };
  };
  _.createBefore = function(cursor) {
    _super.createBefore.call(this, cursor);

    this.cursor = cursor.appendTo(this.ch[L]);
    if (this._replacedFragment) {
      var el = this.jQ[0];
      this.jQ =
        this._replacedFragment.jQ.addClass('blur').bind(
          'mousedown mousemove touchstart touchmove', //FIXME: is monkey-patching the mousedown and mousemove handlers the right way to do this?
          function(e) {
            $(e.target = el).trigger(e);
            // as this is triggered once again,
            // it's probably okay to return false in this case (?)

            // just because this returns false,
            // touchstart and touchmove events are also added,
            // however, it will probably not used as this
            // MathQuillGGB class is probably not used in GGW, AFAIK
            return false;
          }
        ).insertBefore(this.jQ).add(this.jQ);
    }

    this.ch[L].write = function(cursor, ch, replacedFragment) {
      if (replacedFragment) replacedFragment.remove();

      if (ch.match(/[a-z]/i)) VanillaSymbol(ch).createBefore(cursor);
      else {
        this.parent.renderCommand();
        if (ch !== '\\' || !this.isEmpty()) this.parent.parent.write(cursor, ch);
      }
    };
  };
  _.latex = function() {
    return '\\' + this.ch[L].latex() + ' ';
  };
  _.onKey = function(curs, key, e) {
    if (key === 'Tab' || key === 'Enter' || key === 'Spacebar') {
      this.renderCommand();
      e.preventDefault();
      return false;
    }
  };
  _.renderCommand = function() {
    this.jQ = this.jQ.last();
    this.remove();
    if (this[R]) {
      this.cursor.insertBefore(this[R]);
    } else {
      this.cursor.appendTo(this.parent);
    }

    var latex = this.ch[L].latex(), cmd;
    if (!latex) latex = 'backslash';
    this.cursor.insertCmd(latex, this._replacedFragment);
  };
});

var Binomial =
LatexCmds.binom =
LatexCmds.binomial = P(MathCommand, function(_, _super) {
  _.ctrlSeq = '\\binom';
  _.htmlTemplate =
      '<span class="paren scaled">(</span>'
    + '<span class="non-leaf">'
    +   '<span class="array non-leaf">'
    +     '<span>&0</span>'
    +     '<span>&1</span>'
    +   '</span>'
    + '</span>'
    + '<span class="paren scaled">)</span>'
  ;
  _.textTemplate = ['choose(',',',')'];
  _.redraw = function() {
	var block = this.jQ.eq(1);
    var bh = block.outerHeight();
    var fs = 0;
    if (block.css('fontSize').length > 2) {
      if (block.css('fontSize').substr(-2) == "px") {
        fs = block.css('fontSize').slice(0,-2);
      }
    }
    if ((fs > 0) && (bh > 0)) {
      var height = bh/+fs;
      var parens = this.jQ.filter('.paren');
      scale(parens, min(1 + .2*(height - 1), 1.2), 1.05*height);
      if (this.tries) {
        delete this.tries;
      }
    } else if (fs > 0) {
      if (this.tries) {
        this.tries--;
      } else {
        this.tries = 20;
      }
      if (this.tries > 0) {
        var thisfunction = this.redraw.bind(this);

        // assume 60 FPS refresh rate; meaning refresh 
        // in every 0.0166 seconds, or 16.6 milliseconds 
        // 60 ms is probably good, almost in every third frame 
        // this way "tries" is no more than 20 
        setTimeout(thisfunction, 60); 
      } else {
        delete this.tries;
      }
    }
  };
});

var Choose =
LatexCmds.choose = P(Binomial, function(_) {
  _.createBefore = LiveFraction.prototype.createBefore;
});

var Vector =
LatexCmds.vector = P(MathCommand, function(_, _super) {
  _.ctrlSeq = '\\vector';
  _.htmlTemplate = '<span class="array"><span>&0</span></span>';
  _.latex = function() {
    return '\\begin{matrix}' + this.foldChildren([], function(latex, child) {
      latex.push(child.latex());
      return latex;
    }).join('\\\\') + '\\end{matrix}';
  };
  _.text = function() {
    return '[' + this.foldChildren([], function(text, child) {
      text.push(child.text());
      return text;
    }).join() + ']';
  }
  _.createBefore = function(cursor) {
    _super.createBefore.call(this, this.cursor = cursor);
  };
  _.onKey = function(curs, key, e) {
    var currentBlock = this.cursor.parent;

    if (currentBlock.parent === this) {
      if (key === 'Enter') { //enter
        var newBlock = MathBlock();
        newBlock.parent = this;
        newBlock.jQ = $('<span></span>')
          .attr(mqBlockId, newBlock.id)
          .insertAfter(currentBlock.jQ);
        if (currentBlock[R])
          currentBlock[R][L] = newBlock;
        else
          this.ch[R] = newBlock;

        newBlock[R] = currentBlock[R];
        currentBlock[R] = newBlock;
        newBlock[L] = currentBlock;
        this.bubble('redraw').cursor.appendTo(newBlock);

        e.preventDefault();
        return false;
      }
      else if (key === 'Tab' && !currentBlock[R]) {
        if (currentBlock.isEmpty()) {
          if (currentBlock[L]) {
            this.cursor.insertAfter(this);
            delete currentBlock[L][R];
            this.ch[R] = currentBlock[L];
            currentBlock.jQ.remove();
            this.bubble('redraw');

            e.preventDefault();
            return false;
          }
          else
            return;
        }

        var newBlock = MathBlock();
        newBlock.parent = this;
        newBlock.jQ = $('<span></span>').attr(mqBlockId, newBlock.id).appendTo(this.jQ);
        this.ch[R] = newBlock;
        currentBlock[R] = newBlock;
        newBlock[L] = currentBlock;
        this.bubble('redraw').cursor.appendTo(newBlock);

        e.preventDefault();
        return false;
      }
      else if (e.which === 8) { //backspace
        if (currentBlock.isEmpty()) {
          if (currentBlock[L]) {
            this.cursor.appendTo(currentBlock[L])
            currentBlock[L][R] = currentBlock[R];
          }
          else {
            this.cursor.insertBefore(this);
            this.ch[L] = currentBlock[R];
          }

          if (currentBlock[R])
            currentBlock[R][L] = currentBlock[L];
          else
            this.ch[R] = currentBlock[L];

          currentBlock.jQ.remove();
          if (this.isEmpty())
            this.cursor.deleteForward();
          else
            this.bubble('redraw');

          e.preventDefault();
          return false;
        }
        else if (!this.cursor[L]) {
          e.preventDefault();
          return false;
        }
      }
    }
  };
});

LatexCmds.editable = P(RootMathCommand, function(_, _super) {
  _.init = function() {
    MathCommand.prototype.init.call(this, '\\editable');
  };

  _.jQadd = function() {
    var self = this;
    // FIXME: this entire method is a giant hack to get around
    // having to call createBlocks, and createRoot expecting to
    // render the contents' LaTeX. Both need to be refactored.
    _super.jQadd.apply(self, arguments);
    var block = self.ch[L].disown();
    var blockjQ = self.jQ.children().detach();

    self.ch[L] =
    self.ch[R] =
      RootMathBlock();

    self.blocks = [ self.ch[L] ];

    self.ch[L].parent = self;

    createRoot(self.jQ, self.ch[L], false, true);
    self.cursor = self.ch[L].cursor;

    block.children().adopt(self.ch[L], 0, 0);
    blockjQ.appendTo(self.ch[L].jQ);

    self.ch[L].cursor.appendTo(self.ch[L]);
  };

  _.latex = function(){ return this.ch[L].latex(); };
  _.text = function(){ return this.ch[L].text(); };
});
/**********************************
 * Symbols and Special Characters
 *********************************/

//LatexCmds.f = bind(Symbol, 'f', '<var class="florin">&fnof;</var><span style="display:inline-block;width:0">&nbsp;</span>');

var Variable = P(Symbol, function(_, _super) {
  _.init = function(ch, html, text) {
    _super.init.call(this, ch, '<var>'+(html || ch)+'</var>', text);
  }
  _.createBefore = function(cursor) {
	//want the longest possible autocommand, so assemble longest series of letters (Variables) first
	var ctrlSeq = this.ctrlSeq;

	// only join characters which are entered now;
	// so that it should still be possible to enter e.g. "sin" as three variables
	// if we enter "in" and go to the start and enter "s"...
	for (var i = 0, prev = cursor[L]; i < MAX_AUTOCMD_LEN - 1 && prev && prev instanceof Variable; i += 1, prev = prev[L])
		ctrlSeq = prev.ctrlSeq + ctrlSeq;
	//then test if there's an autocommand here, starting with the longest possible and slicing
	while (ctrlSeq.length) {
		// UnItalicizedCmds not used, because e.g. Circle[A,B] GeoGebra command -- \Ci rcle
		//if (AutoCmds.hasOwnProperty(ctrlSeq) || UnItalicizedCmds.hasOwnProperty(ctrlSeq)) {
		if (AutoCmds.hasOwnProperty(ctrlSeq)) {
			if (ctrlSeq == 'pi') {
				// do as if it had not own property,
				// for international GeoGebra commands like
				// "Spiegle" (German) // are other AutoCmds OK?
				//continue;
				break;
			}
			for (var i = 1; i < ctrlSeq.length; i += 1) cursor.backspace();
			var command = LatexCmds[ctrlSeq](ctrlSeq);
			command.createBefore(cursor);
			if (!AutoCmds.hasOwnProperty(ctrlSeq)) {
				// TODO: what about two-parameter functions?
				var command2 = LatexCmds["lparen"]();
				command2.createBefore(cursor);
			}
			var root = cursor.root;
		    if ((root !== undefined) && (root.common !== undefined)) {
                root.common.GeoGebraSuggestionPopupCanShow = false;
            }
			return;
		}
		ctrlSeq = ctrlSeq.slice(1);
	}
	_super.createBefore.call(this, cursor);
  };
  _.text = function() {
    var text = this.ctrlSeq;

    // TODO: this.ctrlSeq does not make much sense here,
    // as it is LaTeX syntax but we need textual syntax here,
    // but still left to avoid possible errors, and using the
    // other solution only (mostly) in the new cases, when the
    // textTemplate[0] has exactly one character...
    if (this.textTemplate[0] && this.textTemplate[0].length === 1) {
      // this is used for Greek letters LatexCmds.alpha...LatexCmds.Omega
      // .length > 0 seems to be Okay, but ctrlSeq's first character
      // after / should not be a Greek letter in theory
      return this.textTemplate[0];
    }

    /*
    // Old code was not right for e.g. Line[A,B]
    // To be consistent with GeoGebra AlgebraInputW syntax,
    // we should insert * nowhere except cases like
    // 3a, where a variable follows a number,
    // so no extra * to insert after variables at all!
	if (this[L] && !(this[L] instanceof Variable)
		&& !(this[L].ctrlSeq === ' ')
		&& !(this[L].ctrlSeq === '(')
		&& !(this[L].ctrlSeq === '\\left(')
        && !(this[L] instanceof BinaryOperator))
      text = '*' + text;
	*/

    // Some people may think this is not necessary either,
    // since GeoGebra can reckognize no * sign when used
    // in the right manner! But the problem is that
    // MathQuill also deleted real * signs beforehand,
    // and these real * signs should be added again...
	//if (this[L] && (this[L] instanceof VanillaSymbol)
	//	&& !(this[L].ctrlSeq === ' ')) {
		// variable after number case is Okay,
		// but what about cases like x*2 ?
		// how to distinguish x*2 and x2 ?
		// there should be a BinarySymbol between: *
		// and this should have the '*' output to text!
	//	text = '*' + text;
	//}
    // so the problem turns out to be 'input latex'-type
    // problem that should be handled in DrawEquationWeb
    // or something like that... No, it is an 'output latex'-type
    // problem that is in RadioButtonTreeItem! but fixed.

    /*
    // Old code was not right for e.g. Line[A,B]
    // To be consistent with GeoGebra AlgebraInputW syntax,
    // we should insert * nowhere except cases like
    // 3a, where a variable follows a number,
    // so no extra * to insert after variables at all!

    // skip spaces
    var nex = this;
    while ((nex[R]) && (nex[R].ctrlSeq === ' '))
	  nex = nex[R];

    if (nex[R] && !(nex[R] instanceof BinaryOperator)
        && !(nex.jQ.hasClass('un-italicized'))
        && !(nex[R].ctrlSeq === '(')
        && !(nex[R].ctrlSeq === '\\left(')
        && !(nex[R].ctrlSeq === ')')
        && !(nex[R].ctrlSeq === '\\right)')
        && !(nex[R].ctrlSeq === '^')

        // although these are interpreted as Variable's in MathQuillGGB,
        // they can be interpreted as entirely different things in GeoGebra
        // so there should be no multiplication sign between Variable's
        && !(nex[R] instanceof Variable)

        // also, there should be no multiplication before command names,
        // this is a quick workaround, but in the long term, we may
        // want to make this multiplication sign disappear altogether
        && !(nex[R].ctrlSeq === '[')
        && !(nex[R].ctrlSeq === '\\left['))
	  text += '*';
    */

	return text;
  };
});

var VanillaSymbol = P(Symbol, function(_, _super) {
  _.init = function(ch, html, text) {
    _super.init.call(this, ch, '<span>'+(html || ch)+'</span>', text);
  };
});

//LatexCmds.lbrace = CharCmds['{'] =
//  bind(VanillaSymbol, '\\lbrace ', '{');
//LatexCmds.rbrace = CharCmds['}'] =
//  bind(VanillaSymbol, '\\rbrace ', '}');

LatexCmds.prime = CharCmds["'"] = bind(VanillaSymbol, "'", '&prime;');

// does not use Symbola font
var NonSymbolaSymbol = P(Symbol, function(_, _super) {
  _.init = function(ch, html, text) {
    _super.init.call(this, ch, '<span class="nonSymbola">'+(html || ch)+'</span>', text);
  };
});

LatexCmds['@'] = NonSymbolaSymbol;
LatexCmds['&'] = LatexCmds.amp = bind(NonSymbolaSymbol, '\\&', '&amp;');
LatexCmds['%'] = bind(NonSymbolaSymbol, '\\%', '%');
LatexCmds['\u00a9'] = LatexCmds.copyright = bind(NonSymbolaSymbol, '\\copyright', '&copy;');

//the following are all Greek to me, but this helped a lot: http://www.ams.org/STIX/ion/stixsig03.html

// 25 Greek letters in GeoGebraWeb keyboard_el.js, and also in Unicode: \u03B1-\u03C9
// pi, phi, lambda, and epsilon, upsilon elsewhere (5)
//final sigma was also missing, but GeoGebraWeb needs it! (1)
//but it turned out that final sigma is the same as \varsigma, tackled later ...

//lowercase Greek letter variables (19)
LatexCmds.alpha = LatexCmds['\u03b1'] = bind(Variable, '\\alpha ', '&alpha;', '\u03b1');
LatexCmds.beta = LatexCmds['\u03b2'] = bind(Variable, '\\beta ', '&beta;', '\u03b2');
LatexCmds.gamma = LatexCmds['\u03b3'] = bind(Variable, '\\gamma ', '&gamma;', '\u03b3');
LatexCmds.delta = LatexCmds['\u03b4'] = bind(Variable, '\\delta ', '&delta;', '\u03b4');
LatexCmds.zeta = LatexCmds['\u03b6'] = bind(Variable, '\\zeta ', '&zeta;', '\u03b6');
LatexCmds.eta = LatexCmds['\u03b7'] = bind(Variable, '\\eta ', '&eta;', '\u03b7');
LatexCmds.theta = LatexCmds['\u03b8'] = bind(Variable, '\\theta ', '&theta;', '\u03b8');
LatexCmds.iota = LatexCmds['\u03b9'] = bind(Variable, '\\iota ', '&iota;', '\u03b9');
LatexCmds.kappa = LatexCmds['\u03ba'] = bind(Variable, '\\kappa ', '&kappa;', '\u03ba');
LatexCmds.mu = LatexCmds['\u03bc'] = bind(Variable, '\\mu ', '&mu;', '\u03bc');
LatexCmds.nu = LatexCmds['\u03bd'] = bind(Variable, '\\nu ', '&nu;', '\u03bd');
LatexCmds.xi = LatexCmds['\u03be'] = bind(Variable, '\\xi ', '&xi;', '\u03be');

// omicron was missing! adding it here, for GeoGebraWeb needs it too:
LatexCmds.omicron = LatexCmds['\u03bf'] = bind(Variable, '\\omicron ', '&omicron;', '\u03bf');
LatexCmds.dollar = bind(Variable, '\\dollar', "<span>&#36;</span>", "$");

LatexCmds.rho = LatexCmds['\u03c1'] = bind(Variable, '\\rho ', '&rho;', '\u03c1');
LatexCmds.sigma = LatexCmds['\u03c3'] = bind(Variable, '\\sigma ', '&sigma;', '\u03c3');// final sigma??
LatexCmds.tau = LatexCmds['\u03c4'] = bind(Variable, '\\tau ', '&tau;', '\u03c4');
LatexCmds.chi = LatexCmds['\u03c7'] = bind(Variable, '\\chi ', '&chi;', '\u03c7');
LatexCmds.psi = LatexCmds['\u03c8'] = bind(Variable, '\\psi ', '&psi;', '\u03c8');
LatexCmds.omega = LatexCmds['\u03c9'] = bind(Variable, '\\omega ', '&omega;', '\u03c9');

LatexCmds.checkmark =  
  bind(Variable,'\\checkmark ','&#x2713;'); 

//GeoGebra's '==' now using '\u225f'
LatexCmds.questeq = LatexCmds['\u225f'] =
  bind(Variable, '\\questeq ', '&#8799;', '\u225f');

//why can't anybody agree on these
LatexCmds.phi = //W3C or Unicode?
LatexCmds['\u03d5'] =
  bind(Variable,'\\phi ','&#981;', '\u03d5');

LatexCmds.phiv = //Elsevier and 9573-13
LatexCmds.varphi = //AMS and LaTeX
LatexCmds['\u03c6'] =
  bind(Variable,'\\varphi ','&phi;', '\u03c6');// for GeoGebraWeb, the same as phi

LatexCmds.epsilon = //W3C or Unicode?
LatexCmds['\u03b5'] =
  bind(Variable, '\\epsilon ', '&#1013;', '\u03b5');

LatexCmds.epsiv = //Elsevier and 9573-13
LatexCmds.varepsilon = //AMS and LaTeX
  bind(Variable,'\\varepsilon ','&epsilon;', '\u03b5');// for GeoGebraWeb, this is the same thing

LatexCmds.piv = //W3C/Unicode and Elsevier and 9573-13
LatexCmds.varpi = //AMS and LaTeX
  bind(Variable, '\\varpi ', '&piv;', '\u03c0');// varpi the same as pi in GeoGebraWeb

LatexCmds.sigmaf = //W3C/Unicode
LatexCmds.sigmav = //Elsevier
LatexCmds.varsigma = //LaTeX
LatexCmds['\u03c2'] = 
  bind(Variable, '\\varsigma ', '&sigmaf;', '\u03c2');

LatexCmds.thetav = //Elsevier and 9573-13
LatexCmds.vartheta = //AMS and LaTeX
LatexCmds.thetasym = //W3C/Unicode
  bind(Variable,'\\vartheta ','&thetasym;', '\u03b8');//for GeoGebraWeb, this is the same thing

LatexCmds.upsilon = //AMS and LaTeX and W3C/Unicode
LatexCmds.upsi = //Elsevier and 9573-13
LatexCmds['\u03c5'] =
  bind(Variable,'\\upsilon ','&upsilon;', '\u03c5');

//these aren't even mentioned in the HTML character entity references
LatexCmds.gammad = //Elsevier
LatexCmds.Gammad = //9573-13 -- WTF, right? I dunno if this was a typo in the reference (see above)
LatexCmds.digamma = //LaTeX
LatexCmds['\u03dc'] = // not sure this is needed, but for the sake of completeness
  bind(Variable,'\\digamma ','&#989;', '\u03dc');//\u03dc Great digamma \u03dd small 

LatexCmds.kappav = //Elsevier
LatexCmds.varkappa = //AMS and LaTeX
  bind(Variable,'\\varkappa ','&#1008;', '\u03ba');// for GGW, same

LatexCmds.rhov = //Elsevier and 9573-13
LatexCmds.varrho = //AMS and LaTeX
  bind(Variable,'\\varrho ','&#1009;', '\u03c1');// for GGW, same

//Greek constants, look best in un-italicised Times New Roman
//LatexCmds.pi = LatexCmds['\u03c0'] = bind(NonSymbolaSymbol,'\\pi ','&pi;');
//LatexCmds.pi = LatexCmds['\u03c0'] = bind(NonSymbolaSymbol,'\\\u03c0 ','&pi;');
LatexCmds.pi = LatexCmds['\u03c0'] = bind(NonSymbolaSymbol, '\\pi ', '&pi;', '\u03c0');
LatexCmds.lambda = LatexCmds['\u03bb'] = bind(NonSymbolaSymbol, '\\lambda ', '&lambda;', '\u03bb');

//uppercase greek letters... there are 24 of them in theory,
//some of which were missing, so adding them for GeoGebraWeb:
LatexCmds.Alpha = LatexCmds['\u0391'] = bind(Variable, '\\Alpha ', '&Alpha;', '\u0391');
LatexCmds.Beta = LatexCmds['\u0392'] = bind(Variable, '\\Beta ', '&Beta;', '\u0392');
LatexCmds.Gamma = LatexCmds['\u0393'] = bind(Variable, '\\Gamma ', '&Gamma;', '\u0393');
LatexCmds.Delta = LatexCmds['\u0394'] = bind(Variable, '\\Delta ', '&Delta;', '\u0394');
LatexCmds.Epsilon = LatexCmds['\u0395'] = bind(Variable, '\\Epsilon ', '&Epsilon;', '\u0395');
LatexCmds.Zeta = LatexCmds['\u0396'] = bind(Variable, '\\Zeta ', '&Zeta;', '\u0396');
LatexCmds.Eta = LatexCmds['\u0397'] = bind(Variable, '\\Eta ', '&Eta;', '\u0397');
LatexCmds.Theta = LatexCmds['\u0398'] = bind(Variable, '\\Theta ', '&Theta;', '\u0398');
LatexCmds.Iota = LatexCmds['\u0399'] = bind(Variable, '\\Iota ', '&Iota;', '\u0399');
LatexCmds.Kappa = LatexCmds['\u039a'] = bind(Variable, '\\Kappa ', '&Kappa;', '\u039a');
LatexCmds.Lambda = LatexCmds['\u039b'] = bind(Variable, '\\Lambda ', '&Lambda;', '\u039b');
LatexCmds.Mu = LatexCmds['\u039c'] = bind(Variable, '\\Mu ', '&Mu;', '\u039c');
LatexCmds.Nu = LatexCmds['\u039d'] = bind(Variable, '\\Nu ', '&Nu;', '\u039d');
LatexCmds.Xi = LatexCmds['\u039e'] = bind(Variable, '\\Xi ', '&Xi;', '\u039e');
LatexCmds.Omicron = LatexCmds['\u039f'] = bind(Variable, '\\Omicron ', '&Omicron;', '\u039f');
LatexCmds.Pi = LatexCmds['\u03a0'] = bind(Variable, '\\Pi ', '&Pi;', '\u03a0');
LatexCmds.Rho = LatexCmds['\u03a1'] = bind(Variable, '\\Rho ', '&Rho;', '\u03a1');
LatexCmds.Sigma = LatexCmds['\u03a3'] = bind(Variable, '\\Sigma ', '&Sigma;', '\u03a3');// final sigma??
LatexCmds.Tau = LatexCmds['\u03a4'] = bind(Variable, '\\Tau ', '&Tau;', '\u03a4');

LatexCmds.Upsilon = //LaTeX
LatexCmds.Upsi = //Elsevier and 9573-13
LatexCmds.upsih = //W3C/Unicode "upsilon with hook"
LatexCmds.Upsih = //'cos it makes sense to me
LatexCmds['\u03a5'] = // GeoGebraWeb (?)
	bind(Symbol, '\\Upsilon ', '<var style="font-family: geogebra-serif, serif">&upsih;</var>', '\u03a5');

LatexCmds.Phi = LatexCmds['\u03a6'] = bind(Variable, '\\Phi ', '&Phi;', '\u03a6');
LatexCmds.Chi = LatexCmds['\u03a7'] = bind(Variable, '\\Chi ', '&Chi;', '\u03a7');
LatexCmds.Psi = LatexCmds['\u03a8'] = bind(Variable, '\\Psi ', '&Psi;', '\u03a8');
LatexCmds.Omega = LatexCmds['\u03a9'] = bind(Variable, '\\Omega ', '&Omega;', '\u03a9');

//other symbols with the same LaTeX command and HTML character entity reference
//(this used to be the syntax for Greek letters as well)
LatexCmds.forall = P(VanillaSymbol, function(_, _super) {
  _.init = function(latex) {
    _super.init.call(this,'\\'+latex+' ','&'+latex+';');
  };
});

// symbols that aren't a single MathCommand, but are instead a whole
// Fragment. Creates the Fragment from a LaTeX string
var LatexFragment = P(MathCommand, function(_) {
  _.init = function(latex) { this.latex = latex; };
  _.createBefore = function(cursor) { cursor.writeLatex(this.latex); };
  _.parser = function() {
    var frag = latexMathParser.parse(this.latex).children();
    return Parser.succeed(frag);
  };
});

// for what seems to me like [stupid reasons][1], Unicode provides
// subscripted and superscripted versions of all ten Arabic numerals,
// as well as [so-called "vulgar fractions"][2].
// Nobody really cares about most of them, but some of them actually
// predate Unicode, dating back to [ISO-8859-1][3], apparently also
// known as "Latin-1", which among other things [Windows-1252][4]
// largely coincides with, so Microsoft Word sometimes inserts them
// and they get copy-pasted into MathQuillGGB.
//
// (Irrelevant but funny story: Windows-1252 is actually a strict
// superset of the "closely related but distinct"[3] "ISO 8859-1" --
// see the lack of a dash after "ISO"? Completely different character
// set, like elephants vs elephant seals, or "Zombies" vs "Zombie
// Redneck Torture Family". What kind of idiot would get them confused.
// People in fact got them confused so much, it was so common to
// mislabel Windows-1252 text as ISO-8859-1, that most modern web
// browsers and email clients treat the MIME charset of ISO-8859-1
// as actually Windows-1252, behavior now standard in the HTML5 spec.)
//
// [1]: http://en.wikipedia.org/wiki/Unicode_subscripts_and_superscripts
// [2]: http://en.wikipedia.org/wiki/Number_Forms
// [3]: http://en.wikipedia.org/wiki/ISO/IEC_8859-1
// [4]: http://en.wikipedia.org/wiki/Windows-1252
LatexCmds['\u00b9'] = bind(LatexFragment, '^1');
LatexCmds['\u00b2'] = bind(LatexFragment, '^2');
LatexCmds['\u00b3'] = bind(LatexFragment, '^3');
LatexCmds['\u00bc'] = bind(LatexFragment, '\\frac14');
LatexCmds['\u00bd'] = bind(LatexFragment, '\\frac12');
LatexCmds['\u00be'] = bind(LatexFragment, '\\frac34');

var BinaryOperator = P(Symbol, function(_, _super) {
  _.init = function(ctrlSeq, html, text) {
    _super.init.call(this,
      ctrlSeq, '<span class="binary-operator">'+html+'</span>', text
    );
  };
});

var BinaryOperatorDot = P(Symbol, function(_, _super) {
	  _.init = function(ctrlSeq, html, text) {
	    _super.init.call(this,
	      ctrlSeq, '<span class="binary-operator binop-dot">'+html+'</span>', text
	    );
	  };
	});

var FixedBinaryOperator = P(BinaryOperator, function(_, _super) {
  _.deleteTowards = Symbol.prototype.moveTowards;
  _.createSelection = noop;
  _.expandSelection = noop;
  _.selectChildren = noop;
  _.selectOutOf = noop;
});

var PlusMinus = P(BinaryOperator, function(_) {
  _.init = VanillaSymbol.prototype.init;

  _.respace = function() {
    if (!this[L]) {
      this.jQ[0].className = '';
    }
    else if (
      this[L] instanceof BinaryOperator &&
      this[R] && !(this[R] instanceof BinaryOperator)
    ) {
      this.jQ[0].className = 'unary-operator';
    }
    else {
      this.jQ[0].className = 'binary-operator';
    }
    return this;
  };
});

LatexCmds['+'] = bind(PlusMinus, '+', '+');

//yes, these are different dashes, I think one is an en dash and the other is a hyphen
// Also, GeoGebraWeb uses Unicode.minus, so we should accept it as well!
LatexCmds['\u2212'] =
LatexCmds['\u2013'] = LatexCmds['-'] = bind(PlusMinus, '-', '&minus;');

LatexCmds['\u00b1'] = LatexCmds.pm = LatexCmds.plusmn = LatexCmds.plusminus =
  bind(PlusMinus,'\\pm ','&plusmn;');
LatexCmds.mp = LatexCmds.mnplus = LatexCmds.minusplus =
  bind(PlusMinus,'\\mp ','&#8723;');

//CharCmds['*'] = LatexCmds.sdot = LatexCmds.cdot =
//	  bind(BinaryOperator, '\\cdot ', '&middot;', '*');

CharCmds['*'] = LatexCmds.sdot = LatexCmds.cdot =
  bind(BinaryOperator, '\\cdot ', '&middot;', ' ');

LatexCmds['pcdot'] = CharCmds['\u00d7'] = 
	  bind(BinaryOperatorDot, '\\pcdot ', '&middot;', ' ');
//semantically should be &sdot;, but &middot; looks better

LatexCmds['='] = bind(BinaryOperator, '=', '=');
LatexCmds['<'] = bind(BinaryOperator, '<', '&lt;');
LatexCmds['>'] = bind(BinaryOperator, '>', '&gt;');
//needed for GGB-446
LatexCmds[':'] = bind(BinaryOperator, ':', ':');
LatexCmds['\u2254'] = bind(BinaryOperator, '\u2254', '\u2254');

LatexCmds.notin =
LatexCmds.sim =
LatexCmds.cong =
LatexCmds.equiv =
LatexCmds.oplus = P(BinaryOperator, function(_, _super) {
  _.init = function(latex) {
    _super.init.call(this, '\\'+latex+' ', '&'+latex+';');
  };
});

//VECTOR_PRODUCT '\u2297' worked as a VanillaSymbol, but it needs to be a BinaryOperator
//in order to correctly handle cases like aXb/2, so it is merged with otimes
LatexCmds.otimes = LatexCmds['\u2297'] = bind(BinaryOperator, '\\otimes ', '&otimes;', '\u2297');


LatexCmds.times = bind(BinaryOperator, '\\times ', '&times;', '[x]');

LatexCmds['\u00f7'] = LatexCmds.div = LatexCmds.divide = LatexCmds.divides =
  bind(BinaryOperator,'\\div ','&divide;', '[/]');

LatexCmds['\u2260'] = LatexCmds.ne = LatexCmds.neq = bind(BinaryOperator,'\\ne ','&ne;', '\u2260');

LatexCmds.ast = LatexCmds.star = LatexCmds.loast = LatexCmds.lowast =
  bind(BinaryOperator,'\\ast ','&lowast;');
  //case 'there4 = // a special exception for this one, perhaps?
LatexCmds.therefor = LatexCmds.therefore =
  bind(BinaryOperator,'\\therefore ','&there4;');

LatexCmds.cuz = // l33t
LatexCmds.because = bind(BinaryOperator,'\\because ','&#8757;');

LatexCmds.prop = LatexCmds.propto = bind(BinaryOperator,'\\propto ','&prop;');

LatexCmds['\u2248'] = LatexCmds.asymp = LatexCmds.approx = bind(BinaryOperator,'\\approx ','&asymp;');

LatexCmds.lt = bind(BinaryOperator, '<', '&lt;', '<');

LatexCmds.gt = bind(BinaryOperator, '>', '&gt;', '>');

// lesser-or-equal signs of parametric curves need to be fixed
LatexCmds.prle = bind(FixedBinaryOperator, '\\prle ', '&le;', '\u2264');

LatexCmds['\u2264'] = LatexCmds.le = LatexCmds.leq = bind(BinaryOperator, '\\le ', '&le;', '\u2264');

LatexCmds['\u2265'] = LatexCmds.ge = LatexCmds.geq = bind(BinaryOperator, '\\ge ', '&ge;', '\u2265');

// GeoGebra IS_ELEMENT_OF "\u2208"
LatexCmds.isin = LatexCmds['in'] = LatexCmds['\u2208'] =
  bind(BinaryOperator, '\\in ', '&isin;', '\u2208');

LatexCmds.ni = LatexCmds.contains = bind(BinaryOperator,'\\ni ','&ni;');

LatexCmds.notni = LatexCmds.niton = LatexCmds.notcontains = LatexCmds.doesnotcontain =
  bind(BinaryOperator,'\\not\\ni ','&#8716;');

// GeoGebra IS_SUBSET_OF_STRICT "\u2282"
LatexCmds.sub = LatexCmds.subset = LatexCmds['\u2282'] =
  bind(BinaryOperator, '\\subset ', '&sub;', '\u2282');

LatexCmds.sup = LatexCmds.supset = LatexCmds.superset =
  bind(BinaryOperator,'\\supset ','&sup;');

LatexCmds.nsub = LatexCmds.notsub =
LatexCmds.nsubset = LatexCmds.notsubset =
  bind(BinaryOperator,'\\not\\subset ','&#8836;');

LatexCmds.nsup = LatexCmds.notsup =
LatexCmds.nsupset = LatexCmds.notsupset =
LatexCmds.nsuperset = LatexCmds.notsuperset =
  bind(BinaryOperator,'\\not\\supset ','&#8837;');

// GeoGebra IS_SUBSET_OF "\u2286"
LatexCmds.sube = LatexCmds.subeq = LatexCmds.subsete = LatexCmds.subseteq =
LatexCmds['\u2286'] =
  bind(BinaryOperator,'\\subseteq ','&sube;', '\u2286');

LatexCmds.supe = LatexCmds.supeq =
LatexCmds.supsete = LatexCmds.supseteq =
LatexCmds.supersete = LatexCmds.superseteq =
  bind(BinaryOperator,'\\supseteq ','&supe;');

LatexCmds.nsube = LatexCmds.nsubeq =
LatexCmds.notsube = LatexCmds.notsubeq =
LatexCmds.nsubsete = LatexCmds.nsubseteq =
LatexCmds.notsubsete = LatexCmds.notsubseteq =
  bind(BinaryOperator,'\\not\\subseteq ','&#8840;');

LatexCmds.nsupe = LatexCmds.nsupeq =
LatexCmds.notsupe = LatexCmds.notsupeq =
LatexCmds.nsupsete = LatexCmds.nsupseteq =
LatexCmds.notsupsete = LatexCmds.notsupseteq =
LatexCmds.nsupersete = LatexCmds.nsuperseteq =
LatexCmds.notsupersete = LatexCmds.notsuperseteq =
  bind(BinaryOperator,'\\not\\supseteq ','&#8841;');


//sum, product, coproduct, integral
var BigSymbol = P(Symbol, function(_, _super) {
  _.init = function(ch, html) {
    _super.init.call(this, ch, '<big>'+html+'</big>');
  };
});

LatexCmds['\u2211'] = LatexCmds.sum = LatexCmds.summation = bind(BigSymbol,'\\sum ','&sum;');
LatexCmds['\u220f'] = LatexCmds.prod = LatexCmds.product = bind(BigSymbol,'\\prod ','&prod;');
LatexCmds.coprod = LatexCmds.coproduct = bind(BigSymbol,'\\coprod ','&#8720;');
LatexCmds['\u222b'] = LatexCmds['int'] = LatexCmds.integral = bind(BigSymbol,'\\int ','&int;');

//the canonical sets of numbers
//LatexCmds.N =
LatexCmds.naturals = LatexCmds.Naturals =
  bind(VanillaSymbol,'\\mathbb{N}','&#8469;');

//LatexCmds.P =
LatexCmds.primes = LatexCmds.Primes =
LatexCmds.projective = LatexCmds.Projective =
LatexCmds.probability = LatexCmds.Probability =
  bind(VanillaSymbol,'\\mathbb{P}','&#8473;');

//LatexCmds.Z =
LatexCmds.integers = LatexCmds.Integers =
  bind(VanillaSymbol,'\\mathbb{Z}','&#8484;');

//LatexCmds.Q =
LatexCmds.rationals = LatexCmds.Rationals =
  bind(VanillaSymbol,'\\mathbb{Q}','&#8474;');

//LatexCmds.R =
LatexCmds.reals = LatexCmds.Reals =
  bind(VanillaSymbol,'\\mathbb{R}','&#8477;');

//LatexCmds.C =
LatexCmds.complex = LatexCmds.Complex =
LatexCmds.complexes = LatexCmds.Complexes =
LatexCmds.complexplane = LatexCmds.Complexplane = LatexCmds.ComplexPlane =
  bind(VanillaSymbol,'\\mathbb{C}','&#8450;');

//LatexCmds.H =
LatexCmds.Hamiltonian = LatexCmds.quaternions = LatexCmds.Quaternions =
  bind(VanillaSymbol,'\\mathbb{H}','&#8461;');

//spacing
LatexCmds.quad = LatexCmds.emsp = bind(VanillaSymbol,'\\quad ','    ');
LatexCmds.qquad = bind(VanillaSymbol,'\\qquad ','        ');
/* spacing special characters, gonna have to implement this in LatexCommandInput::onText somehow
case ',':
  return VanillaSymbol('\\, ',' ');
case ':':
  return VanillaSymbol('\\: ','  ');
case ';':
  return VanillaSymbol('\\; ','   ');
case '!':
  return Symbol('\\! ','<span style="margin-right:-.2em"></span>');
*/

//binary operators
LatexCmds.diamond = bind(VanillaSymbol, '\\diamond ', '&#9671;');
LatexCmds.bigtriangleup = bind(VanillaSymbol, '\\bigtriangleup ', '&#9651;');
LatexCmds.ominus = bind(VanillaSymbol, '\\ominus ', '&#8854;');
LatexCmds.uplus = bind(VanillaSymbol, '\\uplus ', '&#8846;');
LatexCmds.bigtriangledown = bind(VanillaSymbol, '\\bigtriangledown ', '&#9661;');
LatexCmds.sqcap = bind(VanillaSymbol, '\\sqcap ', '&#8851;');
LatexCmds.triangleleft = bind(VanillaSymbol, '\\triangleleft ', '&#8882;');
LatexCmds.sqcup = bind(VanillaSymbol, '\\sqcup ', '&#8852;');
LatexCmds.triangleright = bind(VanillaSymbol, '\\triangleright ', '&#8883;');
LatexCmds.odot = bind(VanillaSymbol, '\\odot ', '&#8857;');
LatexCmds.bigcirc = bind(VanillaSymbol, '\\bigcirc ', '&#9711;');
LatexCmds.dagger = bind(VanillaSymbol, '\\dagger ', '&#0134;');
LatexCmds.ddagger = bind(VanillaSymbol, '\\ddagger ', '&#135;');
LatexCmds.wr = bind(VanillaSymbol, '\\wr ', '&#8768;');
LatexCmds.amalg = bind(VanillaSymbol, '\\amalg ', '&#8720;');

//relationship symbols
LatexCmds.models = bind(VanillaSymbol, '\\models ', '&#8872;');
LatexCmds.prec = bind(VanillaSymbol, '\\prec ', '&#8826;');
LatexCmds.succ = bind(VanillaSymbol, '\\succ ', '&#8827;');
LatexCmds.preceq = bind(VanillaSymbol, '\\preceq ', '&#8828;');
LatexCmds.succeq = bind(VanillaSymbol, '\\succeq ', '&#8829;');
LatexCmds.simeq = bind(VanillaSymbol, '\\simeq ', '&#8771;');
LatexCmds.mid = bind(VanillaSymbol, '\\mid ', '&#8739;');
//LatexCmds.ll = bind(VanillaSymbol, '\\ll ', '&#8810;');//disturbing in GeoGebraWeb
//LatexCmds.gg = bind(VanillaSymbol, '\\gg ', '&#8811;');//disturbing in GeoGebraWeb
LatexCmds.bowtie = bind(VanillaSymbol, '\\bowtie ', '&#8904;');
LatexCmds.sqsubset = bind(VanillaSymbol, '\\sqsubset ', '&#8847;');
LatexCmds.sqsupset = bind(VanillaSymbol, '\\sqsupset ', '&#8848;');
LatexCmds.smile = bind(VanillaSymbol, '\\smile ', '&#8995;');
LatexCmds.sqsubseteq = bind(VanillaSymbol, '\\sqsubseteq ', '&#8849;');
LatexCmds.sqsupseteq = bind(VanillaSymbol, '\\sqsupseteq ', '&#8850;');
LatexCmds.doteq = bind(VanillaSymbol, '\\doteq ', '&#8784;');
LatexCmds.frown = bind(VanillaSymbol, '\\frown ', '&#8994;');
LatexCmds.vdash = bind(VanillaSymbol, '\\vdash ', '&#8870;');
LatexCmds.dashv = bind(VanillaSymbol, '\\dashv ', '&#8867;');

// this is needed for GeoGebraWeb, merged with "\u2225"
LatexCmds.parallel = LatexCmds['\u2225'] =
  bind(VanillaSymbol, '\\parallel ', '&#8741;', '\u2225');

//Now this should be the same as multiplication in Math mode!
//so easiest is to change " " to "*" in RootMathBlock.onText...
//so MathQuillGGB will not produce space in theory, but
//space may still come from GeoGebraWeb and go back to there

// Was there two kinds of space ??? In LaTeX, real space does not mean anything
// important as CharCmds is not even parsed by LaTeX parser, AFAIK, so ignored
CharCmds[' '] = bind(VanillaSymbol, ' ', ' ');

//AND whoever puts \u2060 deserves changing it to space!
// \s is Regexp treats nbsp, figure space and space the same way,
// but still, the word-joiner character can be used for hacking 
// (it was necessary for technical reasons, spaces in Quotations)
//CharCmds['\u2060'] =
//LatexCmds['\u2060'] = LatexCmds.space = bind(VanillaSymbol, '\\space ', '&nbsp;');
// the above syntax was not good when converting it to textual format, so instead:
LatexCmds['\u2060'] = LatexCmds.space = bind(VanillaSymbol, '\\space ', '&nbsp;', ' ');

//arrows
LatexCmds.longleftarrow = bind(VanillaSymbol, '\\longleftarrow ', '&#8592;');
LatexCmds.longrightarrow = bind(VanillaSymbol, '\\longrightarrow ', '&#8594;');
LatexCmds.Longleftarrow = bind(VanillaSymbol, '\\Longleftarrow ', '&#8656;');
LatexCmds.Longrightarrow = bind(VanillaSymbol, '\\Longrightarrow ', '&#8658;');
LatexCmds.longleftrightarrow = bind(VanillaSymbol, '\\longleftrightarrow ', '&#8596;');
LatexCmds.updownarrow = bind(VanillaSymbol, '\\updownarrow ', '&#8597;');
LatexCmds.Longleftrightarrow = bind(VanillaSymbol, '\\Longleftrightarrow ', '&#8660;');
LatexCmds.Updownarrow = bind(VanillaSymbol, '\\Updownarrow ', '&#8661;');
LatexCmds.mapsto = bind(VanillaSymbol, '\\mapsto ', '&#8614;');
LatexCmds.nearrow = bind(VanillaSymbol, '\\nearrow ', '&#8599;');
LatexCmds.hookleftarrow = bind(VanillaSymbol, '\\hookleftarrow ', '&#8617;');
LatexCmds.hookrightarrow = bind(VanillaSymbol, '\\hookrightarrow ', '&#8618;');
LatexCmds.searrow = bind(VanillaSymbol, '\\searrow ', '&#8600;');
LatexCmds.leftharpoonup = bind(VanillaSymbol, '\\leftharpoonup ', '&#8636;');
LatexCmds.rightharpoonup = bind(VanillaSymbol, '\\rightharpoonup ', '&#8640;');
LatexCmds.swarrow = bind(VanillaSymbol, '\\swarrow ', '&#8601;');
LatexCmds.leftharpoondown = bind(VanillaSymbol, '\\leftharpoondown ', '&#8637;');
LatexCmds.rightharpoondown = bind(VanillaSymbol, '\\rightharpoondown ', '&#8641;');
LatexCmds.nwarrow = bind(VanillaSymbol, '\\nwarrow ', '&#8598;');

//Misc
LatexCmds.ldots = bind(VanillaSymbol, '\\ldots ', '&#8230;');
LatexCmds.cdots = bind(VanillaSymbol, '\\cdots ', '&#8943;');
LatexCmds.vdots = bind(VanillaSymbol, '\\vdots ', '&#8942;');
LatexCmds.ddots = bind(VanillaSymbol, '\\ddots ', '&#8944;');
LatexCmds.surd = bind(VanillaSymbol, '\\surd ', '&#8730;');
LatexCmds.triangle = bind(VanillaSymbol, '\\triangle ', '&#9653;');
LatexCmds.ell = bind(VanillaSymbol, '\\ell ', '&#8467;');
LatexCmds.top = bind(VanillaSymbol, '\\top ', '&#8868;');
LatexCmds.flat = bind(VanillaSymbol, '\\flat ', '&#9837;');
LatexCmds.natural = bind(VanillaSymbol, '\\natural ', '&#9838;');
LatexCmds.sharp = bind(VanillaSymbol, '\\sharp ', '&#9839;');
LatexCmds.wp = bind(VanillaSymbol, '\\wp ', '&#8472;');
LatexCmds.bot = bind(VanillaSymbol, '\\bot ', '&#8869;');
LatexCmds.clubsuit = bind(VanillaSymbol, '\\clubsuit ', '&#9827;');
LatexCmds.diamondsuit = bind(VanillaSymbol, '\\diamondsuit ', '&#9826;');
LatexCmds.heartsuit = bind(VanillaSymbol, '\\heartsuit ', '&#9825;');
LatexCmds.spadesuit = bind(VanillaSymbol, '\\spadesuit ', '&#9824;');

//variable-sized
LatexCmds.oint = bind(VanillaSymbol, '\\oint ', '&#8750;');
LatexCmds.bigcap = bind(VanillaSymbol, '\\bigcap ', '&#8745;');
LatexCmds.bigcup = bind(VanillaSymbol, '\\bigcup ', '&#8746;');
LatexCmds.bigsqcup = bind(VanillaSymbol, '\\bigsqcup ', '&#8852;');
LatexCmds.bigvee = bind(VanillaSymbol, '\\bigvee ', '&#8744;');
LatexCmds.bigwedge = bind(VanillaSymbol, '\\bigwedge ', '&#8743;');
LatexCmds.bigodot = bind(VanillaSymbol, '\\bigodot ', '&#8857;');
LatexCmds.bigotimes = bind(VanillaSymbol, '\\bigotimes ', '&#8855;');
LatexCmds.bigoplus = bind(VanillaSymbol, '\\bigoplus ', '&#8853;');
LatexCmds.biguplus = bind(VanillaSymbol, '\\biguplus ', '&#8846;');

//delimiters
LatexCmds.lfloor = bind(VanillaSymbol, '\\lfloor ', '&#8970;');
LatexCmds.rfloor = bind(VanillaSymbol, '\\rfloor ', '&#8971;');
LatexCmds.lceil = bind(VanillaSymbol, '\\lceil ', '&#8968;');
LatexCmds.rceil = bind(VanillaSymbol, '\\rceil ', '&#8969;');
LatexCmds.slash = bind(VanillaSymbol, '\\slash ', '&#47;');
LatexCmds.opencurlybrace = bind(VanillaSymbol, '\\opencurlybrace ', '&#123;');
LatexCmds.closecurlybrace = bind(VanillaSymbol, '\\closecurlybrace ', '&#125;');

//various symbols

LatexCmds.caret = bind(VanillaSymbol,'\\caret ','^');
LatexCmds.underscore = bind(VanillaSymbol,'\\underscore ','_');
LatexCmds.backslash = bind(VanillaSymbol,'\\backslash ','\\','\\');
LatexCmds.vert = bind(VanillaSymbol,'|');
LatexCmds.nabla = LatexCmds.del = bind(VanillaSymbol,'\\nabla ','&nabla;');
LatexCmds.hbar = bind(VanillaSymbol,'\\hbar ','&#8463;');

// this is needed for GeoGebraWeb, merged with "\u22a5"
LatexCmds.perp = LatexCmds.perpendicular = LatexCmds['\u22a5'] =
  bind(VanillaSymbol, '\\perp ', '&perp;', '\u22a5');
//...

LatexCmds.AA = LatexCmds.Angstrom = LatexCmds.angstrom =
  bind(VanillaSymbol,'\\text\\AA ','&#8491;');

// why the degree sign is converted to the ring symbol (in exponent)?
// degree: U+00B0 ring: U+2218
LatexCmds.ring = LatexCmds.circ = LatexCmds.circle =
// although the following syntax would paste back in a right way,
// visually it's very different from degree sign, so unacceptable:
//  bind(VanillaSymbol,'\\circ ','&#8728;', '\u2218');
// so it still has to be solved how to convert this to text in a right way:
  bind(VanillaSymbol,'\\circ ','&#8728;');
// in case it's inside a "power"

LatexCmds.bull = LatexCmds.bullet = bind(VanillaSymbol,'\\bullet ','&bull;');

LatexCmds.setminus = LatexCmds.smallsetminus =
  bind(VanillaSymbol,'\\setminus ','&#8726;');

LatexCmds.not = //bind(Symbol,'\\not ','<span class="not">/</span>');
LatexCmds['\u00ac'] = LatexCmds.neg = bind(VanillaSymbol, '\\neg ', '&not;', '\u00ac');

// removed so that double-click on 1..2 works
LatexCmds['\u2026'] = LatexCmds.dots = LatexCmds.ellip = LatexCmds.hellip =
	LatexCmds.ellipsis = LatexCmds.hellipsis =
	  bind(VanillaSymbol,'\\dots ','&hellip;','...');

LatexCmds.converges =
LatexCmds.darr = LatexCmds.dnarr = LatexCmds.dnarrow = LatexCmds.downarrow =
  bind(VanillaSymbol,'\\downarrow ','&darr;');

LatexCmds.dArr = LatexCmds.dnArr = LatexCmds.dnArrow = LatexCmds.Downarrow =
  bind(VanillaSymbol,'\\Downarrow ','&dArr;');

LatexCmds.diverges = LatexCmds.uarr = LatexCmds.uparrow =
  bind(VanillaSymbol,'\\uparrow ','&uarr;');

LatexCmds.uArr = LatexCmds.Uparrow = bind(VanillaSymbol,'\\Uparrow ','&uArr;');

LatexCmds.to = bind(BinaryOperator,'\\to ','&rarr;');

//merged with GeoGebra "\u2192", maybe it's not necessary to put it in LatexCmds, but used to
// and VanillaSymbol changed to BinaryOperator (in case of .and, .or, etc too)
LatexCmds.implies = LatexCmds['\u2192'] =
LatexCmds.rarr = LatexCmds.rightarrow = bind(BinaryOperator,'\\rightarrow ','&rarr;', '\u2192');

LatexCmds.rArr = LatexCmds.Rightarrow =
  bind(BinaryOperator, '\\Rightarrow ', '&rArr;');

LatexCmds.gets = bind(BinaryOperator,'\\gets ','&larr;');

LatexCmds.larr = LatexCmds.leftarrow = bind(VanillaSymbol,'\\leftarrow ','&larr;');

LatexCmds.impliedby = bind(BinaryOperator,'\\Leftarrow ','&lArr;');

LatexCmds.lArr = LatexCmds.Leftarrow = bind(VanillaSymbol,'\\Leftarrow ','&lArr;');

LatexCmds.harr = LatexCmds.lrarr = LatexCmds.leftrightarrow =
  bind(VanillaSymbol,'\\leftrightarrow ','&harr;');

LatexCmds.iff = bind(BinaryOperator,'\\Leftrightarrow ','&hArr;');

LatexCmds.hArr = LatexCmds.lrArr = LatexCmds.Leftrightarrow =
  bind(VanillaSymbol,'\\Leftrightarrow ','&hArr;');

LatexCmds.Re = LatexCmds.Real = LatexCmds.real = bind(VanillaSymbol,'\\Re ','&real;');

LatexCmds.Im = LatexCmds.imag =
LatexCmds.image = LatexCmds.imagin = LatexCmds.imaginary = LatexCmds.Imaginary =
  bind(VanillaSymbol,'\\Im ','&image;');

// Imaginary Unit is not the same as the Imaginary Part function (before)
// this is like Pi, but does not have a predefined symbol in LaTeX
// however, in that case GeoGebraWeb would make a VanillaSymbol automatically,
// so maybe there is no need for us to make a LatexCmds['\u03af']?
LatexCmds['\u03af'] = bind(NonSymbolaSymbol, '\\\u03af ', '&#943;', '\u03af');

LatexCmds.part = LatexCmds.partial = bind(VanillaSymbol,'\\partial ','&part;');

// GeoGebraWeb also uses infinity, '\u221e'
LatexCmds.inf = LatexCmds.infin = LatexCmds.infty = LatexCmds.infinity =
LatexCmds['\u221e'] =
  bind(VanillaSymbol,'\\infty ','&infin;', '\u221e');

LatexCmds.alef = LatexCmds.alefsym = LatexCmds.aleph = LatexCmds.alephsym =
  bind(VanillaSymbol,'\\aleph ','&alefsym;');

LatexCmds.xist = //LOL
LatexCmds.xists = LatexCmds.exist = LatexCmds.exists =
  bind(VanillaSymbol,'\\exists ','&exist;');

LatexCmds.and = LatexCmds.land = LatexCmds.wedge = LatexCmds['\u2227'] =
  bind(BinaryOperator, '\\wedge ', '&and;', '\u2227');

LatexCmds.or = LatexCmds.lor = LatexCmds.vee = LatexCmds['\u2228'] =
  bind(BinaryOperator, '\\vee ', '&or;', '\u2228');

//LatexCmds.o = LatexCmds.O =
LatexCmds.empty = LatexCmds.emptyset =
LatexCmds.oslash = LatexCmds.Oslash =
LatexCmds.nothing = LatexCmds.varnothing =
  bind(BinaryOperator,'\\varnothing ','&empty;');

LatexCmds.cup = LatexCmds.union = bind(BinaryOperator,'\\cup ','&cup;');

LatexCmds.cap = LatexCmds.intersect = LatexCmds.intersection =
  bind(BinaryOperator,'\\cap ','&cap;');

// \deg is actually a latex function LatexCmds.deg = LatexCmds.degree = bind(VanillaSymbol,'^\\circ ','&deg;');

// GeoGebra ANGLE "\u2220"
LatexCmds.ang = LatexCmds.angle = LatexCmds['\u2220'] =
  bind(VanillaSymbol, '\\angle ', '&ang;', '\u2220');

// GeoGebra MEASURED ANGLE "\u2221"
LatexCmds['\u2221'] = bind(VanillaSymbol, '\\\u2221 ', '&#8737;', '\u2221');

// eulerChar can still come from input, for which this is a workaround
// although we could keep eulerChar internally, that might cause
// different difficulties e.g. on-screen keyboard, non-variable, etc.
// so let's just convert eulerChar to a simple VanillaSymbol like "e"
LatexCmds['\u212f'] = bind(VanillaSymbol, '\u212f', 'e', '\u212f');

var NonItalicizedFunction = P(Symbol, function(_, _super) {
  _.init = function(fn) {
	// fn added to the end to avoid extra space being printed,
	// e.g. in case of "log" command
    _super.init.call(this, '\\'+fn+' ', '<span>'+fn+'</span>', fn);
  };
  _.respace = function()
  {
    this.jQ[0].className =
      (this[R] instanceof SupSub || this[R] instanceof Bracket) ?
      '' : 'non-italicized-function';
  };
});

//backslashless commands, words where adjacent letters (Variables)
//that form them automatically are turned into commands
var UnItalicizedCmds = {

// Proper LaTeX functions
// http://amath.colorado.edu/documentation/LaTeX/Symbols.pdf

arccos : 1, // numbers "1" don't mean anything, currently
arcsin : 1,
arctan : 1,
arg : 1,
cos : 1,
cosh : 1,
cot : 1,
coth : 1,
csc : 1,
deg : 1,
det : 1,
dim : 1,
exp : 1,
gcd : 1,
hom : 1,
inf : 1,
ker : 1,
lg : 1,
//lim : 1,
ln : 1,
log : 1,
max : 1,
min : 1,
sec : 1,
sin : 1,
sinh : 1,
sup : 1,
tan : 1,
tanh : 1,

// Portugese
cossech: 1,

// Romanian special
arcsh: 1,
arcch: 1,
arcth: 1,

// French special
argsh: 1,
argch: 1,
argth: 1,

// Spanish special
arcos: 1,
arcosh: 1,

// German special
arsinh: 1,
artanh: 1,

// Hungarian (??)
arch: 1,
arsh: 1,
arth: 1,
ch: 1,
sh: 1,
th: 1,
cth: 1,

// special GeoGebra functions
sgn : 1,
round : 1,
erf : 1,
Ci : 1,
Si : 1,
Ei : 1,
real : 1,
imaginary : 1,
round : 1,
fractionalPart : 1
}, AutoCmds = {
// GeoGebra+MathQuillGGB
sqrt: 1,
Sqrt: 1,
nthroot: 2,
nroot: 2,
// MathQuillGGB
//sum: 1,
pi: 1
//theta: 1,
//int: 1
}, MAX_AUTOCMD_LEN = 16;

(function() {
  var trigs = {
    sin: 1, cos: 1, tan: 1, sen: 1, tg: 1
    // capital/ar forms not needed, GeoGebra won't serialise to them
    // and users don't need them
    // although it can parse them
    //,Sin: 1, Cos: 1, Tan: 1
    };
  for (var trig in trigs) {
	UnItalicizedCmds[trig] =
	UnItalicizedCmds['a'+trig] =
	UnItalicizedCmds['arc'+trig] =
	UnItalicizedCmds[trig+'h'] =
	UnItalicizedCmds['arc'+trig+'h'] =
	UnItalicizedCmds['a'+trig+'h'] = 1;
  }
  trigs = {
	sec: 1, cosec: 1, csc: 1
	//,Sec: 1, Cosec: 1, Csc: 1,
	,cotan: 1, cot: 1, ctg: 1
	//,Cotan: 1, Cot: 1, Ctg: 1
	,cotg : 1
	};
  for (var trig in trigs) {
	UnItalicizedCmds[trig] =
	UnItalicizedCmds[trig+'h'] = 1;
  }

  /*var trig = ['sin', 'cos', 'tan', 'sec', 'cosec', 'csc', 'cotan', 'cot'];
  for (var i in trig) {
    LatexCmds[trig[i]] =
    LatexCmds[trig[i]+'h'] =
    LatexCmds['a'+trig[i]] = LatexCmds['arc'+trig[i]] =
    LatexCmds['a'+trig[i]+'h'] = LatexCmds['arc'+trig[i]+'h'] =
      NonItalicizedFunction;
  }*/

  for (var fn in UnItalicizedCmds)
    LatexCmds[fn] = NonItalicizedFunction;
}());


/*************************************************
 * Abstract classes of text blocks
 ************************************************/

/**
 * Blocks of plain text, with one or two TextPiece's as children.
 * Represents flat strings of typically serif-font Roman characters, as
 * opposed to hierchical, nested, tree-structured math.
 * Wraps a single HTMLSpanElement.
 */
var TextBlock = P(Node, function(_, _super) {// could descend from MathElement
  _.finalizeInsert = function() {// but its only method is overridden anyway
	if (this.ctrlSeq === '{') {
      MathElement.prototype.finalizeInsert.call(this.parent);
	} else {
      MathElement.prototype.finalizeInsert.call(this);
	}
  };
  _.whetherRootStyleBlock = function() {
	return false;
  };
  _.ctrlSeq = '\\text';
  _.endSeq = '';
  _.join = function(methodName) {
	// for compatibility with MathBlock
    return this.foldChildren('', function(fold, child) {
	  return fold + child[methodName]();
	});
  };
  _.replaces = function(replacedText) {
    if (replacedText instanceof Fragment)
      this.replacedText = replacedText.remove().jQ.text();
    else if (typeof replacedText === 'string')
      this.replacedText = replacedText;
  };

  _.jQadd = function(jQ) {
    _super.jQadd.call(this, jQ);
    if (this.ch[L]) this.ch[L].jQadd(this.jQ[0].firstChild);
  };

  _.createBefore = function(cursor) {
    var textBlock = this;
    _super.createBefore.call(this, cursor);

    if (textBlock[R].respace) textBlock[R].respace();
    if (textBlock[L].respace) textBlock[L].respace();

    textBlock.bubble('redraw');

    cursor.appendTo(textBlock);

    if (textBlock.replacedText)
      for (var i = 0; i < textBlock.replacedText.length; i += 1)
        textBlock.ch[L].write(cursor, textBlock.replacedText.charAt(i));
  };

  _.parser = function() {
    var textBlock = this;

    // TODO: correctly parse text mode
    var string = Parser.string;
    var regex = Parser.regex;
    var optWhitespace = Parser.optWhitespace;
    return optWhitespace
      .then(string('{')).then(regex(/^(([\\][}])*[^}]?)*/)).skip(string('}'))
      .map(function(text) {
        // TODO: is this the correct behavior when parsing
        // the latex \text{} ?  This violates the requirement that
        // the text contents are always nonempty.  Should we just
        // disown the parent node instead?

    	// and make sure text did not end with \
    	// so there is an extra space at the end in that case
    	// note that JavaScript also escapes backslash,
    	// so we double it everywhere
    	var text2 = text;
    	if (text.substring(text.length-2) === '\\ ') {
    		text2 = text2.substring(0,text2.length-1);
    	}

    	// if all } was escaped, \} could only have come from escaping }
        // if }s were not escaped by us, then it can go wrong anyway
    	// but this is we are going to avoid (see other comments)
    	text2 = text2.replace(/\\}/g,'}');

    	// this is also like replace, just better, change figure spaces
        text2 = text2.split('\u2060').join(' ');

        // but it is a good question when this escaping
        // should have happened in case of parsing / pasting
        // so, to escape everything perfectly, then it
        // might need pre-processing similar to parsing!
    	// i.e. only escape things inside \quotation{}
    	// but then comes the original problem again:
    	// which } sign should mean the end of \quotation?
    	// e.g. \quotation{12}+\quotation{34} can be:
    	// "12"+"34" or "12}+\quotation{34", otherwise we
    	// could not enter "12}+\quotation{34"...
    	// so we might require that all content inside
    	// \quotation shall be escaped by default!
    	// i.e. the user shall take care to paste only
    	// escaped things inside quotations, and in
    	// case of GeoGebraWeb calling this, it should do that.
    	// TODO: copy with CTRL+C shall escape it, however!

        TextPiece(text2).adopt(textBlock, 0, 0);
        return textBlock;
      });
  };
  _.textContents = function() {
    return this.foldChildren('', function(text, child) {
      return text + child.text2;
    });
  };
  _.text = function() {
	  if (this.ctrlSeq === '{') {
		  // for quotationtext, text and html mode is this,
		  // but behold the latex mode...
		  return this.textContents();
	  } else if (this.ctrlSeq === '\\textotherwise') {
		// maybe this won't be used...
		return "true";
	  }
	  return '"' + this.textContents() + '"';
  };
  _.latex = function() {
	  if (this.ctrlSeq == '\\textsf') {
		  // not clear what other things should be allowed here
		  return this.ctrlSeq + '{' + this.textContents() + '}';
	  } else if (this.ctrlSeq === '{') {
		  return this.ctrlSeq + this.textContents() + this.endSeq;
	  }
	  return '\\text{' + this.textContents() + '}';
  };
  _.html = function() {
	// FIXME: it's unclear why htmlTemplate is not used here
	// from makeTextBlock, so are all makeTextBlock commands void?
	if (this.ctrlSeq === '\\textsf') {
		// manual hack
		return (
				'<span class="sans-serif text" mathquillggb-command-id='+this.id+'>'
				+   this.textContents()
				+ '</span>'
		);
	} else if (this.ctrlSeq === '{') {
		return this.textContents();
	}
    return (
        '<span class="text" mathquillggb-command-id='+this.id+'>'
      +   this.textContents()
      + '</span>'
    );
  };

  _.onKey = function(curs, key, e) {
	// added a "curs" parameter to the onKey method just to get
	// the root block in this TextBlock (other ways did not succeed)
	var root = curs.root;
	if ((root !== undefined) && (root.common !== undefined)) {
	  // this does not work in itself, probably due to overriding!
      root.common.GeoGebraSuggestionPopupCanShow = false;
      // so let's also set an internal "force" property!
      root.common.forceGeoGebraSuggestionPopupCanShow = true;
	}
    if (this.ctrlSeq === '\\textotherwise') {
      switch (key) {
        case 'Ctrl-Shift-Backspace':
        case 'Ctrl-Backspace':
        case 'Shift-Backspace':
        case 'Backspace':
        case 'Left':
        case 'Shift-Left':
        case 'Ctrl-Left':
        case 'Ctrl-Shift-Left':
        case 'Home':
        case 'Ctrl-Home':
        case 'Shift-Home':
        case 'Ctrl-Shift-Home':
        case 'Up':
        case 'Shift-Up':
        case 'Ctrl-Up':
        case 'Ctrl-Shift-Up':
        //case 'Ctrl-Shift-Del':
        //case 'Ctrl-Del':
        //case 'Shift-Del':
        //case 'Del':
          curs.insertBefore(this);
          break;

        //case 'Right':
        //case 'Shift-Right':
        //case 'Ctrl-Right':
        //case 'Tab':
        //case 'Esc':
        //case 'Shift-Tab':
        //case 'Shift-Esc':
        //case 'Shift-Spacebar':
        //case 'End':
        //case 'Ctrl-End':
        //case 'Shift-End':
        //case 'Ctrl-Shift-End':
        //case 'Down':
        //case 'Shift-Down':
        //case 'Ctrl-Down':
          //this.cursor.prepareMove().appendTo(this.cursor.parent);
          //this.cursor.prepareMove().appendTo(this);
        //  this.cursor.insertAfter(this);
        //  break;
        default:
          curs.insertAfter(this);
      }
      return false;
    }
    if (key === 'Spacebar' || key === 'Shift-Spacebar') return false;
  };
  _.onText = function(curs, ch) {
    if (this.ctrlSeq === '\\textotherwise') {
	  return false;
	}
    if (ch !== '"') {
      //curs.write(ch);
      // what would cursor.write do?
      this.write(curs, ch);
	} else if (curs[R]) {
      this.write(curs, ch);
	} else {
      curs.moveRight();
	}
    return false;
  };
  _.moveTowards = function(dir, cursor) {
    if (this.ctrlSeq === '\\textotherwise') {
 	  cursor.insertAdjacent(-dir, this);
    }
    cursor.appendDir(-dir, this);
  };
  _.moveOutOf = function(dir, cursor) {
    if (this.ctrlSeq === '{') {
      // if this is used from Quotation:
      cursor.insertAdjacent(dir, this.parent);
    } else {
      cursor.insertAdjacent(dir, this);
    }
  };

  // TODO: make these methods part of a shared mixin or something.
  _.createSelection = MathCommand.prototype.createSelection;
  _.expandSelection = MathCommand.prototype.expandSelection;
  _.clearSelection = MathCommand.prototype.clearSelection;
  _.retractSelection = MathCommand.prototype.retractSelection;
  _.placeCursor = MathCommand.prototype.placeCursor;//?
  _.selectChildren = MathBlock.prototype.selectChildren;//?

  _.selectOutOf = function(dir, cursor) {
    if (this.ctrlSeq === '\\textotherwise') {
      TextBlock.prototype.moveOutOf.apply(this, arguments);
    } else if (this.ctrlSeq === '{') {
      // if this is used from Quotation:
      MathBlock.prototype.selectOutOf.apply(this, arguments);
    } else {
      var cmd = this;
      cursor.clearSelection().hide().insertAdjacent(dir, cmd)
      .selection = Selection(cmd);
    }
  };
  _.deleteTowards = function(dir, cursor) {
    if (this.ctrlSeq === '\\textotherwise') {
      cursor.insertAdjacent(-dir, this);
    } else {
      TextBlock.prototype.createSelection.call(this, dir, cursor);
      //_.createSelection(dir, cursor);
    }
  };
  _.deleteOutOf = function(dir, cursor) {
	if (this.ctrlSeq === '\\textotherwise') {
	  cursor.insertAdjacent(dir, this);
	} else if (this.ctrlSeq === '{') {
      // also delete content!
      if ((this.ch[L] !== 0) && (this.ch[R] !== 0)) {
        cursor.selection = Selection(this.ch[L], this.ch[R]);
        cursor.deleteSelection();
      }
      // if this is used from quotation (MathBlock.deleteOutOf)
      cursor.unwrapGramp();
    } else {
      // backspace and delete at ends of block don't unwrap
      if (this.isEmpty()) cursor.insertAfter(this);
    }
  };
  _.write = function(cursor, ch0, replacedFragment) {
    if (this.ctrlSeq === '\\textotherwise') {
      return false;
    }

    if (replacedFragment) replacedFragment.remove();

    var ch = ch0;
    ch = ch.split('\u2060').join(' ');

    // in GeoGebraWeb, $ should be accepted just like
    // any other character!
    //if (ch !== '$') {
      if (!cursor[L]) TextPiece(ch).createBefore(cursor);
      else cursor[L].appendText(ch);
    //}
    //else if (this.isEmpty()) {
    //  cursor.insertAfter(this);
    //  VanillaSymbol('\\$','$').createBefore(cursor);
    //}
    //else if (!cursor[R]) cursor.insertAfter(this);
    //else if (!cursor[L]) cursor.insertBefore(this);
    //else { // split apart
    //  var prevBlock = TextBlock();
    //  var prevPc = this.ch[L];
    //  prevPc.disown();
    //  prevPc.adopt(prevBlock, 0, 0);

    //  cursor.insertBefore(this);
    //  _super.createBefore.call(prevBlock, cursor);
    //}
    return false;
  };

  _.seek = function(pageX, cursor) {
    consolidateChildren(this);

    //MathBlock.prototype.seek.apply(this, arguments);
    // this is equivalent to this:
    cursor.appendTo(this).seekHoriz(pageX, this);
    // but... is cursor.appendTo valid with TextBlock?
    // in theory yes, as it is called in createBefore 
  };

  _.blur = function() {
    MathBlock.prototype.blur.call(this);
    consolidateChildren(this);
  };

  function consolidateChildren(self) {
    var firstChild = self.ch[L];

    while (firstChild[R]) {
      firstChild.combineDir(R);
    }
  }

  _.focus = MathBlock.prototype.focus;
  _.isEmpty = MathBlock.prototype.isEmpty;
});

/**
 * Piece of plain text, with a TextBlock as a parent and no children.
 * Wraps a single DOMTextNode.
 * For convenience, has a .text property that's just a JavaScript string
 * mirroring the text contents of the DOMTextNode.
 * Text contents must always be nonempty.
 */
var TextPiece = P(Node, function(_, _super) {
  _.init = function(text) {
    _super.init.call(this);
    this.text2 = text;
  };
  _.jQadd = function(dom) { this.dom = dom; this.jQ = $(dom); };
  _.jQize = function() {
    return this.jQadd(document.createTextNode(this.text2));
  };
  _.appendText = function(text) {
    this.text2 += text;
    this.dom.appendData(text);
  };
  _.prependText = function(text) {
    this.text2 = text + this.text2;
    this.dom.insertData(0, text);
  };
  _.appendTextInDir = function(text, dir) {
    if (dir === R) this.appendText(text);
    else this.prependText(text);
  };

  function endChar(dir, text) {
    return text.charAt(dir === L ? 0 : -1 + text.length);
  }

  _.moveTowards = function(dir, cursor) {
    var ch = endChar(-dir, this.text2)

    var from = this[-dir];
    if (from) from.appendTextInDir(ch, dir);
    else TextPiece(ch).createDir(-dir, cursor);

    return this.deleteTowards(dir, cursor);
  };

  _.combineDir = function(dir) {
    var toCombine = this[dir];

    this.appendTextInDir(toCombine.text2, dir);
    toCombine.remove();
  };

  _.latex = function() { return this.text2; };
  _.text = function() { return this.text2; };
  _.html = function() { return this.text2; };

  _.deleteTowards = function(dir, cursor) {
    if (this.text2.length > 1) {
      if (dir === R) {
        this.dom.deleteData(0, 1);
        this.text2 = this.text2.slice(1);
      }
      else {
        // note that the order of these 2 lines is annoyingly important
        // (the second line mutates this.text.length)
        this.dom.deleteData(-1 + this.text2.length, 1);
        this.text2 = this.text2.slice(0, -1);
      }
    }
    else {
      this.remove();
      this.jQ.remove();
      cursor[dir] = 0;
    }
  };

  // -*- selection methods -*- //

  // there's gotta be a better way to move the cursor...
  function insertCursorAdjacent(dir, cursor, el) {
    cursor[-dir] = el;
    cursor[dir] = el[dir];
    cursor.hide().show();
  }

  _.createSelection = function(dir, cursor) {
    var selectedPiece = TextPiece(endChar(-dir, this.text2));
    this.deleteTowards(dir, cursor);
    selectedPiece.createDir(dir, cursor);

    cursor.selection = Selection(selectedPiece);

    insertCursorAdjacent(dir, cursor, selectedPiece);
  }

  _.clearSelection = function(dir, cursor) {
    // cursor calls our clearSelection every time because the selection
    // only every contains one Node.
    if (this.text2.length > 1) return this.retractSelection(dir, cursor);

    var cursorSibling = this;

    if (this[-dir]) {
      cursorSibling = this[-dir];
      cursorSibling.combineDir(dir);
    }

    insertCursorAdjacent(dir, cursor, cursorSibling);

    cursor.clearSelection();
  };

  _.expandSelection = function(dir, cursor) {
    var selectedPiece = cursor.selection.ends[L];
    var selectChar = endChar(-dir, this.text2);
    selectedPiece.appendTextInDir(selectChar, dir);
    this.deleteTowards(dir, cursor);
  };

  _.retractSelection = function(dir, cursor) {
    var deselectChar = endChar(-dir, this.text2);

    if (this[-dir]) {
      this[-dir].appendTextInDir(deselectChar, dir);
    }
    else {
      TextPiece(deselectChar).createDir(-dir, cursor);
    }

    this.deleteTowards(dir, cursor);
  };
});

// in GeoGebraWeb this is harmful!
//CharCmds.$ =

LatexCmds.text =
LatexCmds.textnormal =
LatexCmds.textrm =
LatexCmds.textup =
LatexCmds.textmd = TextBlock;

function makeTextBlock(latex, tagName, attrs) {
  return P(TextBlock, {
    ctrlSeq: latex,
    htmlTemplate: '<'+tagName+' '+attrs+'>&0</'+tagName+'>'
  });
}

function makeQuotationText() {
  return P(TextBlock, {
	ctrlSeq: '{',
	endSeq: '}',
	htmlTemplate: ''
    //ctrlSeq: '\\quotationtext',
    //htmlTemplate: '&0'
  });
}

// hack to make CharCmds['"'] work in GeoGebraWeb history
//LatexCmds.quotationtext = makeQuotationText();

LatexCmds.textotherwise =
  makeTextBlock('\\textotherwise', 'span', 'class="text"');

LatexCmds.sf = LatexCmds.textsf =
  makeTextBlock('\\textsf', 'span', 'class="sans-serif text"');
LatexCmds.tt = LatexCmds.texttt =
  makeTextBlock('\\texttt', 'span', 'class="monospace text"');
LatexCmds.textsc =
  makeTextBlock('\\textsc', 'span', 'style="font-variant:small-caps" class="text"');
LatexCmds.uppercase =
  makeTextBlock('\\uppercase', 'span', 'style="text-transform:uppercase" class="text"');
LatexCmds.lowercase =
  makeTextBlock('\\lowercase', 'span', 'style="text-transform:lowercase" class="text"');
// Parser MathCommand
var latexMathParser = (function() {
  function commandToBlock(cmd) {
    var block = MathBlock();
    cmd.adopt(block, 0, 0);
    return block;
  }
  function joinBlocks(blocks) {
    var firstBlock = blocks[0] || MathBlock();

    for (var i = 1; i < blocks.length; i += 1) {
      blocks[i].children().adopt(firstBlock, firstBlock.ch[R], 0);
    }

    return firstBlock;
  }

  var string = Parser.string;
  var regex = Parser.regex;
  var letter = Parser.letter;
  var any = Parser.any;
  var optWhitespace = Parser.optWhitespace;
  var succeed = Parser.succeed;
  var fail = Parser.fail;

  // Parsers yielding MathCommands
  var variable = letter.map(Variable);
  var symbol = regex(/^[^${}\\_^]/).map(VanillaSymbol);

  var controlSequence =
    regex(/^[^\\]/)
    .or(string('\\').then(
      regex(/^[a-z]+/i)
      .or(regex(/^\s+/).result(' '))
      .or(any)
    )).then(function(ctrlSeq) {
      var cmdKlass = LatexCmds[ctrlSeq];

      if (cmdKlass) {
        return cmdKlass(ctrlSeq).parser();
      }
      else {
        return fail('unknown command: \\'+ctrlSeq);
      }
    })
  ;

  var command =
    controlSequence
    .or(variable)
    .or(symbol)
  ;

  // Parsers yielding MathBlocks
  var mathGroup = string('{').then(function() { return mathSequence; }).skip(string('}'));
  var mathBlock = optWhitespace.then(mathGroup.or(command.map(commandToBlock)));
  var mathSequence = mathBlock.many().map(joinBlocks).skip(optWhitespace);

  var optMathBlock =
    string('[').then(
      mathBlock.then(function(block) {
        return block.join('latex') !== ']' ? succeed(block) : fail();
      })
      .many().map(joinBlocks).skip(optWhitespace)
    ).skip(string(']'))
  ;

  var latexMath = mathSequence;

  latexMath.block = mathBlock;
  latexMath.optBlock = optMathBlock;
  return latexMath;
})();
/********************************************
 * Cursor and Selection "singleton" classes
 *******************************************/

/* The main thing that manipulates the Math DOM. Makes sure to manipulate the
HTML DOM to match. */

/* Sort of singletons, since there should only be one per editable math
textbox, but any one HTML document can contain many such textboxes, so any one
JS environment could actually contain many instances. */

//A fake cursor in the fake textbox that the math is rendered in.
var Cursor = P(Point, function(_) {
  _.init = function(root) {
    this.parent = this.root = root;
    var jQ = this.jQ = this._jQ = $('<span class="cursor">&zwj;</span>');

    //closured for setInterval
    this.blink = function(){ jQ.toggleClass('blink'); }

    this.upDownCache = {};
  };
  _.fix3bug = function(text) {
    // we shall change every a/b division to \frac{a}{b}
    // in complex formulas this is complex, so needs parsing
    // using depth is the easiest algorithm that comes to
    // my mind again! just like in case of fix2bug, fixabug
    // but NOTE TODO that it is probably not perfect in all cases!
    // especially the case of Quotations shall be taken care of
	var ret = '';//?

    var str = text;
    var depth = 0;
    var substrPerDepth = new Array();
    var depthsArray = new Array();
    var numberOfUnclosedFromLeft = new Array();
    var numberOfUnclosedFromRight = new Array();
    var depthsLast = 0;
    substrPerDepth[depthsLast] = '';
    depthsArray[depthsLast] = depth;//0,0
    numberOfUnclosedFromLeft[depthsLast] = 0;// fill this later
    numberOfUnclosedFromRight[depthsLast] = 0;// fill this later
    var lv;
    // at first let's fill the arrays then comes the main algorithm
    for (lv = 0; lv < str.length; lv++) {
      // NOTE: this algorithm might not be perfect in some cases
      // e.g. when there are single ( and ) in Quotation, etc.
      // that is not a pair of anything, etc. so this needs to
      // be tested more!
      if (str.charAt(lv) === '(' ||
    	  str.charAt(lv) === '[' ||
    	  str.charAt(lv) === '{') {
    	// when a closing sign comes, then at a right syntax
    	// it should also correspond to the opening sign,
    	// in theory, except cases I mentioned in NODE TODO
    	depth++;
    	depthsLast++;
        substrPerDepth[depthsLast] = str.charAt(lv);
        depthsArray[depthsLast] = depth;
        numberOfUnclosedFromLeft[depthsLast] = 0;// fill this later
        numberOfUnclosedFromRight[depthsLast] = 0;// fill this later
      	depth++;
      	depthsLast++;
      	depthsArray[depthsLast] = depth;
        numberOfUnclosedFromLeft[depthsLast] = 0;// fill this later
        numberOfUnclosedFromRight[depthsLast] = 0;// fill this later
      } else if (str.charAt(lv) === ')' ||
    		     str.charAt(lv) === ']' ||
    		     str.charAt(lv) === '}') {
       	depth--;
       	depthsLast++;
        substrPerDepth[depthsLast] = str.charAt(lv);
        depthsArray[depthsLast] = depth;
        numberOfUnclosedFromLeft[depthsLast] = 0;// fill this later
        numberOfUnclosedFromRight[depthsLast] = 0;// fill this later
    	depth--;
    	depthsLast++;
    	depthsArray[depthsLast] = depth;
        numberOfUnclosedFromLeft[depthsLast] = 0;// fill this later
        numberOfUnclosedFromRight[depthsLast] = 0;// fill this later
      } else {
        substrPerDepth[depthsLast] += str.charAt(lv);
        // already registered in theory
        //depthsArray[depthsLast] = depth;
      }
    }
    // now we shall have substrPerDepth and depthsArray arrays
    // as input, based on these, we can replace strings, and
    // then join the arrays back together

    var checkstr, lv2, firstTimePlaceholderBoolean;
    //var lvsArray;
    var leftlimit, rightlimit, a, b, newS;
    for (lv = 0; lv < depthsArray.length; lv++) {
      checkstr = substrPerDepth[lv];
      depth = depthsArray[lv];

      // maybe use this instead of keeping placeholders?
      // numberOfUnclosedFromLeft, numberOfUnclosedFromRight

      // now we shall check, whether this string is interrupted
      // by some higher depth, and then the control returns
      // to it later, because in that case we shall add that
      // also to checkstr
      /*
      lv2 = lv + 1;
      firstTimePlaceholderBoolean = true;
      while (lv2 < depthsArray.length) {
    	if (depthsArray[lv2] === depth) {
          checkstr += substrPerDepth[lv2];
          firstTimePlaceholderBoolean = true;
        } else if (depthsArray[lv2] > depth) {
    	  // if depth is increasing, then we join these
    	  // characters to one irrelevant symbol... or
    	  // to preserve the length of string and string
    	  // indexes for making later replacements easier,
    	  // it's better to put space at these places...

    	  // except one place...
    	  if (firstTimePlaceholderBoolean) {
    	    checkstr += 'X';
    	    firstTimePlaceholderBoolean = false;
    	  } else {
    	    checkstr += ' ';
          }
        } else {
    	  // only when depth is dimishing, we shall halt
    	  break;
        }
        lv2++;
      }
      firstTimePlaceholderBoolean = true;
      // now checkstr has the same number of characters
      // as if we put together corresponding substrPerDepth
      // this shall be useful when doing replacements later!
      
      // maybe use no placeholders either?
      */

      // but run the following algorithm on checkstr as if
      // it were ready, and remember if no +-, comes for the
      // next depth! e.g. in lvsArray booleans?

      // now we have the checkstr in theory, in which
  	  // we can replace a/b to \frac{a}{b} without problems

      /*
      rightlimit = 0;
      leftlimit = 0;
  	  while ((lv2 = checkstr.indexOf('/', rightlimit)) !== -1) {
  	    // at the two sides of / we shall go until "+", "-" or ","
  	    leftlimit = lv2;
  	    while (leftlimit >= 0) {
          if ((checkstr.charAt(leftlimit) === '+') ||
  		      (checkstr.charAt(leftlimit) === '-') ||
  			  (checkstr.charAt(leftlimit) === ',')) {
  	        leftlimit++;
  		    break;
  		  }
  		  leftlimit--;
  	    }
  	    rightlimit = lv2;
  	    // maybe indexOf is quicker algorithm, but this
  	    // is easier (takes less paid working time):
        while (rightlimit < checkstr.length) {
          if ((checkstr.charAt(rightlimit) === '+') ||
              (checkstr.charAt(rightlimit) === '-') ||
              (checkstr.charAt(rightlimit) === ',')) {
    		rightlimit--;
    		break;
    	  }
    	  rightlimit++;
        }
        a = checkstr.substring(leftlimit, lv2);
        b = checkstr.substring(lv2 + 1, rightlimit + 1);
        newS = '\\frac{' + a + '}{' + b + '}';
        // but... if we replace a/b by newS, then the
        // number of characters in checkstr will change!
        // that's why the result should be gathered in
        // a different return string AND indexes shall
        // go from the ends of the strings towards their
        // beginning...
      }
      */
    }
    return ret;
  };
  _.fix2bug = function(text) {
    var str = text;
    var depth = 0;
    var boolPerDepth = new Array();
    boolPerDepth[0] = false;//does not make sense
    var lastchar = '';
    var ret = "";
    while (str.length > 0) {
      // NOTE: this algorithm might not be perfect in some cases
      // e.g. when there are single ( and ) in Quotation, etc.
      // that is not a pair of anything, etc. so this needs to
      // be tested more!
      if (str.charAt(0) === '(') {
        str = str.substring(1);
    	depth++;
    	// maybe override later in this block
    	boolPerDepth[depth] = false;
    	if (lastchar === '^') {
    	  ret += '{';
    	  boolPerDepth[depth] = true;
    	  lastchar = '{';
    	//} else if (lastchar === '/') {
        // maybe we could change a/(x+1) to
    	// \frac{a}{x+1} here, but it would
    	// be quite complex and we have to
    	// rethink this method anyway, to avoid
    	// bugs, so I think we can say that
    	// this is ready the "dirty buggy way"
    	// and we can start implementing the
    	// "perfect" solution instead
    	} else {
    	  ret += '(';
    	  lastchar = '(';
    	}
      } else if (str.charAt(0) === ')') {
    	str = str.substring(1);
    	if (boolPerDepth[depth] === true) {
    	  // means we need a \\right\\ added
    	  ret += '}';
      	  lastchar = '}';
    	} else {
    	  ret += ')';
      	  lastchar = ')';
    	}
      	// data for this depth is not reliable anyway
      	boolPerDepth[depth] = false;
    	depth--;
      } else if (str.charAt(0) === '\\') {
    	// if this is followed by a ( or ),
    	// then let's ignore that anyway, because
    	// it seems to be harmful for the code!
      	lastchar = '\\';
    	str = str.substring(1);
    	if (str.length > 0) {
    	  if (str.charAt(0) === '(' ||
    		  str.charAt(0) === ')' ||
    		  str.charAt(0) === '[' ||
    		  str.charAt(0) === ']') {
    		// in this case, do not add lastchar (ignore)
    		// otherwise add it...
    		continue;
    	  }
    	}
    	ret += lastchar;
      } else {
    	lastchar = str.substring(0,1);
    	str = str.substring(1);
    	ret += lastchar;
      }
    }
    return ret;
  };
  _.fixabug = function(text) {
    var str = text;
    var depth = 0;
    var boolPerDepth = new Array();
    boolPerDepth[0] = false;//does not make sense
    var lastchar = '';
    var ret = "";
    while (str.length > 0) {
      // NOTE: this algorithm might not be perfect in some cases
      // e.g. when there are single { and } in Quotation, etc.
      // that is not a pair of anything, etc. so this needs to
      // be tested more!
      if (str.charAt(0) === '{') {
    	str = str.substring(1);
    	depth++;
    	// maybe override later in this block
    	boolPerDepth[depth] = false;
        var lastcc = lastchar.charCodeAt(0);
        if (lastcc >= 65 && lastcc <= 90) {
          // ASCII A-Z OK
          ret += '{';
        } else if (lastcc >= 97 && lastcc <= 122) {
          // we shall also accept lowercase, as this method
          // is also called from somewhere else!
          ret += '{';
        } else if (lastcc >= 48 && lastcc <= 57) {
          // ASCII 0-9 maybe OK (?)
          ret += '{';
        } else if ((lastchar === '^') || (lastchar === '_')) {
          // in this case the syntax is important to
          // leave this intact, so:
          ret += '{';
        } else if (lastchar === '\\') {
          // it might be \\left\\{ or just \\{
          // we need to add \\left in case or just \\{
          if (ret.substr(-6) === '\\left\\') {
            ret += '{';
          } else {
        	// in the end of ret, change \\ to \\left\\
        	// which actually means just adding "left\\"
        	// and in this iteration we also add "{"
        	ret += 'left\\{';
        	boolPerDepth[depth] = 51;
          }
        } else {
          // TODO: also check for Korean!
          // else branch shall do the actual thing!
          ret += '\\left\\{';
          boolPerDepth[depth] = true;
        }
    	lastchar = '{';
      } else if (str.charAt(0) === '}') {
    	str = str.substring(1);
    	if (boolPerDepth[depth] === true) {
    	  // means we need a \\right\\ added
    	  ret += '\\right\\}';
    	} else if (boolPerDepth[depth] === 51) {
    	  ret += 'right\\}';
    	} else {
    	  ret += '}';
    	}
      	// data for this depth is not reliable anyway
      	boolPerDepth[depth] = false;
    	depth--;
    	lastchar = '}';
      } else {
    	lastchar = str.substring(0,1);
    	str = str.substring(1);
    	ret += lastchar;
      }
    }
    return ret;
  };
  _.substQuotations = function(text) {
    // " either means '"' or '\\quotation{' / '}', so we have to convert
    // " to the right meaning, which depends on:
    // - is there \\quotation used elsewhere? then no substitution inside
    // - outside of \\quotation, outermost " should be converted to that
    var text2 = text;
    var text3 = "";
    var inside1 = false;// inside \\quotation
    var inside2 = false;// inside " "
    var lastchar = '';
    while (text2.length > 0) {
      if (text2.substring(0,1) === '"') {
        text2 = text2.substring(1);
        if (inside1) {
          text3 += '"';
          lastchar = '"';
        } else if (inside2) {
          if (lastchar === '\\') {
          	// lastchar should not have happened,
          	// let's erase the last char of text3
        	//if (text3.length) {//comes from lastchar
        	  text3 = text3.substring(0, text3.length - 1);
        	//}
          }
          text3 += '}';
          inside2 = false;
          lastchar = '}';
        } else {
          if (lastchar === '\\') {
        	// lastchar should not have happened,
        	// let's erase the last char of text3
        	// before adding \\quotation{, or
        	// even better than that:
        	text3 += 'quotation{';
          } else {
            text3 += '\\quotation{';
          }
          inside2 = true;
          lastchar = '{';
        }
      } else if ((text2.length >= 11) && (text2.substring(0,11) === '\\quotation{')) {
        lastchar = '{';
        text2 = text2.substring(11);
        if (inside1) {
          text3 += '\\quotation{';
        } else if (inside2) {
          // this should not happen in theory, by the way!
          text3 += '\\quotation{';
        } else {
          text3 += '\\quotation{';
          inside1 = true;
        }
      } else if (text2.substring(0,1) === '}') {
        lastchar = '}';
        text2 = text2.substring(1);
        if (inside1) {
          // for better syntax, we need to escape this!
          // but we can only escape this in a right way
          // when we're not using the \\quotation syntax,
          // since this could be ambiguous:
          // \\quotation{ \frac{3}{5} } would close it early
          // so the best solution will be just to copy the LaTeX
          // in the "\frac{3}{5}" format, and users need not know
          // about the quotation syntax at all...
          // in short - this should only happen if users want bugs
          text3 += '}';
          inside1 = false;
        } else if (inside2) {
          // so, here we are!!! escape!
          text3 += '\\}';
        } else {
          // this should not happen in theory, by the way
          text3 += '}';
        }
      } else {
        lastchar = text2.substring(0,1);
        text2 = text2.substring(1);
        text3 += lastchar;
      }
    }
    return text3;
  };
  _.hasSelection = function(){
	  return !!this.selection;
  }
  _.show = function() {
    this.jQ = this._jQ.removeClass('blink');
    if ('intervalId' in this) //already was shown, just restart interval
      clearInterval(this.intervalId);
    else { //was hidden and detached, insert this.jQ back into HTML DOM
      if (this[R]) {
        if (this.selection && this.selection.ends[L][L] === this[L])
          this.jQ.insertBefore(this.selection.jQ);
        else
          this.jQ.insertBefore(this[R].jQ.first());
      }
      else
        this.jQ.appendTo(this.parent.jQ);
      this.parent.focus();
    }
    this.intervalId = setInterval(this.blink, 500);
    return this;
  };
  _.hide = function() {
    if ('intervalId' in this)
      clearInterval(this.intervalId);
    delete this.intervalId;
    this.jQ.detach();
    this.jQ = $();
    return this;
  };

  _.withDirInsertAt = function(dir, parent, withDir, oppDir) {
	this.checkColorCursor(false);
    var oldParent = this.parent;
    this.parent = parent;
    this[dir] = withDir;
    this[-dir] = oppDir;
    oldParent.blur();
    this.checkColorCursor(true);
  };
  _.insertAdjacent = function(dir, el) {
    this.withDirInsertAt(dir, el.parent, el[dir], el);
    this.parent.jQ.addClass('hasCursor');
    jQinsertAdjacent(dir, this.jQ, jQgetExtreme(dir, el.jQ));
    return this;
  };
  _.insertBefore = function(el) { return this.insertAdjacent(L, el); };
  _.insertAfter = function(el) { return this.insertAdjacent(R, el); };

  _.appendDir = function(dir, el) {
    this.withDirInsertAt(dir, el, 0, el.ch[dir]);

    // never insert before textarea
    if (dir === L && el.textarea) {
      jQinsertAdjacent(-dir, this.jQ, el.textarea);
    } else {
      jQappendDir(dir, this.jQ, el.jQ);
    }

    el.focus();

    return this;
  };
  _.prependTo = function(el) { return this.appendDir(L, el); };
  _.appendTo = function(el) { return this.appendDir(R, el); };

  _.escapeDir = function(dir, key, e) {
    // always prevent default of Spacebar, but only prevent default of Tab if
    // not in the root editable
    if (key === 'Spacebar' || this.parent !== this.root) {
      e.preventDefault();
    }

    // want to be a noop if in the root editable (in fact, Tab has an unrelated
    // default browser action if so)
    if (this.parent === this.root) return;

    this.checkColorCursor(false);
    clearUpDownCache(this);
    this.show().clearSelection();
    this.parent.moveOutOf(dir, this);
    this.checkColorCursor(true);
  };

  _.moveDirWithin = function(dir, block) {
    this.checkColorCursor(false);
    if (this[dir]) this[dir].moveTowards(dir, this);
    else if (this.parent !== block) this.parent.moveOutOf(dir, this);
    this.checkColorCursor(true);
  };
  _.moveLeftWithin = function(block) {
    return this.moveDirWithin(L, block);
  };
  _.moveRightWithin = function(block) {
    return this.moveDirWithin(R, block);
  };
  _.moveDir = function(dir) {
    clearUpDownCache(this);

    if (this.selection)  {
      this.insertAdjacent(dir, this.selection.ends[dir]).clearSelection();
    }
    else {
      this.moveDirWithin(dir, this.root);
    }

    return this.show();
  };
  _.moveLeft = function() { return this.moveDir(L); };
  _.moveRight = function() { return this.moveDir(R); };

  /**
   * moveUp and moveDown have almost identical algorithms:
   * - first check next and prev, if so prepend/appendTo them
   * - else check the parent's 'upOutOf'/'downOutOf' property:
   *   + if it's a function, call it with the cursor as the sole argument and
   *     use the return value as if it were the value of the property
   *   + if it's undefined, bubble up to the next ancestor.
   *   + if it's false, stop bubbling.
   *   + if it's a Node, jump up or down to it
   */
  _.moveUp = function() { return moveUpDown(this, 'up'); };
  _.moveDown = function() { return moveUpDown(this, 'down'); };
  function moveUpDown(self, dir) {
    self.checkColorCursor(false);
    var dirInto = dir+'Into', dirOutOf = dir+'OutOf';
    if (self[R][dirInto]) self.prependTo(self[R][dirInto]);
    else if (self[L][dirInto]) self.appendTo(self[L][dirInto]);
    else {
      var ancestor = self.parent;
      do {
        var prop = ancestor[dirOutOf];
        if (prop) {
          if (typeof prop === 'function') prop = ancestor[dirOutOf](self);
          if (prop === false) break;
          if (prop instanceof Node) {
            self.jumpUpDown(ancestor, prop);
            break;
          }
        }
        ancestor = ancestor.parent;
      } while (ancestor !== self.root);
    }
    var ret = self.clearSelection().show();
    self.checkColorCursor(true);
    return ret;
  }
  /**
   * jump up or down from one block Node to another:
   * - cache the current Point in the node we're jumping from
   * - check if there's a Point in it cached for the node we're jumping to
   *   + if so put the cursor there,
   *   + if not seek a position in the node that is horizontally closest to
   *     the cursor's current position
   */
  _.jumpUpDown = function(from, to) {
    this.checkColorCursor(false);
    var self = this;
    self.upDownCache[from.id] = Point(self.parent, self[L], self[R]);
    var cached = self.upDownCache[to.id];
    if (cached) {
      cached[R] ? self.insertBefore(cached[R]) : self.appendTo(cached.parent);
    }
    else {
      var pageX = offset(self).left;
      self.appendTo(to).seekHoriz(pageX, to);
    }
    this.checkColorCursor(true);
  };
  _.checkColorCursor = function(addColor) {
    // before moving: remove highlighting from old element (addColor === false)
	// after moving: add highlighting to new element (addColor === true)
	// note: when (addColor === true), stop after one coloring!
	// and: the priority of the colorings: this[R], this[L], this.parent.parent
	// so we also need a variable...
	var onTheEdgeNeedsParent = false;
    if (this[R]) {
      if ((this[R] instanceof Bracket) || (this[R] instanceof CloseBracket)) {
        // |( remove highlight style from this[R]
        this[R].setColoring(addColor === true);
        if (addColor) {
          return;
        }
      }
    } else {
      onTheEdgeNeedsParent = true;
    }
    if (this[L]) {
      if ((this[L] instanceof Bracket) || (this[L] instanceof CloseBracket)) {
        // (| remove highlight style from this[L]
        this[L].setColoring(addColor === true);
        if (addColor) {
          return;
        }
      }
    } else {
      onTheEdgeNeedsParent = true;
    }

    if (onTheEdgeNeedsParent === true) {
      if (this.parent) {
        if (this.parent.parent) {
          if ((this.parent.parent instanceof Bracket) || (this.parent.parent instanceof CloseBracket)) {
            // |( remove highlight style from this.parent.parent
            this.parent.parent.setColoring(addColor === true);
          }
        }
      }
    }
  };
  _.seek = function(target, pageX, pageY) {
    this.checkColorCursor(false);
    var cursor = this;
    clearUpDownCache(cursor);

    var nodeId = target.attr(mqBlockId) || target.attr(mqCmdId);
    if (!nodeId) {
      var targetParent = target.parent();
      nodeId = targetParent.attr(mqBlockId) || targetParent.attr(mqCmdId);
    }
    var node = nodeId ? Node.byId[nodeId] : cursor.root;

    // target could've been selection span, so get node from target before
    // clearing selection
    cursor.clearSelection().show();

    node.seek(pageX, cursor);
    this.checkColorCursor(true);
    return cursor;
  };
  _.seekHoriz = function(pageX, block) {
    this.checkColorCursor(false);
    //move cursor to position closest to click
    var cursor = this;
    var dist = offset(cursor).left - pageX;
    var prevDist;

    do {
      cursor.moveLeftWithin(block);
      prevDist = dist;
      dist = offset(cursor).left - pageX;
    }
    while (dist > 0 && (cursor[L] || cursor.parent !== block));

    if (-dist > prevDist) cursor.moveRightWithin(block);
    this.checkColorCursor(true);
    return cursor;
  };
  function offset(self) {
    //in Opera 11.62, .getBoundingClientRect() and hence jQuery::offset()
    //returns all 0's on inline elements with negative margin-right (like
    //the cursor) at the end of their parent, so temporarily remove the
    //negative margin-right when calling jQuery::offset()
    //Opera bug DSK-360043
    //http://bugs.jquery.com/ticket/11523
    //https://github.com/jquery/jquery/pull/717
    var offset = self.jQ.removeClass('cursor').offset();
    self.jQ.addClass('cursor');
    return offset;
  }
  _.writeLatexSafe = function(mort) {
    // at first we should decide whether to call writeLatex,
	// or we're in a TextBlock, and call it's onText?
    var self = this;
    // if we're in a Quotation, then the parent of the cursor
    // is probably a TextBlock (or maybe a TextPiece, so
    // cursor.parent.parent is a TextBlock, but it will not
    // be too far away e.g. parent.parent.parent.parent...)
    // because putting latex inside TextBlock should be illegal
    if (this.parent instanceof TextBlock) {
      self.parent.bubble('onText', self, mort);
      return false;
    } else if ((this.parent.parent) && (this.parent.parent instanceof TextBlock)) {
      self.parent.bubble('onText', self, mort);
      return false;
    }
    var mrt = mort;
    if (this.root) {
      var triple = mort;
      var numadded = 0;
      if (this[L] && (this[L] instanceof Symbol)) {
        if (this[L].ctrlSeq) {
          if (this[L].ctrlSeq.length === 1) {
            triple = this[L].ctrlSeq + triple;
            numadded++;
            if (this[L][L] && (this[L][L] instanceof Symbol)) {
              if (this[L][L].ctrlSeq) {
                if (this[L][L].ctrlSeq.length === 1) {
                  triple = this[L][L].ctrlSeq + triple;
                  numadded++;
                }
              }
            }
          }
        }
      }
      var tripleL = triple.length;
      // this may be 0-1-2 characters more than mort.length
      // but in case it's really more, try to merge!
      // moreover, merge ANYWAY, if (tripleL > 1)!
      if (tripleL > 1) {
        triple = this.root.mergeKoreanDoubles(triple);
        if (tripleL != triple.length) {
          mrt = triple;
          for (var cv = 0; cv < numadded; cv++) {
            this.backspace();
          }
        }
      }
    }
    this.writeLatex(mrt).show();
    return true;
  };
  _.writeLatex = function(latex) {
	  this.checkColorCursor(false);
    var self = this;
    clearUpDownCache(self);
    self.show().deleteSelection();

    var all = Parser.all;
    var eof = Parser.eof;

    var block = latexMathParser.skip(eof).or(all.result(false)).parse(latex);

    if (block) {
      block.children().adopt(self.parent, self[L], self[R]);
      block.jQize().insertBefore(self.jQ);
      self[L] = block.ch[R];
      block.finalizeInsert();
      self.parent.bubble('redraw');
    }
    this.checkColorCursor(true);
    return this.hide();
  };
  _.write = function(ch) {
    this.checkColorCursor(false);
    var seln = this.prepareWrite();
    var ret = this.insertCh(ch, seln);
    this.checkColorCursor(true);
    return ret;
  };
  _.insertCh = function(ch, replacedFragment) {
    this.parent.write(this, ch, replacedFragment);
    return this;
  };
  _.insertCmd = function(latexCmd, replacedFragment) {
    this.checkColorCursor(false);
    var cmd = LatexCmds[latexCmd];
    if (cmd) {
      cmd = cmd(latexCmd);
      if (replacedFragment) cmd.replaces(replacedFragment);
      cmd.createBefore(this);
    }
    else {
      cmd = TextBlock();
      cmd.replaces(latexCmd);
      cmd.ch[L].focus = function(){ delete this.focus; return this; };
      cmd.createBefore(this);
      this.insertAfter(cmd);
      if (replacedFragment)
        replacedFragment.remove();
    }
    this.checkColorCursor(true);
    return this;
  };
  _.unwrapGramp = function() {
    var gramp = this.parent.parent;
    var greatgramp = gramp.parent;
    var next = gramp[R];
    var cursor = this;

    var prev = gramp[L];
    gramp.disown().eachChild(function(uncle) {
      if (uncle.isEmpty()) return;

      uncle.children()
        .adopt(greatgramp, prev, next)
        .each(function(cousin) {
          cousin.jQ.insertBefore(gramp.jQ.first());
        })
      ;

      prev = uncle.ch[R];
    });

    if (!this[R]) { //then find something to be next to insertBefore
      if (this[L])
        this[R] = this[L][R];
      else {
        while (!this[R]) {
          this.parent = this.parent[R];
          if (this.parent)
            this[R] = this.parent.ch[L];
          else {
            this[R] = gramp[R];
            this.parent = greatgramp;
            break;
          }
        }
      }
    }
    if (this[R])
      this.insertBefore(this[R]);
    else
      this.appendTo(greatgramp);

    gramp.jQ.remove();

    if (gramp[L])
      gramp[L].respace();
    if (gramp[R])
      gramp[R].respace();
  };
  _.deleteDir = function(dir) {
    this.checkColorCursor(false);
    clearUpDownCache(this);
    this.show();

    // deleteSelection shall be Okay as no selection
    // should select only part of a ggbtable!
    if (this.deleteSelection()); // pass
    // deleteTowards only calls createSelection,
    // which shall be Okay, or deletes symbols (OK)
    else if (this[dir]) this[dir].deleteTowards(dir, this);
    // deleteOutOf is fixed for MathBlock
    // otherwise it shall be Okay
    else if (this.parent !== this.root) this.parent.deleteOutOf(dir, this);
    // this way there may be a lot of empty
    // matrix cells, but it shall be Okay

    if (this[L])
      this[L].respace();
    if (this[R])
      this[R].respace();
    this.parent.bubble('redraw');
    this.checkColorCursor(true);
    return this;
  };
  _.backspace = function() { return this.deleteDir(L); };
  _.deleteForward = function() { return this.deleteDir(R); };
  _.selectFrom = function(anticursor) {
    // `this` cursor and the anticursor should be in the same tree, because
    // the mousemove handler attached to the document, unlike the one attached
    // to the root HTML DOM element, doesn't try to get the math tree node of
    // the mousemove target, and Cursor::seek() based solely on coordinates
    // stays within the tree of `this` cursor's root.
    var selection = Fragment.between(this, anticursor);

    var leftEnd = selection.ends[L];
    var rightEnd = selection.ends[R];
    var lca = leftEnd.parent;
    // apparently leftEnd and rightEnd are on the same level
    // and lca is their parent MathBlock...
    // but in case leftEnd or rightEnd is ggbtd or ggbtr,
    // then it's not good for us, so we have to select only
    // one element, the ggbtable!
    if (leftEnd.ctrlSeq) {
      if (leftEnd.ctrlSeq.indexOf('\\ggbtd') > -1) {
        if (lca && lca.parent && lca.parent.parent) {
          rightEnd = leftEnd = lca.parent;
          lca = leftEnd.parent;
        }
      }
      if (leftEnd.ctrlSeq.indexOf('\\ggbtr') > -1) {
        if (lca && lca.parent && lca.parent.parent) {
          rightEnd = leftEnd = lca.parent;
          lca = leftEnd.parent;
        }
      }
    } else {
      // e.g. TextPiece?
    }

    if (lca && lca.selectChildren) {
      lca.selectChildren(this.hide(), leftEnd, rightEnd);
      this.root.selectionChanged();
    }
  };
  _.selectDir = function(dir) {
    var self = this;
    clearUpDownCache(this);

    if (self[dir]) {
      var adjacent = self[dir],
          selection = self.selection;

      if (!selection) {
        adjacent.createSelection(dir, self);
      }
      else if (selection.ends[dir] === self[-dir]) {
        adjacent.expandSelection(dir, self);
      }
      else if (selection.ends[dir] === selection.ends[-dir]) {
        adjacent.clearSelection(dir, self);
      }
      else {
        adjacent.retractSelection(dir, self);
      }
    }
    else if (self.parent !== self.root) {
      self.parent.selectOutOf(dir, self);
    }

    self.root.selectionChanged();
  };
  _.selectLeft = function() { return this.selectDir(L); };
  _.selectRight = function() { return this.selectDir(R); };

  function clearUpDownCache(self) {
    self.upDownCache = {};
  }

  _.prepareMove = function() {
    clearUpDownCache(this);
    return this.show().clearSelection();
  };
  _.prepareEdit = function() {
    clearUpDownCache(this);
    return this.show().deleteSelection();
  };
  _.prepareWrite = function() {
    clearUpDownCache(this);
    return this.show().replaceSelection();
  };

  _.clearSelection = function() {
    if (this.selection) {
      this.selection.clear();
      delete this.selection;
      this.root.selectionChanged();
    }
    return this;
  };
  _.deleteSelection = function() {
    if (!this.selection) return false;

    // we shall only delete the selection
    // when it's not selecting parts of ggbtable,
    // but let's suppose this is the case here,
    // as selection bugs are already fixed...
    // and deleting a whole ggbtable is Okay.
    this[L] = this.selection.ends[L][L];
    this[R] = this.selection.ends[R][R];
    this.selection.remove();
    this.root.selectionChanged();
    return delete this.selection;
  };
  _.replaceSelection = function() {
    var seln = this.selection;
    if (seln) {
      this[L] = seln.ends[L][L];
      this[R] = seln.ends[R][R];
      delete this.selection;
    }
    return seln;
  };
});

var Selection = P(Fragment, function(_, _super) {
  _.init = function(first, last) {
    var seln = this;

    // just select one thing if only one argument
    _super.init.call(seln, first, last || first);

    seln.jQwrap(seln.jQ);
  };
  _.jQwrap = function(children) {
    this.jQ = children.wrapAll('<span class="selection"></span>').parent();
      //can't do wrapAll(this.jQ = $(...)) because wrapAll will clone it
  };
  _.adopt = function() {
    this.jQ.replaceWith(this.jQ = this.jQ.children());
    return _super.adopt.apply(this, arguments);
  };
  _.clear = function() {
    // using the browser's native .childNodes property so that we
    // don't discard text nodes.
    this.jQ.replaceWith(this.jQ[0].childNodes);
    return this;
  };
});
/*********************************************************
 * The actual jQuery plugin and document ready handlers.
 ********************************************************/

//The publicy exposed method of jQuery.prototype, available (and meant to be
//called) on jQuery-wrapped HTML DOM elements.
$.fn.mathquillggb = function(cmd, latex) {
  switch (cmd) {
  case 'redraw':
    return this.each(function() {
      var blockId = $(this).attr(mqBlockId),
        rootBlock = blockId && Node.byId[blockId];
      if (rootBlock) {
        (function postOrderRedraw(el) {
          el.eachChild(postOrderRedraw);
          if (el.redraw) el.redraw();
        })(rootBlock);
      }
    });
  case 'revert':
    return this.each(function() {
      var blockId = $(this).attr(mqBlockId),
        block = blockId && Node.byId[blockId];
      if (block && block.revert)
        block.revert();
    });
  case 'latex':
    if (arguments.length > 1) {
      return this.each(function() {
        var blockId = $(this).attr(mqBlockId),
          block = blockId && Node.byId[blockId];
        if (block)
          block.renderLatex(latex);
      });
    }

    var blockId = $(this).attr(mqBlockId),
      block = blockId && Node.byId[blockId];
    return block && block.latex();
  case 'text':
    var blockId = $(this).attr(mqBlockId),
      block = blockId && Node.byId[blockId];
    return block && block.text();
  case 'textpluscursor':
	var blockId = $(this).attr(mqBlockId),
	  block = blockId && Node.byId[blockId];
	var cursor = block && block.cursor;
	var ret = block && block.text();
	if (cursor && !cursor.hasSelection()) {
	  cursor.write('x');
	  ret = block && block.text();
	  cursor.backspace();
	}
	return ret;
  case 'html':
    return this.html().replace(/ ?hasCursor|hasCursor /, '')
      .replace(/ class=(""|(?= |>))/g, '')
      .replace(/<span class="?cursor( blink)?"?><\/span>/i, '')
      .replace(/<span class="?textarea"?( disabled="disabled")?><textarea><\/textarea><\/span>/i, '');
  case 'write':
    if (arguments.length > 1)
      return this.each(function() {
        var blockId = $(this).attr(mqBlockId),
          block = blockId && Node.byId[blockId],
          cursor = block && block.cursor;

        if (cursor)
          cursor.writeLatex(latex).parent.blur();
      });
    // do not mix different commands in any case
    return undefined;
  case 'simpaste':
    if (arguments.length > 1)
      return this.each(function() {
        var blockId = $(this).attr(mqBlockId),
          block = blockId && Node.byId[blockId],
          cursor = block && block.cursor;

        if (cursor)
          // "latex" is actually text
          cursor.parent.bubble('onText', cursor, latex);
      });
    // do not mix different commands in any case
    return undefined;
  case 'replace':
    // this function should replace the current 'word',
    // or the sequence of elements like in arguments[2]
	// to a latex string given in arguments[1]
	//var lx = arguments[1];// it is also called "latex"
	var cw = arguments[2];
	var original_arguments = arguments;
    if (arguments.length > 1)
	  return this.each(function() {
	    var blockId = $(this).attr(mqBlockId),
	        block = blockId && Node.byId[blockId],
	        cursor = block && block.cursor;

        if (cursor) {
          // first deleting the current word
          var ilen = cw.length;
          while (ilen > 0) {
        	  if ((cursor[L] instanceof Variable) ||
        	      (cursor[L] instanceof VanillaSymbol)) {
        		  cursor.backspace();
            	  ilen--;
        	  } else if (cursor[L] != 0)
        	  //if (cursor[L] instanceof MathCommand)
        	  {
        		  var cname = cursor[L].text().replace(/\W/g, '');
        		  cursor.backspace();
        		  if (cname && cname.length) {
        			  ilen -= cname.length;
        		  } else {
        			  // beware of infinite loop, but Okay to decrement
        			  // as there was a cursor.backspace() anyway
        			  // maybe console.log & break would be better here
        			  ilen--;
        		  }
        	  }else {
        		  return;
        	  }
          }

          // then writing the latex...
          // this seems to write GeoGebra command syntax help
          // as nicely as latex, so no problem here, but...
          var cursorWas = cursor;
          var latexWritingHappened = cursor.writeLatexSafe(latex);

          // maybe this is just for historical reasons?
          // copied from some other code and adapted...
          // but this turns out to be harmful!!!
          //cursorWas.parent.blur();

          // now we shall actualize GeoGebraSuggestionPopupCanShow
          if (cursor.root && latex.length) {
            var croot = cursor.root;
            if (croot.common) {
              var esi = croot.common;
              esi.GeoGebraSuggestionPopupCanShow = false;
              // in case of this was written in TextBlock,
              // leave GeoGebraSuggestionPopupCanShow false...
              if (latexWritingHappened) {
                // get the last character of latex, and check it
                var lastchar = latex.charCodeAt(latex.length - 1);
                if (latex.trim) {
                  // who supports IE8, etc?
                  var ltrim = latex.trim();
                  if (ltrim.length) {
                    lastchar = ltrim.charCodeAt(ltrim.length - 1);
                  }
                }
                croot.geogebraAutocompleteSuggestionCheck(lastchar);
        	  }
            }
          }

          if (original_arguments[3]) {// if this is a GeoGebra command suggestion

            // we should select the first part of latex which is between < and >
            var ilt = latex.indexOf('<');
            if (ilt >= 0) {
              var igt = latex.indexOf('>', ilt);
              var sublatex = latex.substring(ilt);
              if (igt >= 0) {
                // do something only in this case ... but note that
                // latex.length may be a wrong data to base our code upon...
                // so we shall count the number of < and > in the formula
                var ngt = sublatex.split('>').length - 1;
                // cursor is currently on the right-hand-side of 'latex'
                while (cursor[L]) {
                  if ((cursor[L] instanceof BinaryOperator) &&
                      (cursor[L].ctrlSeq === '>')) {
                    if (ngt > 1) {
                      ngt--;
                    } else {
                      break;
                    }
                  }
                  cursor.moveLeft();
                }
                // now the cursor should be on the right-hand-side
                // of the first '>' after the first '<'
                while (cursor[L]) {
                  if ((cursor[L] instanceof BinaryOperator) &&
                      (cursor[L].ctrlSeq === '<')) {
                    cursor.selectLeft();
                    break;
                  } else {
                    cursor.selectLeft();
                  }
                }
              }
            }
          }
        }
      });
    // do not mix different commands in any case
    return undefined;
  case 'matrixsize':
	// arguments[1] is called latex
    // 0 is nothing,
	// 1 is adding a row
	// 2 is removing a row
	// 3 is adding a column
	// 4 is removing a column
	if (latex) {
      return this.each(function() {
        var blockId = $(this).attr(mqBlockId),
            block = blockId && Node.byId[blockId],
            cursor = block && block.cursor;

        // in order to add a new row to the matrix,
        // we shall seek the matrix, the place of
        // which does not depend on the place of cursor
        var tableJQ = $(this).find('.spectable');
        //var tableID = $(tableJQ[0]).attr('mathquillggb-command-id');
        var tableID = $(tableJQ[0]).attr(mqCmdId);
        var tablock = tableID && Node.byId[tableID];

        // best is to implement it there and call its method
        switch (latex) {
        case 1:
        	// AddRow
        	tablock.addNewRow(cursor);
        	break;
        case 2:
        	// RemoveRow
        	tablock.removeRow(cursor);
        	break;
        case 3:
        	// AddColumn
        	tablock.addNewCol(cursor);
        	break;
        case 4:
        	// RemoveColumn
        	tablock.removeCol(cursor);
        	break;
        default:
        	break;
        }
      });
	}
    // do not mix different commands in any case
	return undefined;
  case 'cmd':
    if (arguments.length > 1)
      return this.each(function() {
        var blockId = $(this).attr(mqBlockId),
          block = blockId && Node.byId[blockId],
          cursor = block && block.cursor;

        if (cursor) {
          var seln = cursor.prepareWrite();
          if (/^\\[a-z]+$/i.test(latex)) cursor.insertCmd(latex.slice(1), seln);
          else cursor.insertCh(latex, seln);
          cursor.hide().parent.blur();
        }
      });
    // do not mix different commands in any case
    return undefined;
  default:
    var RootClass;
    if (cmd === 'textbox') RootClass = RootTextBlock;
    else if (cmd === 'eqnarray') RootClass = RootEqnArray;
    else RootClass = RootMathBlock;

    var textbox = cmd === 'textbox';
    var eqnarray = cmd === 'eqnarray';
    var editable = textbox || cmd === 'editable';

    return this.each(function() {
      createRoot($(this), RootClass(), textbox, editable);

      // [Jay]
      // XXX THIS SHIT IS HACKTASTICK XXX
      // Eqnarray b0rks when clicking or selecting.
      //
      // better things to do with this:
      // a) implement navigation/selection in eqnarray
      // b) make createRoot less monolithic, so we can override
      //    things such that these don't get bound, instead of
      //    unbinding them here.
      //
      // This line should be deleted when either a) or b) is
      // accomplished.
      if (cmd === 'eqnarray') $(this).unbind('.mathquillggb');
    });
  }
};

//set back the original namespace
jQuery.noConflict(true);
}());

//# sourceURL=mathquillggb.js