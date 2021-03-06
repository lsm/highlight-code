import { Component, Prop, Watch, Element, Method, Event, Listen, State, h, Host } from '@stencil/core';
import Prism from 'prismjs';
import { injectCSS } from '@deckdeckgo/utils';
export class DeckdeckgoHighlightCode {
    constructor() {
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
                        const highlight = Prism.highlight(m, Prism.languages[this.language], this.language);
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
            } },
            this.renderCarbon(),
            this.renderUbuntu(),
            h("div", { class: "deckgo-highlight-code-container", onMouseDown: () => this.edit(), onTouchStart: () => this.edit() },
                h("code", null),
                h("slot", { name: "code" }),
                h("slot", { name: "label" }))));
    }
    renderCarbon() {
        if (this.terminal !== 'carbon') {
            return undefined;
        }
        return (h("div", { class: "carbon" },
            this.renderCarbonCircle('red'),
            this.renderCarbonCircle('yellow'),
            this.renderCarbonCircle('green')));
    }
    renderCarbonCircle(color) {
        return h("div", { class: color });
    }
    renderUbuntu() {
        if (this.terminal !== 'ubuntu') {
            return undefined;
        }
        return (h("div", { class: "ubuntu" },
            this.renderUbuntuCircle('close'),
            this.renderUbuntuCircle('minimize'),
            this.renderUbuntuCircle('maximize'),
            h("p", null,
                h("slot", { name: "user" }))));
    }
    renderUbuntuCircle(mode) {
        const symbol = mode === 'close' ? '&#10005;' : mode === 'minimize' ? '&#9472;' : '&#9723;';
        return h("div", { class: mode, innerHTML: symbol });
    }
    static get is() { return "deckgo-highlight-code"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() { return {
        "$": ["deckdeckgo-highlight-code.scss"]
    }; }
    static get styleUrls() { return {
        "$": ["deckdeckgo-highlight-code.css"]
    }; }
    static get properties() { return {
        "src": {
            "type": "string",
            "mutable": false,
            "complexType": {
                "original": "string",
                "resolved": "string",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": ""
            },
            "attribute": "src",
            "reflect": false
        },
        "anchor": {
            "type": "string",
            "mutable": false,
            "complexType": {
                "original": "string",
                "resolved": "string",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": ""
            },
            "attribute": "anchor",
            "reflect": false,
            "defaultValue": "'// DeckDeckGo'"
        },
        "anchorZoom": {
            "type": "string",
            "mutable": false,
            "complexType": {
                "original": "string",
                "resolved": "string",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": ""
            },
            "attribute": "anchor-zoom",
            "reflect": false,
            "defaultValue": "'// DeckDeckGoZoom'"
        },
        "hideAnchor": {
            "type": "boolean",
            "mutable": false,
            "complexType": {
                "original": "boolean",
                "resolved": "boolean",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": ""
            },
            "attribute": "hide-anchor",
            "reflect": false,
            "defaultValue": "true"
        },
        "language": {
            "type": "string",
            "mutable": false,
            "complexType": {
                "original": "string",
                "resolved": "string",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": ""
            },
            "attribute": "language",
            "reflect": true,
            "defaultValue": "'javascript'"
        },
        "highlightLines": {
            "type": "string",
            "mutable": false,
            "complexType": {
                "original": "string",
                "resolved": "string",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": ""
            },
            "attribute": "highlight-lines",
            "reflect": true
        },
        "lineNumbers": {
            "type": "boolean",
            "mutable": false,
            "complexType": {
                "original": "boolean",
                "resolved": "boolean",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": ""
            },
            "attribute": "line-numbers",
            "reflect": true,
            "defaultValue": "false"
        },
        "terminal": {
            "type": "string",
            "mutable": false,
            "complexType": {
                "original": "'carbon' | 'ubuntu' | 'none'",
                "resolved": "\"carbon\" | \"none\" | \"ubuntu\"",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": ""
            },
            "attribute": "terminal",
            "reflect": true,
            "defaultValue": "'carbon'"
        },
        "editable": {
            "type": "boolean",
            "mutable": false,
            "complexType": {
                "original": "boolean",
                "resolved": "boolean",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": ""
            },
            "attribute": "editable",
            "reflect": false,
            "defaultValue": "false"
        }
    }; }
    static get states() { return {
        "editing": {}
    }; }
    static get events() { return [{
            "method": "prismLanguageLoaded",
            "name": "prismLanguageLoaded",
            "bubbles": true,
            "cancelable": true,
            "composed": true,
            "docs": {
                "tags": [],
                "text": ""
            },
            "complexType": {
                "original": "string",
                "resolved": "string",
                "references": {}
            }
        }, {
            "method": "codeDidChange",
            "name": "codeDidChange",
            "bubbles": true,
            "cancelable": true,
            "composed": true,
            "docs": {
                "tags": [],
                "text": ""
            },
            "complexType": {
                "original": "HTMLElement",
                "resolved": "HTMLElement",
                "references": {
                    "HTMLElement": {
                        "location": "global"
                    }
                }
            }
        }]; }
    static get methods() { return {
        "load": {
            "complexType": {
                "signature": "() => Promise<void>",
                "parameters": [],
                "references": {
                    "Promise": {
                        "location": "global"
                    }
                },
                "return": "Promise<void>"
            },
            "docs": {
                "text": "",
                "tags": []
            }
        },
        "findNextAnchor": {
            "complexType": {
                "signature": "(enter: boolean) => Promise<DeckdeckgoHighlightCodeAnchor>",
                "parameters": [{
                        "tags": [],
                        "text": ""
                    }],
                "references": {
                    "Promise": {
                        "location": "global"
                    },
                    "DeckdeckgoHighlightCodeAnchor": {
                        "location": "import",
                        "path": "../declarations/deckdeckgo-highlight-code-anchor"
                    },
                    "NodeListOf": {
                        "location": "global"
                    },
                    "HTMLElement": {
                        "location": "global"
                    }
                },
                "return": "Promise<DeckdeckgoHighlightCodeAnchor>"
            },
            "docs": {
                "text": "",
                "tags": []
            }
        },
        "zoomCode": {
            "complexType": {
                "signature": "(zoom: boolean) => Promise<void>",
                "parameters": [{
                        "tags": [],
                        "text": ""
                    }],
                "references": {
                    "Promise": {
                        "location": "global"
                    },
                    "HTMLElement": {
                        "location": "global"
                    }
                },
                "return": "Promise<void>"
            },
            "docs": {
                "text": "",
                "tags": []
            }
        }
    }; }
    static get elementRef() { return "el"; }
    static get watchers() { return [{
            "propName": "language",
            "methodName": "loadLanguage"
        }, {
            "propName": "lineNumbers",
            "methodName": "onLineNumbersChange"
        }, {
            "propName": "terminal",
            "methodName": "onCarbonChange"
        }]; }
    static get listeners() { return [{
            "name": "prismLanguageLoaded",
            "method": "languageLoaded",
            "target": "document",
            "capture": false,
            "passive": false
        }]; }
}
