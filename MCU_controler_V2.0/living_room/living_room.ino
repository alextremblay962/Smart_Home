#include <ArduinoJson.h>
#include <BH1750.h>
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <SimpleTimer.h>
#include <Wire.h>

SimpleTimer timer;

//============= networking setting ===============
#define MQTT_SERVER "192.168.16.25"
#define port 1883
const char* ssid = "103-961-Lamarche";
const char* password = "LimeRouge16";
//=================================================
//===============  MQTT setting ===================
void callback(char* topic, byte* payload, unsigned int length);
WiFiClient wifiClient;
PubSubClient client(MQTT_SERVER, port, callback, wifiClient);
//=================================================

// topic to subscribe //
const char* T_RGB = "L-MVusr05_oP/living_room/tv_light";
const char* T_PIR = "L-MVusr05_oP/living_room/pir";
const char* T_lightevel = "L-MVusr05_oP/living_room/lux";
const char* update_Topic = "update";

long lastMsg = 0;
char msg[20];

#define redPin D6
#define greenPin D7
#define bluePin D5
#define PIRPin D8

int red = 0;
int green = 0;
int blue = 0;
String prevColorStr;
bool pirState = false;
bool prevPirState = false;

//BH1750 lightMeter;

void setup()
{
    Serial.begin(115200);
    Serial.println("init...");
    pinMode(redPin, OUTPUT);
    pinMode(greenPin, OUTPUT);
    pinMode(greenPin, OUTPUT);

    Wire.begin();

    WiFi.persistent(false);
    WiFi.disconnect(true);

    //============= networking setup ===============
    WiFi.begin(ssid, password);
    //=================================================
    //===============  MQTT setup ===================
    reconnect();
    delay(2000);
    //=================================================

    //================  BH1750 ======================
    //lightMeter.begin();

    Serial.println("Running...");
    analogWrite(redPin, map(red, 0, 255, 0, 1023));
    analogWrite(greenPin, map(green, 0, 255, 0, 1023));
    analogWrite(bluePin, map(blue, 0, 255, 0, 1023));

    //timer.setInterval(80L, send_lux);
    timer.setInterval(80L, PIRupdate);
}

void loop()
{
    // reconnect if connection is lost
    if (!client.connected() && WiFi.status() == 3) {
        reconnect();
    }
    // maintain MQTT connection
    client.loop();
    //PIRupdate();

    timer.run();

    delay(1);
}

// MQTT callback
void callback(char* topic, byte* payload, unsigned int length)
{
    String topicStr = topic;
    String strValue;
    int Intvalue;

    //Print out some debugging info
    Serial.println("Callback update.");
    Serial.print("Topic: ");
    Serial.println(topicStr);

    for (int i = 0; i < length; i++) {
        Serial.print((char)payload[i]);
        strValue += (char)payload[i];
    }
    Serial.println();
    Intvalue = strValue.toInt();

    Update_value(Intvalue, strValue, topicStr);
}

void Update_value(int val, String strval, String topic)
{

    //for RGB

    if (topic == T_RGB) {
        StaticJsonBuffer<200> jsonBuffer;
        JsonObject& root = jsonBuffer.parseObject(strval);

        String colorstr = root["color"];
        String mode = root["mode"];
        boolean state = root["state"];

        Serial.print("state: ");
        Serial.println(state);
        Serial.print("mode: ");
        Serial.println(mode);
        Serial.print("color: ");
        Serial.println(colorstr);
        if (1) {
            if (colorstr[0] == '#') {
                long color = (long)strtol(&colorstr[1], NULL, 16);
                red = (color >> 16) & 0xff;
                green = (color >> 8) & 0xff;
                blue = (color)&0xff;

                prevColorStr = colorstr;
            }
            Serial.print("Green: ");
            Serial.println(green);

            //output value
            analogWrite(redPin, map(red, 0, 255, 0, 1023));
            analogWrite(greenPin, map(green, 0, 255, 0, 1023));
            analogWrite(bluePin, map(blue, 0, 255, 0, 1023));
        }
    }
}

// MQTT connection
// networking functions
void reconnect()
{
    // WiFi connect
    if (WiFi.status() != WL_CONNECTED) {
        // debug printing
        Serial.print("Connecting to ");
        Serial.println(ssid);

        // loop while we wait for connection
        while (WiFi.status() != WL_CONNECTED) {
            delay(500);
            Serial.print(".");
        }
        Serial.println("");
        Serial.println("WiFi connected");
        Serial.println("IP address: ");
        Serial.println(WiFi.localIP());
    }

    // mqtt connect
    if (WiFi.status() == WL_CONNECTED) {
        while (!client.connected()) {
            Serial.print("Attempting MQTT connection...");
            String clientName;
            clientName += "esp8266-";
            uint8_t mac[6];
            WiFi.macAddress(mac);
            clientName += macToStr(mac);

            if (client.connect((char*)clientName.c_str())) {
                Serial.println("\tMTQQ Connected");
                //========================   topic to subscribe ========================

                client.subscribe(T_RGB);

                //========================   topic to subscribe ========================

                client.publish(update_Topic, "1");
                Serial.println("send update");
            }
            // otherwise print failed for debugging
            else {
                Serial.println("\tFailed.");
                abort();
            }
        }
    }
}

// generate unique name from MAC addr
String macToStr(const uint8_t* mac)
{
    String result;
    for (int i = 0; i < 6; ++i) {
        result += String(mac[i], 16);

        if (i < 5) {
            result += ':';
        }
    }
    return result;
}

void PIRupdate()
{
    //Serial.println("PIR state change");
    pirState = digitalRead(PIRPin);
    String state = String(pirState);
    String braket = "}";
    String payload;

    StaticJsonBuffer<200> jsonBuffer;
    JsonObject& root = jsonBuffer.createObject();

    root["value"] = pirState;

    root.printTo(payload);

    if (pirState != prevPirState) {
        client.publish(T_PIR, (char*)payload.c_str());
        prevPirState = pirState;
        Serial.print("PIR state change to : ");
        Serial.println(pirState);
    }
    delay(50);
}

// int prevlux = 0;
// void send_lux() {

//   int lux = lightMeter.readLightLevel();

//   if (lux - prevlux >= 5 || prevlux - lux >= 5) {
//     client.publish(T_lightevel, (char *)String(lux).c_str());
//     delay(500);

//     Serial.print("light: ");
//     Serial.println(lightMeter.readLightLevel());
//     prevlux = lux;
//   }
// }
