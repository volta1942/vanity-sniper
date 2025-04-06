"use strict";

const tls = require("tls");
const WebSocket = require("ws");
const extractJsonFromString = require("extract-json-from-string");
const fs = require("fs/promises")

let vanity;
const guilds = {};

const token = "";
const webhookx = "";
const server = "";

let mfaToken = "";

const tlsSocket = tls.connect({
    host: "canary.discord.com",
    port: 443,
});

tlsSocket.on('data', (data) => {
    const ext = extractJsonFromString(data.toString());
    const find = ext.find((e) => e.code) || ext.find((e) => e.message);

    if (find) {
        console.log(find);

        const requestBody = JSON.stringify({
            content: `||@everyone||`,
            embeds: [
                {
                    fields: [
                        {
                            name: "Vanity",
                            value: `\`\`\`${vanity}\`\`\``,
                            inline: true
                        },
                        {
                            name: "Code",
                            value: `\`\`\`${JSON.stringify(find.code)}\`\`\``,
                            inline: true
                        }
                    ]
                }
            ]
        });

        const webhookPath = webhookx;
        const request = [
            `POST ${webhookPath} HTTP/1.1`,
            "Host: canary.discord.com",
            "Content-Type: application/json",
            "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
            "X-Super-Properties: eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiQ2hyb21lIiwiZGV2aWNlIjoiIiwic3lzdGVtX2xvY2FsZSI6InRyLVRSIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzEzMS4wLjAuMCBTYWZhcmkvNTM3LjM2IiwiYnJvd3Nlcl92ZXJzaW9uIjoiMTMxLjAuMC4wIiwib3NfdmVyc2lvbiI6IjEwIiwicmVmZXJyZXIiOiJodHRwczovL2Rpc2NvcmQuY29tLyIsInJlZmVycmluZ19kb21haW4iOiJkaXNjb3JkLmNvbSIsInJlZmVycmluZ19kb21haW5pbi9jdXJlbnQiOiIiLCJyZWZlcnJpbmdfZG9tYWluX2N1cnJlbnQiOiIiLCJyZWxlYXNlX2NoYW5uZWwiOiJzdGFibGUiLCJjbGllZW50X2J1aWxkX25hbWUiOiJ7YWpheDA3QHI7c2M7ZGZbZDQiLCIgQWxnaG9vI0Fay85K5F44-ioY=",
            `Content-Length: ${Buffer.byteLength(requestBody)}`,
            "",
            requestBody
        ].join("\r\n");

        tlsSocket.write(request);
    }
});

tlsSocket.on("error", (error) => {
    console.log("-> TLS Connection Error <-", error);
    return process.exit();
});

tlsSocket.on("end", () => {
    console.log("-> TLS Connection Lost <-");
    return process.exit();
});

const hd1 = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) nosniff/1.0.9164 Chrome/124.0.6367.243 Electron/30.2.0 Safari/537.36",
    Authorization: token,
    "Content-Type": "application/json",
    "X-Super-Properties": "eyJvcyI6IkFuZHJvaWQiLCJicm93c2VyIjoiQW5kcm9pZCBDaHJvbWUiLCJkZXZpY2UiOiJBbmRyb2lkIiwic3lzdGVtX2xvY2FsZSI6InRyLVRSIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKExpbnV4OyBBbmRyb2lkIDYuMDsgTmV4dXMgNSBCdWlsZC9NUkE1OE4pIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS8xMzEuMC4wLjAgTW9iaWxlIFNhZmFyaS81MzcuMzYiLCJicm93c2VyX3ZlcnNpb24iOiIxMzEuMC4wLjAiLCJvc192ZXJzaW9uIjoiNi4wIiwicmVmZXJyZXIiOiJodHRwczovL2Rpc2NvcmQuY29tL2NoYW5uZWxzL0BtZS8xMzAzMDQ1MDIyNjQzNTIzNjU1IiwicmVmZXJyaW5nX2RvbWFpbiI6ImRpc2NvcmQuY29tIiwicmVmZXJyZXJfY3VycmVudCI6IiIsInJlZmVycmluZ19kb21haW5fY3VycmVudCI6IiIsInJlbGVhc2VfY2hhbm5lbCI6InN0YWJsZSIsImNsaWVudF9idWlsZF9udW1iZXIiOjM1NTYyNCwiY2xpZW50X2V2ZW50X3NvdXJjZSI6bnVsbCwiaGFzX2NsaWVudF9tb2RzIjpmYWxzZX0=",
};

tlsSocket.on("secureConnect", () => {
    const websocket = new WebSocket("wss://gateway.discord.gg");

    websocket.onclose = (event) => {
        console.log("-> WebSocket Connection Lost <-");
        return process.exit();
    };

    websocket.onmessage = async (message) => {
        const { d, op, t } = JSON.parse(message.data);

        if (t === "GUILD_UPDATE") {
            const vanityCode = guilds[d.guild_id];
            if (vanityCode && vanityCode !== d.vanity_url) {
                const requestBody = JSON.stringify({ code: vanityCode });
                tlsSocket.write([
                    `PATCH /api/v6/guilds/${server}/vanity-url HTTP/1.1`,
                    'Host: canary.discord.com',
                    'Content-Type: application/json',
                    'Accept-Encoding: gzip, deflate, br, zstd',
                    'X-Discord-MFA-Authorization: ' + mfaToken,
                    'Cookie: __Secure-recent_mfa=' + mfaToken,
                    `Content-Length: ${Buffer.byteLength(requestBody)}`,
                    ...Object.entries(hd1).map(([key, value]) => `${key}: ${value}`),
                    '',
                    requestBody
                ].join('\r\n'));
                vanity = `${find}`;
            }
          }    
        else if (t === "READY") {
            d.guilds.forEach((guild) => {
                if (guild.vanity_url_code) {
                    guilds[guild.id] = guild.vanity_url_code;
                }
                else {
                }
            });
            console.log(guilds);
        }

        if (op === 10) {
            websocket.send(JSON.stringify({
                op: 2,
                d: {
                    token: a,
                    intents: 513 << 0,
                    properties: {
                        os: "Windows",
                        browser: "Chrome",
                        device: "Desktop",
                    },
                },
            }));
            setInterval(() => websocket.send(JSON.stringify({ op: 1, d: {}, s: null, t: "heartbeat" })), d.heartbeat_interval);
        }
    };

    setInterval(() => {
        tlsSocket.write(["GET / HTTP/1.1", "Host: canary.discord.com", "", ""].join("\r\n"));
    }, 60);
}); 

const readMFAToken = async () => { 
    mfaToken = await fs.readFile('mfa.txt', 'utf8');
    console.log("MFA Token Has Been Read");
};

readMFAToken();
