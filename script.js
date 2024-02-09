wasm4keyboard = {
    _enabled: false,
    document: null,
    console: null,
    notifications: null,
    clock: false,
    
    _findConsole: function() {
        let console = document.getElementsByTagName("wasm4-app")[0];
        if (console != null) return [console, document];
        
        // wasm4.org embeds games in iframes, so we should check them too.
        for (const iframe of document.getElementsByTagName("iframe")) {
            let elements = iframe.contentDocument.getElementsByTagName("wasm4-app");
            if (elements.length > 0) return [elements[0], iframe.contentDocument];
        }
        
        return [null, null];
    },
    
    initialize: function() {
        [this.console, this.document] = this._findConsole();

        if (console == null) {
            console.error("[WASM-4 Keyboard] <wasm4-app> couldn't be found!");
            return;
        }
        
        this.notifications = this.console.shadowRoot.children[0].children[0];
        
        this.document.addEventListener('keydown', (e) => {     
            if (e.keyCode == 13 && e.ctrlKey) {
                wasm4keyboard.enabled = !wasm4keyboard.enabled;
            }
            
            if ((!wasm4keyboard.enabled) || wasm4keyboard.console.showMenu) return;
            e.preventDefault();
            e.stopImmediatePropagation();
            e.stopPropagation();
            
            if (e.keyCode == 13 && e.altKey && !wasm4keyboard.console.showMenu)  {
                    wasm4keyboard.console.showMenu = true;
                    setTimeout(() => wasm4keyboard.console.showMenu = true, 10);
            }
            
            wasm4keyboard.input(true, e);
            
            return false;
        });
        
        this.document.addEventListener('keyup', (e) => {
            if (!wasm4keyboard.enabled || wasm4keyboard.console.showMenu) return;
            
            e.preventDefault();
            e.stopImmediatePropagation();

            wasm4keyboard.input(false, e);
        })
    },
    
    input: function(down, event) {
        let isAscii = (event.key.length == 1) && (event.key.codePointAt() <= 255);
    
        if (event.keyCode == 0) return;
    
        this.console.inputState.gamepad[0] |= 8;
        this.console.inputState.gamepad[1] = (
            this.clock
            | (down << 1)
            | (event.shiftKey << 2)
            | (event.ctrlKey << 3)
            | (event.altKey << 4)
            | (event.metaKey << 5)
            | (event.getModifierState('CapsLock') << 6)
            | (isAscii << 7)
        );
        this.console.inputState.gamepad[2] = isAscii? event.key.codePointAt(): 0;
        this.console.inputState.gamepad[3] = event.keyCode;
        this.clock = !this.clock;
    },
    
    get enabled() {
        return this._enabled;
    },
    
    set enabled(value) {
        this._enabled = value;
        this.clock = false;
        
        if (value) {
            this.console.inputState.gamepad[0] |= 8;
            
            this.notifications.show("Keyboard enabled!");
            this.notifications.show("- Use ALT+ENTER to pause.");
            this.notifications.show("- Use CTRL+ENTER to disable.")
        } else {
            this.console.inputState.gamepad[0] &= ~8;
            
            this.notifications.show("Keyboard disabled!");
            this.notifications.show("- Use CTRL+ENTER to reenable.");
        }
    }
}

if (document.readyState != "complete") {
    document.addEventListener('load', () => wasm4keyboard.initialize());
} else {
    wasm4keyboard.initialize();
    wasm4keyboard.enabled = true;
}
