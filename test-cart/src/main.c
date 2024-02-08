#include "wasm4.h"
#include <stdbool.h>

#include "keyboard.h"
#include "keycodes.h"

void drawByte(int y, uint8_t byte) {
    *DRAW_COLORS = 0x02;
    for (uint8_t i = 0; i < 8; i++) {
        if ((byte >> i) & 0b00000001) {
            text("1", 85 + 8*i, y);
        } else {
            text("0", 85 + 8*i, y);
        }
    }
}

bool clock = false;

#define BUFFER_SIZE (17*8)
char buffer[BUFFER_SIZE] = {0};
uint8_t lastIdx = 0;

void update() {
    if ((*GAMEPAD1 & KEYBOARD_ENABLED)) {
        uint8_t info = *KEYBOARD_INFO; 
        if ((info & INFO_CLOCK) != clock) {
            clock = (info & INFO_CLOCK);
            char code = (char) *KEYBOARD_CODE;
            char key  = (char) *KEYBOARD_ASCII;
            
            if (info & INFO_DOWN) {
                if (code == KEY_BACKSPACE && lastIdx > 0) {
                    lastIdx--;
                    buffer[lastIdx] = 0;
                }
                else if (lastIdx < (BUFFER_SIZE - 1)) {
                    if (code == KEY_ENTER) key = '\n';
                    if (key != 0) {
                        buffer[lastIdx] = key;
                        lastIdx++;
                    }
                }
            }
        }
    }

    *DRAW_COLORS = 0x03;
    text("\x80\x81  \x84\x85\x86\x87", 85, 10);
    
    text("Gamepad1", 10, 20);
    drawByte(20, *GAMEPAD1);
    
    *DRAW_COLORS = 0x03;
    text("Gamepad2", 10, 30);
    drawByte(30, *GAMEPAD2);
    
    *DRAW_COLORS = 0x03;
    text("Gamepad3", 10, 40);
    drawByte(40, *GAMEPAD3);
    
    *DRAW_COLORS = 0x03;
    text("Gamepad4", 10, 50);
    drawByte(50, *GAMEPAD4);
    
    *DRAW_COLORS = 0x21;
    rect(5, 65, 150, 73);
    *DRAW_COLORS = 0x03;
    text(buffer, 8, 70);
    
    *DRAW_COLORS = 0x12;
    text((*GAMEPAD1 & KEYBOARD_ENABLED)? "Ready.": "No keyboard!", 5, 145);
}
