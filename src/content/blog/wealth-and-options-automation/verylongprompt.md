---
title: "\"Part 20: The Master Prompt — Sovereign Wealth Engine (Copy-Paste"
description: "\"A fully self-contained, ultra-detailed natural-language prompt"
pubDate: "2026-06-07"
tags:
category: "Wealth & Automation"
author: "Chirag Singhal"
series: "Wealth & Option Trading Automation"
part: 20
draft: false
---


# Part 20: The Master Prompt — Sovereign Wealth Engine

> **How to use this page:** Copy everything inside the "Master Prompt" section
> below and paste it as-is into any capable AI coding agent (Gemini,
> Claude Sonnet, GPT-4o, or a local Llama model via Groq). The agent will
> read your goals, ask clarifying questions if needed, then generate the
> complete repository scaffold automatically. No manual coding required.

---

## Master Prompt (Begin copying from the next line)

---

You are a Staff-level Systems Architect, Senior Quant Developer, and DevOps
Engineer. Your task is to design and generate the **complete repository**
for a project called **sovereign-wealth-engine**. This is a paper trading,
backtesting, and multi-asset wealth tracking system built entirely for zero
ongoing cost, running on free cloud services only. No real orders are ever
placed. This system is for a software developer based in Bhubaneswar, India,
employed at TCS, who wants to automate the simulation and tracking of every
viable investment strategy available in the Indian financial market.

---

### SECTION 1: ABSOLUTE CONSTRAINTS — READ BEFORE EVERYTHING ELSE

Every decision you make must satisfy all of these constraints simultaneously.
If any proposed component violates any of these, reject it and find an
alternative.

The infrastructure cost must be zero rupees per month, every month,
permanently. No paid VMs. No paid databases. No paid APIs. No paid data
feeds. No annual subscriptions. No hidden fees. The broker account opening
fees must be zero and the Annual Maintenance Charge (AMC) on the broker
account must also be zero. All broker APIs used must be completely free with
no monthly charge for API access.

The execution engine for all automation must be GitHub Actions using the
free tier (2,000 minutes per month for public repositories). No VMs, no
Oracle Cloud, no EC2, no Railway, no Render, no Fly.io. GitHub Actions
cron jobs are the only permitted execution engine.

The database must be a single free-tier database. Turso's Starter plan is
the recommended choice because it provides one database (or up to 500 on
the free tier), 9 GB of storage, 1 billion row reads per month, and 25
million row writes per month. A single database is sufficient for the entire
system. Do not create multiple databases. Everything — all strategies, all
portfolio tracking, all history — goes into one Turso database accessed via
the Turso HTTP REST API, which requires no SDK and works from any Python
HTTP library.

The dashboard must be a static HTML and JavaScript page hosted on GitHub
Pages (free) or Cloudflare Pages (free). No server-side rendering. No
Next.js. No Vercel. The dashboard fetches data directly from Turso using
the Turso read-only HTTP endpoint from the browser.

The system must never place real orders with any broker. All "orders" are
simulated paper trades written to the database. The word "execute" in
strategy context always means "simulate a paper trade entry into the
database."

---

### SECTION 2: REPOSITORY IDENTITY AND PURPOSE

The repository name is **sovereign-wealth-engine**. Choose this name because
it signals that this is a personal financial sovereignty tool — a paper
trading and wealth simulation engine, not a real trading system. The README
must contain a prominent disclaimer at the very top stating that this system
only simulates paper trades, never places real orders, and is purely
educational and for personal research.

The repository is public. It contains no real money, no real credentials
in version control (all secrets are in GitHub Secrets), and no personally
identifiable information.

The system must be designed to run indefinitely, for years, without manual
intervention. The user will occasionally update environment variables (for
example, when MTF interest rates change or when P2P lending rates change)
but the system must otherwise be fully autonomous.

The primary programming language is Python 3.12. The dashboard is plain HTML,
CSS, and vanilla JavaScript with Chart.js loaded from CDN. No TypeScript.
No React. No build step for the dashboard.

---

### SECTION 3: ALL FREE DATA SOURCES AND THEIR ROLES

The coding agent must choose the best available data source for each category.
All data sources listed here are free with no API key required, or free with
a free-tier API key that does not require credit card or payment to obtain.

