package main

import (
    "bytes"
    "encoding/json"
    "io"
    "log"
    "net/http"
    "os"
    "time"
    "crypto/tls"
)

type MFAPayload struct {
    Ticket string `json:"ticket"`
    Type   string `json:"mfa_type"`
    Data   string `json:"data"`
}

type MFAResponse struct {
    Token string `json:"token"`
}

type VanityResponse struct {
    MFA struct {
        Ticket string `json:"ticket"`
    } `json:"mfa"`
}

const (
    discordToken = "hesap token"
    password     = "hesap sifre"
)

func setCommonHeaders(req *http.Request, token string) {
    req.Header.Set("Authorization", token)
    req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36")
    req.Header.Set("X-Super-Properties", "eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiQ2hyb21lIiwiZGV2aWNlIjoiIiwic3lzdGVtX2xvY2FsZSI6InRyLVRSIiwiaGFzX2NsaWVudF9tb2RzIjpmYWxzZSwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzEzMy4wLjAuMCBTYWZhcmkvNTM3LjM2IiwiYnJvd3Nlcl92ZXJzaW9uIjoiMTMzLjAuMC4wIiwib3NfdmVyc2lvbiI6IjEwIiwicmVmZXJyZXIiOiIiLCJyZWZlcnJpbmdfZG9tYWluIjoiIiwicmVmZXJyZXJfY3VycmVudCI6IiIsInJlZmVycmluZ19kb21haW5fY3VycmVudCI6IiIsInJlbGVhc2VfY2hhbm5lbCI6ImNhbmFyeSIsImNsaWVudF9idWlsZF9udW1iZXIiOjM2ODc3MCwiY2xpZW50X2V2ZW50X3NvdXJjZSI6bnVsbH0=")
    req.Header.Set("X-Discord-Timezone", "Europe/Berlin")
    req.Header.Set("X-Discord-Locale", "en-US")
    req.Header.Set("X-Debug-Options", "bugReporterEnabled")
    req.Header.Set("Content-Type", "application/json")
}

func getMFAToken(client *http.Client, token, password string) (string, error) {
    body := []byte("{\"code\":\"malaq\"}")
    req, err := http.NewRequest("PATCH", "https://canary.discord.com/api/v7/guilds/123/vanity-url", bytes.NewBuffer(body))
    if err != nil {
        return "", err
    }

    setCommonHeaders(req, token)
    
    resp, err := client.Do(req)
    if err != nil {
        return "", err
    }
    defer resp.Body.Close()

    bodyBytes, err := io.ReadAll(resp.Body)
    if err != nil {
        return "", err
    }

    var vanityResponse VanityResponse
    if err := json.Unmarshal(bodyBytes, &vanityResponse); err != nil {
        return "", err
    }

    payload := MFAPayload{
        Ticket: vanityResponse.MFA.Ticket,
        Type:   "password",
        Data:   password,
    }

    jsonPayload, err := json.Marshal(payload)
    if err != nil {
        return "", err
    }

    mfaReq, err := http.NewRequest("POST", "https://canary.discord.com/api/v9/mfa/finish", bytes.NewBuffer(jsonPayload))
    if err != nil {
        return "", err
    }

    setCommonHeaders(mfaReq, token)

    mfaResp, err := client.Do(mfaReq)
    if err != nil {
        return "", err
    }
    defer mfaResp.Body.Close()

    mfaBodyBytes, err := io.ReadAll(mfaResp.Body)
    if err != nil {
        return "", err
    }

    var mfaResponse MFAResponse
    if err := json.Unmarshal(mfaBodyBytes, &mfaResponse); err != nil {
        return "", err
    }

    return mfaResponse.Token, nil
}

func saveMFAToken(token string) error {
    file, err := os.OpenFile("mfa.txt", os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0644)
    if err != nil {
        return err
    }
    defer file.Close()
    _, err = file.WriteString(token)
    return err
}

func main() {
    log.SetFlags(0)

    client := &http.Client{
        Transport: &http.Transport{
            TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
        },
        Timeout: 5 * time.Second,
    }

    for {
        mfaToken, err := getMFAToken(client, discordToken, password)
        if err != nil {
            log.Println("Error getting MFA token:", err)
        } else {
            err = saveMFAToken(mfaToken)
            if err != nil {
                log.Println("Error saving MFA token:", err)
            } else {
                log.Println("start.bat calıstır")
            }
        }

        time.Sleep(5 * time.Minute)
    }
}
