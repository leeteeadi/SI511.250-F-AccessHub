#include <WiFi.h>
#include <PubSubClient.h>
#include <ESP32Servo.h>

const char* WIFI_SSID = "YOUR_WIFI_NAME";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* MQTT_SERVER = "broker.hivemq.com";
const int MQTT_PORT = 1883;

const char* DEVICE_ID = "door1";
const char* COMMAND_TOPIC = "accesshub/device/door1/command";
const char* STATUS_TOPIC = "accesshub/device/door1/status";
const char* EVENT_TOPIC = "accesshub/device/door1/event";

const int SERVO_PIN = 23;
const int GREEN_LED_PIN = 22;
const int RED_LED_PIN = 21;
const int YELLOW_LED_PIN = 19;
const int BUZZER_PIN = 18;
const int BUTTON_PIN = 17;
const int DOOR_SENSOR_PIN = 16;

WiFiClient espClient;
PubSubClient mqttClient(espClient);
Servo lockServo;

unsigned long lastHeartbeat = 0;
unsigned long lastBlink = 0;
bool yellowBlinkState = false;
int lastDoorState = HIGH;

void setIdleState() {
  digitalWrite(GREEN_LED_PIN, LOW);
  digitalWrite(RED_LED_PIN, LOW);
  digitalWrite(YELLOW_LED_PIN, HIGH);
}

void beep(int count, int durationMs, int gapMs) {
  for (int i = 0; i < count; i++) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(durationMs);
    digitalWrite(BUZZER_PIN, LOW);
    delay(gapMs);
  }
}

void publishStatus(const char* status) {
  String payload = String("{\"deviceId\":\"") + DEVICE_ID +
                   "\",\"status\":\"" + status +
                   "\",\"timestamp\":" + millis() + "}";
  mqttClient.publish(STATUS_TOPIC, payload.c_str(), true);
}

void publishEvent(const char* eventType, const char* details = "") {
  String payload = String("{\"deviceId\":\"") + DEVICE_ID +
                   "\",\"event\":\"" + eventType +
                   "\",\"details\":\"" + details +
                   "\",\"timestamp\":" + millis() + "}";
  mqttClient.publish(EVENT_TOPIC, payload.c_str());
}

void unlockForSeconds(int durationSeconds) {
  digitalWrite(YELLOW_LED_PIN, LOW);
  digitalWrite(RED_LED_PIN, LOW);
  digitalWrite(GREEN_LED_PIN, HIGH);

  publishStatus("unlocking");
  publishEvent("unlock_started");

  lockServo.write(90);
  beep(1, 120, 80);
  delay(durationSeconds * 1000);

  lockServo.write(0);
  publishEvent("unlock_completed");
  publishStatus("locked");
  setIdleState();
}

void denyAccess() {
  digitalWrite(GREEN_LED_PIN, LOW);
  digitalWrite(YELLOW_LED_PIN, LOW);
  digitalWrite(RED_LED_PIN, HIGH);
  beep(2, 90, 80);
  publishEvent("access_denied");
  delay(1200);
  setIdleState();
}

void handleCommand(char* topic, byte* payload, unsigned int length) {
  String message;
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }

  if (message.indexOf("unlock") >= 0) {
    unlockForSeconds(5);
  } else if (message.indexOf("deny") >= 0) {
    denyAccess();
  }
}

void connectWiFi() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    digitalWrite(YELLOW_LED_PIN, yellowBlinkState ? HIGH : LOW);
    yellowBlinkState = !yellowBlinkState;
    delay(400);
  }
}

void connectMQTT() {
  while (!mqttClient.connected()) {
    String clientId = String("accesshub-") + DEVICE_ID;
    if (mqttClient.connect(clientId.c_str())) {
      mqttClient.subscribe(COMMAND_TOPIC);
      publishStatus("online");
      setIdleState();
    } else {
      delay(1000);
    }
  }
}

void setup() {
  Serial.begin(115200);

  pinMode(GREEN_LED_PIN, OUTPUT);
  pinMode(RED_LED_PIN, OUTPUT);
  pinMode(YELLOW_LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(DOOR_SENSOR_PIN, INPUT_PULLUP);

  lockServo.attach(SERVO_PIN);
  lockServo.write(0);
  setIdleState();

  connectWiFi();
  mqttClient.setServer(MQTT_SERVER, MQTT_PORT);
  mqttClient.setCallback(handleCommand);
  connectMQTT();
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  if (!mqttClient.connected()) {
    connectMQTT();
  }

  mqttClient.loop();

  if (millis() - lastHeartbeat > 15000) {
    publishStatus("online");
    lastHeartbeat = millis();
  }

  if (digitalRead(BUTTON_PIN) == LOW) {
    publishEvent("button_pressed");
    delay(250);
  }

  int currentDoorState = digitalRead(DOOR_SENSOR_PIN);
  if (currentDoorState != lastDoorState) {
    if (currentDoorState == LOW) {
      publishEvent("door_opened");
    } else {
      publishEvent("door_closed");
    }
    lastDoorState = currentDoorState;
    delay(100);
  }
}
