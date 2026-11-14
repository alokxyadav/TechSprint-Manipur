"""
Time-series forecasting engine using Facebook Prophet.
Generates predictions with confidence intervals and seasonality analysis.
"""

import sys
import json
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from prophet import Prophet
import warnings

warnings.filterwarnings('ignore')

class ForecastEngine:
    def __init__(self):
        """Initialize the forecasting engine."""
        self.model = None
        
    def prepare_data(self, time_series: list) -> pd.DataFrame:
        """
        Prepare time series data for Prophet.
        
        Args:
            time_series: List of {date, value} dictionaries
            
        Returns:
            DataFrame with 'ds' and 'y' columns
        """
        df = pd.DataFrame(time_series)
        df['ds'] = pd.to_datetime(df['date'])
        df['y'] = df['value'].astype(float)
        
        return df[['ds', 'y']]
    
    def train_and_forecast(
        self, 
        time_series: list, 
        forecast_months: int = 12,
        yearly_seasonality: bool = True,
        weekly_seasonality: bool = False
    ) -> dict:
        """
        Train Prophet model and generate forecasts.
        
        Args:
            time_series: Historical data as list of {date, value}
            forecast_months: Number of months to forecast
            yearly_seasonality: Enable yearly seasonality
            weekly_seasonality: Enable weekly seasonality
            
        Returns:
            Dictionary with forecast data, confidence intervals, and metrics
        """
        try:
            # Prepare data
            df = self.prepare_data(time_series)
            
            if len(df) < 10:
                return {
                    'success': False,
                    'error': 'Insufficient data points for forecasting (minimum 10 required)'
                }
            
            # Initialize and configure Prophet
            self.model = Prophet(
                yearly_seasonality=yearly_seasonality,
                weekly_seasonality=weekly_seasonality,
                daily_seasonality=False,
                interval_width=0.95,  # 95% confidence interval
                changepoint_prior_scale=0.05
            )
            
            # Fit model
            self.model.fit(df)
            
            # Create future dataframe
            future = self.model.make_future_dataframe(
                periods=forecast_months * 30,  # Approximate days
                freq='D'
            )
            
            # Generate forecast
            forecast = self.model.predict(future)
            
            # Extract forecast data (future only)
            last_historical_date = df['ds'].max()
            future_forecast = forecast[forecast['ds'] > last_historical_date]
            
            # Convert to monthly aggregates for cleaner output
            future_forecast['month'] = future_forecast['ds'].dt.to_period('M')
            monthly_forecast = future_forecast.groupby('month').agg({
                'yhat': 'mean',
                'yhat_lower': 'mean',
                'yhat_upper': 'mean'
            }).reset_index()
            
            # Format forecast data
            forecast_data = []
            for _, row in monthly_forecast.iterrows():
                forecast_data.append({
                    'date': str(row['month']),
                    'yhat': float(row['yhat']),
                    'yhat_lower': float(row['yhat_lower']),
                    'yhat_upper': float(row['yhat_upper'])
                })
            
            # Calculate growth rate
            growth_rate = self._calculate_growth_rate(df, forecast_data)
            
            # Extract seasonality
            seasonality_data = self._extract_seasonality(forecast)
            
            # Calculate model confidence
            confidence = self._calculate_confidence(df, forecast)
            
            return {
                'success': True,
                'forecast_data': forecast_data,
                'growth_rate': growth_rate,
                'confidence': confidence,
                'seasonality_data': seasonality_data,
                'metrics': {
                    'historical_points': len(df),
                    'forecast_points': len(forecast_data),
                    'forecast_months': forecast_months
                }
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def _calculate_growth_rate(self, historical: pd.DataFrame, forecast: list) -> float:
        """Calculate overall growth rate from historical to forecast."""
        try:
            historical_avg = historical['y'].mean()
            forecast_avg = np.mean([f['yhat'] for f in forecast])
            
            if historical_avg == 0:
                return 0.0
            
            growth_rate = ((forecast_avg - historical_avg) / historical_avg) * 100
            return round(float(growth_rate), 2)
            
        except Exception:
            return 0.0
    
    def _extract_seasonality(self, forecast: pd.DataFrame) -> list:
        """Extract monthly seasonality patterns."""
        try:
            if 'yearly' not in forecast.columns:
                return []
            
            # Group by month and calculate average seasonality
            forecast['month'] = forecast['ds'].dt.month
            monthly_seasonality = forecast.groupby('month')['yearly'].mean()
            
            month_names = [
                'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
            ]
            
            seasonality_data = []
            for month in range(1, 13):
                if month in monthly_seasonality.index:
                    seasonality_data.append({
                        'month': month_names[month - 1],
                        'strength': float(monthly_seasonality[month])
                    })
            
            return seasonality_data
            
        except Exception:
            return []
    
    def _calculate_confidence(self, historical: pd.DataFrame, forecast: pd.DataFrame) -> float:
        """
        Calculate model confidence based on historical fit.
        Returns a score between 0 and 100.
        """
        try:
            # Get predictions for historical period
            historical_forecast = forecast[forecast['ds'].isin(historical['ds'])]
            
            if len(historical_forecast) == 0:
                return 50.0  # Default confidence
            
            # Calculate MAPE (Mean Absolute Percentage Error)
            merged = historical.merge(historical_forecast[['ds', 'yhat']], on='ds')
            
            # Avoid division by zero
            merged = merged[merged['y'] != 0]
            
            if len(merged) == 0:
                return 50.0
            
            mape = np.mean(np.abs((merged['y'] - merged['yhat']) / merged['y'])) * 100
            
            # Convert MAPE to confidence score (lower MAPE = higher confidence)
            confidence = max(0, min(100, 100 - mape))
            
            return round(float(confidence), 2)
            
        except Exception:
            return 50.0  # Default confidence on error

def main():
    """CLI interface for forecasting."""
    if len(sys.argv) < 2:
        print(json.dumps({
            'success': False,
            'error': 'Usage: python forecast_engine.py <time_series_json> [forecast_months]'
        }))
        sys.exit(1)
    
    try:
        time_series = json.loads(sys.argv[1])
        forecast_months = int(sys.argv[2]) if len(sys.argv) > 2 else 12
        
        engine = ForecastEngine()
        result = engine.train_and_forecast(time_series, forecast_months)
        
        print(json.dumps(result, indent=2))
        
    except json.JSONDecodeError:
        print(json.dumps({
            'success': False,
            'error': 'Invalid JSON input'
        }))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({
            'success': False,
            'error': str(e)
        }))
        sys.exit(1)

if __name__ == '__main__':
    main()