**For Indian Equity Historical OHLCV Data (daily candles):**
Use yfinance for Nifty 50 index (ticker symbol NSEI) and Nifty Bank (NSEBANK)
daily price data. yfinance is completely free and requires no account.
Alternatively use the jugaad-data Python library which directly scrapes NSE
and provides cleaner Indian market data including F&O segment history.

**For Indian Options and Futures Live/Intraday Data:**
The primary free source is Shoonya (Finvasia) broker API. Shoonya provides
a Python SDK (ShoonyaApi-py on PyPI) that is fully free. The account opening
fee is zero and the AMC is zero. The API provides live option chains, live
LTP (Last Traded Price), historical candles (up to 5-minute resolution for
recent data), and WebSocket streaming. Login to Shoonya requires a TOTP
(Time-based One-Time Password) which must be generated programmatically using
the pyotp library with a seed stored in GitHub Secrets.

Secondary free broker alternatives (each with free API, zero AMC, zero F&O
brokerage) are: Flattrade (similar Python SDK), Fyers (free Python SDK with
generous rate limits), and Angel One SmartAPI (free Python SDK, excellent
historical data going back further than Shoonya). The system should be
designed so the broker can be swapped by changing an environment variable.

**For NSE Options Historical Data (backtesting):**
Use the nsepython library (pip installable, no API key) or the jugaad-data
library to download historical NSE option chain snapshots. The NSE website
provides contract-wise historical data for F&O going back several years.
Additionally, the ICICI Breeze API (free for Breeze account holders, zero
AMC) provides excellent historical F&O data and is worth supporting as an
optional data source via an environment variable switch.

**For Mutual Fund NAV Data:**
Use mfapi.in which is completely free, requires no API key, no registration,
and returns JSON data. It provides latest NAV, historical NAV by scheme code,
and search by scheme name. The AMFI official website also provides bulk daily
NAV text files. Cache all mutual fund data in the database to avoid repeated
API calls. Do not call mfapi.in more than once per day per fund.

**For Gold and Silver ETF Prices:**
Use yfinance to fetch prices for Nippon India Gold ETF (ticker: GOLDBEES.NS),
SBI Gold ETF (ticker: SBIGETS.NS), and Mirae Asset Silver ETF (ticker:
SILVERETF.NS) on NSE. These are available as daily OHLCV data through
yfinance at no cost.

**For REIT Unit Prices:**
Use yfinance to fetch Embassy Office Parks REIT (ticker: EMBASSYOFFICE.NS)
and Mindspace Business Parks REIT (ticker: MINDSPACE.NS) daily prices.

**For Nifty 50 Real-Time Spot Price:**
Use Shoonya API (websocket or polling) during market hours. Outside market
hours, use the last known closing price stored in the database.

**For Web Search (AI-Assisted Research Feature):**
Use the Brave Search API free tier which provides $5 in free monthly credits
without requiring a credit card. Alternatively use Serper.dev which provides
2,500 free queries to start. Both have simple REST APIs. The search feature
is used by the LLM integration module to fetch current news, earnings
announcements, and macro events that the AI uses to make strategy decisions.
If both are unavailable, fall back to scraping NSE announcements page.

---

### SECTION 4: FREE LLM APIS FOR AI-DRIVEN DECISIONS

The system must use AI (Large Language Models) to make certain decisions.
This is what makes the sovereign-wealth-engine different from a static
rule-based bot. The LLM must be invoked for the following tasks:

First, the LLM analyzes morning macro context before strategies run. Each
morning at 9:00 AM IST it receives a text summary of the previous day's
Nifty performance, current India VIX level, any RBI or SEBI announcements
(fetched via the search API), and any scheduled events for the day (RBI
policy, earnings of large-cap stocks, global market moves). Based on this
context the LLM decides whether to "run all strategies", "run only
non-directional strategies", "run only hedged strategies", or "stand aside
today." The decision is written to the database and the strategy runner
respects it.

Second, the LLM periodically reviews the backtesting and paper trading
results (weekly) and suggests which strategies are performing best, which
should have their parameters tightened, and which should be paused. This
analysis is written to the database as a strategy review record.

Third, the LLM acts as a portfolio rebalancer. Monthly it reviews the
simulated multi-asset portfolio allocation and recommends whether to
increase or decrease simulated allocation to any given bucket.

The primary free LLM to use is **Google Gemini Flash** via the Google AI
Studio API. The free tier provides 15 requests per minute, 1 million tokens
per minute, and 1,500 requests per day at zero cost with no credit card.
The API key is free and obtained from aistudio.google.com. The model to
default to is gemini-2.0-flash-lite or the latest Gemini Flash model
available at the time of code generation.

