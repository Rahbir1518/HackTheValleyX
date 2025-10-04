// src/types.d.ts

interface AudioFeatures {
  avg_pitch: number;
  pitch_variability: number;
  avg_energy: number;
  voicing_ratio: number;
  duration: number;
  pitch_time_series: number[];
  pitch_timestamps: number[];
  rms_time_series: number[];
  rms_timestamps: number[];
}

interface RiskItem {
  condition: string;
  risk: number;
  status: string;
  color: string;
}

interface WebSocketMessage {
  type: 'status' | 'features' | 'analysis' | 'complete' | 'error';
  message?: string;
  data?: any;
}

interface AnalysisResult {
  risk_assessment: Array<{
    condition: string;
    risk_percentage: number;
    status: string;
    reasoning: string;
  }>;
  overall_status: string;
  next_steps: string[];
  key_findings: string;
}

// Add to your existing types.d.ts:

