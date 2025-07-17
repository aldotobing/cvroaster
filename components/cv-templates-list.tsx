import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const templates = [
  {
    name: "Professional ATS-Optimized",
    format: "DOCX",
    file: "/cv-templates/ats-friendly-template.docx",
    description: "Clean, ATS-friendly design that works for all industries",
    icon: <User className="w-5 h-5 text-indigo-500" />,
    badge: "Most Popular"
  },
  {
    name: "Tech & Engineering",
    format: "DOCX",
    file: "/cv-templates/software-developer-example.docx",
    description: "Perfect for developers, engineers, and technical roles",
    icon: <User className="w-5 h-5 text-indigo-500" />
  },
  {
    name: "Creative & Marketing",
    format: "DOCX",
    file: "/cv-templates/marketing-manager-example.docx",
    description: "Ideal for marketing, design, and creative professionals",
    icon: <User className="w-5 h-5 text-indigo-500" />
  },
];

export default function CVTemplatesList() {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <motion.div 
      className="mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
        <CardHeader 
          className="bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/20 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white dark:bg-indigo-900/50 rounded-lg shadow-sm">
                <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Free CV Templates</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Download professional templates to get started</p>
              </div>
            </div>
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="text-gray-500 dark:text-gray-400"
            >
              ▼
            </motion.div>
          </div>
        </CardHeader>
        
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <CardContent className="pt-6">
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                  {templates.map((tpl, index) => (
                    <motion.div
                      key={tpl.file}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group relative h-full flex flex-col border rounded-lg hover:border-indigo-300 dark:border-gray-700 dark:hover:border-indigo-600 transition-colors overflow-hidden bg-white dark:bg-gray-800 shadow-sm hover:shadow-md"
                    >
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex-shrink-0">
                            {tpl.icon}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-baseline gap-2">
                              <h4 className="text-base font-bold text-gray-900 dark:text-white truncate">
                                {tpl.name}
                              </h4>
                              {tpl.badge && (
                                <span className="text-[11px] px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 rounded-full whitespace-nowrap">
                                  {tpl.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                              {tpl.description}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                          <span className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded">
                            {tpl.format}
                          </span>
                          <a
                            href={tpl.file}
                            download
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors px-2 py-1 -mr-2 -mb-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Download className="w-4 h-4 flex-shrink-0" />
                            <span className="hidden sm:inline">Download</span>
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>Tip:</strong> Download a template, fill in your details, then upload it back to get personalized feedback on your CV.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
