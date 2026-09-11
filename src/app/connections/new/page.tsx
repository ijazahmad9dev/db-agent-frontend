"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ConnectionForm } from "@/components/connections/connection-form";
import { CSVUploadForm } from "@/components/connections/csv-upload-form";
import { GSheetsForm } from "@/components/connections/gsheets-form";

export default function NewConnectionPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-semibold">New connection</h1>

      <Tabs defaultValue="database">
        <TabsList>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="csv">CSV upload</TabsTrigger>
          <TabsTrigger value="gsheets">Google Sheets</TabsTrigger>
        </TabsList>

        <TabsContent value="database"><Card><CardContent className="pt-6"><ConnectionForm /></CardContent></Card></TabsContent>
        <TabsContent value="csv"><Card><CardContent className="pt-6"><CSVUploadForm /></CardContent></Card></TabsContent>
        <TabsContent value="gsheets"><Card><CardContent className="pt-6"><GSheetsForm /></CardContent></Card></TabsContent>
      </Tabs>
    </div>
  );
}