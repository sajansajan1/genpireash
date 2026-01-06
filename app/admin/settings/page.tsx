"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
        <p className="text-gray-600 mt-2">Manage platform configuration and settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Platform Settings</CardTitle>
            <CardDescription>General platform configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platform-name">Platform Name</Label>
              <Input id="platform-name" defaultValue="Genpire" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="support-email">Support Email</Label>
              <Input id="support-email" defaultValue="support@genpire.com" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maintenance-message">Maintenance Message</Label>
              <Textarea id="maintenance-message" placeholder="Message to display during maintenance..." rows={3} />
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="maintenance-mode" />
              <Label htmlFor="maintenance-mode">Enable Maintenance Mode</Label>
            </div>

            <Button>Save Platform Settings</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Configure system notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch id="email-notifications" defaultChecked />
              <Label htmlFor="email-notifications">Email Notifications</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="sms-notifications" />
              <Label htmlFor="sms-notifications">SMS Notifications</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="push-notifications" defaultChecked />
              <Label htmlFor="push-notifications">Push Notifications</Label>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="notification-frequency">Notification Frequency</Label>
              <select className="w-full p-2 border rounded-md">
                <option>Immediate</option>
                <option>Daily Digest</option>
                <option>Weekly Summary</option>
              </select>
            </div>

            <Button>Save Notification Settings</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>Platform security configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch id="two-factor" defaultChecked />
              <Label htmlFor="two-factor">Require Two-Factor Authentication</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="password-policy" defaultChecked />
              <Label htmlFor="password-policy">Enforce Strong Password Policy</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
              <Input id="session-timeout" type="number" defaultValue="60" />
            </div>

            <Button>Save Security Settings</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Settings</CardTitle>
            <CardDescription>API configuration and limits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rate-limit">Rate Limit (requests per minute)</Label>
              <Input id="rate-limit" type="number" defaultValue="100" />
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="api-logging" defaultChecked />
              <Label htmlFor="api-logging">Enable API Logging</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="api-version">Default API Version</Label>
              <select className="w-full p-2 border rounded-md">
                <option>v1</option>
                <option>v2</option>
              </select>
            </div>

            <Button>Save API Settings</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
