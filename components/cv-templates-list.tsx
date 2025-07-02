import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";

const templates = [
  {
    name: "ATS-Friendly CV Template (DOCX)",
    file: "/cv-templates/ats-friendly-template.docx",
    description: "A clean, ATS-optimized template suitable for most roles.",
  },
  {
    name: "Software Developer Example (DOCX)",
    file: "/cv-templates/software-developer-example.docx",
    description: "Example CV for a Software Developer role.",
  },
  {
    name: "Marketing Manager Example (DOCX)",
    file: "/cv-templates/marketing-manager-example.docx",
    description: "Example CV for a Marketing Manager role.",
  },
];

export default function CVTemplatesList() {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
          <Download className="w-5 h-5" />
          Free CV Templates & Examples
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {templates.map((tpl) => (
            <li
              key={tpl.file}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b last:border-b-0 pb-4 last:pb-0"
            >
              <div>
                <div className="font-semibold text-gray-800 dark:text-gray-100">
                  {tpl.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {tpl.description}
                </div>
              </div>
              <a
                href={tpl.file}
                download
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
