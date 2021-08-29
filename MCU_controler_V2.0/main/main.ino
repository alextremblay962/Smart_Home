#include <ArduinoJson.h>
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <SimpleTimer.h>

SimpleTimer timer;

//============= networking setting ===============
#define MQTT_SERVER "test.mosquitto.org"
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
const char* SSR_topic = "room1/light1";
const char* RGB_topic = "room1/RBG1";

const char* update_Topic = "update";

long lastMsg = 0;
char msg[20];

#define redPin D6
#define greenPin D7
#define bluePin D5


#define SSR_pin D8

int red = 0;
int green = 0;
int blue = 0;
String prevColorStr;
bool pirState = false;
bool prevPirState = false;

void setup()
{
    Serial.begin(115200);
    Serial.println("init...");
    pinMode(redPin, OUTPUT);
    pinMode(greenPin, OUTPUT);
    pinMode(greenPin, OUTPUT);
    pinMode(SSR_pin, OUTPUT);

    WiFi.persistent(false);
    WiFi.disconnect(true);

    //============= networking setup ===============
    WiFi.begin(ssid, password);
    //=================================================
    //===============  MQTT setup ===================
    reconnect();
    delay(2000);
    //=================================================

    Serial.println("Running...");
    analogWrite(redPin, map(red, 0, 255, 0, 1023));
    analogWrite(greenPin, map(green, 0, 255, 0, 1023));
    analogWrite(bluePin, map(blue, 0, 255, 0, 1023));
}

void loop()
{
    // reconnect if connection is lost
    if (!client.connected() && WiFi.status() == 3) {
        reconnect();
    }
    // maintain MQTT connection
    client.loop();

    delay(1);
}

// MQTT callback
void callback(char* topic, byte* payload, unsigned int length)
{
    String topicStr = topic;
    String strValue;
    int Intvalue;

    // Print out some debugging info
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
    Serial.print("topic: ");
    Serial.print(topicStr);
    Serial.print("  value: ");
    Serial.println(strValue);
}

void Update_value(int val, String strval, String topic)
{
    StaticJsonBuffer<200> jsonBuffer;
    JsonObject& root = jsonBuffer.parseObject(strval);

    String colorstr = root["hex"];
    String mode = root["mode"];
    boolean state = root["state"];

    //for RGB

    if (topic == RGB_topic) {

        Serial.print("state: ");
        Serial.println(state);
        Serial.print("mode: ");
        Serial.println(mode);
        Serial.print("color: ");
        Serial.println(colorstr);
        if (state) {
            if (colorstr[0] == '#') {
                long color = (long)strtol(&colorstr[1], NULL, 16);
                red = (color >> 16) & 0xff;
                green = (color >> 8) & 0xff;
                blue = (color)&0xff;

                prevColorStr = colorstr;
            }

        } else {
            red = 0;
            green = 0;
            blue = 0;
        }
        //output value
        analogWrite(redPin, map(red, 0, 255, 0, 1023));
        analogWrite(greenPin, map(green, 0, 255, 0, 1023));
        analogWrite(bluePin, map(blue, 0, 255, 0, 1023));
    } else if (topic = SSR_topic) {
        digitalWrite(SSR_pin , state);
    }
}

// MQTT connection
// networking functions
void reconnect()
{
    digitalWrite(redPin, LOW);
    digitalWrite(greenPin,LOW);
    digitalWrite(bluePin,LOW);
    digitalWrite(SSR_pin,LOW);
    
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

                client.subscribe(SSR_topic);
                client.subscribe(RGB_topic);

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
