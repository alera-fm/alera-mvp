/**
 * IRCAM Amplify API Service
 * Real implementation based on official API documentation
 * https://api-doc.ircamamplify.io
 */

interface IRCAMAuthResponse {
  id_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: string;
}

interface IRCAMAIDetectorResponse {
  id: string;
}

interface IRCAMJobResponse {
  job_infos: {
    job_id: string;
    job_status: "pending" | "processing" | "success" | "error";
    job_start_datetime: string;
    job_end_datetime?: string;
    service_name: string;
    report_info: {
      report: {
        resultList?: Array<{
          inputFilename: string;
          isAi: boolean;
          confidence: number;
          modelVersion?: string;
          suspectedModel?: string;
          status: string;
        }>;
      };
    };
  };
}

export class IRCAMAmplifyService {
  private clientId: string;
  private clientSecret: string;
  private apiUrl: string;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor() {
    this.clientId = process.env.IRCAM_CLIENT_ID || "";
    this.clientSecret = process.env.IRCAM_CLIENT_SECRET || "";
    this.apiUrl = process.env.IRCAM_API_URL || "https://api.ircamamplify.io";

    if (!this.clientId || !this.clientSecret) {
      console.warn(
        "[IRCAM] API credentials not configured - audio scanning will be disabled"
      );
    }
  }

  /**
   * Authenticate with IRCAM API and get id_token
   */
  private async authenticate(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await fetch(`${this.apiUrl}/oauth/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: "client_credentials",
        }),
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const data: IRCAMAuthResponse = await response.json();
      this.accessToken = data.id_token;
      // Set expiry to 5 minutes before actual expiry for safety
      this.tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

      console.log(
        "[IRCAM] Authentication successful, token expires in",
        data.expires_in,
        "seconds"
      );
      return this.accessToken;
    } catch (error) {
      console.error("[IRCAM] Authentication error:", error);
      throw new Error("Failed to authenticate with IRCAM API");
    }
  }

  /**
   * Submit audio file for AI detection analysis
   * NOTE: The audioUrl should be a publicly accessible URL (not ias://)
   * IRCAM will download it directly
   */
  async submitAIDetection(audioUrl: string): Promise<string> {
    const token = await this.authenticate();

    try {
      console.log("[IRCAM] Submitting AI detection for:", audioUrl);

      const response = await fetch(`${this.apiUrl}/aidetector/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          audioUrlList: [audioUrl],
          timeAnalysis: false,
        }),
      });

      console.log(
        "[IRCAM] AI Detection response status:",
        response.status,
        response.statusText
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("[IRCAM] Error response:", errorData);
        throw new Error(
          `AI detection submission failed: ${
            errorData.message || response.statusText
          }`
        );
      }

      const data: IRCAMAIDetectorResponse = await response.json();
      console.log("[IRCAM] Success! Job ID:", data.id);
      return data.id;
    } catch (error) {
      console.error("[IRCAM] AI detection submission error:", error);
      throw new Error("Failed to submit audio for AI detection");
    }
  }

  /**
   * Get job results
   */
  async getJobResults(jobId: string): Promise<IRCAMJobResponse> {
    const token = await this.authenticate();

    try {
      const response = await fetch(`${this.apiUrl}/aidetector/${jobId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get job results: ${response.statusText}`);
      }

      const data: IRCAMJobResponse = await response.json();
      console.log("[IRCAM] ========== RAW JOB RESPONSE ==========");
      console.log("[IRCAM] Job ID:", jobId);
      console.log("[IRCAM] Job Status:", data.job_infos?.job_status);
      console.log("[IRCAM] Full Response:", JSON.stringify(data, null, 2));
      console.log("[IRCAM] ======================================");
      return data;
    } catch (error) {
      console.error("[IRCAM] Get results error:", error);
      throw new Error("Failed to retrieve job results");
    }
  }

  /**
   * Poll for job completion
   */
  async pollJobResults(
    jobId: string,
    maxAttempts: number = 60,
    intervalMs: number = 5000
  ): Promise<IRCAMJobResponse> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const results = await this.getJobResults(jobId);

      if (
        results.job_infos?.job_status === "success" ||
        results.job_infos?.job_status === "error"
      ) {
        return results;
      }

      console.log(
        `[IRCAM] Job ${jobId} still processing (attempt ${
          attempt + 1
        }/${maxAttempts})...`
      );

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    throw new Error(
      `Job ${jobId} polling timeout after ${maxAttempts} attempts`
    );
  }

  /**
   * Legacy method for backwards compatibility
   * Maps to AI detection
   */
  async submitAudioAnalysis(
    audioUrl: string,
    metadata?: {
      title?: string;
      artist?: string;
      isrc?: string;
    }
  ): Promise<string> {
    console.log("[IRCAM] submitAudioAnalysis called - using AI Music Detector");
    console.log("[IRCAM] Metadata:", metadata);
    return this.submitAIDetection(audioUrl);
  }

  /**
   * Legacy method for backwards compatibility
   */
  async getAnalysisResults(jobId: string): Promise<{
    job_id: string;
    status: "pending" | "processing" | "completed" | "failed";
    results?: {
      copyright_match?: {
        detected: boolean;
        confidence: number;
        matched_tracks?: any[];
      };
      ai_generated?: {
        detected: boolean;
        confidence: number;
        ai_model_signatures?: string[];
      };
    };
    error?: string;
  }> {
    const jobResults = await this.getJobResults(jobId);

    // Map IRCAM response to our expected format
    const status: "pending" | "processing" | "completed" | "failed" =
      jobResults.job_infos?.job_status === "success"
        ? "completed"
        : jobResults.job_infos?.job_status === "error"
        ? "failed"
        : jobResults.job_infos?.job_status === "processing"
        ? "processing"
        : "pending";

    // Extract AI results from the actual IRCAM response structure
    const aiResults =
      jobResults.job_infos?.report_info?.report?.resultList?.[0];

    console.log("[IRCAM] ========== PARSED AI RESULTS ==========");
    console.log(
      "[IRCAM] Job Status:",
      jobResults.job_infos?.job_status,
      "→ Mapped to:",
      status
    );
    console.log("[IRCAM] AI Detector Results:", aiResults);
    console.log("[IRCAM] - Is AI Generated:", aiResults?.isAi);
    console.log("[IRCAM] - Confidence:", aiResults?.confidence);
    console.log("[IRCAM] - Model Version:", aiResults?.modelVersion);
    console.log("[IRCAM] - Suspected Model:", aiResults?.suspectedModel);
    console.log("[IRCAM] ========================================");

    const mappedResponse = {
      job_id: jobId,
      status,
      results: {
        copyright_match: {
          detected: false,
          confidence: 0,
          matched_tracks: [],
        },
        ai_generated: {
          detected: aiResults?.isAi || false,
          confidence: aiResults?.confidence || 0,
          ai_model_signatures: aiResults?.modelVersion
            ? [aiResults.modelVersion]
            : [],
        },
      },
      error:
        jobResults.job_infos?.job_status === "error"
          ? "Analysis failed"
          : undefined,
    };

    console.log("[IRCAM] ========== MAPPED RESPONSE ==========");
    console.log(JSON.stringify(mappedResponse, null, 2));
    console.log("[IRCAM] =======================================");

    return mappedResponse;
  }
}

// Export singleton instance
export const ircamService = new IRCAMAmplifyService();
