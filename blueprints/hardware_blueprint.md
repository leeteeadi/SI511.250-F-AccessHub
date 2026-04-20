# AccessHub Edge Hardware Blueprint

## Components
- ESP32
- Servo Motor
- Relay Module
- LEDs (Green, Red, Yellow)
- Push Button
- Buzzer

## Wiring
GPIO23 -> Servo Signal
GPIO22 -> Green LED
GPIO21 -> Red LED
GPIO19 -> Yellow LED
GPIO17 -> Button
GPIO18 -> Buzzer

## Behavior
- Green = access granted
- Red = denied
- Yellow = idle