The secondary free LLM to support (switchable via environment variable) is
**Groq API** which provides free access to Llama 3, DeepSeek, Qwen, and
Mixtral models with high speed and no credit card required. Groq is
preferable when lower latency is needed or when Gemini rate limits are hit.

The LLM integration must be a pluggable module. Switching between Gemini and
Groq must require only changing the LLM_PROVIDER environment variable and
the corresponding API key. The system must handle LLM rate limit errors
gracefully with exponential backoff and fallback to rule-based decisions if
the LLM is unavailable.

---

### SECTION 5: ALL INVESTMENT AND STRATEGY MODULES

The system simulates, tracks, and backtests every module listed here. Each
module is independently toggleable via environment variables. If a module's
ENABLED environment variable is set to false, the module is completely
skipped and does not count against GitHub Actions minute limits.

**MODULE GROUP A — OPTION SELLING STRATEGIES (Nifty 50 Weekly Options):**

All option selling strategies share these common rules that must be
implemented as a shared base module:

Entry slippage is always added as a fixed configurable amount per lot to
the entry price, and the same slippage is subtracted from exit prices.
Regulatory costs (STT, exchange fees, GST) are approximated as a flat
configurable rupee amount per leg per lot and deducted from PnL. The
default slippage and tax values must be stored in environment variables
and must be realistic for Nifty options. Losses are stored as negative PnL.
Wins are stored as positive PnL. The strategy runner logs every simulated
entry and exit to the database with timestamp, strategy name, option symbol,
strike, type (CE/PE), direction (BUY/SELL), quantity, entry price, exit
price, exit reason, gross PnL, and net PnL after costs.

Strategy A1 — Short Strangle: Sells one slightly out-of-the-money Call and
one slightly out-of-the-money Put simultaneously. Entry is at a configurable
time after market open (default 9:20 AM). The LLM decides whether to enter
based on VIX level and morning macro context. Stop loss is applied
independently per leg and the threshold is configurable. If only one leg is
stopped out, the other leg may be held with a trailing stop or exited. All
such logic is configurable. Exit at a configurable time (default 3:15 PM)
or on stop loss. Quantities and strike selection method (delta-based or
percentage OTM) are configurable via environment variables.

Strategy A2 — Short Iron Fly: Sells the ATM Call and ATM Put. Buys an OTM
Call and an OTM Put at a configurable wing width away. The net credit
received defines the maximum profit. A stop loss based on a configurable
percentage of the maximum credit is applied to the entire position. The
wing width in points is configurable.

Strategy A3 — Iron Condor: Sells a slightly OTM Call and slightly OTM Put.
Buys further OTM options to cap the maximum loss. The distance from ATM and
the wing width are both configurable. This is the primary default strategy
because it provides defined risk and is the most suitable for a beginner
automating their first live strategy after successful paper testing.

Strategy A4 — Broken Wing Butterfly: A cost-efficient variant of the
butterfly where one wing is wider than the other, often achievable for zero
net debit or a small credit. The LLM may suggest when this is favorable
based on current implied volatility skew.

Strategy A5 — Calendar Spread: Sells a near-week expiry option and buys the
same strike in the next-week expiry. Profits from faster time decay of the
near-week leg. Configurable strike selection and expiry offset.

Strategy A6 — Bull Put Spread (Directional Bias): Only entered when the LLM
confirms a bullish macro day based on morning context. Sells an OTM Put at a
higher strike and buys a further OTM Put at a lower strike. Stop loss is the
full width of the spread minus the net credit received.

Strategy A7 — Bear Call Spread (Directional Bias): Mirror of A6 for bearish
days. Only entered when the LLM confirms a bearish bias in the morning
context.

Strategy A8 — Long Straddle (Pre-Event Buy): Only activated when the LLM or
the event calendar detects that a high-impact event (RBI policy meeting,
Union Budget, election result, major global shock) is scheduled within the
next one to two trading days. Buys the ATM Call and ATM Put simultaneously.
The profit target and stop loss are both configurable percentages of the
total premium paid.

Strategy A9 — Expiry Day Scalping: On every Thursday expiry (or the
rescheduled expiry when Thursday is a holiday), runs a short-lived intraday
strategy that exploits the aggressive theta decay of expiring weekly options.
This strategy must have a strict time window (configurable start and stop
times) and a strict maximum loss limit for the day.

