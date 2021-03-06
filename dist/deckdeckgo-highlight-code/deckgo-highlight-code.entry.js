import { r as registerInstance, c as createEvent, h, H as Host, g as getElement } from './index-61c78bfe.js';

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
}

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

function getCjsExportFromNamespace (n) {
	return n && n['default'] || n;
}

var prism = createCommonjsModule(function (module) {
/* **********************************************
     Begin prism-core.js
********************************************** */

var _self = (typeof window !== 'undefined')
	? window   // if in browser
	: (
		(typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope)
		? self // if in worker
		: {}   // if in node js
	);

/**
 * Prism: Lightweight, robust, elegant syntax highlighting
 * MIT license http://www.opensource.org/licenses/mit-license.php/
 * @author Lea Verou http://lea.verou.me
 */

var Prism = (function (_self){

// Private helper vars
var lang = /\blang(?:uage)?-([\w-]+)\b/i;
var uniqueId = 0;


var _ = {
	manual: _self.Prism && _self.Prism.manual,
	disableWorkerMessageHandler: _self.Prism && _self.Prism.disableWorkerMessageHandler,
	util: {
		encode: function (tokens) {
			if (tokens instanceof Token) {
				return new Token(tokens.type, _.util.encode(tokens.content), tokens.alias);
			} else if (Array.isArray(tokens)) {
				return tokens.map(_.util.encode);
			} else {
				return tokens.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\u00a0/g, ' ');
			}
		},

		type: function (o) {
			return Object.prototype.toString.call(o).slice(8, -1);
		},

		objId: function (obj) {
			if (!obj['__id']) {
				Object.defineProperty(obj, '__id', { value: ++uniqueId });
			}
			return obj['__id'];
		},

		// Deep clone a language definition (e.g. to extend it)
		clone: function deepClone(o, visited) {
			var clone, id, type = _.util.type(o);
			visited = visited || {};

			switch (type) {
				case 'Object':
					id = _.util.objId(o);
					if (visited[id]) {
						return visited[id];
					}
					clone = {};
					visited[id] = clone;

					for (var key in o) {
						if (o.hasOwnProperty(key)) {
							clone[key] = deepClone(o[key], visited);
						}
					}

					return clone;

				case 'Array':
					id = _.util.objId(o);
					if (visited[id]) {
						return visited[id];
					}
					clone = [];
					visited[id] = clone;

					o.forEach(function (v, i) {
						clone[i] = deepClone(v, visited);
					});

					return clone;

				default:
					return o;
			}
		},

		/**
		 * Returns the Prism language of the given element set by a `language-xxxx` or `lang-xxxx` class.
		 *
		 * If no language is set for the element or the element is `null` or `undefined`, `none` will be returned.
		 *
		 * @param {Element} element
		 * @returns {string}
		 */
		getLanguage: function (element) {
			while (element && !lang.test(element.className)) {
				element = element.parentElement;
			}
			if (element) {
				return (element.className.match(lang) || [, 'none'])[1].toLowerCase();
			}
			return 'none';
		},

		/**
		 * Returns the script element that is currently executing.
		 *
		 * This does __not__ work for line script element.
		 *
		 * @returns {HTMLScriptElement | null}
		 */
		currentScript: function () {
			if (typeof document === 'undefined') {
				return null;
			}
			if ('currentScript' in document) {
				return document.currentScript;
			}

			// IE11 workaround
			// we'll get the src of the current script by parsing IE11's error stack trace
			// this will not work for inline scripts

			try {
				throw new Error();
			} catch (err) {
				// Get file src url from stack. Specifically works with the format of stack traces in IE.
				// A stack will look like this:
				//
				// Error
				//    at _.util.currentScript (http://localhost/components/prism-core.js:119:5)
				//    at Global code (http://localhost/components/prism-core.js:606:1)

				var src = (/at [^(\r\n]*\((.*):.+:.+\)$/i.exec(err.stack) || [])[1];
				if (src) {
					var scripts = document.getElementsByTagName('script');
					for (var i in scripts) {
						if (scripts[i].src == src) {
							return scripts[i];
						}
					}
				}
				return null;
			}
		}
	},

	languages: {
		extend: function (id, redef) {
			var lang = _.util.clone(_.languages[id]);

			for (var key in redef) {
				lang[key] = redef[key];
			}

			return lang;
		},

		/**
		 * Insert a token before another token in a language literal
		 * As this needs to recreate the object (we cannot actually insert before keys in object literals),
		 * we cannot just provide an object, we need an object and a key.
		 * @param inside The key (or language id) of the parent
		 * @param before The key to insert before.
		 * @param insert Object with the key/value pairs to insert
		 * @param root The object that contains `inside`. If equal to Prism.languages, it can be omitted.
		 */
		insertBefore: function (inside, before, insert, root) {
			root = root || _.languages;
			var grammar = root[inside];
			var ret = {};

			for (var token in grammar) {
				if (grammar.hasOwnProperty(token)) {

					if (token == before) {
						for (var newToken in insert) {
							if (insert.hasOwnProperty(newToken)) {
								ret[newToken] = insert[newToken];
							}
						}
					}

					// Do not insert token which also occur in insert. See #1525
					if (!insert.hasOwnProperty(token)) {
						ret[token] = grammar[token];
					}
				}
			}

			var old = root[inside];
			root[inside] = ret;

			// Update references in other language definitions
			_.languages.DFS(_.languages, function(key, value) {
				if (value === old && key != inside) {
					this[key] = ret;
				}
			});

			return ret;
		},

		// Traverse a language definition with Depth First Search
		DFS: function DFS(o, callback, type, visited) {
			visited = visited || {};

			var objId = _.util.objId;

			for (var i in o) {
				if (o.hasOwnProperty(i)) {
					callback.call(o, i, o[i], type || i);

					var property = o[i],
					    propertyType = _.util.type(property);

					if (propertyType === 'Object' && !visited[objId(property)]) {
						visited[objId(property)] = true;
						DFS(property, callback, null, visited);
					}
					else if (propertyType === 'Array' && !visited[objId(property)]) {
						visited[objId(property)] = true;
						DFS(property, callback, i, visited);
					}
				}
			}
		}
	},
	plugins: {},

	highlightAll: function(async, callback) {
		_.highlightAllUnder(document, async, callback);
	},

	highlightAllUnder: function(container, async, callback) {
		var env = {
			callback: callback,
			container: container,
			selector: 'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'
		};

		_.hooks.run('before-highlightall', env);

		env.elements = Array.prototype.slice.apply(env.container.querySelectorAll(env.selector));

		_.hooks.run('before-all-elements-highlight', env);

		for (var i = 0, element; element = env.elements[i++];) {
			_.highlightElement(element, async === true, env.callback);
		}
	},

	highlightElement: function(element, async, callback) {
		// Find language
		var language = _.util.getLanguage(element);
		var grammar = _.languages[language];

		// Set language on the element, if not present
		element.className = element.className.replace(lang, '').replace(/\s+/g, ' ') + ' language-' + language;

		// Set language on the parent, for styling
		var parent = element.parentNode;
		if (parent && parent.nodeName.toLowerCase() === 'pre') {
			parent.className = parent.className.replace(lang, '').replace(/\s+/g, ' ') + ' language-' + language;
		}

		var code = element.textContent;

		var env = {
			element: element,
			language: language,
			grammar: grammar,
			code: code
		};

		function insertHighlightedCode(highlightedCode) {
			env.highlightedCode = highlightedCode;

			_.hooks.run('before-insert', env);

			env.element.innerHTML = env.highlightedCode;

			_.hooks.run('after-highlight', env);
			_.hooks.run('complete', env);
			callback && callback.call(env.element);
		}

		_.hooks.run('before-sanity-check', env);

		if (!env.code) {
			_.hooks.run('complete', env);
			callback && callback.call(env.element);
			return;
		}

		_.hooks.run('before-highlight', env);

		if (!env.grammar) {
			insertHighlightedCode(_.util.encode(env.code));
			return;
		}

		if (async && _self.Worker) {
			var worker = new Worker(_.filename);

			worker.onmessage = function(evt) {
				insertHighlightedCode(evt.data);
			};

			worker.postMessage(JSON.stringify({
				language: env.language,
				code: env.code,
				immediateClose: true
			}));
		}
		else {
			insertHighlightedCode(_.highlight(env.code, env.grammar, env.language));
		}
	},

	highlight: function (text, grammar, language) {
		var env = {
			code: text,
			grammar: grammar,
			language: language
		};
		_.hooks.run('before-tokenize', env);
		env.tokens = _.tokenize(env.code, env.grammar);
		_.hooks.run('after-tokenize', env);
		return Token.stringify(_.util.encode(env.tokens), env.language);
	},

	matchGrammar: function (text, strarr, grammar, index, startPos, oneshot, target) {
		for (var token in grammar) {
			if (!grammar.hasOwnProperty(token) || !grammar[token]) {
				continue;
			}

			var patterns = grammar[token];
			patterns = Array.isArray(patterns) ? patterns : [patterns];

			for (var j = 0; j < patterns.length; ++j) {
				if (target && target == token + ',' + j) {
					return;
				}

				var pattern = patterns[j],
					inside = pattern.inside,
					lookbehind = !!pattern.lookbehind,
					greedy = !!pattern.greedy,
					lookbehindLength = 0,
					alias = pattern.alias;

				if (greedy && !pattern.pattern.global) {
					// Without the global flag, lastIndex won't work
					var flags = pattern.pattern.toString().match(/[imsuy]*$/)[0];
					pattern.pattern = RegExp(pattern.pattern.source, flags + 'g');
				}

				pattern = pattern.pattern || pattern;

				// Don’t cache length as it changes during the loop
				for (var i = index, pos = startPos; i < strarr.length; pos += strarr[i].length, ++i) {

					var str = strarr[i];

					if (strarr.length > text.length) {
						// Something went terribly wrong, ABORT, ABORT!
						return;
					}

					if (str instanceof Token) {
						continue;
					}

					if (greedy && i != strarr.length - 1) {
						pattern.lastIndex = pos;
						var match = pattern.exec(text);
						if (!match) {
							break;
						}

						var from = match.index + (lookbehind && match[1] ? match[1].length : 0),
						    to = match.index + match[0].length,
						    k = i,
						    p = pos;

						for (var len = strarr.length; k < len && (p < to || (!strarr[k].type && !strarr[k - 1].greedy)); ++k) {
							p += strarr[k].length;
							// Move the index i to the element in strarr that is closest to from
							if (from >= p) {
								++i;
								pos = p;
							}
						}

						// If strarr[i] is a Token, then the match starts inside another Token, which is invalid
						if (strarr[i] instanceof Token) {
							continue;
						}

						// Number of tokens to delete and replace with the new match
						delNum = k - i;
						str = text.slice(pos, p);
						match.index -= pos;
					} else {
						pattern.lastIndex = 0;

						var match = pattern.exec(str),
							delNum = 1;
					}

					if (!match) {
						if (oneshot) {
							break;
						}

						continue;
					}

					if(lookbehind) {
						lookbehindLength = match[1] ? match[1].length : 0;
					}

					var from = match.index + lookbehindLength,
					    match = match[0].slice(lookbehindLength),
					    to = from + match.length,
					    before = str.slice(0, from),
					    after = str.slice(to);

					var args = [i, delNum];

					if (before) {
						++i;
						pos += before.length;
						args.push(before);
					}

					var wrapped = new Token(token, inside? _.tokenize(match, inside) : match, alias, match, greedy);

					args.push(wrapped);

					if (after) {
						args.push(after);
					}

					Array.prototype.splice.apply(strarr, args);

					if (delNum != 1)
						_.matchGrammar(text, strarr, grammar, i, pos, true, token + ',' + j);

					if (oneshot)
						break;
				}
			}
		}
	},

	tokenize: function(text, grammar) {
		var strarr = [text];

		var rest = grammar.rest;

		if (rest) {
			for (var token in rest) {
				grammar[token] = rest[token];
			}

			delete grammar.rest;
		}

		_.matchGrammar(text, strarr, grammar, 0, 0, false);

		return strarr;
	},

	hooks: {
		all: {},

		add: function (name, callback) {
			var hooks = _.hooks.all;

			hooks[name] = hooks[name] || [];

			hooks[name].push(callback);
		},

		run: function (name, env) {
			var callbacks = _.hooks.all[name];

			if (!callbacks || !callbacks.length) {
				return;
			}

			for (var i=0, callback; callback = callbacks[i++];) {
				callback(env);
			}
		}
	},

	Token: Token
};

_self.Prism = _;

function Token(type, content, alias, matchedStr, greedy) {
	this.type = type;
	this.content = content;
	this.alias = alias;
	// Copy of the full string this token was created from
	this.length = (matchedStr || '').length|0;
	this.greedy = !!greedy;
}

Token.stringify = function(o, language) {
	if (typeof o == 'string') {
		return o;
	}

	if (Array.isArray(o)) {
		return o.map(function(element) {
			return Token.stringify(element, language);
		}).join('');
	}

	var env = {
		type: o.type,
		content: Token.stringify(o.content, language),
		tag: 'span',
		classes: ['token', o.type],
		attributes: {},
		language: language
	};

	if (o.alias) {
		var aliases = Array.isArray(o.alias) ? o.alias : [o.alias];
		Array.prototype.push.apply(env.classes, aliases);
	}

	_.hooks.run('wrap', env);

	var attributes = Object.keys(env.attributes).map(function(name) {
		return name + '="' + (env.attributes[name] || '').replace(/"/g, '&quot;') + '"';
	}).join(' ');

	return '<' + env.tag + ' class="' + env.classes.join(' ') + '"' + (attributes ? ' ' + attributes : '') + '>' + env.content + '</' + env.tag + '>';
};

if (!_self.document) {
	if (!_self.addEventListener) {
		// in Node.js
		return _;
	}

	if (!_.disableWorkerMessageHandler) {
		// In worker
		_self.addEventListener('message', function (evt) {
			var message = JSON.parse(evt.data),
				lang = message.language,
				code = message.code,
				immediateClose = message.immediateClose;

			_self.postMessage(_.highlight(code, _.languages[lang], lang));
			if (immediateClose) {
				_self.close();
			}
		}, false);
	}

	return _;
}

//Get current script and highlight
var script = _.util.currentScript();

if (script) {
	_.filename = script.src;

	if (script.hasAttribute('data-manual')) {
		_.manual = true;
	}
}

if (!_.manual) {
	function highlightAutomaticallyCallback() {
		if (!_.manual) {
			_.highlightAll();
		}
	}

	// If the document state is "loading", then we'll use DOMContentLoaded.
	// If the document state is "interactive" and the prism.js script is deferred, then we'll also use the
	// DOMContentLoaded event because there might be some plugins or languages which have also been deferred and they
	// might take longer one animation frame to execute which can create a race condition where only some plugins have
	// been loaded when Prism.highlightAll() is executed, depending on how fast resources are loaded.
	// See https://github.com/PrismJS/prism/issues/2102
	var readyState = document.readyState;
	if (readyState === 'loading' || readyState === 'interactive' && script && script.defer) {
		document.addEventListener('DOMContentLoaded', highlightAutomaticallyCallback);
	} else {
		if (window.requestAnimationFrame) {
			window.requestAnimationFrame(highlightAutomaticallyCallback);
		} else {
			window.setTimeout(highlightAutomaticallyCallback, 16);
		}
	}
}

return _;

})(_self);

if ('object' !== 'undefined' && module.exports) {
	module.exports = Prism;
}

// hack for components to work correctly in node.js
if (typeof commonjsGlobal !== 'undefined') {
	commonjsGlobal.Prism = Prism;
}


/* **********************************************
     Begin prism-markup.js
********************************************** */

Prism.languages.markup = {
	'comment': /<!--[\s\S]*?-->/,
	'prolog': /<\?[\s\S]+?\?>/,
	'doctype': {
		pattern: /<!DOCTYPE(?:[^>"'[\]]|"[^"]*"|'[^']*')+(?:\[(?:(?!<!--)[^"'\]]|"[^"]*"|'[^']*'|<!--[\s\S]*?-->)*\]\s*)?>/i,
		greedy: true
	},
	'cdata': /<!\[CDATA\[[\s\S]*?]]>/i,
	'tag': {
		pattern: /<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/i,
		greedy: true,
		inside: {
			'tag': {
				pattern: /^<\/?[^\s>\/]+/i,
				inside: {
					'punctuation': /^<\/?/,
					'namespace': /^[^\s>\/:]+:/
				}
			},
			'attr-value': {
				pattern: /=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/i,
				inside: {
					'punctuation': [
						/^=/,
						{
							pattern: /^(\s*)["']|["']$/,
							lookbehind: true
						}
					]
				}
			},
			'punctuation': /\/?>/,
			'attr-name': {
				pattern: /[^\s>\/]+/,
				inside: {
					'namespace': /^[^\s>\/:]+:/
				}
			}

		}
	},
	'entity': /&#?[\da-z]{1,8};/i
};

Prism.languages.markup['tag'].inside['attr-value'].inside['entity'] =
	Prism.languages.markup['entity'];

// Plugin to make entity title show the real entity, idea by Roman Komarov
Prism.hooks.add('wrap', function(env) {

	if (env.type === 'entity') {
		env.attributes['title'] = env.content.replace(/&amp;/, '&');
	}
});

Object.defineProperty(Prism.languages.markup.tag, 'addInlined', {
	/**
	 * Adds an inlined language to markup.
	 *
	 * An example of an inlined language is CSS with `<style>` tags.
	 *
	 * @param {string} tagName The name of the tag that contains the inlined language. This name will be treated as
	 * case insensitive.
	 * @param {string} lang The language key.
	 * @example
	 * addInlined('style', 'css');
	 */
	value: function addInlined(tagName, lang) {
		var includedCdataInside = {};
		includedCdataInside['language-' + lang] = {
			pattern: /(^<!\[CDATA\[)[\s\S]+?(?=\]\]>$)/i,
			lookbehind: true,
			inside: Prism.languages[lang]
		};
		includedCdataInside['cdata'] = /^<!\[CDATA\[|\]\]>$/i;

		var inside = {
			'included-cdata': {
				pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i,
				inside: includedCdataInside
			}
		};
		inside['language-' + lang] = {
			pattern: /[\s\S]+/,
			inside: Prism.languages[lang]
		};

		var def = {};
		def[tagName] = {
			pattern: RegExp(/(<__[\s\S]*?>)(?:<!\[CDATA\[[\s\S]*?\]\]>\s*|[\s\S])*?(?=<\/__>)/.source.replace(/__/g, tagName), 'i'),
			lookbehind: true,
			greedy: true,
			inside: inside
		};

		Prism.languages.insertBefore('markup', 'cdata', def);
	}
});

Prism.languages.xml = Prism.languages.extend('markup', {});
Prism.languages.html = Prism.languages.markup;
Prism.languages.mathml = Prism.languages.markup;
Prism.languages.svg = Prism.languages.markup;


/* **********************************************
     Begin prism-css.js
********************************************** */

(function (Prism) {

	var string = /("|')(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/;

	Prism.languages.css = {
		'comment': /\/\*[\s\S]*?\*\//,
		'atrule': {
			pattern: /@[\w-]+[\s\S]*?(?:;|(?=\s*\{))/,
			inside: {
				'rule': /@[\w-]+/
				// See rest below
			}
		},
		'url': {
			pattern: RegExp('url\\((?:' + string.source + '|[^\n\r()]*)\\)', 'i'),
			inside: {
				'function': /^url/i,
				'punctuation': /^\(|\)$/
			}
		},
		'selector': RegExp('[^{}\\s](?:[^{};"\']|' + string.source + ')*?(?=\\s*\\{)'),
		'string': {
			pattern: string,
			greedy: true
		},
		'property': /[-_a-z\xA0-\uFFFF][-\w\xA0-\uFFFF]*(?=\s*:)/i,
		'important': /!important\b/i,
		'function': /[-a-z0-9]+(?=\()/i,
		'punctuation': /[(){};:,]/
	};

	Prism.languages.css['atrule'].inside.rest = Prism.languages.css;

	var markup = Prism.languages.markup;
	if (markup) {
		markup.tag.addInlined('style', 'css');

		Prism.languages.insertBefore('inside', 'attr-value', {
			'style-attr': {
				pattern: /\s*style=("|')(?:\\[\s\S]|(?!\1)[^\\])*\1/i,
				inside: {
					'attr-name': {
						pattern: /^\s*style/i,
						inside: markup.tag.inside
					},
					'punctuation': /^\s*=\s*['"]|['"]\s*$/,
					'attr-value': {
						pattern: /.+/i,
						inside: Prism.languages.css
					}
				},
				alias: 'language-css'
			}
		}, markup.tag);
	}

}(Prism));


/* **********************************************
     Begin prism-clike.js
********************************************** */

Prism.languages.clike = {
	'comment': [
		{
			pattern: /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,
			lookbehind: true
		},
		{
			pattern: /(^|[^\\:])\/\/.*/,
			lookbehind: true,
			greedy: true
		}
	],
	'string': {
		pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
		greedy: true
	},
	'class-name': {
		pattern: /(\b(?:class|interface|extends|implements|trait|instanceof|new)\s+|\bcatch\s+\()[\w.\\]+/i,
		lookbehind: true,
		inside: {
			'punctuation': /[.\\]/
		}
	},
	'keyword': /\b(?:if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/,
	'boolean': /\b(?:true|false)\b/,
	'function': /\w+(?=\()/,
	'number': /\b0x[\da-f]+\b|(?:\b\d+\.?\d*|\B\.\d+)(?:e[+-]?\d+)?/i,
	'operator': /[<>]=?|[!=]=?=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/,
	'punctuation': /[{}[\];(),.:]/
};


/* **********************************************
     Begin prism-javascript.js
********************************************** */

Prism.languages.javascript = Prism.languages.extend('clike', {
	'class-name': [
		Prism.languages.clike['class-name'],
		{
			pattern: /(^|[^$\w\xA0-\uFFFF])[_$A-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\.(?:prototype|constructor))/,
			lookbehind: true
		}
	],
	'keyword': [
		{
			pattern: /((?:^|})\s*)(?:catch|finally)\b/,
			lookbehind: true
		},
		{
			pattern: /(^|[^.]|\.\.\.\s*)\b(?:as|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/,
			lookbehind: true
		},
	],
	'number': /\b(?:(?:0[xX](?:[\dA-Fa-f](?:_[\dA-Fa-f])?)+|0[bB](?:[01](?:_[01])?)+|0[oO](?:[0-7](?:_[0-7])?)+)n?|(?:\d(?:_\d)?)+n|NaN|Infinity)\b|(?:\b(?:\d(?:_\d)?)+\.?(?:\d(?:_\d)?)*|\B\.(?:\d(?:_\d)?)+)(?:[Ee][+-]?(?:\d(?:_\d)?)+)?/,
	// Allow for all non-ASCII characters (See http://stackoverflow.com/a/2008444)
	'function': /#?[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/,
	'operator': /--|\+\+|\*\*=?|=>|&&|\|\||[!=]==|<<=?|>>>?=?|[-+*/%&|^!=<>]=?|\.{3}|\?[.?]?|[~:]/
});

Prism.languages.javascript['class-name'][0].pattern = /(\b(?:class|interface|extends|implements|instanceof|new)\s+)[\w.\\]+/;

Prism.languages.insertBefore('javascript', 'keyword', {
	'regex': {
		pattern: /((?:^|[^$\w\xA0-\uFFFF."'\])\s])\s*)\/(?:\[(?:[^\]\\\r\n]|\\.)*]|\\.|[^/\\\[\r\n])+\/[gimyus]{0,6}(?=(?:\s|\/\*[\s\S]*?\*\/)*(?:$|[\r\n,.;:})\]]|\/\/))/,
		lookbehind: true,
		greedy: true
	},
	// This must be declared before keyword because we use "function" inside the look-forward
	'function-variable': {
		pattern: /#?[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*)\s*=>))/,
		alias: 'function'
	},
	'parameter': [
		{
			pattern: /(function(?:\s+[_$A-Za-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*)?\s*\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\))/,
			lookbehind: true,
			inside: Prism.languages.javascript
		},
		{
			pattern: /[_$a-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*=>)/i,
			inside: Prism.languages.javascript
		},
		{
			pattern: /(\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\)\s*=>)/,
			lookbehind: true,
			inside: Prism.languages.javascript
		},
		{
			pattern: /((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:[_$A-Za-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*\s*)\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\)\s*\{)/,
			lookbehind: true,
			inside: Prism.languages.javascript
		}
	],
	'constant': /\b[A-Z](?:[A-Z_]|\dx?)*\b/
});

Prism.languages.insertBefore('javascript', 'string', {
	'template-string': {
		pattern: /`(?:\\[\s\S]|\${(?:[^{}]|{(?:[^{}]|{[^}]*})*})+}|(?!\${)[^\\`])*`/,
		greedy: true,
		inside: {
			'template-punctuation': {
				pattern: /^`|`$/,
				alias: 'string'
			},
			'interpolation': {
				pattern: /((?:^|[^\\])(?:\\{2})*)\${(?:[^{}]|{(?:[^{}]|{[^}]*})*})+}/,
				lookbehind: true,
				inside: {
					'interpolation-punctuation': {
						pattern: /^\${|}$/,
						alias: 'punctuation'
					},
					rest: Prism.languages.javascript
				}
			},
			'string': /[\s\S]+/
		}
	}
});

if (Prism.languages.markup) {
	Prism.languages.markup.tag.addInlined('script', 'javascript');
}

Prism.languages.js = Prism.languages.javascript;


/* **********************************************
     Begin prism-file-highlight.js
********************************************** */

(function () {
	if (typeof self === 'undefined' || !self.Prism || !self.document || !document.querySelector) {
		return;
	}

	/**
	 * @param {Element} [container=document]
	 */
	self.Prism.fileHighlight = function(container) {
		container = container || document;

		var Extensions = {
			'js': 'javascript',
			'py': 'python',
			'rb': 'ruby',
			'ps1': 'powershell',
			'psm1': 'powershell',
			'sh': 'bash',
			'bat': 'batch',
			'h': 'c',
			'tex': 'latex'
		};

		Array.prototype.slice.call(container.querySelectorAll('pre[data-src]')).forEach(function (pre) {
			// ignore if already loaded
			if (pre.hasAttribute('data-src-loaded')) {
				return;
			}

			// load current
			var src = pre.getAttribute('data-src');

			var language, parent = pre;
			var lang = /\blang(?:uage)?-([\w-]+)\b/i;
			while (parent && !lang.test(parent.className)) {
				parent = parent.parentNode;
			}

			if (parent) {
				language = (pre.className.match(lang) || [, ''])[1];
			}

			if (!language) {
				var extension = (src.match(/\.(\w+)$/) || [, ''])[1];
				language = Extensions[extension] || extension;
			}

			var code = document.createElement('code');
			code.className = 'language-' + language;

			pre.textContent = '';

			code.textContent = 'Loading…';

			pre.appendChild(code);

			var xhr = new XMLHttpRequest();

			xhr.open('GET', src, true);

			xhr.onreadystatechange = function () {
				if (xhr.readyState == 4) {

					if (xhr.status < 400 && xhr.responseText) {
						code.textContent = xhr.responseText;

						Prism.highlightElement(code);
						// mark as loaded
						pre.setAttribute('data-src-loaded', '');
					}
					else if (xhr.status >= 400) {
						code.textContent = '✖ Error ' + xhr.status + ' while fetching file: ' + xhr.statusText;
					}
					else {
						code.textContent = '✖ Error: File does not exist or is empty';
					}
				}
			};

			xhr.send(null);
		});
	};

	document.addEventListener('DOMContentLoaded', function () {
		// execute inside handler, for dropping Event as argument
		self.Prism.fileHighlight();
	});

})();
});

function unifyEvent(e) {
    return e.changedTouches ? e.changedTouches[0] : e;
}
function debounce(func, timeout) {
    let timer;
    return (...args) => {
        const next = () => func(...args);
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(next, timeout && timeout > 0 ? timeout : 300);
    };
}
function isMobile() {
    if (!window || !navigator) {
        return false;
    }
    const a = navigator.userAgent || navigator.vendor || window.opera;
    return (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od|ad)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) ||
        /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)));
}
function isIOS() {
    if (!window || !navigator) {
        return false;
    }
    const a = navigator.userAgent || navigator.vendor || window.opera;
    return /iPad|iPhone|iPod/i.test(a);
}
function isIPad() {
    if (!window || !navigator) {
        return false;
    }
    const a = navigator.userAgent || navigator.vendor || window.opera;
    return /iPad/i.test(a);
}
function isFullscreen() {
    if (!window || !screen) {
        return false;
    }
    return window.innerHeight == screen.height;
}
function isFirefox() {
    if (!window || !navigator) {
        return false;
    }
    const a = navigator.userAgent || navigator.vendor || window.opera;
    return /firefox/i.test(a);
}

function lazyLoadSelectedImages(images) {
    return new Promise((resolve) => {
        if (!images) {
            resolve();
            return;
        }
        images.forEach((image) => {
            if (image.hasAttribute('data-src')) {
                image.setAttribute('src', `${image.getAttribute('data-src')}`);
                image.removeAttribute('data-src');
                if (!image.classList.contains('deckgo-reveal')) {
                    image.style.setProperty('visibility', 'inherit');
                }
            }
            image.style.setProperty('pointer-events', 'none');
        });
        resolve();
    });
}
function lazyLoadSelectedLazyImagesComponent(components) {
    return new Promise((resolve) => {
        if (!components) {
            resolve();
            return;
        }
        components.forEach(async (component) => {
            await component.lazyLoad();
        });
        resolve();
    });
}

function injectJS(id, src) {
    return new Promise((resolve, reject) => {
        if (!document) {
            resolve();
            return;
        }
        if (document.getElementById(id)) {
            resolve('JS already loaded.');
            return;
        }
        const script = document.createElement('script');
        script.id = id;
        script.async = true;
        script.defer = true;
        script.src = src;
        script.addEventListener('load', () => resolve('JS loaded.'));
        script.addEventListener('error', () => reject('Error loading script.'));
        script.addEventListener('abort', () => reject('Script loading aborted.'));
        document.head.appendChild(script);
    });
}
function injectCSS(id, src) {
    return new Promise((resolve, reject) => {
        if (!document) {
            resolve();
            return;
        }
        if (document.getElementById(id)) {
            resolve('CSS already loaded.');
            return;
        }
        const link = document.createElement('link');
        link.id = id;
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('href', src);
        link.addEventListener('load', () => resolve('CSS loaded.'));
        link.addEventListener('error', () => reject('Error loading css.'));
        link.addEventListener('abort', () => reject('CSS loading aborted.'));
        document.head.appendChild(link);
    });
}

const deckdeckgoHighlightCodeCss = "code[class*=\"language-\"],pre[class*=\"language-\"]{color:black;background:none;text-shadow:0 1px white;font-family:Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;font-size:1em;text-align:left;white-space:pre;word-spacing:normal;word-break:normal;word-wrap:normal;line-height:1.5;-moz-tab-size:4;-o-tab-size:4;tab-size:4;-webkit-hyphens:none;-moz-hyphens:none;-ms-hyphens:none;hyphens:none}pre[class*=\"language-\"]::-moz-selection,pre[class*=\"language-\"] ::-moz-selection,code[class*=\"language-\"]::-moz-selection,code[class*=\"language-\"] ::-moz-selection{text-shadow:none;background:#b3d4fc}pre[class*=\"language-\"]::selection,pre[class*=\"language-\"] ::selection,code[class*=\"language-\"]::selection,code[class*=\"language-\"] ::selection{text-shadow:none;background:#b3d4fc}@media print{code[class*=\"language-\"],pre[class*=\"language-\"]{text-shadow:none}}pre[class*=\"language-\"]{padding:1em;margin:.5em 0;overflow:auto}:not(pre)>code[class*=\"language-\"],pre[class*=\"language-\"]{background:#f5f2f0}:not(pre)>code[class*=\"language-\"]{padding:.1em;border-radius:.3em;white-space:normal}.token.comment,.token.prolog,.token.doctype,.token.cdata{color:slategray}.token.punctuation{color:#999}.token.namespace{opacity:.7}.token.property,.token.tag,.token.boolean,.token.number,.token.constant,.token.symbol,.token.deleted{color:#905}.token.selector,.token.attr-name,.token.string,.token.char,.token.builtin,.token.inserted{color:#690}.token.operator,.token.entity,.token.url,.language-css .token.string,.style .token.string{color:#9a6e3a;background:hsla(0, 0%, 100%, .5)}.token.atrule,.token.attr-value,.token.keyword{color:#07a}.token.function,.token.class-name{color:#DD4A68}.token.regex,.token.important,.token.variable{color:#e90}.token.important,.token.bold{font-weight:bold}.token.italic{font-style:italic}.token.entity{cursor:help}:host ::slotted([slot=code]){display:none}:host(.deckgo-highlight-code-edit) ::slotted([slot=code]){display:block;white-space:pre-wrap}:host(.deckgo-highlight-code-edit) code{display:none}:host([editable]) code:empty:not(:focus):after{content:var(--deckgo-highlight-code-empty-text, \"Click to add your code\")}:host(.deckgo-highlight-code-carbon){display:var(--deckgo-highlight-code-carbon-display, block);overflow:var(--deckgo-highlight-code-carbon-overflow, auto);border:var(--deckgo-highlight-code-carbon-border);border-radius:var(--deckgo-highlight-code-carbon-border-radius, 4px);background:var(--deckgo-highlight-code-carbon-background, #282a36);color:var(--deckgo-highlight-code-carbon-color, white);box-shadow:var(--deckgo-highlight-code-carbon-box-shadow, rgba(0, 0, 0, 0.55) 0 8px 16px);margin:var(--deckgo-highlight-code-carbon-margin, 16px 0)}:host(.deckgo-highlight-code-carbon) div.deckgo-highlight-code-container{margin:var(--deckgo-highlight-code-margin, 0 0 16px)}:host(.deckgo-highlight-code-carbon) ::slotted([slot=code]){color:var(--deckgo-highlight-code-carbon-color, white)}:host(.deckgo-highlight-code-ubuntu){display:var(--deckgo-highlight-code-ubuntu-display, block);overflow:var(--deckgo-highlight-code-ubuntu-overflow, auto);border:var(--deckgo-highlight-code-ubuntu-border);border-radius:var(--deckgo-highlight-code-ubuntu-border-radius, 6px 6px 0 0);background:var(--deckgo-highlight-code-ubuntu-background, rgba(56, 4, 40, 0.9));color:var(--deckgo-highlight-code-ubuntu-color, #ddd);box-shadow:var(--deckgo-highlight-code-ubuntu-box-shadow, 2px 4px 10px rgba(0, 0, 0, 0.5));margin:var(--deckgo-highlight-code-ubuntu-margin, 16px 0)}:host(.deckgo-highlight-code-ubuntu) div.deckgo-highlight-code-container{margin:var(--deckgo-highlight-code-margin, 0 0 16px);padding:var(--deckgo-highlight-code-padding, 2px 0 0);background:transparent}:host(.deckgo-highlight-code-ubuntu) div.deckgo-highlight-code-container code{font-family:var(--deckgo-highlight-code-font-family, \"Ubuntu mono\")}:host(.deckgo-highlight-code-ubuntu) ::slotted([slot=code]){color:var(--deckgo-highlight-code-ubuntu-color, #ddd)}div.deckgo-highlight-code-container{color:var(--deckgo-highlight-code-color, inherit);background:var(--deckgo-highlight-code-background);padding:var(--deckgo-highlight-code-padding, 0 16px);border-radius:var(--deckgo-highlight-code-border-radius);margin:var(--deckgo-highlight-code-margin, 16px 0);transform-origin:bottom left;transition:all 0.2s ease-in-out;transform:scale(var(--deckgo-highlight-code-zoom, 1));direction:var(--deckgo-highlight-code-direction, ltr);text-align:var(--deckgo-highlight-code-text-align, start);width:var(--deckgo-highlight-code-container-width);height:var(--deckgo-highlight-code-container-height);display:var(--deckgo-highlight-code-container-display, block);justify-content:var(--deckgo-highlight-code-container-justify-content);flex-direction:var(--deckgo-highlight-code-container-flex-direction);align-items:var(--deckgo-highlight-code-container-align-items)}div.deckgo-highlight-code-container code{overflow-y:var(--deckgo-highlight-code-scroll, scroll);white-space:pre-wrap;font-size:var(--deckgo-highlight-code-font-size);font-family:var(--deckgo-highlight-code-font-family, monospace);display:var(--deckgo-highlight-code-display, block);counter-reset:linenumber;}div.deckgo-highlight-code-container code>div.deckgo-highlight-code-line-number{counter-increment:linenumber;position:relative;padding-left:3.5em}div.deckgo-highlight-code-container code>div.deckgo-highlight-code-line-number:before{content:counter(linenumber);display:inline-block;position:absolute;top:0;bottom:0;left:0;width:2.5em;background:inherit;border-right:1px solid var(--deckgo-highlight-code-line-numbers, #999);color:var(--deckgo-highlight-code-line-numbers, #999)}div.deckgo-highlight-code-container code span.deckgo-highlight-code-anchor-hidden{visibility:hidden}div.deckgo-highlight-code-container code .deckgo-highlight-code-line{background:var(--deckgo-highlight-code-line-background, #3e4564);border-top:var(--deckgo-highlight-code-line-border-top);border-bottom:var(--deckgo-highlight-code-line-border-bottom)}div.deckgo-highlight-code-container code .language-css .token.string:not(.deckgo-highlight-code-line),div.deckgo-highlight-code-container code .style .token.string:not(.deckgo-highlight-code-line),div.deckgo-highlight-code-container code .token.entity:not(.deckgo-highlight-code-line),div.deckgo-highlight-code-container code .token.operator:not(.deckgo-highlight-code-line),div.deckgo-highlight-code-container code .token.url:not(.deckgo-highlight-code-line){background:inherit}div.deckgo-highlight-code-container code .token.comment,div.deckgo-highlight-code-container code .token.prolog,div.deckgo-highlight-code-container code .token.doctype,div.deckgo-highlight-code-container code .token.cdata{color:var(--deckgo-highlight-code-token-comment, #6272a4)}div.deckgo-highlight-code-container code .token.punctuation{color:var(--deckgo-highlight-code-token-punctuation, #6272a4)}div.deckgo-highlight-code-container code .token.property,div.deckgo-highlight-code-container code .token.tag,div.deckgo-highlight-code-container code .token.boolean,div.deckgo-highlight-code-container code .token.number,div.deckgo-highlight-code-container code .token.constant,div.deckgo-highlight-code-container code .token.symbol,div.deckgo-highlight-code-container code .token.deleted{color:var(--deckgo-highlight-code-token-property, #bd93f9)}div.deckgo-highlight-code-container code .token.selector,div.deckgo-highlight-code-container code .token.attr-name,div.deckgo-highlight-code-container code .token.string,div.deckgo-highlight-code-container code .token.char,div.deckgo-highlight-code-container code .token.builtin,div.deckgo-highlight-code-container code .token.inserted{color:var(--deckgo-highlight-code-token-selector, #50fa7b)}div.deckgo-highlight-code-container code .token.operator,div.deckgo-highlight-code-container code .token.entity,div.deckgo-highlight-code-container code .token.url,div.deckgo-highlight-code-container code .language-css .token.string,div.deckgo-highlight-code-container code .style .token.string{color:var(--deckgo-highlight-code-token-operator, #ff79c6)}div.deckgo-highlight-code-container code .token.atrule,div.deckgo-highlight-code-container code .token.attr-value,div.deckgo-highlight-code-container code .token.keyword{color:var(--deckgo-highlight-code-token-atrule, #ff79c6)}div.deckgo-highlight-code-container code .token.function,div.deckgo-highlight-code-container code .token.class-name{color:var(--deckgo-highlight-code-token-function, #ffb86c)}div.deckgo-highlight-code-container code .token.regex,div.deckgo-highlight-code-container code .token.important,div.deckgo-highlight-code-container code .token.variable{color:var(--deckgo-highlight-code-token-regex, #f1fa8c)}div.carbon{display:flex;justify-content:flex-start;padding:var(--deckgo-highlight-code-carbon-header-padding, 16px)}div.carbon>div{width:var(--deckgo-highlight-code-carbon-header-button-width, 12px);height:var(--deckgo-highlight-code-carbon-header-button-height, 12px);border-radius:var(--deckgo-highlight-code-carbon-header-button-border-radius, 50%);margin:var(--deckgo-highlight-code-carbon-header-button-margin, 0 6px 0 0)}div.carbon>div.red{background:var(--deckgo-highlight-code-carbon-header-button-red-background, #ff5f56);border:var(--deckgo-highlight-code-carbon-header-button-red-border, 0.5px solid #e0443e)}div.carbon>div.yellow{background:var(--deckgo-highlight-code-carbon-header-button-yellow-background, #ffbd2e);border:var(--deckgo-highlight-code-carbon-header-button-yellow-border, 0.5px solid #dea123)}div.carbon>div.green{background:var(--deckgo-highlight-code-carbon-header-button-green-background, #27c93f);border:var(--deckgo-highlight-code-carbon-header-button-green-border, 0.5px solid #1aab29)}div.ubuntu{display:flex;justify-content:flex-start;align-items:center;padding:var(--deckgo-highlight-code-ubuntu-header-padding, 0 8px);height:var(--deckgo-highlight-code-ubuntu-header-height, 25px);background:var(--deckgo-highlight-code-ubuntu-header-background, linear-gradient(#504b45 0%, #3c3b37 100%));font-family:var(--deckgo-highlight-code-ubuntu-header-font-family, \"Ubuntu\")}div.ubuntu>div{display:flex;align-items:center;justify-content:center;width:var(--deckgo-highlight-code-carbon-header-button-width, 12px);height:var(--deckgo-highlight-code-carbon-header-button-height, 12px);border-radius:var(--deckgo-highlight-code-carbon-header-button-border-radius, 50%);margin:var(--deckgo-highlight-code-carbon-header-button-margin, 0 4px 0 0);font-size:var(--deckgo-highlight-code-carbon-header-button-font-size, 7px);color:var(--deckgo-highlight-code-carbon-header-button-color, black);text-shadow:var(--deckgo-highlight-code-carbon-header-button-text-shadow, 0px 1px 0px rgba(255, 255, 255, 0.2));box-shadow:var(--deckgo-highlight-code-carbon-header-button-box-shadow, 0px 0px 1px 0px #41403a, 0px 1px 1px 0px #474642)}div.ubuntu>div.close{background:var(--deckgo-highlight-code-carbon-header-button-close-background, linear-gradient(#f37458 0%, #de4c12 100%));border:var(--deckgo-highlight-code-carbon-header-button-close-border)}div.ubuntu>div.minimize{background:var(--deckgo-highlight-code-carbon-header-button-minimize-background, linear-gradient(#7d7871 0%, #595953 100%));border:var(--deckgo-highlight-code-carbon-header-button-minimize-border)}div.ubuntu>div.maximize{background:var(--deckgo-highlight-code-carbon-header-button-maximize-background, linear-gradient(#7d7871 0%, #595953 100%));border:var(--deckgo-highlight-code-carbon-header-button-maximize-border)}div.ubuntu>p{color:var(--deckgo-highlight-code-carbon-header-user-color, #d5d0ce);font-size:var(--deckgo-highlight-code-carbon-header-user-font-size, 12px);line-height:var(--deckgo-highlight-code-carbon-header-user-line-height, 14px);margin:var(--deckgo-highlight-code-carbon-header-user-margin, 0 0 1px 4px)}";

const DeckdeckgoHighlightCode = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.anchor = '// DeckDeckGo';
        this.anchorZoom = '// DeckDeckGoZoom';
        this.hideAnchor = true;
        this.language = 'javascript';
        this.lineNumbers = false;
        this.terminal = 'carbon';
        this.editable = false;
        this.editing = false;
        this.anchorOffsetTop = 0;
        this.fetchOrParseAfterUpdate = false;
        this.catchNewLine = async ($event) => {
            if ($event && $event.key === 'Enter') {
                $event.preventDefault();
                const selection = await this.getSelection();
                if (selection && selection.focusNode && selection.focusNode.textContent && selection.focusOffset > 0) {
                    const charCode = selection.focusNode.textContent.charCodeAt(window.getSelection().focusOffset);
                    document.execCommand('insertHTML', false, charCode === 10 || charCode === 13 ? '\n' : '\n\n');
                }
                else {
                    document.execCommand('insertHTML', false, '\n\n');
                }
            }
        };
        this.applyCode = async () => {
            await this.stopEditing();
            await this.parseSlottedCode();
        };
        this.prismLanguageLoaded = createEvent(this, "prismLanguageLoaded", 7);
        this.codeDidChange = createEvent(this, "codeDidChange", 7);
    }
    async componentWillLoad() {
        await this.loadGoogleFonts();
    }
    async componentDidLoad() {
        const languageWasLoaded = await this.languageDidLoad();
        await this.loadLanguage();
        if (languageWasLoaded) {
            await this.fetchOrParse();
        }
    }
    async componentDidUpdate() {
        if (this.fetchOrParseAfterUpdate) {
            await this.fetchOrParse();
            this.fetchOrParseAfterUpdate = false;
        }
    }
    async languageLoaded($event) {
        if (!$event || !$event.detail) {
            return;
        }
        if (this.language && this.language !== 'javascript' && $event.detail === this.language) {
            await this.fetchOrParse();
        }
    }
    async fetchOrParse() {
        if (this.src) {
            await this.fetchCode();
        }
        else {
            await this.parseSlottedCode();
        }
    }
    languageDidLoad() {
        return new Promise((resolve) => {
            if (!document || !this.language || this.language === '') {
                resolve(false);
                return;
            }
            if (this.language === 'javascript') {
                resolve(true);
                return;
            }
            const scripts = document.querySelector("[deckdeckgo-prism-loaded='" + this.language + "']");
            if (scripts) {
                resolve(true);
            }
            else {
                resolve(false);
            }
        });
    }
    loadLanguage() {
        return new Promise(async (resolve) => {
            if (!document || !this.language || this.language === '' || this.language === 'javascript') {
                resolve();
                return;
            }
            const scripts = document.querySelector("[deckdeckgo-prism='" + this.language + "']");
            if (scripts) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.onload = async () => {
                script.setAttribute('deckdeckgo-prism-loaded', this.language);
                this.prismLanguageLoaded.emit(this.language);
            };
            script.onerror = async () => {
                // if the language definition doesn't exist or if unpkg is down, display code anyway
                this.prismLanguageLoaded.emit(this.language);
            };
            script.src = 'https://unpkg.com/prismjs@latest/components/prism-' + this.language + '.js';
            script.setAttribute('deckdeckgo-prism', this.language);
            script.defer = true;
            document.head.appendChild(script);
            resolve();
        });
    }
    async onLineNumbersChange() {
        await this.fetchOrParse();
    }
    async onCarbonChange() {
        this.fetchOrParseAfterUpdate = true;
        await this.loadGoogleFonts();
    }
    async loadGoogleFonts() {
        if (this.terminal === 'ubuntu') {
            await injectCSS('google-fonts-ubuntu', 'https://fonts.googleapis.com/css?family=Ubuntu|Ubuntu+Mono&display=swap');
        }
    }
    load() {
        return new Promise(async (resolve) => {
            if (!this.language || this.language === '') {
                resolve();
                return;
            }
            if (this.language === 'javascript') {
                await this.fetchOrParse();
                resolve();
                return;
            }
            if (document.querySelector("[deckdeckgo-prism-loaded='" + this.language + "']")) {
                await this.fetchOrParse();
            }
            else {
                await this.loadLanguage();
            }
            resolve();
        });
    }
    parseSlottedCode() {
        const code = this.el.querySelector("[slot='code']");
        if (code) {
            return this.parseCode(code.innerText ? code.innerText.trim() : code.innerText);
        }
        else {
            return new Promise((resolve) => {
                resolve();
            });
        }
    }
    async fetchCode() {
        if (!this.src) {
            return;
        }
        let fetchedCode;
        try {
            const response = await fetch(this.src);
            fetchedCode = await response.text();
            await this.parseCode(fetchedCode);
        }
        catch (e) {
            // Prism might not be able to parse the code for the selected language
            const container = this.el.shadowRoot.querySelector('div.deckgo-highlight-code-container');
            if (container && fetchedCode) {
                container.children[0].innerHTML = fetchedCode;
            }
        }
    }
    parseCode(code) {
        return new Promise(async (resolve, reject) => {
            const container = this.el.shadowRoot.querySelector('div.deckgo-highlight-code-container');
            if (!code || code === undefined || code === '') {
                resolve();
                return;
            }
            if (container) {
                try {
                    // clear the container first
                    container.children[0].innerHTML = '';
                    // split the code on linebreaks
                    const regEx = RegExp(/\n(?!$)/g); //
                    const match = code.split(regEx);
                    match.forEach((m, idx, array) => {
                        // On last element
                        if (idx === array.length - 1) {
                            this.attachHighlightObserver(container);
                        }
                        let div = document.createElement('div');
                        if (this.lineNumbers) {
                            div.classList.add('deckgo-highlight-code-line-number');
                        }
                        const highlight = prism.highlight(m, prism.languages[this.language], this.language);
                        // If empty, use \u200B as zero width text spacer
                        div.innerHTML = highlight && highlight !== '' ? highlight : '\u200B';
                        container.children[0].appendChild(div);
                    });
                    await this.addAnchors();
                    resolve();
                }
                catch (err) {
                    reject(err);
                }
            }
        });
    }
    attachHighlightObserver(container) {
        if (window && 'ResizeObserver' in window) {
            // @ts-ignore
            const observer = new ResizeObserver(async (_entries) => {
                await this.addHighlight();
                observer.disconnect();
            });
            observer.observe(container);
        }
        else {
            // Back in my days...
            setTimeout(async () => {
                await this.addHighlight();
            }, 100);
        }
    }
    addAnchors() {
        return new Promise((resolve) => {
            const elements = this.el.shadowRoot.querySelectorAll('span.comment');
            if (elements) {
                const elementsArray = Array.from(elements);
                const anchors = elementsArray.filter((element) => {
                    return this.hasLineAnchor(element.innerHTML);
                });
                if (anchors) {
                    anchors.forEach((anchor) => {
                        anchor.classList.add('deckgo-highlight-code-anchor');
                        if (this.hideAnchor) {
                            anchor.classList.add('deckgo-highlight-code-anchor-hidden');
                        }
                    });
                }
            }
            resolve();
        });
    }
    hasLineAnchor(line) {
        return (line &&
            this.anchor &&
            line.indexOf('@Prop') === -1 &&
            line
                .split(' ')
                .join('')
                .indexOf(this.anchor.split(' ').join('')) > -1);
    }
    addHighlight() {
        return new Promise(async (resolve) => {
            if (this.highlightLines && this.highlightLines.length > 0) {
                const rows = await this.findRowsToHighlight();
                if (rows && rows.length > 0) {
                    const containerCode = this.el.shadowRoot.querySelector('code');
                    if (containerCode && containerCode.hasChildNodes()) {
                        const elements = Array.prototype.slice.call(containerCode.childNodes);
                        let rowIndex = 0;
                        let lastOffsetTop = -1;
                        let offsetHeight = -1;
                        elements.forEach((element) => {
                            let editElement;
                            // We need to convert text entries to an element in order to be able to style it
                            if (element.nodeName === '#text') {
                                const span = document.createElement('span');
                                if (element.previousElementSibling) {
                                    element.previousElementSibling.insertAdjacentElement('afterend', span);
                                }
                                else {
                                    element.parentNode.prepend(span);
                                }
                                span.appendChild(element);
                                editElement = span;
                            }
                            else {
                                editElement = element;
                            }
                            // We try to find the row index with the offset of the element
                            rowIndex = editElement.offsetTop > lastOffsetTop ? rowIndex + 1 : rowIndex;
                            lastOffsetTop = editElement.offsetTop;
                            // For some reason, some converted text element are displayed on two lines, that's why we should consider the 2nd one as index
                            offsetHeight = offsetHeight === -1 || offsetHeight > editElement.offsetHeight ? editElement.offsetHeight : offsetHeight;
                            const rowsIndexToCompare = editElement.offsetHeight > offsetHeight ? rowIndex + 1 : rowIndex;
                            if (rows.indexOf(rowsIndexToCompare) > -1) {
                                editElement.classList.add('deckgo-highlight-code-line');
                            }
                        });
                    }
                }
            }
            resolve();
        });
    }
    findRowsToHighlight() {
        return new Promise((resolve) => {
            let results = [];
            const rows = this.highlightLines.split(' ');
            if (rows && rows.length > 0) {
                rows.forEach((row) => {
                    const index = row.split(',');
                    if (index && index.length >= 1) {
                        const start = parseInt(index[0], 0);
                        const end = parseInt(index[1], 0);
                        for (let i = start; i <= end; i++) {
                            results.push(i);
                        }
                    }
                });
            }
            resolve(results);
        });
    }
    findNextAnchor(enter) {
        return new Promise(async (resolve) => {
            const elements = this.el.shadowRoot.querySelectorAll('span.deckgo-highlight-code-anchor');
            if (elements) {
                const elementsArray = enter ? Array.from(elements) : Array.from(elements).reverse();
                const anchor = elementsArray.find((element) => {
                    return enter ? element.offsetTop > this.anchorOffsetTop : element.offsetTop < this.anchorOffsetTop;
                });
                if (anchor) {
                    this.anchorOffsetTop = anchor.offsetTop;
                    resolve({
                        offsetTop: anchor.offsetTop,
                        hasLineZoom: this.hasLineZoom(anchor.textContent)
                    });
                }
                else if (!enter) {
                    const elementCode = this.el.shadowRoot.querySelector('code');
                    if (elementCode && elementCode.firstElementChild) {
                        this.anchorOffsetTop = 0;
                        resolve({
                            offsetTop: 0,
                            hasLineZoom: false
                        });
                    }
                    else {
                        resolve(null);
                    }
                }
                else {
                    resolve(null);
                }
            }
            else {
                resolve(null);
            }
        });
    }
    zoomCode(zoom) {
        return new Promise((resolve) => {
            const container = this.el.shadowRoot.querySelector('div.deckgo-highlight-code-container');
            if (container) {
                container.style.setProperty('--deckgo-highlight-code-zoom', zoom ? '1.3' : '1');
            }
            resolve();
        });
    }
    hasLineZoom(line) {
        return (line &&
            this.anchorZoom &&
            line.indexOf('@Prop') === -1 &&
            line
                .split(' ')
                .join('')
                .indexOf(this.anchorZoom.split(' ').join('')) > -1);
    }
    edit() {
        return new Promise((resolve) => {
            if (!this.editable) {
                resolve();
                return;
            }
            this.editing = true;
            const slottedCode = this.el.querySelector("[slot='code']");
            if (slottedCode) {
                setTimeout(() => {
                    slottedCode.setAttribute('contentEditable', 'true');
                    slottedCode.addEventListener('blur', this.applyCode, { once: true });
                    slottedCode.addEventListener('keydown', this.catchNewLine);
                    slottedCode.focus();
                }, 100);
            }
            resolve();
        });
    }
    getSelection() {
        return new Promise((resolve) => {
            let selectedSelection = null;
            if (window && window.getSelection) {
                selectedSelection = window.getSelection();
            }
            else if (document && document.getSelection) {
                selectedSelection = document.getSelection();
            }
            else if (document && document.selection) {
                selectedSelection = document.selection.createRange().text;
            }
            resolve(selectedSelection);
        });
    }
    stopEditing() {
        return new Promise((resolve) => {
            this.editing = false;
            const slottedCode = this.el.querySelector("[slot='code']");
            if (slottedCode) {
                slottedCode.removeAttribute('contentEditable');
                if (slottedCode.innerHTML) {
                    slottedCode.innerHTML = slottedCode.innerHTML.trim();
                }
                this.codeDidChange.emit(this.el);
            }
            resolve();
        });
    }
    render() {
        return (h(Host, { class: {
                'deckgo-highlight-code-edit': this.editing,
                'deckgo-highlight-code-carbon': this.terminal === 'carbon',
                'deckgo-highlight-code-ubuntu': this.terminal === 'ubuntu'
            } }, this.renderCarbon(), this.renderUbuntu(), h("div", { class: "deckgo-highlight-code-container", onMouseDown: () => this.edit(), onTouchStart: () => this.edit() }, h("code", null), h("slot", { name: "code" }), h("slot", { name: "label" }))));
    }
    renderCarbon() {
        if (this.terminal !== 'carbon') {
            return undefined;
        }
        return (h("div", { class: "carbon" }, this.renderCarbonCircle('red'), this.renderCarbonCircle('yellow'), this.renderCarbonCircle('green')));
    }
    renderCarbonCircle(color) {
        return h("div", { class: color });
    }
    renderUbuntu() {
        if (this.terminal !== 'ubuntu') {
            return undefined;
        }
        return (h("div", { class: "ubuntu" }, this.renderUbuntuCircle('close'), this.renderUbuntuCircle('minimize'), this.renderUbuntuCircle('maximize'), h("p", null, h("slot", { name: "user" }))));
    }
    renderUbuntuCircle(mode) {
        const symbol = mode === 'close' ? '&#10005;' : mode === 'minimize' ? '&#9472;' : '&#9723;';
        return h("div", { class: mode, innerHTML: symbol });
    }
    get el() { return getElement(this); }
    static get watchers() { return {
        "language": ["loadLanguage"],
        "lineNumbers": ["onLineNumbersChange"],
        "terminal": ["onCarbonChange"]
    }; }
};
DeckdeckgoHighlightCode.style = deckdeckgoHighlightCodeCss;

export { DeckdeckgoHighlightCode as deckgo_highlight_code };
