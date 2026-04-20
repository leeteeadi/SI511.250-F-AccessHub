# How to add the hardware package to your repo

## 1. Copy these files
- `blueprints/accesshub_edge.md`
- `blueprints/system_diagram.svg`
- `blueprints/wiring_diagram.svg`
- `firmware/accesshub_edge.ino`
- `frontend/src/HardwareSimulator.jsx`
- `frontend/src/App_with_simulator.jsx`

## 2. Frontend simulation
Replace your current `frontend/src/App.jsx` with the contents of `App_with_simulator.jsx`, then also add `HardwareSimulator.jsx` to the same folder.

## 3. Firmware libraries
In Arduino IDE, install:
- `PubSubClient`
- `ESP32Servo`

## 4. Firmware setup
In `accesshub_edge.ino`, update:
- `WIFI_SSID`
- `WIFI_PASSWORD`
- `MQTT_SERVER` if you use a different broker

## 5. Backend note
Your current backend already emits `unlock_device` on approval, which is enough for the simulator. To drive real hardware through MQTT, the backend should additionally publish an `unlock` command to the MQTT topic.

## 6. Commit commands
```bash
git add blueprints firmware frontend/src/HardwareSimulator.jsx frontend/src/App.jsx README.md
git commit -m "Add AccessHub Edge hardware blueprints and simulator"
git push
```