**MODULE GROUP B — FUTURES STRATEGIES (Nifty Near-Month Futures):**

Strategy B1 — EMA Trend Following: Uses configurable short and long period
exponential moving averages on a configurable candle timeframe. Goes long
when the short EMA crosses above the long EMA and a configurable trend
filter is satisfied. Goes short on the reverse. Uses ATR-based stop loss.
All parameters configurable.

Strategy B2 — Opening Range Breakout: Identifies the high and low of the
first configurable number of minutes after market open. Enters a long
position on a close above the range high (confirmed by configurable volume
condition) or a short on a close below the range low. Target and stop loss
are multiples of the opening range width, configurable.

Strategy B3 — Supertrend Follower: Uses the Supertrend indicator with
configurable ATR period and multiplier. Enters long on green Supertrend and
short on red Supertrend. Implements a configurable trailing stop.

**MODULE GROUP C — EQUITY SWING AND MTF:**

Strategy C1 — Stage 2 Momentum Breakout (MTF Simulation): Scans the Nifty
500 universe daily after market close. Filters for stocks in Stage 2 uptrend
(defined as price above both the 50-day and 200-day simple moving averages).
Among filtered stocks, selects those breaking out of a configurable number of
days' high on above-average volume. Simulates a buy at next day's open with
a configurable MTF leverage multiplier. Simulates MTF interest as a daily
deduction from the position's value. MTF interest rate is fully configurable.
Sets a stop loss at a configurable percentage below the entry. Trails stop
loss using a configurable moving average period. When stop is hit, logs
exit and simulates the MTF principal repayment.

Strategy C2 — Mean Reversion RSI: Enters only stocks already in Stage 2
uptrend where the RSI has pulled back below a configurable oversold threshold.
Enters when RSI recovers above a configurable level. Uses fixed percentage
stop loss.

Strategy C3 — Gap-and-Go VWAP: For highly liquid Nifty 50 stocks that gap
up or down more than a configurable percentage on market open with elevated
volume, simulates a long or short entry when price returns to VWAP within a
configurable time window. Strict intraday exit.

**MODULE GROUP D — ARBITRAGE VIA MUTUAL FUNDS (not a custom coded arbitrage):**

Rather than building a custom cash-futures arbitrage module, track the
performance of actual arbitrage mutual funds using the mfapi.in free API.
The best arbitrage funds to simulate investment in are: Kotak Equity Arbitrage
Fund, Nippon India Arbitrage Fund, HDFC Arbitrage Fund, and Invesco India
Arbitrage Fund. These consistently return 6.5% to 7.5% per year, are taxed
as equity for investors in high tax brackets (15% STCG within one year,
12.5% LTCG after one year), and are the most capital-efficient way to
replicate arbitrage returns without coding a live arbitrage engine.

The system simulates a monthly SIP into one or more of these funds, fetches
the current NAV daily from mfapi.in, and calculates the current value and
CAGR of the simulated investment. All parameters (monthly SIP amount, which
fund, whether to enable) are configurable.

**MODULE GROUP E — PASSIVE INVESTMENT TRACKERS (no trading, pure tracking):**

E1 — Liquid Fund Tracker: Simulates parking surplus capital in a liquid
mutual fund instead of a savings account. The best liquid funds to default
to are Nippon India Liquid Fund, HDFC Liquid Fund, and Kotak Liquid Fund,
which consistently return 6.0% to 6.6% per year with same-day liquidity
for redemptions below a threshold. Fetch daily NAV from mfapi.in. The
saving account mode can be enabled as an alternative by setting an
environment variable. When saving account mode is on, apply a simple
configurable flat annual interest rate (default 6.5% for IDFC FIRST or AU
Small Finance Bank) instead of using the mutual fund NAV.

E2 — Balanced Advantage Fund (Dynamic Asset Allocation) Tracker: Simulates
a monthly SIP into one or more Balanced Advantage Funds. The best performers
to default to are HDFC Balanced Advantage Fund (3-year CAGR approximately
18.9%), ICICI Prudential Balanced Advantage Fund, and Mirae Asset Balanced
Advantage Fund. These funds automatically shift between equity and debt
based on valuations, making them suitable for medium to long-term systematic
investment. Fetch NAV daily from mfapi.in.

