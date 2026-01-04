import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import AsyncStorage from "@react-native-async-storage/async-storage";

let connection = null;
let notificationCallback = null;

// API Base URL - Local Development
const BASE_URL = "http://192.168.0.110:5144";

export async function connectUserHub() {
  try {
    const userId = await AsyncStorage.getItem("userId");
    if (!userId) {
      console.log("❌ No userId found");
      return;
    }

    const hubUrl = `${BASE_URL}/userHub?userId=${userId}`;
    console.log("🔗 Connecting to:", hubUrl);

    connection = new HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    // Listener
    connection.on("ReceiveUserNotification", (data) => {
      console.log("📩 SignalR Notification received:", data);
      if (notificationCallback) notificationCallback(data);
    });

    await connection.start();
    console.log("🟢 UserHub Connected");
  } catch (err) {
    console.log("❌ Hub connection error:", err);
  }
}

export function registerNotificationListener(callback) {
  notificationCallback = callback;
}

export function disconnectUserHub() {
  if (connection) {
    connection.stop();
    console.log("🔴 Hub disconnected");
  }
}

