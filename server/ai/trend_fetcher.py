"""
Google Trends data fetching service using PyTrends.
Handles trend data collection, related queries, and seasonality signals.
"""

import sys
import json
from datetime import datetime, timedelta
from pytrends.request import TrendReq
import pandas as pd
import time

class TrendFetcher:
    def __init__(self):
        """Initialize PyTrends client."""
        self.pytrends = TrendReq(hl='en-US', tz=360)
        
    def fetch_trend_data(self, keyword: str, timeframe: str = 'today 5-y') -> dict:
        """
        Fetch Google Trends data for a keyword.
        
        Args:
            keyword: Search keyword
            timeframe: Time range (default: last 5 years)
            
        Returns:
            Dictionary with trend data, related queries, and metadata
        """
        try:
            # Build payload
            self.pytrends.build_payload([keyword], timeframe=timeframe, geo='')
            
            # Get interest over time
            interest_df = self.pytrends.interest_over_time()
            
            if interest_df.empty:
                return {
                    'success': False,
                    'error': 'No trend data available for this keyword',
                    'keyword': keyword
                }
            
            # Convert to time series data
            time_series = []
            for date, row in interest_df.iterrows():
                time_series.append({
                    'date': date.strftime('%Y-%m-%d'),
                    'value': int(row[keyword]) if keyword in row else 0
                })
            
            # Get related queries
            related_queries = self._get_related_queries(keyword)
            
            # Calculate basic statistics
            values = [item['value'] for item in time_series]
            avg_value = sum(values) / len(values) if values else 0
            max_value = max(values) if values else 0
            min_value = min(values) if values else 0
            
            return {
                'success': True,
                'keyword': keyword,
                'timeframe': timeframe,
                'time_series': time_series,
                'related_queries': related_queries,
                'statistics': {
                    'average': avg_value,
                    'maximum': max_value,
                    'minimum': min_value,
                    'data_points': len(time_series)
                }
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'keyword': keyword
            }
    
    def _get_related_queries(self, keyword: str) -> dict:
        """Fetch related and rising queries."""
        try:
            related = self.pytrends.related_queries()
            
            result = {
                'top': [],
                'rising': []
            }
            
            if keyword in related:
                # Top queries
                if 'top' in related[keyword] and related[keyword]['top'] is not None:
                    top_df = related[keyword]['top']
                    result['top'] = top_df['query'].tolist()[:10] if not top_df.empty else []
                
                # Rising queries
                if 'rising' in related[keyword] and related[keyword]['rising'] is not None:
                    rising_df = related[keyword]['rising']
                    result['rising'] = rising_df['query'].tolist()[:10] if not rising_df.empty else []
            
            return result
            
        except Exception as e:
            print(f"Error fetching related queries: {e}", file=sys.stderr)
            return {'top': [], 'rising': []}
    
    def fetch_multiple_keywords(self, keywords: list, timeframe: str = 'today 5-y') -> dict:
        """
        Fetch trend data for multiple keywords with rate limiting.
        
        Args:
            keywords: List of keywords
            timeframe: Time range
            
        Returns:
            Dictionary mapping keywords to their trend data
        """
        results = {}
        
        for i, keyword in enumerate(keywords):
            # Rate limiting: wait between requests
            if i > 0:
                time.sleep(2)  # 2 second delay between requests
            
            results[keyword] = self.fetch_trend_data(keyword, timeframe)
        
        return results

def main():
    """CLI interface for trend fetching."""
    if len(sys.argv) < 2:
        print(json.dumps({
            'success': False,
            'error': 'Usage: python trend_fetcher.py <keyword> [timeframe]'
        }))
        sys.exit(1)
    
    keyword = sys.argv[1]
    timeframe = sys.argv[2] if len(sys.argv) > 2 else 'today 5-y'
    
    fetcher = TrendFetcher()
    result = fetcher.fetch_trend_data(keyword, timeframe)
    
    print(json.dumps(result, indent=2))

if __name__ == '__main__':
    main()