E3 — Nifty 50 Index Fund SIP Tracker: Simulates a fixed monthly SIP into
a Nifty 50 index fund. Default to UTI Nifty 50 Index Fund or Nippon India
Index Fund (Nifty Plan). Fetch NAV daily. Calculate total units accumulated,
current corpus value, XIRR, and projected value in 5, 10, and 20 years using
the configurable assumed CAGR (default 12%).

E4 — Fixed Deposit Tracker: Tracks one or more simulated FDs. Each FD has
a configurable principal, annual interest rate, compounding frequency
(quarterly by default), start date, and maturity date. The system calculates
and logs the daily accrued interest to the database. On maturity it
automatically simulates rollover at the same or a configurable new rate.
The best FD rates currently available are Suryoday Small Finance Bank at
8.10% per year, Utkarsh Small Finance Bank at 8.10%, Muthoot Capital at
9.10% (NBFC, no DICGC insurance), and Shriram Finance at 8.15%. All of
these rates and institutions are configurable via environment variables.

E5 — P2P Lending Tracker: Simulates a portfolio of P2P loans across one
or more platforms. Configurable total principal, platform name (Lendbox,
Faircent, or LiquiLoans), annual interest rate, and a simulated default
rate. The system accrues daily interest and applies the annual default rate
as a daily principal reduction. All rates are configurable via environment
variables so the user can update them when platform rates change. Expected
rates are Lendbox at up to 15.4% gross per year and Faircent at 10% to 18%.

E6 — REIT Tracker: Tracks simulated investment in Exchange-listed REITs.
Fetch daily unit prices via yfinance. Track Embassy Office Parks REIT and
Mindspace Business Parks REIT by default. Log quarterly dividend accruals
(the user manually inputs each quarter's distribution per unit via an
environment variable or a simple config file). Calculate yield on cost and
total return.

E7 — Gold and Silver ETF Tracker: Tracks simulated investment in Nippon
India Gold ETF (GOLDBEES) and Mirae Asset Silver ETF via yfinance daily
prices. Calculate unrealized gain or loss and portfolio weight.

E8 — Dividend Stock Tracker: Tracks simulated investment in select
high-dividend Indian stocks. Default list includes Coal India, ITC, ONGC,
and Vedanta for their dividend yields. Use yfinance for daily prices.
Annual dividend yield per stock is configurable via environment variables.

---

### SECTION 6: ENVIRONMENT VARIABLES — COMPLETE REQUIREMENTS

Every configurable parameter in the system must be stored as an environment
variable in GitHub Repository Secrets. The coding agent must generate a
comprehensive .env.example file that lists every single environment variable
with a comment explaining what it does and its default value. The .env file
itself must never be committed to the repository.

The environment variables must cover at minimum the following categories:

Broker credentials: variables for Shoonya login (user ID, password, TOTP
seed, vendor code, API secret, IMEI). Equivalent variables for Flattrade and
Angel One SmartAPI to allow switching. A variable called ACTIVE_BROKER that
determines which broker SDK to load.

Database credentials: Turso database URL and Turso auth token. A separate
variable for a read-only Turso token used by the dashboard.

LLM configuration: LLM_PROVIDER (gemini or groq), GEMINI_API_KEY,
GROQ_API_KEY, the name of the model to use, maximum tokens per request,
and a variable to completely disable the LLM and fall back to rule-based
decisions.

Search API configuration: SEARCH_PROVIDER (brave or serper), BRAVE_API_KEY,
SERPER_API_KEY, and a variable to disable web search.

Strategy toggles: One ENABLED variable per strategy (e.g.
STRATEGY_A1_ENABLED, STRATEGY_B1_ENABLED, STRATEGY_E4_ENABLED). Setting
any of these to false completely skips that strategy module.

Strategy parameters: For each strategy, the key parameters should have their
own environment variables. For example, A1_ENTRY_TIME, A1_EXIT_TIME,
A1_STOP_LOSS_PERCENT, A1_STRIKE_SELECTION_METHOD, A3_WING_WIDTH,
B1_FAST_EMA, B1_SLOW_EMA, B1_TIMEFRAME_MINUTES, C1_MTF_LEVERAGE,
C1_MTF_INTEREST_RATE_PA, C1_STOP_LOSS_PERCENT, and so on for every
strategy.

