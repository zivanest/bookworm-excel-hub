
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { GitHubConfig } from '@/types';
import { githubService } from '@/services/githubService';
import { toast } from 'sonner';
import { Settings, GithubIcon, FileJson } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

const GitHubSettings: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<GitHubConfig>({
    owner: 'zivanest',
    repo: 'bookworm-excel-hub',
    path: 'src/data/libraryData.ts',
    token: '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',
    branch: 'main'
  });
  const [isFileConfig, setIsFileConfig] = useState(false);

  useEffect(() => {
    // First check if we have a file-based config
    const currentConfig = githubService.getConfig();
    
    if (currentConfig.configSource === 'file') {
      setConfig(currentConfig);
      setIsFileConfig(true);
      return;
    }
    
    // If no file config, load settings from localStorage if available
    const savedConfig = localStorage.getItem('githubConfig');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig) as Omit<GitHubConfig, 'configSource'>;
        setConfig({
          ...parsedConfig,
          configSource: 'localStorage'
        });
        githubService.setConfig({
          ...parsedConfig,
          configSource: 'localStorage'
        });
      } catch (error) {
        console.error("Error parsing stored GitHub config:", error);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    try {
      // Skip if using file config
      if (isFileConfig) {
        toast.info("Using file-based configuration, settings cannot be modified here");
        setIsOpen(false);
        return;
      }
      
      // Validate config
      if (!config.owner || !config.repo || !config.path || !config.token) {
        toast.error("All fields are required");
        return;
      }

      // Save to localStorage
      const configToSave: GitHubConfig = { 
        ...config, 
        configSource: 'localStorage' 
      };
      localStorage.setItem('githubConfig', JSON.stringify(configToSave));
      
      // Update the service with new config
      githubService.setConfig(configToSave);
      
      toast.success("GitHub settings saved");
      setIsOpen(false);
    } catch (error) {
      console.error("Error saving GitHub settings:", error);
      toast.error("Failed to save GitHub settings");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <GithubIcon className="h-4 w-4" />
          GitHub Settings
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>GitHub Repository Settings</DialogTitle>
          <DialogDescription>
            Configure the GitHub repository where your library data will be stored.
          </DialogDescription>
        </DialogHeader>
        
        {isFileConfig && (
          <Alert className="mb-4">
            <FileJson className="h-4 w-4" />
            <AlertDescription>
              Settings are loaded from a configuration file. To modify them, edit the <code>github-config.json</code> file in your application's public directory.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4 py-4">
          <div className="grid gap-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="owner" className="text-right text-sm">
                Owner/Username:
              </label>
              <Input
                id="owner"
                name="owner"
                value={config.owner}
                onChange={handleChange}
                placeholder="e.g., yourusername"
                className="col-span-3"
                disabled={isFileConfig}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="repo" className="text-right text-sm">
                Repository:
              </label>
              <Input
                id="repo"
                name="repo"
                value={config.repo}
                onChange={handleChange}
                placeholder="e.g., library-data"
                className="col-span-3"
                disabled={isFileConfig}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="path" className="text-right text-sm">
                File Path:
              </label>
              <Input
                id="path"
                name="path"
                value={config.path}
                onChange={handleChange}
                placeholder="e.g., data/library.json"
                className="col-span-3"
                disabled={isFileConfig}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="branch" className="text-right text-sm">
                Branch:
              </label>
              <Input
                id="branch"
                name="branch"
                value={config.branch || 'main'}
                onChange={handleChange}
                placeholder="e.g., main"
                className="col-span-3"
                disabled={isFileConfig}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="token" className="text-right text-sm">
                Token:
              </label>
              <Input
                id="token"
                name="token"
                type="password"
                value={config.token}
                onChange={handleChange}
                placeholder="GitHub Personal Access Token"
                className="col-span-3"
                disabled={isFileConfig}
              />
            </div>
          </div>
          
          <div className="pt-4 text-sm text-muted-foreground">
            <p>Note: Your token is stored only in your browser's local storage.</p>
            {!isFileConfig && (
              <p className="mt-2">
                Alternatively, you can create a <code>github-config.json</code> file in the public directory with your settings.
              </p>
            )}
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button variant="outline" className="mr-2" onClick={() => setIsOpen(false)}>
            Close
          </Button>
          {!isFileConfig && (
            <Button onClick={handleSave}>
              Save Settings
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GitHubSettings;
