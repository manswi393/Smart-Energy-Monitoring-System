#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <WiFi.h>
#include <HTTPClient.h>

// ================= LCD =================
LiquidCrystal_I2C lcd(0x27, 16, 2);

// ================= WIFI =================
const char* ssid = "Shreeya's A14";
const char* password = "Shreeya08";
const char* serverURL = "http://10.234.196.141:3000/data";

// ================= PINS =================
const int currentPin = 34;
const int voltagePin = 35;

// ================= CONSTANTS =================
const float sensitivity = 0.185;   // ACS712 5A
const float rate = 8.0;

// ================= VARIABLES =================
float current = 0;
float voltage = 0;
float power = 0;
float energy = 0;
float predictedCost = 0;

float currentOffset = 0;
float voltageOffset = 0;

unsigned long lastTime = 0;

const int sampleCount = 1000;

// ================= OFFSET CALIBRATION =================
void calibrateOffsets() {
  long sumC = 0;
  long sumV = 0;

  for (int i = 0; i < 2000; i++) {
    sumC += analogRead(currentPin);
    sumV += analogRead(voltagePin);
    delay(1);
  }

  currentOffset = sumC / 2000.0;
  voltageOffset = sumV / 2000.0;

  Serial.print("Current Offset: ");
  Serial.println(currentOffset);

  Serial.print("Voltage Offset: ");
  Serial.println(voltageOffset);
}

// ================= CURRENT =================
float getCurrent() {
  float sumSq = 0;

  for (int i = 0; i < sampleCount; i++) {
    float adc = analogRead(currentPin);

    // Remove offset
    float centered = (adc - currentOffset) * (3.3 / 4095.0);

    sumSq += centered * centered;
  }

  float rms = sqrt(sumSq / sampleCount);

  float currentValue = rms / sensitivity;

  return currentValue;
}

// ================= VOLTAGE =================
float getVoltage() {
  float sumSq = 0;

  for (int i = 0; i < sampleCount; i++) {
    float adc = analogRead(voltagePin);

    // Remove offset
    float centered = (adc - voltageOffset) * (3.3 / 4095.0);

    sumSq += centered * centered;
  }

  float rms = sqrt(sumSq / sampleCount);

  // Scaling factor (you may tune later)
  float realVoltage = rms * 650;

  return realVoltage;
}

// ================= SETUP =================
void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);

  lcd.init();
  lcd.backlight();

  lcd.print("Connecting WiFi");

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.println("Connecting...");
  }

  Serial.println("WiFi Connected");
  lcd.clear();
  lcd.print("WiFi Connected");

  delay(1000);

  // 🔥 CALIBRATE OFFSETS (VERY IMPORTANT)
  lcd.clear();
  lcd.print("Calibrating...");
  calibrateOffsets();

  lcd.clear();
  lcd.print("Meter Ready");

  lastTime = millis();
}

// ================= LOOP =================
void loop() {

  // -------- SENSOR READINGS --------
  current = getCurrent();
  voltage = getVoltage();

  // -------- POWER --------
  float powerFactor = 0.7;
  power = voltage * current * powerFactor;

  // -------- ENERGY --------
  if (millis() - lastTime >= 1000) {
    lastTime = millis();
    energy += (power / 1000.0) * (1.0 / 3600.0);
  }

  // -------- COST --------
  float monthlyUnits = (power / 1000.0) * 24 * 30;
  predictedCost = monthlyUnits * rate;

  // ================= LCD =================
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("V:");
  lcd.print(voltage, 0);
  lcd.print(" I:");
  lcd.print(current, 2);

  lcd.setCursor(0, 1);
  lcd.print("P:");
  lcd.print(power, 0);
  lcd.print("W");

  delay(1500);

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("E:");
  lcd.print(energy, 4);

  lcd.setCursor(0, 1);
  lcd.print("Rs:");
  lcd.print(predictedCost, 0);

  delay(1500);

  // ================= WIFI SEND =================
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    http.begin(serverURL);
    http.addHeader("Content-Type", "application/json");

    String json = "{";
    json += "\"current\":" + String(current, 3) + ",";
    json += "\"voltage\":" + String(voltage, 1) + ",";
    json += "\"power\":" + String(power, 2) + ",";
    json += "\"energy\":" + String(energy, 5) + ",";
    json += "\"predictedCost\":" + String(predictedCost, 2);
    json += "}";

    Serial.println(json);

    int httpResponseCode = http.POST(json);

    Serial.print("HTTP Response: ");
    Serial.println(httpResponseCode);

    http.end();
  }

  // ================= SERIAL =================
  Serial.print("V: "); Serial.print(voltage);
  Serial.print(" I: "); Serial.print(current);
  Serial.print(" P: "); Serial.print(power);
  Serial.print(" E: "); Serial.print(energy);
  Serial.print(" Rs: "); Serial.println(predictedCost);
}