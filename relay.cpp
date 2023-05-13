#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266mDNS.h>
#include <ESPAsyncWebServer.h>

// Using nodemcu v3 lolin

// Your Device PIN
const int RELAY = D1;
const int LED = D4;
// Your SSID and deviceName
const char *ssid = "SSID";
const char *password = "PASSWORD";
const char *deviceName = "NAME";

AsyncWebServer server(80);

unsigned long currentTime = millis();
// Update mDNS
unsigned long lastUpdateTime = currentTime;
const unsigned long updateInterval = 10000;
// Prevent Spam
bool tasking = false;
bool tasktimeout = false;
unsigned long lastTriggerTime = currentTime;
const unsigned long TriggerTimeout = 100;
const unsigned long TriggerTimePreventSpam = 600;

void disableRelay() {
  digitalWrite(LED, HIGH);
  digitalWrite(RELAY, HIGH);
}

void enableRelay() {
  digitalWrite(LED, LOW);
  digitalWrite(RELAY, LOW);
}

void updatetask() {
  // Fast Relay Switch
  if (tasktimeout && (currentTime - lastTriggerTime >= TriggerTimeout)) {
    disableRelay();
    tasktimeout = false;
  }
  // Prevent Spam
  if (tasking && (currentTime - lastTriggerTime >= TriggerTimePreventSpam)) {
    tasking = false;
  }
}

void setup() {
  pinMode(RELAY, OUTPUT);
  digitalWrite(RELAY, HIGH);
  pinMode(LED, OUTPUT);
  digitalWrite(LED, LOW);

  WiFi.hostname(deviceName);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) delay(500);
  WiFi.setAutoReconnect(true);
  MDNS.begin(deviceName);

  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request) {
    // Maybe Redirect to website?
    request->send(200, "text/plain", "Hello World!");
  });

  server.on("/trigger", HTTP_GET, [](AsyncWebServerRequest *request) {
    if (!tasking) {
      lastTriggerTime = currentTime;
      tasking = true;
      tasktimeout = true;
      enableRelay();
      request->send(200, "text/plain", "success");
    } else {
      request->send(200, "text/plain", "rate limited");;
    }
  });

  server.onNotFound([](AsyncWebServerRequest *request) {
    request->send(404, "text/plain", "Not found");
  });

  server.begin();
  digitalWrite(LED, HIGH);
}

void loop() {
  currentTime = millis();

  // Update MDNS
  if (currentTime - lastUpdateTime >= updateInterval) {
    lastUpdateTime = currentTime;
    if (WiFi.status() == WL_CONNECTED) MDNS.update();
  }

  // Every CPU Cycle Task
  updatetask();
}