Cost simulation: SLIPPAGE_PER_LOT_INR, TAX_PER_LEG_INR, and
NIFTY_LOT_SIZE. These must reflect real current values. As of June 2026,
Nifty 50 lot size is 75 units.

Passive investment rates: P2P_INTEREST_RATE_PA, P2P_DEFAULT_RATE_PA,
P2P_PLATFORM_NAME, FD_INTEREST_RATE_PA, FD_COMPOUNDING_FREQUENCY,
MTF_INTEREST_RATE_PA (currently approximately 12.49% per year for most
brokers), LIQUID_FUND_USE_SAVINGS_ACCOUNT_MODE, SAVINGS_ACCOUNT_RATE_PA.

Mutual fund scheme codes: Variables for the scheme codes of each mutual fund
tracked (e.g. ARBITRAGE_FUND_SCHEME_CODE, BALANCED_ADVANTAGE_FUND_SCHEME_CODE,
INDEX_FUND_SCHEME_CODE, LIQUID_FUND_SCHEME_CODE). These are mfapi.in scheme
numbers, and the user must be able to change them to their preferred funds.

SIP amounts: Variables for how much is simulated as a monthly SIP into each
fund category.

MCP server backup: The system must support backing up the .env configuration
securely to a custom MCP server installed by the user. A variable called
MCP_BACKUP_ENABLED and MCP_SERVER_ENDPOINT must control this. When enabled,
the system posts an encrypted summary of the current configuration state to
the user's custom MCP server after each successful daily run.

Dashboard access: DASHBOARD_PUBLIC (true or false). When true, the Turso
read-only token is embedded in the dashboard HTML file for public access.
When false, the dashboard prompts for a password that is used as a local
decryption key.

---

### SECTION 7: DATABASE DESIGN PHILOSOPHY (NOT SCHEMA)

Use a single Turso database. The database name should be
sovereign-wealth-engine or similar. Do not create multiple databases for
different strategy groups; one database with well-named tables is sufficient.
Turso's free starter tier provides more than enough storage and read/write
capacity for the entire system running for years.

The database must contain separate tables for:
active paper trading positions across all strategy modules,
historical closed trades with full PnL details for each strategy,
daily PnL aggregated by date and strategy,
passive investment snapshots updated daily showing current value of each
passive module,
the overall portfolio snapshot showing the total simulated net worth across
all modules at end of each day,
mutual fund NAV cache to avoid re-fetching data already retrieved today,
LLM decision logs recording what the AI was told each morning and what it
decided,
strategy review records from the weekly LLM portfolio analysis,
event calendar entries (upcoming RBI meetings, budget dates, expiry dates)
used by the LLM to make pre-event decisions,
session cache for the broker API login token to avoid re-authenticating
on every cron run.

Design the tables to be append-only where possible. Never delete trade
records. Use soft deletes for positions. Ensure all timestamps are stored
in ISO 8601 format in IST.

---

### SECTION 8: GITHUB ACTIONS WORKFLOW ARCHITECTURE

Design three distinct workflow files:

Workflow 1 is the strategy runner. It runs every 5 minutes on weekdays
during Indian market hours (9:15 AM to 3:30 PM IST, which is 3:45 AM to
10:00 AM UTC on weekdays). It checks the database for the LLM's morning
decision. If the decision is to stand aside, it exits immediately. Otherwise
it runs all enabled strategy modules in sequence. Each module checks whether
an existing position is open and needs to be managed, or whether a new
position should be entered based on the current time and market data.

Workflow 2 is the daily jobs workflow. It runs once per day at 9:00 AM IST
on weekdays to do the morning LLM analysis, and once again at 4:30 PM IST
to do the end-of-day jobs: fetch and cache all mutual fund NAVs, update
all ETF prices, accrue P2P interest, accrue FD interest, calculate the
MTF interest deduction on open equity swing positions, create the daily
portfolio snapshot, and trigger the weekly LLM strategy review if it is
the end of the week.

Workflow 3 is the backtesting workflow. It is triggered manually via
workflow_dispatch only (never on a schedule). It accepts parameters via
workflow_dispatch inputs: which strategy to backtest, the start date, and
the end date. It downloads historical data, runs the strategy module in
backtest mode using the historical data instead of live data, and writes
the backtest results to the database for display on the dashboard. The
dashboard shows a separate backtesting section displaying equity curves
and performance statistics for each backtest run.

