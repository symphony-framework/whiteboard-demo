
import { SymphonyClient } from "@symphony-rtc/client";
import { WS_URL } from "./constants";

const client = new SymphonyClient(WS_URL);
export default client
