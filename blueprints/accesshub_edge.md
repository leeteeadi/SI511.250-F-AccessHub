# AccessHub Edge Hardware Blueprint

## 1. Purpose
AccessHub Edge is the physical controller that connects the AccessHub software platform to a real or simulated door lock. Its job is to receive an approved unlock command from the backend, actuate a lock mechanism, display the result on LEDs, and report device state back to the dashboard.

## 2. Demo Story
1. A guest clicks **Request Access** in the web app.
2. A manager clicks **Approve**.
3. The backend publishes an **unlock** command for the device.
4. The device turns the **green LED** on and unlocks the mechanism for 5 seconds.
5. The device relocks and returns to **idle**.
6. The dashboard shows the event in real time.

## 3. Recommended Hardware
### Controller
- ESP32 DevKit V1

### Outputs
- SG90 or MG90S servo motor for a safe demo lock
- Green LED for access granted
- Red LED for access denied
- Yellow LED for online / idle
- Piezo buzzer for audible feedback

### Inputs
- Push button for local request / manual trigger
- Reed switch or magnetic sensor for door state (optional)

### Power
- USB power for ESP32
- Separate 5V supply for servo if needed
- Common ground between ESP32 and servo power supply

## 4. Bill of Materials (BOM)
- 1 × ESP32 DevKit V1
- 1 × SG90 servo motor
- 1 × breadboard or perfboard
- 3 × LEDs (green, red, yellow)
- 3 × 220 ohm resistors
- 1 × piezo buzzer
- 1 × push button
- 1 × magnetic reed switch (optional)
- jumper wires
- USB cable
- small acrylic board / cardboard base for presentation

## 5. GPIO Map
| ESP32 Pin | Connected Part | Purpose |
|---|---|---|
| GPIO23 | Servo signal | Lock / unlock movement |
| GPIO22 | Green LED | Access granted |
| GPIO21 | Red LED | Access denied |
| GPIO19 | Yellow LED | Idle / online |
| GPIO18 | Buzzer | Feedback beeps |
| GPIO17 | Push button | Local request input |
| GPIO16 | Door sensor | Open / closed state |
| 5V | Servo VCC / peripherals | Power |
| GND | All grounds | Common ground |

## 6. Wiring Instructions
### LEDs
For each LED:
- ESP32 GPIO pin -> 220 ohm resistor -> LED anode
- LED cathode -> GND

### Button
- GPIO17 -> one side of push button
- other side of push button -> GND
- configure in firmware as `INPUT_PULLUP`

### Buzzer
- GPIO18 -> buzzer positive
- buzzer negative -> GND

### Servo
- GPIO23 -> servo signal wire
- external 5V -> servo VCC
- GND -> servo GND
- make sure servo GND and ESP32 GND are connected together

### Door Sensor (optional)
- GPIO16 -> sensor output
- other side -> GND
- configure as `INPUT_PULLUP`

## 7. Device State Logic
- **Idle / online:** yellow LED on
- **Access granted:** green LED on, servo unlocks, short beep
- **Access denied:** red LED on, double beep
- **Offline / error:** yellow LED blinks slowly

## 8. Communication Design
### Preferred protocol
MQTT for device communication, because it is lightweight and good for device commands.

### Topics
- `accesshub/device/door1/command`
- `accesshub/device/door1/status`
- `accesshub/device/door1/event`

### Example unlock payload
```json
{
  "type": "unlock",
  "durationSeconds": 5,
  "requestId": "req_123"
}
```

## 9. Backend Integration
The backend should publish an unlock command when a request is approved. The device firmware subscribes to the command topic and executes the action.

### Example backend flow
- user requests access
- manager approves request
- backend emits websocket update to UI
- backend publishes MQTT unlock command to the ESP32
- ESP32 unlocks servo and reports status

## 10. Physical Layout
Recommended demo board layout:
- ESP32 mounted on the left
- three LEDs in a row at center top
- button at lower center
- servo mounted on the right with a visible latch arm
- optional printed labels under each part for demo clarity

## 11. What to say in a demo
"The ESP32 controller acts as the bridge between the AccessHub platform and a physical lock. When the manager approves access in the dashboard, the backend sends an unlock command to the device. The device gives visual feedback with LEDs, actuates the lock, and reports the event back to the system in real time."

## 12. Safety Notes
- For demo purposes, use a servo-driven mock lock instead of a real strike lock.
- Do not power the servo directly from the ESP32 3.3V pin.
- Keep the system low voltage only.