All workflows must handle errors gracefully. A failed strategy module must
not prevent other modules from running. Use continue-on-error where
appropriate. All workflow steps must log their output clearly with
timestamps. Use the uv package manager for Python dependency management
as it is significantly faster than pip and is free.

---

### SECTION 9: DASHBOARD REQUIREMENTS

The dashboard must be a single HTML file with embedded CSS and JavaScript.
It must look premium — not like a basic developer tool. Use a dark theme
with accent colors that feel professional (deep navy background, electric
blue or gold accents, clean monospaced font for numbers). Use Chart.js
version 4 loaded from CDN for all charts.

The dashboard has the following sections:

A summary header showing today's date (India Standard Time), total
simulated portfolio value in Indian Rupees with appropriate lakhs formatting,
today's total simulated PnL with color coding (green for positive, red for
negative), overall strategy win rate since inception, and months of operation.

An equity curve chart showing the total simulated portfolio value over time
as a line chart, with separate lines for the options PnL component and the
passive investment component.

A strategy performance table with one row per strategy showing total trades
simulated, win rate, total gross PnL, total net PnL after costs, average
winning trade size, average losing trade size, maximum drawdown, and profit
factor (gross profit divided by gross loss).

A passive income summary section showing each passive module (liquid fund,
balanced advantage fund, index fund SIP, FD, P2P, REIT, gold ETF, silver
ETF, dividend stocks), its current simulated value, total invested amount,
unrealized gain or loss, annualized return, and simulated monthly income
contribution.

An active positions table showing all currently open paper positions with
the current LTP fetched from the broker API on page load (or cached in the
database if market is closed), unrealized PnL, and time since entry.

A backtesting results section that shows a dropdown to select a completed
backtest run, and displays the equity curve, key metrics, and monthly
returns heatmap for the selected backtest.

An LLM journal section showing the last 10 LLM morning decisions with the
reasoning provided by the AI, and the last 5 weekly strategy reviews.

A configuration overview section showing the current values of key
environment variables (sanitizing sensitive credentials) so the user can
confirm at a glance what the system is configured to do.

The dashboard must be responsive. It must load completely within 3 seconds
on a standard broadband connection. All Turso data fetches happen
asynchronously and the dashboard shows loading skeletons while data loads.

---

### SECTION 10: MCP SERVER INTEGRATION

The system is designed to integrate with MCP (Model Context Protocol) servers.
The architecture must be modular so that any new MCP server can be added by
installing it in the environment and adding its configuration to the relevant
environment variables.

The user has a custom MCP server that provides secure backup and retrieval
of environment variable configurations. The system must send a POST request
to the user's MCP server endpoint (configured via MCP_SERVER_ENDPOINT)
containing a structured JSON payload of the current configuration state
(excluding sensitive credentials) after each successful daily run. This
allows the user to track configuration history and recover from accidental
environment variable changes.

---

### SECTION 11: BACKTESTING PHILOSOPHY

The backtesting module is not a separate codebase. It is the same strategy
module code running in a different mode. Each strategy module checks an
environment variable called BACKTEST_MODE. When true, the module reads price
data from the historical data cache in the database (or downloads it fresh
if not cached) instead of calling the live broker API. It iterates through
each historical candle chronologically and calls the same entry, management,
and exit functions used in live paper trading. This ensures that the
backtested logic is identical to the forward-tested logic.

Backtest results must report gross PnL, net PnL (after simulated slippage
and taxes), total number of trades, win rate, profit factor, maximum
drawdown percentage, Sharpe ratio (annualized), Calmar ratio, and the
equity curve as a list of cumulative PnL values by date.

For option strategies, backtesting uses historical option prices from
nsepython or jugaad-data. If historical option data is not available for
the backtest period, the system falls back to a Black-Scholes approximation
using historical spot prices and a configurable implied volatility assumption.
The IV assumption must be configurable via an environment variable.

---

### SECTION 12: CACHING AND RATE LIMIT HANDLING

All external API calls must be cached aggressively in the database.

For mutual fund NAV data, check the database first. If a valid NAV for today
already exists in the cache, use it. Only fetch from mfapi.in if the cache
is empty or stale.

For broker session tokens, cache the session token in the database with its
creation timestamp. On each cron run, check if the token is less than
12 hours old. Only re-login if the token is expired.

