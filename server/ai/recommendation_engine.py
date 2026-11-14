"""
AI-powered recommendation engine that generates actionable business insights.
Provides production timing, marketing strategies, risk warnings, and launch recommendations.
"""

import sys
import json
from datetime import datetime
import numpy as np

class RecommendationEngine:
    def __init__(self):
        """Initialize recommendation engine."""
        self.month_names = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ]
    
    def generate_recommendations(
        self,
        domain: str,
        keyword: str,
        growth_rate: float,
        confidence: float,
        seasonality_data: list,
        forecast_data: list
    ) -> list:
        """
        Generate comprehensive recommendations based on forecast analysis.
        
        Args:
            domain: Industry domain
            keyword: Analyzed keyword
            growth_rate: Predicted growth rate (%)
            confidence: Model confidence (0-100)
            seasonality_data: Monthly seasonality patterns
            forecast_data: Forecast predictions
            
        Returns:
            List of recommendation dictionaries
        """
        recommendations = []
        
        # 1. Growth-based recommendations
        recommendations.extend(
            self._generate_growth_recommendations(domain, keyword, growth_rate, confidence)
        )
        
        # 2. Seasonality-based recommendations
        if seasonality_data:
            recommendations.extend(
                self._generate_seasonality_recommendations(domain, seasonality_data, confidence)
            )
        
        # 3. Risk assessment
        recommendations.extend(
            self._generate_risk_recommendations(growth_rate, confidence, forecast_data)
        )
        
        # 4. Timing recommendations
        if seasonality_data:
            recommendations.extend(
                self._generate_timing_recommendations(domain, seasonality_data, confidence)
            )
        
        return recommendations
    
    def _generate_growth_recommendations(
        self, 
        domain: str, 
        keyword: str, 
        growth_rate: float, 
        confidence: float
    ) -> list:
        """Generate recommendations based on growth rate."""
        recommendations = []
        
        if growth_rate > 20:
            # High growth scenario
            recommendations.append({
                'title': 'Strong Growth Opportunity Detected',
                'description': f'The {keyword} sector shows exceptional growth potential with a {growth_rate:.1f}% projected increase. This presents a significant market opportunity for expansion and investment.',
                'category': 'production',
                'priority': 'high',
                'confidence_score': confidence,
                'impact_score': 90.0,
                'reasoning': f'Historical data indicates strong upward momentum in {domain} sector. Market conditions favor aggressive expansion strategies.',
                'action_items': [
                    'Increase production capacity by 30-50%',
                    'Expand team and resources to meet growing demand',
                    'Secure additional funding for scaling operations',
                    'Accelerate product development timeline',
                    'Consider strategic partnerships for market penetration'
                ]
            })
            
            recommendations.append({
                'title': 'Aggressive Marketing Strategy Recommended',
                'description': 'With strong growth indicators, now is the optimal time to invest heavily in marketing and brand awareness campaigns.',
                'category': 'marketing',
                'priority': 'high',
                'confidence_score': confidence,
                'impact_score': 85.0,
                'reasoning': 'Growing market interest creates favorable conditions for customer acquisition with lower CAC.',
                'action_items': [
                    'Launch multi-channel marketing campaigns',
                    'Increase marketing budget by 40-60%',
                    'Focus on content marketing and SEO',
                    'Invest in paid advertising across key platforms',
                    'Build strategic influencer partnerships'
                ]
            })
            
        elif growth_rate > 5:
            # Moderate growth
            recommendations.append({
                'title': 'Steady Growth Trajectory Identified',
                'description': f'The market shows healthy growth at {growth_rate:.1f}%, indicating stable expansion opportunities with manageable risk.',
                'category': 'strategy',
                'priority': 'medium',
                'confidence_score': confidence,
                'impact_score': 70.0,
                'reasoning': 'Moderate growth allows for measured expansion while maintaining operational stability.',
                'action_items': [
                    'Implement gradual capacity increases (15-25%)',
                    'Optimize existing operations for efficiency',
                    'Test new market segments cautiously',
                    'Maintain balanced marketing investment',
                    'Focus on customer retention and satisfaction'
                ]
            })
            
        elif growth_rate < -10:
            # Declining market
            recommendations.append({
                'title': 'Market Contraction Warning',
                'description': f'Significant decline detected ({growth_rate:.1f}%). Immediate strategic adjustments required to mitigate risks.',
                'category': 'risk',
                'priority': 'critical',
                'confidence_score': confidence,
                'impact_score': 95.0,
                'reasoning': 'Negative growth trend indicates market challenges requiring defensive strategies.',
                'action_items': [
                    'Reduce production capacity and overhead costs',
                    'Diversify into related growth markets',
                    'Focus on core profitable segments',
                    'Implement cost optimization measures',
                    'Consider pivoting business model or offerings'
                ]
            })
        
        else:
            # Stable/flat market
            recommendations.append({
                'title': 'Market Stabilization Observed',
                'description': f'The market shows stability with {growth_rate:.1f}% change. Focus on differentiation and operational excellence.',
                'category': 'strategy',
                'priority': 'medium',
                'confidence_score': confidence,
                'impact_score': 60.0,
                'reasoning': 'Flat growth requires competitive advantages through innovation and efficiency.',
                'action_items': [
                    'Invest in product innovation and differentiation',
                    'Optimize operational efficiency',
                    'Strengthen customer relationships',
                    'Explore niche market opportunities',
                    'Maintain conservative financial approach'
                ]
            })
        
        return recommendations
    
    def _generate_seasonality_recommendations(
        self,
        domain: str,
        seasonality_data: list,
        confidence: float
    ) -> list:
        """Generate recommendations based on seasonal patterns."""
        if not seasonality_data:
            return []
        
        # Find peak and low months
        sorted_months = sorted(seasonality_data, key=lambda x: x['strength'], reverse=True)
        peak_months = [m['month'] for m in sorted_months[:3]]
        low_months = [m['month'] for m in sorted_months[-3:]]
        
        recommendations = []
        
        recommendations.append({
            'title': 'Seasonal Peak Period Strategy',
            'description': f'Market analysis reveals peak demand during {", ".join(peak_months)}. Optimize operations for maximum capture during these high-value periods.',
            'category': 'timing',
            'priority': 'high',
            'confidence_score': confidence,
            'impact_score': 80.0,
            'best_months': peak_months,
            'reasoning': 'Historical seasonality patterns show consistent demand peaks during these months.',
            'action_items': [
                f'Increase inventory and staffing before {peak_months[0]}',
                'Launch major marketing campaigns 4-6 weeks before peak',
                'Prepare infrastructure for increased demand',
                'Offer premium products/services during peak periods',
                'Maximize pricing power during high-demand months'
            ]
        })
        
        recommendations.append({
            'title': 'Off-Season Optimization Strategy',
            'description': f'Lower demand expected during {", ".join(low_months)}. Implement strategic initiatives to maintain revenue and prepare for peak season.',
            'category': 'timing',
            'priority': 'medium',
            'confidence_score': confidence,
            'impact_score': 65.0,
            'avoid_months': low_months,
            'reasoning': 'Seasonal lows present opportunities for preparation and strategic positioning.',
            'action_items': [
                'Use off-season for team training and development',
                'Conduct maintenance and system upgrades',
                'Plan and develop new products/features',
                'Offer promotional campaigns to stimulate demand',
                'Focus on customer retention and loyalty programs'
            ]
        })
        
        return recommendations
    
    def _generate_risk_recommendations(
        self,
        growth_rate: float,
        confidence: float,
        forecast_data: list
    ) -> list:
        """Generate risk assessment and mitigation recommendations."""
        recommendations = []
        
        # Confidence-based risk
        if confidence < 60:
            recommendations.append({
                'title': 'Market Uncertainty Detected',
                'description': f'Forecast confidence at {confidence:.1f}% indicates higher market volatility. Implement risk mitigation strategies.',
                'category': 'risk',
                'priority': 'high',
                'confidence_score': confidence,
                'impact_score': 75.0,
                'reasoning': 'Lower confidence suggests unpredictable market conditions requiring defensive measures.',
                'action_items': [
                    'Maintain higher cash reserves (6-12 months runway)',
                    'Diversify revenue streams and customer base',
                    'Implement flexible operational models',
                    'Monitor market indicators closely',
                    'Prepare contingency plans for multiple scenarios'
                ]
            })
        
        # Volatility assessment
        if forecast_data and len(forecast_data) > 3:
            values = [f['yhat'] for f in forecast_data]
            volatility = np.std(values) / np.mean(values) if np.mean(values) > 0 else 0
            
            if volatility > 0.3:
                recommendations.append({
                    'title': 'High Market Volatility Warning',
                    'description': 'Forecast shows significant fluctuations. Adopt agile strategies to navigate uncertainty.',
                    'category': 'risk',
                    'priority': 'high',
                    'confidence_score': confidence,
                    'impact_score': 70.0,
                    'reasoning': 'High volatility increases business risk and requires adaptive approaches.',
                    'action_items': [
                        'Implement rolling forecasts and frequent reviews',
                        'Build flexible supply chain and operations',
                        'Avoid long-term fixed commitments',
                        'Maintain strong relationships with key stakeholders',
                        'Develop rapid response capabilities'
                    ]
                })
        
        return recommendations
    
    def _generate_timing_recommendations(
        self,
        domain: str,
        seasonality_data: list,
        confidence: float
    ) -> list:
        """Generate optimal timing recommendations for launches and campaigns."""
        if not seasonality_data:
            return []
        
        sorted_months = sorted(seasonality_data, key=lambda x: x['strength'], reverse=True)
        best_launch_months = [m['month'] for m in sorted_months[:2]]
        
        recommendations = []
        
        recommendations.append({
            'title': 'Optimal Launch Window Identified',
            'description': f'Based on market analysis, {best_launch_months[0]} and {best_launch_months[1]} present the best opportunities for new product launches or major initiatives.',
            'category': 'timing',
            'priority': 'high',
            'confidence_score': confidence,
            'impact_score': 85.0,
            'best_months': best_launch_months,
            'reasoning': 'Peak market activity during these months maximizes visibility and adoption rates.',
            'action_items': [
                f'Schedule major launches for {best_launch_months[0]}',
                'Begin pre-launch marketing 8-10 weeks in advance',
                'Align product development timeline accordingly',
                'Coordinate with industry events and conferences',
                'Prepare customer support for increased inquiries'
            ]
        })
        
        return recommendations

def main():
    """CLI interface for recommendation generation."""
    if len(sys.argv) < 2:
        print(json.dumps({
            'success': False,
            'error': 'Usage: python recommendation_engine.py <analysis_data_json>'
        }))
        sys.exit(1)
    
    try:
        data = json.loads(sys.argv[1])
        
        engine = RecommendationEngine()
        recommendations = engine.generate_recommendations(
            domain=data.get('domain', ''),
            keyword=data.get('keyword', ''),
            growth_rate=data.get('growth_rate', 0),
            confidence=data.get('confidence', 50),
            seasonality_data=data.get('seasonality_data', []),
            forecast_data=data.get('forecast_data', [])
        )
        
        print(json.dumps({
            'success': True,
            'recommendations': recommendations
        }, indent=2))
        
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
