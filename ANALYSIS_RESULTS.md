# Tech Sector Transcript Sentiment Analysis — Key Findings

## Dataset
- 37 tech companies across 11 subsectors
- 722 quarterly earnings transcripts scored (2021-2026)
- 669 sentiment-return pairs (with next-quarter stock returns)
- 10 tech-specific sentiment dimensions scored by Claude Haiku 4.5

## Statistically Significant Correlations (p < 0.05)

### Overall: r = +0.087, t = 2.24 (SIGNIFICANT)
Positive sentiment → positive next-quarter returns in tech

### By Dimension (strongest signals):
- **margin_trajectory**: r = +0.130, t = 3.37 — STRONGEST
- **ai_exposure**: r = +0.103, t = 2.66
- **guidance_confidence**: r = +0.094, t = 2.44
- **overall_sentiment**: r = +0.082, t = 2.13
- **customer_momentum**: r = +0.077, t = 2.00

### By Subsector:
- **Cloud/SaaS**: r = +0.203, t = 2.16 (STRONGEST subsector)
- **Semiconductors**: r = +0.196, t = 2.53
- Enterprise Software: r = -0.047 (not significant)

### Quintile Analysis (monotonic!):
- Q1 (Most Bearish): +6.0% avg return
- Q2 (Bearish): +6.1%
- Q3 (Neutral): +6.5%
- Q4 (Bullish): +9.1%
- Q5 (Most Bullish): +11.3%
→ 5.3 percentage point spread between extremes

### Sentiment CHANGE is even stronger: r = +0.123, t = 3.10
- Big Decline in sentiment: +6.1% avg return
- Big Improvement in sentiment: +13.4% avg return
→ 7.3 percentage point spread

## Key Insight
Unlike the cross-sector analysis (r ≈ 0), the tech-focused analysis reveals
a real, statistically significant positive relationship between earnings call
sentiment and next-quarter stock performance. Margin trajectory and AI exposure
are the most predictive dimensions. Cloud/SaaS and Semiconductor subsectors
show the strongest signals.