For LLM API calls, log each request and response in the database with a
timestamp. If the same morning analysis request has already been made today
(determined by checking for a today's entry in the LLM decision log table),
skip the LLM call entirely and use the stored decision from earlier in the
day.

For the broker API, implement exponential backoff with jitter for all HTTP
requests. If a rate limit error (HTTP 429) is received, wait and retry up
to a configurable maximum number of attempts.

For web search, cache search results in the database for a configurable
number of hours (default 6 hours for news) to avoid repeated identical
queries consuming the monthly free quota.

---

### SECTION 13: SECURITY AND SECRET MANAGEMENT

All secrets must be stored in GitHub Repository Secrets. The following
secrets are required at minimum and must be documented clearly in the README:

SHOONYA_USER, SHOONYA_PASSWORD, SHOONYA_TOTP_SEED, SHOONYA_VENDOR_CODE,
SHOONYA_API_SECRET, SHOONYA_IMEI, TURSO_DB_URL, TURSO_AUTH_TOKEN,
TURSO_READ_ONLY_TOKEN, GEMINI_API_KEY, GROQ_API_KEY, BRAVE_API_KEY,
SERPER_API_KEY, MCP_SERVER_ENDPOINT, and all strategy parameter variables
that the user prefers to keep private.

The README must contain a step-by-step guide for setting up all required
GitHub Secrets so a new user can fork the repository and get it running
in under 30 minutes.

The dashboard HTML file must never contain the full read/write Turso token.
It must only ever contain the read-only token if DASHBOARD_PUBLIC is true.

---

### SECTION 14: DOCUMENTATION AND MAINTAINABILITY

The README must be comprehensive and stunning. It must include a project
description explaining that this is a paper trading simulation system only,
architecture overview with a diagram showing how GitHub Actions, Turso,
the broker API, LLM API, and the dashboard interact, a table of all
strategies with their current enable/disable status and key parameters,
a table of all passive investment modules, the complete list of GitHub Secrets
required with description of each, a quick start guide, a FAQ section
answering the most common questions about paper trading vs live trading,
API rate limits, and data accuracy.

Every Python module must have a module-level docstring explaining what it does,
what environment variables it reads, and what database tables it reads or
writes. All functions must have docstrings.

The repository must have a CHANGELOG.md that logs major updates. It must
have a STRATEGIES.md that describes every strategy in plain English for
non-technical readers. It must have a CONTRIBUTING.md explaining how to add
a new strategy module.

---

### SECTION 15: THE HISTORICAL CONTEXT OF THIS PROMPT

This prompt was created as Part 20 of the "Wealth and Option Trading
Automation" blog series at blog.oriz.in. The series documents the complete
journey from understanding basic options concepts to building a fully
automated, AI-driven paper trading and wealth tracking system for Indian
markets. Every decision in this system architecture was made after extensive
research into what is genuinely available for free to a retail developer in
India as of June 2026.

Key design decisions made before this prompt was written:
The system uses GitHub Actions instead of a paid VM because the free tier
provides 2,000 minutes per month for public repositories, which is
sufficient for 5-minute cron jobs during market hours.
Turso was chosen over Supabase because Turso's REST API is completely
stateless and works perfectly from ephemeral GitHub Actions runners without
connection pooling concerns.
Shoonya was chosen as the primary broker because it is one of the few Indian
brokers with zero AMC, zero F&O brokerage, and a publicly available, free
Python SDK.
The LLM integration uses Gemini Flash because the free tier is genuinely
free with no credit card required and the rate limits (1,500 requests per
day) are sufficient for the system's usage pattern.
Liquid funds are used instead of savings accounts for idle capital
simulation because liquid funds return 5.5% to 6.6% per year versus
2.5% to 4% for savings accounts, while still being accessible within
one business day.
Balanced Advantage Funds are included because they automatically adjust
equity/debt allocation based on valuations, making them suitable for
long-term systematic investment without requiring active management.

The author's ultimate goal is financial independence from salary income
by building multiple automated income streams, each tracked and optimized
by this system over many years of consistent operation.

---

**Begin building the sovereign-wealth-engine repository now.** Start by
proposing the complete file and directory structure, then generate each file
in logical order. Prioritize the database migration script, the core shared
utilities, one complete strategy module (Iron Condor, A3) as a reference
implementation, the daily jobs workflow, and the dashboard. Everything else
builds on these foundations.

---

## Master Prompt (End copying at the line above)

**[← Back to Master Index](/blog/wealth-and-options-automation)**
