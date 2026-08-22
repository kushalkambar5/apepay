# ApePay is a crypto(Ethereum) payment gateway which allow merchants to accept payments in crypto with privacy


this project i have to show only as a mvp as a demo so i will be showing the demo in local anvil for now.

backend will be exposed with ngrok
and frontend will be hosted on vercel.
Contracts will be in Local Anvil for now
db will be postgresql(drizzle) running on my laptop




DB Tables


users
────────────────────────────────
id                  UUID PK
email               VARCHAR UNIQUE
password_hash       TEXT
name                VARCHAR
created_at          TIMESTAMP
updated_at          TIMESTAMP





merchants
────────────────────────────────
id                  UUID PK
user_id             UUID FK → users.id

business_name       VARCHAR
website             TEXT

status              ENUM
                    active
                    suspended

created_at          TIMESTAMP
updated_at          TIMESTAMP


merchant_wallets
────────────────────────────────
id                  UUID PK
merchant_id         UUID FK

network             VARCHAR
                    anvil

address             VARCHAR

wallet_type         ENUM
                    payout
                    authentication

is_active           BOOLEAN

created_at          TIMESTAMP
updated_at          TIMESTAMP




api_keys
────────────────────────────────
id                  UUID PK
merchant_id         UUID FK

name                VARCHAR

key_prefix          VARCHAR
key_hash            TEXT

environment         ENUM
                    test
                    live

last_used_at        TIMESTAMP
expires_at          TIMESTAMP

revoked_at          TIMESTAMP

created_at          TIMESTAMP




payments
────────────────────────────────
id                  UUID PK

payment_id          VARCHAR UNIQUE
merchant_id         UUID FK

order_id            VARCHAR

amount              NUMERIC
currency            VARCHAR

network             VARCHAR

status              ENUM

checkout_url        TEXT

redirect_url        TEXT

expires_at          TIMESTAMP

paid_at             TIMESTAMP

created_at          TIMESTAMP
updated_at          TIMESTAMP



Payment status enum
created
pending
processing
paid
expired
failed
cancelled



payment_intents
────────────────────────────────
id                      UUID PK

payment_id              UUID FK UNIQUE

protocol                VARCHAR
                        zkbob

protocol_version        VARCHAR

asset                   VARCHAR
                        ETH

network                 VARCHAR
                        anvil

expected_amount         NUMERIC

payment_identifier      TEXT

commitment              TEXT

recipient_identifier    TEXT

expires_at              TIMESTAMP

created_at              TIMESTAMP
updated_at              TIMESTAMP





payment_events
────────────────────────────────
id                  UUID PK

payment_id          UUID FK

event_type          VARCHAR

old_status          VARCHAR NULL
new_status          VARCHAR NULL

source              VARCHAR

metadata            JSONB

created_at          TIMESTAMP





webhook_endpoints
────────────────────────────────
id                  UUID PK

merchant_id         UUID FK

url                 TEXT

secret_hash         TEXT

is_active            BOOLEAN

created_at          TIMESTAMP
updated_at          TIMESTAMP



webhook_deliveries
────────────────────────────────
id                  UUID PK

webhook_endpoint_id UUID FK
payment_id          UUID FK

event_type          VARCHAR

payload             JSONB

status              ENUM
                    pending
                    delivered
                    failed

attempt_count       INTEGER

next_retry_at       TIMESTAMP NULL

last_response_code  INTEGER NULL

last_error          TEXT NULL

created_at          TIMESTAMP
delivered_at        TIMESTAMP NULL













                         ┌──────────────┐
                         │    users     │
                         └──────┬───────┘
                                │
                                │ 1:N
                                ▼
                         ┌──────────────┐
                         │  merchants   │
                         └──────┬───────┘
                                │
             ┌──────────────────┼──────────────────┐
             │                  │                  │
             ▼                  ▼                  ▼
      ┌────────────┐     ┌────────────┐     ┌───────────────┐
      │ api_keys   │     │  wallets   │     │ webhook_      │
      │            │     │            │     │ endpoints     │
      └────────────┘     └────────────┘     └───────┬───────┘
                                                    │
                                                    ▼
                                            ┌───────────────┐
                                            │   webhook_    │
                                            │   deliveries  │
                                            └───────────────┘


                         ┌──────────────┐
                         │   payments   │
                         └──────┬───────┘
                                │
                 ┌──────────────┼──────────────┐
                 │              │              │
                 ▼              ▼              ▼
        ┌────────────────┐ ┌──────────────┐ ┌──────────────┐
        │ payment_intent │ │ payment_event│ │ blockchain_  │
        │                │ │              │ │ transactions │
        └────────────────┘ └──────────────┘ └──────────────┘