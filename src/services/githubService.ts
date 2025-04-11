
import { GitHubConfig, LibraryData } from "@/types";
import { toast } from "sonner";

// Default empty data
const defaultData: LibraryData = {
  students: [],
  books: [],
  lastUpdated: new Date().toISOString()
};

// GitHub API service for reading and writing library data
export class GitHubDataService {
  private config: GitHubConfig;
  private cachedData: LibraryData | null = null;
  private lastFetchTime: number = 0;
  private isFetching: boolean = false;
  
  constructor(config: GitHubConfig) {
    this.config = config;
    this.loadConfigFromFile();
  }

  // Load configuration from the config file
  private async loadConfigFromFile(): Promise<void> {
    try {
      const response = await fetch('/github-config.json');
      
      if (response.ok) {
        const fileConfig = await response.json();
        if (fileConfig && fileConfig.owner && fileConfig.repo && fileConfig.token) {
          console.log("GitHub config loaded from file");
          this.config = { ...fileConfig, configSource: 'file' };
          toast.success("GitHub configuration loaded from file");
        }
      }
    } catch (error) {
      console.log("No GitHub config file found or error loading it:", error);
      // Silently fail and use localStorage config if available
    }
  }

  // Set or update GitHub configuration
  public setConfig(config: GitHubConfig): void {
    // Don't override file config with localStorage config
    if (this.config.configSource === 'file' && (!config.configSource || config.configSource === 'localStorage')) {
      console.log("Not overriding file config with localStorage config");
      return;
    }
    
    this.config = config;
    this.cachedData = null; // Clear cache when config changes
  }

  // Check if GitHub configuration is valid
  public hasValidConfig(): boolean {
    return !!(this.config.owner && this.config.repo && this.config.path && this.config.token);
  }

  // Get current config
  public getConfig(): GitHubConfig {
    return { ...this.config };
  }

  // Fetch data from GitHub with cache control (5 min TTL)
  public async getData(): Promise<LibraryData> {
    // Return cached data if available and not expired (5 minutes TTL)
    const now = Date.now();
    if (
      this.cachedData && 
      now - this.lastFetchTime < 5 * 60 * 1000 && 
      !this.isFetching
    ) {
      return this.cachedData;
    }

    if (!this.hasValidConfig()) {
      console.error("GitHub configuration is incomplete");
      toast.error("GitHub configuration is incomplete");
      return defaultData;
    }

    // Prevent concurrent fetches
    if (this.isFetching) {
      // Wait for current fetch to complete
      let retries = 0;
      while (this.isFetching && retries < 10) {
        await new Promise(resolve => setTimeout(resolve, 500));
        retries++;
      }
      
      if (this.cachedData) {
        return this.cachedData;
      }
    }

    this.isFetching = true;

    try {
      const { owner, repo, path, token, branch = "main" } = this.config;
      
      // Fetch file content from GitHub
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
        {
          headers: {
            Authorization: `token ${token}`,
            Accept: "application/vnd.github.v3+json"
          }
        }
      );

      if (!response.ok) {
        // If file doesn't exist, return default data
        if (response.status === 404) {
          console.log("File not found in repository, will create on first save");
          this.cachedData = defaultData;
          this.lastFetchTime = now;
          return defaultData;
        }
        
        // Handle API errors
        const error = await response.json();
        console.error("GitHub API error:", error);
        toast.error(`GitHub API error: ${error.message || "Unknown error"}`);
        return defaultData;
      }

      const data = await response.json();
      const content = atob(data.content);
      
      // Parse JSON data
      this.cachedData = JSON.parse(content) as LibraryData;
      this.lastFetchTime = now;
      
      return this.cachedData;
    } catch (error) {
      console.error("Error fetching data from GitHub:", error);
      toast.error("Failed to load data from GitHub");
      return defaultData;
    } finally {
      this.isFetching = false;
    }
  }

  // Save data to GitHub
  public async saveData(data: LibraryData): Promise<boolean> {
    if (!this.hasValidConfig()) {
      console.error("GitHub configuration is incomplete");
      toast.error("GitHub configuration is incomplete");
      return false;
    }

    try {
      const { owner, repo, path, token, branch = "main" } = this.config;
      
      // Update lastUpdated timestamp
      data.lastUpdated = new Date().toISOString();

      // Get current file (to get the sha for updating)
      let sha: string | undefined;
      
      try {
        const fileResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
          {
            headers: {
              Authorization: `token ${token}`,
              Accept: "application/vnd.github.v3+json"
            }
          }
        );
        
        if (fileResponse.ok) {
          const fileData = await fileResponse.json();
          sha = fileData.sha;
        }
      } catch (error) {
        // If file doesn't exist yet, sha remains undefined
        console.log("File doesn't exist yet, will create it");
      }

      // Prepare the request body
      const content = btoa(JSON.stringify(data, null, 2));
      const requestBody: any = {
        message: `Update library data - ${new Date().toISOString()}`,
        content,
        branch
      };

      // Include sha if we're updating an existing file
      if (sha) {
        requestBody.sha = sha;
      }

      // Create or update the file
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
        {
          method: "PUT",
          headers: {
            Authorization: `token ${token}`,
            Accept: "application/vnd.github.v3+json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error("GitHub API error when saving:", error);
        toast.error(`Error saving to GitHub: ${error.message || "Unknown error"}`);
        return false;
      }

      // Update cache with the saved data
      this.cachedData = data;
      this.lastFetchTime = Date.now();
      
      toast.success("Data saved to GitHub successfully");
      return true;
    } catch (error) {
      console.error("Error saving data to GitHub:", error);
      toast.error("Failed to save data to GitHub");
      return false;
    }
  }
}

// Create a singleton instance
export const githubService = new GitHubDataService({
  owner: "",
  repo: "",
  path: "library-data.json",
  token: "",
  branch: "main"
});
