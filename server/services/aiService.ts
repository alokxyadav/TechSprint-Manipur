import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

const AI_PATH = path.join(process.cwd(), 'server', 'ai');

export interface TrendData {
  success: boolean;
  keyword?: string;
  timeframe?: string;
  time_series?: Array<{ date: string; value: number }>;
  related_queries?: {
    top: string[];
    rising: string[];
  };
  statistics?: {
    average: number;
    maximum: number;
    minimum: number;
    data_points: number;
  };
  error?: string;
}

export interface ForecastResult {
  success: boolean;
  forecast_data?: Array<{
    date: string;
    yhat: number;
    yhat_lower: number;
    yhat_upper: number;
  }>;
  growth_rate?: number;
  confidence?: number;
  seasonality_data?: Array<{ month: string; strength: number }>;
  metrics?: {
    historical_points: number;
    forecast_points: number;
    forecast_months: number;
  };
  error?: string;
}

export interface RecommendationResult {
  success: boolean;
  recommendations?: Array<{
    title: string;
    description: string;
    category: 'production' | 'marketing' | 'risk' | 'timing' | 'strategy';
    priority: 'low' | 'medium' | 'high' | 'critical';
    confidence_score: number;
    impact_score?: number;
    best_months?: string[];
    avoid_months?: string[];
    reasoning?: string;
    action_items?: string[];
  }>;
  error?: string;
}

/**
 * Fetch Google Trends data for a keyword
 */
export async function fetchTrendData(
  keyword: string,
  timeframe: string = 'today 5-y'
): Promise<TrendData> {
  try {
    const scriptPath = path.join(AI_PATH, 'trend_fetcher.py');
    const command = `python3 "${scriptPath}" "${keyword}" "${timeframe}"`;

    const { stdout, stderr } = await execAsync(command, {
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    });

    if (stderr) {
      console.warn('[AI Service] Trend fetcher warnings:', stderr);
    }

    const result = JSON.parse(stdout);
    return result;
  } catch (error: any) {
    console.error('[AI Service] Error fetching trend data:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch trend data',
    };
  }
}

/**
 * Generate forecast using Prophet ML model
 */
export async function generateForecast(
  timeSeriesData: Array<{ date: string; value: number }>,
  forecastMonths: number = 12
): Promise<ForecastResult> {
  try {
    const scriptPath = path.join(AI_PATH, 'forecast_engine.py');
    const timeSeriesJson = JSON.stringify(timeSeriesData).replace(/"/g, '\\"');
    const command = `python3 "${scriptPath}" "${timeSeriesJson}" ${forecastMonths}`;

    const { stdout, stderr } = await execAsync(command, {
      maxBuffer: 10 * 1024 * 1024,
    });

    if (stderr) {
      console.warn('[AI Service] Forecast engine warnings:', stderr);
    }

    const result = JSON.parse(stdout);
    return result;
  } catch (error: any) {
    console.error('[AI Service] Error generating forecast:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate forecast',
    };
  }
}

/**
 * Generate AI recommendations based on forecast analysis
 */
export async function generateRecommendations(data: {
  domain: string;
  keyword: string;
  growth_rate: number;
  confidence: number;
  seasonality_data: Array<{ month: string; strength: number }>;
  forecast_data: Array<{
    date: string;
    yhat: number;
    yhat_lower: number;
    yhat_upper: number;
  }>;
}): Promise<RecommendationResult> {
  try {
    const scriptPath = path.join(AI_PATH, 'recommendation_engine.py');
    const dataJson = JSON.stringify(data).replace(/"/g, '\\"');
    const command = `python3 "${scriptPath}" "${dataJson}"`;

    const { stdout, stderr } = await execAsync(command, {
      maxBuffer: 10 * 1024 * 1024,
    });

    if (stderr) {
      console.warn('[AI Service] Recommendation engine warnings:', stderr);
    }

    const result = JSON.parse(stdout);
    return result;
  } catch (error: any) {
    console.error('[AI Service] Error generating recommendations:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate recommendations',
    };
  }
}

/**
 * Complete AI pipeline: fetch trends, forecast, and generate recommendations
 */
export async function runCompleteForecast(
  domainCode: string,
  keyword: string,
  forecastMonths: number = 12
): Promise<{
  success: boolean;
  trendData?: TrendData;
  forecastResult?: ForecastResult;
  recommendations?: RecommendationResult;
  error?: string;
}> {
  try {
    // Step 1: Fetch trend data
    const trendData = await fetchTrendData(keyword);

    if (!trendData.success || !trendData.time_series) {
      return {
        success: false,
        error: trendData.error || 'Failed to fetch trend data',
      };
    }

    // Step 2: Generate forecast
    const forecastResult = await generateForecast(
      trendData.time_series,
      forecastMonths
    );

    if (!forecastResult.success) {
      return {
        success: false,
        trendData,
        error: forecastResult.error || 'Failed to generate forecast',
      };
    }

    // Step 3: Generate recommendations
    const recommendations = await generateRecommendations({
      domain: domainCode,
      keyword,
      growth_rate: forecastResult.growth_rate || 0,
      confidence: forecastResult.confidence || 50,
      seasonality_data: forecastResult.seasonality_data || [],
      forecast_data: forecastResult.forecast_data || [],
    });

    return {
      success: true,
      trendData,
      forecastResult,
      recommendations,
    };
  } catch (error: any) {
    console.error('[AI Service] Error in complete forecast:', error);
    return {
      success: false,
      error: error.message || 'Failed to run complete forecast',
    };
  }
}
